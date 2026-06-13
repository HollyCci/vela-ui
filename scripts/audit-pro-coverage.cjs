#!/usr/bin/env node
/**
 * Audits whether every Pro component in the showcase has:
 * - a local component implementation directory
 * - at least one live React demo registered in showcase demos
 * - reference variants from demo-index.json
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const registryPath = path.join(root, 'src/showcase/registry.ts');
const demoIndexPath = path.join(root, 'src/showcase/demo-index.json');
const packageIndexPath = path.join(root, 'src/components/index.ts');
const componentsDir = path.join(root, 'src/components');
const demosDir = path.join(root, 'src/showcase/demos');

const registrySource = fs.readFileSync(registryPath, 'utf8');
const demoIndex = JSON.parse(fs.readFileSync(demoIndexPath, 'utf8'));
const packageIndexSource = fs.readFileSync(packageIndexPath, 'utf8');

const proBlockMatch = /export const PRO_CATEGORIES:[\s\S]*?=\s*\{([\s\S]*?)\};/.exec(registrySource);
if (!proBlockMatch) {
  throw new Error('Unable to find PRO_CATEGORIES in src/showcase/registry.ts');
}

const categories = [];
const categoryRe = /['"]?([A-Za-z ]+)['"]?\s*:\s*\[([\s\S]*?)\]/g;
let categoryMatch;
while ((categoryMatch = categoryRe.exec(proBlockMatch[1])) !== null) {
  const name = categoryMatch[1].trim();
  const ids = [...categoryMatch[2].matchAll(/'([a-z0-9-]+)'/g)].map((match) => match[1]);
  categories.push({ name, ids });
}

const toExportName = (id) =>
  id
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');

const componentDirs = new Set(
  fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(componentsDir, entry.name, 'index.tsx')))
    .map((entry) => entry.name),
);

const packageExportNames = new Set(
  [...packageIndexSource.matchAll(/default\s+as\s+([A-Za-z0-9_]+)/g)].map((match) => match[1]),
);

const allVariantSlugs = new Set(Object.values(demoIndex).flat());
const liveDemoKeys = new Set();
const variantDemoKeys = new Set();
for (const file of fs.readdirSync(demosDir)) {
  if (!file.endsWith('-demos.tsx')) continue;
  const source = fs.readFileSync(path.join(demosDir, file), 'utf8');
  const variantExportMatches = [
    ...source.matchAll(/export\s+const\s+[A-Za-z0-9]+VariantDemos[\s\S]*?=\s*\{([\s\S]*?)\};/g),
  ];
  const variantExportRanges = variantExportMatches.map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
  }));
  const isInVariantExport = (index) =>
    variantExportRanges.some((range) => index >= range.start && index <= range.end);

  for (const match of source.matchAll(/['"]([a-z0-9-]+)['"]\s*:\s*</g)) {
    if (isInVariantExport(match.index)) variantDemoKeys.add(match[1]);
    liveDemoKeys.add(match[1]);
  }
  for (const match of source.matchAll(/\n\s*([a-z][a-z0-9-]*)\s*:\s*</g)) {
    liveDemoKeys.add(match[1]);
  }
}

const rows = [];
for (const category of categories) {
  for (const id of category.ids) {
    rows.push({
      category: category.name,
      id,
      hasComponent: componentDirs.has(id),
      hasLiveDemo: liveDemoKeys.has(id),
      hasPackageExport: packageExportNames.has(toExportName(id)),
      variants: Array.isArray(demoIndex[id]) ? demoIndex[id].length : 0,
    });
  }
}

const coverageProblems = rows.filter(
  (row) => !row.hasComponent || !row.hasLiveDemo || !row.hasPackageExport || row.variants === 0,
);
const exportProblems = [...componentDirs].filter((id) => !packageExportNames.has(toExportName(id)));
const unknownVariantDemoKeys = [...variantDemoKeys].filter((slug) => !allVariantSlugs.has(slug));
const requiredVariantSlugs = [...allVariantSlugs];
const missingRequiredVariantSlugs = requiredVariantSlugs.filter((slug) => !variantDemoKeys.has(slug));

console.log(`Pro components: ${rows.length}`);
console.log(`Component directories: ${componentDirs.size}`);
console.log(`Live demo keys: ${liveDemoKeys.size}`);
console.log(`Variant demo keys: ${variantDemoKeys.size}`);
console.log(`Package exports: ${packageExportNames.size}`);
console.log('');
console.log('| Category | Component | Variants | Component | Live demo | Package export |');
console.log('| --- | --- | ---: | --- | --- | --- |');
for (const row of rows) {
  console.log(
    `| ${row.category} | ${row.id} | ${row.variants} | ${row.hasComponent ? 'yes' : 'no'} | ${
      row.hasLiveDemo ? 'yes' : 'no'
    } | ${row.hasPackageExport ? 'yes' : 'no'} |`,
  );
}

if (
  coverageProblems.length > 0 ||
  exportProblems.length > 0 ||
  unknownVariantDemoKeys.length > 0 ||
  missingRequiredVariantSlugs.length > 0
) {
  console.error('');
  console.error('Coverage gaps:');
  for (const row of coverageProblems) {
    const missing = [];
    if (!row.hasComponent) missing.push('component');
    if (!row.hasLiveDemo) missing.push('live demo');
    if (!row.hasPackageExport) missing.push('package export');
    if (row.variants === 0) missing.push('reference variants');
    console.error(`- ${row.id}: missing ${missing.join(', ')}`);
  }
  for (const id of exportProblems) {
    console.error(`- ${id}: missing package export ${toExportName(id)}`);
  }
  for (const slug of unknownVariantDemoKeys) {
    console.error(`- ${slug}: variant demo key is not listed in demo-index.json`);
  }
  for (const slug of missingRequiredVariantSlugs) {
    console.error(`- ${slug}: missing required slug-level live demo`);
  }
  process.exitCode = 1;
}
