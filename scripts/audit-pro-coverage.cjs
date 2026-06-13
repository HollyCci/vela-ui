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
const componentsDir = path.join(root, 'src/components');
const demosDir = path.join(root, 'src/showcase/demos');

const registrySource = fs.readFileSync(registryPath, 'utf8');
const demoIndex = JSON.parse(fs.readFileSync(demoIndexPath, 'utf8'));

const proBlockMatch = /export const PRO_CATEGORIES:[\s\S]*?=\s*\{([\s\S]*?)\};/.exec(registrySource);
if (!proBlockMatch) {
  throw new Error('Unable to find PRO_CATEGORIES in src/showcase/registry.ts');
}

const categories = [];
const categoryRe = /['"]?([A-Za-z ]+)['"]?\s*:\s*\[([\s\S]*?)\]/g;
let categoryMatch;
while ((categoryMatch = categoryRe.exec(proBlockMatch[1])) !== null) {
  const name = categoryMatch[1];
  const ids = [...categoryMatch[2].matchAll(/'([a-z0-9-]+)'/g)].map((match) => match[1]);
  categories.push({ name, ids });
}

const componentDirs = new Set(
  fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(componentsDir, entry.name, 'index.tsx')))
    .map((entry) => entry.name),
);

const liveDemoKeys = new Set();
for (const file of fs.readdirSync(demosDir)) {
  if (!file.endsWith('-demos.tsx')) continue;
  const source = fs.readFileSync(path.join(demosDir, file), 'utf8');
  for (const match of source.matchAll(/['"]([a-z0-9-]+)['"]\s*:\s*</g)) {
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
      variants: Array.isArray(demoIndex[id]) ? demoIndex[id].length : 0,
    });
  }
}

const problems = rows.filter((row) => !row.hasComponent || !row.hasLiveDemo || row.variants === 0);

console.log(`Pro components: ${rows.length}`);
console.log(`Component directories: ${componentDirs.size}`);
console.log(`Live demo keys: ${liveDemoKeys.size}`);
console.log('');
console.log('| Category | Component | Variants | Component | Live demo |');
console.log('| --- | --- | ---: | --- | --- |');
for (const row of rows) {
  console.log(
    `| ${row.category} | ${row.id} | ${row.variants} | ${row.hasComponent ? 'yes' : 'no'} | ${
      row.hasLiveDemo ? 'yes' : 'no'
    } |`,
  );
}

if (problems.length > 0) {
  console.error('');
  console.error('Coverage gaps:');
  for (const row of problems) {
    const missing = [];
    if (!row.hasComponent) missing.push('component');
    if (!row.hasLiveDemo) missing.push('live demo');
    if (row.variants === 0) missing.push('reference variants');
    console.error(`- ${row.id}: missing ${missing.join(', ')}`);
  }
  process.exitCode = 1;
}
