const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'src/styles/_index.json');
const distDir = path.join(root, 'dist');
const distComponentsDir = path.join(distDir, 'components');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function countBlockRules(css, block) {
  const escaped = block.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\.${escaped}(?:__|--|[\\s.#:\\[,>{+~)]|$)`, 'g');
  return (css.match(re) ?? []).length;
}

function main() {
  if (!fs.existsSync(distDir)) fail('dist does not exist. Run: pnpm build');
  if (fs.existsSync(path.join(distDir, 'styles.css'))) fail('legacy dist/styles.css must not exist');

  const blocks = JSON.parse(read(indexPath));
  const componentCss = blocks
    .map((item) => {
      const filename = item.file.replace(/^components\//, '');
      const file = path.join(distComponentsDir, filename);
      if (!fs.existsSync(file)) fail(`missing component CSS file: dist/components/${filename}`);
      return read(file);
    })
    .join('\n');
  const tokensCss = read(path.join(distDir, 'tokens.css'));
  const fontsCss = read(path.join(distDir, 'fonts.css'));
  const keyframesCss = read(path.join(distDir, 'keyframes.css'));
  const css = [tokensCss, fontsCss, keyframesCss, componentCss].join('\n');
  const missing = [];
  const lowCoverage = [];

  if (css.includes('heroui-full')) {
    fail('published CSS still contains heroui-full marker');
  }

  if (css.includes('--tw-')) {
    fail('published CSS must not expose Tailwind internal --tw-* variables');
  }

  if (css.includes('border: 0 solid')) {
    fail('published CSS must not include Tailwind preflight border reset');
  }

  if (css.includes('body {\n  background-color: var(--background);')) {
    fail('published CSS must not style the host body');
  }

  for (const item of blocks) {
    const count = countBlockRules(css, item.block);
    if (count === 0) missing.push(item.block);
    if (item.count > 0 && count < Math.max(1, Math.floor(item.count * 0.6))) {
      lowCoverage.push(`${item.block}: expected~${item.count}, found ${count}`);
    }
  }

  if (missing.length > 0) {
    fail(`missing CSS blocks: ${missing.slice(0, 30).join(', ')}${missing.length > 30 ? '...' : ''}`);
  }

  const requiredTokens = ['--font-inter', '--background', '--foreground', '--radius', '--ease-smooth'];
  const missingTokens = requiredTokens.filter((token) => !css.includes(token));
  if (missingTokens.length > 0) fail(`missing required tokens: ${missingTokens.join(', ')}`);

  const requiredKeyframes = ['@keyframes enter', '@keyframes exit', '@keyframes spin'];
  const missingKeyframes = requiredKeyframes.filter((name) => !css.includes(name));
  if (missingKeyframes.length > 0) fail(`missing required keyframes: ${missingKeyframes.join(', ')}`);

  if (lowCoverage.length > 0) {
    console.warn(`low CSS block coverage warnings (${lowCoverage.length}):`);
    for (const item of lowCoverage.slice(0, 20)) console.warn(`  - ${item}`);
  }

  console.log(`css parity ok: ${blocks.length} blocks covered, ${css.length} bytes across CSS subpaths`);
}

main();
