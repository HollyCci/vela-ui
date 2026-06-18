#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  REFERENCE,
  componentContracts,
  referenceVariantCounts,
  browserSmokeComponents,
} = require('./pro-parity-contract.cjs');

const root = path.join(__dirname, '..');
const registryPath = path.join(root, 'src/showcase/registry.ts');
const demoIndexPath = path.join(root, 'src/showcase/demo-index.json');
const docsMetaPath = path.join(root, 'src/showcase/docs-meta.json');

const registrySource = fs.readFileSync(registryPath, 'utf8');
const demoIndex = JSON.parse(fs.readFileSync(demoIndexPath, 'utf8'));
const docsMeta = JSON.parse(fs.readFileSync(docsMetaPath, 'utf8'));

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
  for (const id of ids) components.push({ category, id });
}

const componentIds = components.map((component) => component.id);
const contractIds = Object.keys(componentContracts).sort();
const expectedIds = [...componentIds].sort();
const smokeIds = new Set(browserSmokeComponents);
const countIds = Object.keys(referenceVariantCounts).sort();
const problems = [];

const missingContracts = expectedIds.filter((id) => !componentContracts[id]);
const staleContracts = contractIds.filter((id) => !expectedIds.includes(id));
const missingReferenceCounts = expectedIds.filter((id) => referenceVariantCounts[id] === undefined);
const staleReferenceCounts = countIds.filter((id) => !expectedIds.includes(id));

for (const id of missingContracts) {
  problems.push(`${id}: missing parity contract entry`);
}
for (const id of staleContracts) {
  problems.push(`${id}: parity contract entry is not in PRO_CATEGORIES`);
}
for (const id of missingReferenceCounts) {
  problems.push(`${id}: missing reference variant count`);
}
for (const id of staleReferenceCounts) {
  problems.push(`${id}: reference variant count is not in PRO_CATEGORIES`);
}

for (const { id } of components) {
  const tags = componentContracts[id];
  const expectedVariantCount = referenceVariantCounts[id];
  if (!Array.isArray(tags) || tags.length === 0) {
    problems.push(`${id}: parity contract must list expected behaviors`);
  }
  if (!Array.isArray(demoIndex[id]) || demoIndex[id].length === 0) {
    problems.push(`${id}: demo-index must list reference variants`);
  }
  if (expectedVariantCount !== undefined && demoIndex[id]?.length !== expectedVariantCount) {
    problems.push(`${id}: expected ${expectedVariantCount} reference variants, found ${demoIndex[id]?.length ?? 0}`);
  }
  if (!docsMeta[id]?.sections || docsMeta[id].sections.length !== demoIndex[id].length) {
    problems.push(`${id}: docs-meta sections must match demo-index variants`);
  }
}

for (const id of browserSmokeComponents) {
  if (!expectedIds.includes(id)) {
    problems.push(`${id}: browser smoke component is not in PRO_CATEGORIES`);
  }
}

const overlayComponents = ['command', 'context-menu', 'emoji-picker', 'hover-card', 'inline-select', 'sheet'];
for (const id of overlayComponents) {
  if (!componentContracts[id]?.some((tag) => tag.includes('popover') || tag.includes('overlay') || tag.includes('dialog') || tag.includes('menu') || tag.includes('sheet') || tag.includes('trigger'))) {
    problems.push(`${id}: overlay component contract must include overlay/trigger behavior`);
  }
}

console.log(`Reference: ${REFERENCE.name} ${REFERENCE.version}`);
console.log(`Reference URL: ${REFERENCE.url}`);
console.log(`Reference checked: ${REFERENCE.checkedAt}`);
console.log(`Parity contract components: ${contractIds.length}`);
console.log(`Reference variant counts: ${countIds.length}`);
console.log(`Browser smoke components: ${browserSmokeComponents.length}`);
console.log('');
console.log('| Category | Component | Variants | Expected behavior tags | Browser smoke |');
console.log('| --- | --- | ---: | --- | --- |');
for (const { category, id } of components) {
  console.log(
    `| ${category} | ${id} | ${demoIndex[id]?.length ?? 0} | ${componentContracts[id]?.join(', ') ?? 'missing'} | ${
      smokeIds.has(id) ? 'yes' : 'no'
    } |`,
  );
}
console.log('');
console.log(
  'Note: this contract is a parity checklist and coverage gate. Full goal completion still requires browser smoke plus manual/visual comparison against the live reference.',
);

if (problems.length > 0) {
  console.error('');
  console.error('Parity contract gaps:');
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exitCode = 1;
}
