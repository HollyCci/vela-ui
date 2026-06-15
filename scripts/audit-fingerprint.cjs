const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const RELEASE_FORBIDDEN = [
  /heroui-full/i,
  /heroui\.pro/i,
  /@heroui-pro/i,
  /fumadocs/i,
  /原站/,
];

const RELEASE_STRICT = [
  { name: 'fd-* document tokens/classes', re: /(?:--fd-|text-fd-|bg-fd-|border-fd-|fd-)/g },
  { name: 'next font module hashes', re: /-module__[A-Za-z0-9]+__/g },
];

const SOURCE_WARN = [
  { name: '原站 comments', re: /原站/g },
  { name: 'heroui.pro references', re: /heroui\.pro/g },
  { name: 'heroui-full references', re: /heroui-full/g },
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file);
}

function readMaybe(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function count(re, text) {
  return (text.match(re) ?? []).length;
}

function main() {
  const failures = [];
  const warnings = [];
  const distFiles = walk(path.join(root, 'dist')).filter((file) => /\.(css|js|cjs|d\.ts|json)$/.test(file));

  for (const file of distFiles) {
    const text = readMaybe(file);
    for (const re of RELEASE_FORBIDDEN) {
      if (re.test(text)) failures.push(`${rel(file)} contains forbidden pattern ${re}`);
    }
    for (const rule of RELEASE_STRICT) {
      const n = count(rule.re, text);
      if (n > 0) failures.push(`${rel(file)} contains ${rule.name} (${n})`);
    }
  }

  const sourceFiles = [
    ...walk(path.join(root, 'src')),
    ...['README.md', 'PATTERN.md', 'package.json']
      .map((file) => path.join(root, file))
      .filter((file) => fs.existsSync(file)),
  ].filter((file) => /\.(ts|tsx|css|md|json)$/.test(file));

  for (const file of sourceFiles) {
    const text = readMaybe(file);
    for (const rule of SOURCE_WARN) {
      const n = count(rule.re, text);
      if (n > 0) warnings.push(`${rel(file)}: ${rule.name} (${n})`);
    }
  }

  if (warnings.length > 0) {
    console.warn(`fingerprint warnings (${warnings.length}):`);
    for (const item of warnings.slice(0, 40)) console.warn(`  - ${item}`);
  }

  if (failures.length > 0) {
    console.error(`fingerprint failures (${failures.length}):`);
    for (const item of failures.slice(0, 40)) console.error(`  - ${item}`);
    process.exit(1);
  }

  console.log('fingerprint audit ok');
}

main();
