const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const stylesDir = path.join(root, 'src/styles');
const componentsDir = path.join(stylesDir, 'components');
const indexPath = path.join(stylesDir, '_index.json');
const libPath = path.join(stylesDir, 'lib.css');

const LIB_HEADER = `/**
 * Vela UI 自有样式聚合入口。
 * 顺序固定：Tailwind properties -> tokens -> base -> shared keyframes -> component blocks -> fonts。
 * 库发布产物 dist/styles.css 由同一顺序拼接生成。
 */`;

const FOUNDATION_IMPORTS = [
  "@import './properties.css';",
  "@import './tokens.css';",
  "@import './base.css' layer(base);",
  "@import './keyframes-shared.css';",
];

function readIndex() {
  return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
}

function buildLibCss(index) {
  const componentImports = index.map((item) => `@import './${item.file}';`);
  return [
    LIB_HEADER,
    ...FOUNDATION_IMPORTS,
    '',
    ...componentImports,
    '',
    "@import './fonts.css';",
    '',
  ].join('\n');
}

function normalize(text) {
  return `${text.trimEnd()}\n`;
}

function main() {
  const isCheck = process.argv.includes('--check');
  const index = readIndex();
  const expectedFiles = index.map((item) => item.file).sort();
  const actualFiles = fs
    .readdirSync(componentsDir)
    .filter((name) => name.endsWith('.css'))
    .map((name) => `components/${name}`)
    .sort();
  const nextLibText = buildLibCss(index);

  if (isCheck) {
    const currentLib = fs.readFileSync(libPath, 'utf8');
    const mismatches = [];
    if (JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles)) {
      mismatches.push('src/styles/_index.json file list');
    }
    if (normalize(currentLib) !== normalize(nextLibText)) mismatches.push('src/styles/lib.css');
    if (mismatches.length > 0) {
      console.error(`CSS index is out of sync: ${mismatches.join(', ')}. Run: pnpm generate:css-index`);
      process.exit(1);
    }
    console.log(`css index ok: ${index.length} component style blocks`);
    return;
  }

  fs.writeFileSync(libPath, nextLibText);
  console.log(`generated lib.css from _index.json: ${index.length} component style blocks`);
}

main();
