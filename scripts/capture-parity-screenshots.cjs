#!/usr/bin/env node
/**
 * 视觉同视口对比工具：逐 Pro 组件，在同一 viewport(1440 宽)下
 *  - 本地：截 showcase 每个变体预览(.sc-live-preview[data-slug])的干净元素图
 *  - 线上：截 heroui.pro 对应组件页每个 H2 段(从本段 H2 到下一段 H2 的裁剪区)
 * 落盘到 docs/parity-shots/<id>/，并写 manifest.json 记录本地/线上配对，供逐项视觉比对。
 *
 * 用法：
 *   node scripts/capture-parity-screenshots.cjs                # 全部 Pro 组件
 *   node scripts/capture-parity-screenshots.cjs --component=sheet
 *   node scripts/capture-parity-screenshots.cjs --limit=3      # 前 3 个(验证用)
 *   node scripts/capture-parity-screenshots.cjs --local-only   # 跳过线上(无网时)
 */
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright-core');
const { REFERENCE } = require('./pro-parity-contract.cjs');

const root = path.join(__dirname, '..');
const outRoot = path.join(root, 'docs/parity-shots');
const registrySource = fs.readFileSync(path.join(root, 'src/showcase/registry.ts'), 'utf8');
const docsMeta = JSON.parse(fs.readFileSync(path.join(root, 'src/showcase/docs-meta.json'), 'utf8'));
const demoIndex = JSON.parse(fs.readFileSync(path.join(root, 'src/showcase/demo-index.json'), 'utf8'));

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const has = (name) => process.argv.includes(`--${name}`);
const onlyComponent = arg('component');
const limit = arg('limit') ? Number(arg('limit')) : undefined;
const localOnly = has('local-only');

const VIEWPORT = { width: 1440, height: 1000 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const requestOk = (url) =>
  new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });

const findBrowserExecutable = () =>
  [
    process.env.VELA_BROWSER_EXECUTABLE,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ]
    .filter(Boolean)
    .find((c) => fs.existsSync(c));

const startServer = async () => {
  if (process.env.VELA_SHOWCASE_URL) return { url: process.env.VELA_SHOWCASE_URL, stop: async () => {} };
  const port = process.env.VELA_SHOWCASE_PORT ?? '5190';
  const url = `http://127.0.0.1:${port}/`;
  if (await requestOk(url)) return { url, stop: async () => {} };
  const child = spawn('pnpm', ['exec', 'vite', '--host', '127.0.0.1', '--port', port], {
    cwd: root,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let out = '';
  child.stdout.on('data', (c) => (out += c));
  child.stderr.on('data', (c) => (out += c));
  for (let i = 0; i < 80; i += 1) {
    if (await requestOk(url)) {
      return {
        url,
        stop: async () => {
          child.kill('SIGTERM');
          await sleep(250);
          if (!child.killed) child.kill('SIGKILL');
        },
      };
    }
    await sleep(250);
  }
  child.kill('SIGTERM');
  throw new Error(`Vite showcase did not start at ${url}\n${out}`);
};

const parseProComponents = () => {
  const block = /export const PRO_CATEGORIES:[\s\S]*?=\s*\{([\s\S]*?)\};/.exec(registrySource);
  if (!block) throw new Error('PRO_CATEGORIES not found');
  const ids = [];
  const re = /['"]?([A-Za-z ]+)['"]?\s*:\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = re.exec(block[1])) !== null) {
    for (const idm of m[2].matchAll(/'([a-z0-9-]+)'/g)) ids.push(idm[1]);
  }
  return ids;
};

const clickComponent = async (page, id) => {
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(50);
  const button = page.locator(`button[data-id="${id}"]`).first();
  await button.waitFor({ state: 'visible', timeout: 8000 });
  await button.scrollIntoViewIfNeeded();
  await sleep(80);
  try {
    await button.click({ timeout: 10000 });
  } catch {
    const h = await button.elementHandle();
    if (h) await page.evaluate((el) => el.click(), h);
  }
  await page.locator('article h1').first().waitFor({ state: 'visible', timeout: 8000 });
  await sleep(200);
};

const autoScroll = async (page) => {
  let prev = 0;
  let stable = 0;
  for (let pass = 0; pass < 40; pass += 1) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = await page.evaluate(() => window.innerHeight);
    for (let y = 0; y <= h; y += Math.max(320, Math.floor(vh * 0.75))) {
      await page.evaluate((sy) => window.scrollTo(0, sy), y);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(150);
    const nh = await page.evaluate(() => document.documentElement.scrollHeight);
    stable = nh === prev ? stable + 1 : 0;
    prev = nh;
    if (stable >= 2) break;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
};

// Recharts charts animate in on mount (~1.5s; radar/area/line grow from a collapsed
// state). The live shots settle because captureLive runs a multi-second autoScroll
// before screenshotting; captureLocal must likewise wait until the chart geometry stops
// changing, else early-iterated variants get captured mid-animation (e.g. radar polygons
// frozen at a fraction of their final radius). Polls the preview's SVG path/polygon
// geometry until stable for two consecutive samples; returns immediately for non-chart
// previews (no recharts surface) so they incur no extra delay.
const waitForChartSettled = async (page, slug) => {
  let prev = null;
  let stable = 0;
  for (let i = 0; i < 30; i += 1) {
    const sig = await page.evaluate((s) => {
      const host = document.querySelector(`.sc-live-preview[data-slug="${s}"]`);
      if (!host) return 'no-chart';
      const svg = host.querySelector('svg.recharts-surface');
      if (!svg) return 'no-chart';
      const paths = [...svg.querySelectorAll('path')].map((p) => p.getAttribute('d') || '').join('|');
      const polys = [...svg.querySelectorAll('polygon')].map((p) => p.getAttribute('points') || '').join('|');
      return `${paths}##${polys}`;
    }, slug);
    if (sig === 'no-chart') return;
    if (sig === prev) {
      stable += 1;
      if (stable >= 2) return;
    } else {
      stable = 0;
      prev = sig;
    }
    await sleep(150);
  }
};

const captureLocal = async (page, baseUrl, id, dir) => {
  await page.setViewportSize(VIEWPORT);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await clickComponent(page, id);
  const slugs = demoIndex[id] ?? [];
  const shots = [];
  for (const slug of slugs) {
    const preview = page.locator(`.sc-live-preview[data-slug="${slug}"]`).first();
    try {
      await preview.waitFor({ state: 'visible', timeout: 6000 });
      await preview.scrollIntoViewIfNeeded();
      await sleep(120);
      await waitForChartSettled(page, slug);
      const file = `local__${slug}.png`;
      await preview.screenshot({ path: path.join(dir, file) });
      shots.push({ slug, file });
    } catch (e) {
      shots.push({ slug, file: null, error: String(e.message).slice(0, 120) });
    }
  }
  return shots;
};

const captureLive = async (page, id, dir) => {
  await page.setViewportSize(VIEWPORT);
  await page.goto(`${REFERENCE.url}/${id}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('h1', { timeout: 15000 });
  await autoScroll(page);
  // 采集每个 H2 段(忽略非变体标题)的 y 区间，裁剪截图
  const ignored = ['Anatomy', 'CSS Classes', 'API Reference', 'About', 'On this page'];
  const sections = await page.evaluate((ig) => {
    const ignoredSet = new Set(ig);
    const hs = [...document.querySelectorAll('h2')].filter((h) => {
      const t = (h.textContent ?? '').replace(/\s+/g, ' ').trim();
      return t && !ignoredSet.has(t);
    });
    const docH = document.documentElement.scrollHeight;
    return hs.map((h, i) => {
      const top = h.getBoundingClientRect().top + window.scrollY;
      const next = hs[i + 1];
      const bottom = next ? next.getBoundingClientRect().top + window.scrollY : Math.min(top + 1400, docH);
      return { heading: (h.textContent ?? '').replace(/\s+/g, ' ').trim(), top: Math.max(0, top - 12), bottom };
    });
  }, ignored);
  const shots = [];
  for (let i = 0; i < sections.length; i += 1) {
    const s = sections[i];
    const file = `live__${String(i).padStart(2, '0')}.png`;
    try {
      // 先把本段滚到视口顶部；接近页面底部时滚动会被钳制，故按实际 scrollY 换算视口内 y
      await page.evaluate((y) => window.scrollTo(0, y), s.top);
      await page.waitForTimeout(140);
      const scrollY = await page.evaluate(() => window.scrollY);
      const vy = Math.max(0, Math.round(s.top - scrollY));
      const visH = Math.min(Math.round(s.bottom - s.top), VIEWPORT.height - vy);
      if (visH < 40) {
        shots.push({ index: i, heading: s.heading, file: null, error: 'section not in viewport' });
        continue;
      }
      await page.screenshot({
        path: path.join(dir, file),
        clip: { x: 0, y: vy, width: VIEWPORT.width, height: visH },
      });
      shots.push({ index: i, heading: s.heading, file });
    } catch (e) {
      shots.push({ index: i, heading: s.heading, file: null, error: String(e.message).slice(0, 120) });
    }
  }
  return shots;
};

const main = async () => {
  const exe = findBrowserExecutable();
  if (!exe) throw new Error('No Chrome/Chromium found. Set VELA_BROWSER_EXECUTABLE.');
  let all = parseProComponents();
  if (onlyComponent) all = all.filter((id) => id === onlyComponent);
  if (limit) all = all.slice(0, limit);
  if (all.length === 0) throw new Error(`No components to capture (component=${onlyComponent})`);

  fs.mkdirSync(outRoot, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({ executablePath: exe, headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT });
  const manifest = { capturedAt: new Date().toISOString(), reference: REFERENCE.url, components: {} };

  try {
    for (const id of all) {
      const dir = path.join(outRoot, id);
      fs.mkdirSync(dir, { recursive: true });
      process.stdout.write(`capturing ${id} ... `);
      const local = await captureLocal(page, server.url, id, dir);
      let live = [];
      if (!localOnly) {
        try {
          live = await captureLive(page, id, dir);
        } catch (e) {
          live = [{ error: String(e.message).slice(0, 160) }];
        }
      }
      manifest.components[id] = {
        title: docsMeta[id]?.title ?? id,
        sections: (docsMeta[id]?.sections ?? []).map((s) => s.heading),
        local,
        live,
      };
      console.log(`local ${local.filter((s) => s.file).length}/${local.length}, live ${live.filter((s) => s.file).length}/${live.length}`);
    }
  } finally {
    fs.writeFileSync(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
    await browser.close();
    await server.stop();
  }
  console.log(`\nDone. Shots in ${path.relative(root, outRoot)}/<id>/ , manifest at ${path.relative(root, path.join(outRoot, 'manifest.json'))}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
