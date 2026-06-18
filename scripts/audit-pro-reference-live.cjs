#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const { REFERENCE } = require('./pro-parity-contract.cjs');

const root = path.join(__dirname, '..');
const registryPath = path.join(root, 'src/showcase/registry.ts');
const docsMetaPath = path.join(root, 'src/showcase/docs-meta.json');
const registrySource = fs.readFileSync(registryPath, 'utf8');
const docsMeta = JSON.parse(fs.readFileSync(docsMetaPath, 'utf8'));
const requestedComponent = process.argv.find((arg) => arg.startsWith('--component='))?.split('=')[1];

const ignoredReferenceHeadings = new Set(['Anatomy', 'CSS Classes', 'API Reference', 'About', 'On this page']);

const findBrowserExecutable = () => {
  const candidates = [
    process.env.VELA_BROWSER_EXECUTABLE,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Arc.app/Contents/MacOS/Arc',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
};

const parseProComponents = () => {
  const proBlockMatch = /export const PRO_CATEGORIES:[\s\S]*?=\s*\{([\s\S]*?)\};/.exec(registrySource);
  if (!proBlockMatch) {
    throw new Error('Unable to find PRO_CATEGORIES in src/showcase/registry.ts');
  }

  const components = [];
  const categoryRe = /['"]?([A-Za-z ]+)['"]?\s*:\s*\[([\s\S]*?)\]/g;
  let categoryMatch;
  while ((categoryMatch = categoryRe.exec(proBlockMatch[1])) !== null) {
    const category = categoryMatch[1].trim();
    const ids = [...categoryMatch[2].matchAll(/'([a-z0-9-]+)'/g)].map((match) => match[1]);
    for (const id of ids) {
      if (!requestedComponent || requestedComponent === id) components.push({ category, id });
    }
  }
  return components;
};

const normalizeHeading = (heading) =>
  heading
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/New$/, '')
    .replace(/KPIWith/g, 'KPI With')
    .toLowerCase();

const autoScroll = async (page) => {
  let previousHeight = 0;
  let stablePasses = 0;

  for (let pass = 0; pass < 60; pass += 1) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    for (let y = 0; y <= height; y += Math.max(320, Math.floor(viewportHeight * 0.75))) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(180);

    const nextHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    stablePasses = nextHeight === previousHeight ? stablePasses + 1 : 0;
    previousHeight = nextHeight;
    if (stablePasses >= 2) break;
  }

  await page.evaluate(() => window.scrollTo(0, 0));
};

const readReferenceVariantHeadings = async (page, id) => {
  await page.goto(`${REFERENCE.url}/${id}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('h1', { timeout: 15000 });
  await autoScroll(page);

  return page.evaluate((ignored) => {
    const ignoredSet = new Set(ignored);
    return [...document.querySelectorAll('h2')]
      .map((heading) => (heading.textContent ?? '').replace(/\s+/g, ' ').trim())
      .filter((heading) => heading && !ignoredSet.has(heading));
  }, [...ignoredReferenceHeadings]);
};

const formatList = (values) => values.join(', ') || '(none)';

const main = async () => {
  const browserExecutable = findBrowserExecutable();
  if (!browserExecutable) {
    throw new Error('No Chrome/Chromium browser executable found. Set VELA_BROWSER_EXECUTABLE.');
  }

  const components = parseProComponents();
  if (requestedComponent && components.length === 0) {
    throw new Error(`Unknown Pro component: ${requestedComponent}`);
  }

  const browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const mismatches = [];

  try {
    for (const { id } of components) {
      const referenceHeadings = await readReferenceVariantHeadings(page, id);
      const localHeadings = docsMeta[id]?.sections?.map((section) => section.heading) ?? [];
      const referenceNormalized = referenceHeadings.map(normalizeHeading);
      const localNormalized = localHeadings.map(normalizeHeading);
      const matches =
        referenceNormalized.length === localNormalized.length &&
        referenceNormalized.every((heading, index) => heading === localNormalized[index]);

      console.log(`${matches ? 'ok' : 'DIFF'} ${id}: reference ${referenceHeadings.length}, local ${localHeadings.length}`);
      if (!matches) {
        mismatches.push({ id, referenceHeadings, localHeadings });
      }
    }
  } finally {
    await browser.close();
  }

  console.log('');
  console.log(`Live reference: ${REFERENCE.url}`);
  console.log(`Components compared: ${components.length}`);
  console.log(`Mismatches: ${mismatches.length}`);

  if (mismatches.length > 0) {
    console.log('');
    console.log('Reference heading mismatches:');
    for (const mismatch of mismatches) {
      console.log(`- ${mismatch.id}`);
      console.log(`  reference (${mismatch.referenceHeadings.length}): ${formatList(mismatch.referenceHeadings)}`);
      console.log(`  local (${mismatch.localHeadings.length}): ${formatList(mismatch.localHeadings)}`);
    }
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
