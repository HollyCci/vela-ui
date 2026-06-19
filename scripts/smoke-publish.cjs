const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function fail(message) {
  console.error(message);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function componentExportEntries() {
  return Object.entries(pkg.exports)
    .filter(([key, value]) => key.startsWith('./') && key !== './package.json' && typeof value === 'object' && value.types && value.import)
    .sort(([a], [b]) => a.localeCompare(b));
}

function resolveExportTarget(exportValue, condition) {
  if (typeof exportValue === 'string') return exportValue;
  const target = exportValue[condition];
  assert(typeof target === 'string', `missing ${condition} condition in export`);
  return target;
}

async function importTarget(target) {
  const abs = path.join(root, target);
  return import(pathToFileURL(abs).href);
}

function resolveCssExportTarget(exportValue) {
  if (typeof exportValue === 'string') return exportValue;
  return exportValue.style ?? exportValue.default;
}

function assertCssExport(key, marker) {
  const target = resolveCssExportTarget(pkg.exports[key]);
  assert(typeof target === 'string', `${key} CSS export target missing`);
  const abs = path.join(root, target);
  assert(fs.existsSync(abs), `${key} CSS target missing: ${target}`);
  const css = fs.readFileSync(abs, 'utf8');
  if (marker) assert(css.includes(marker), `${key} missing marker: ${marker}`);
  assert(!css.includes('--tw-'), `${key} must not expose Tailwind internal --tw-* variables`);
  assert(!css.includes('@layer properties'), `${key} must not expose Tailwind properties layer`);
  assert(!css.includes('border: 0 solid'), `${key} must not include Tailwind preflight border reset`);
  assert(!css.includes('body {\n  background-color: var(--background);'), `${key} must not style the host body`);
  return { target, css };
}

function assertCssFile(target, marker) {
  const abs = path.join(root, target);
  assert(fs.existsSync(abs), `CSS file missing: ${target}`);
  const css = fs.readFileSync(abs, 'utf8');
  if (marker) assert(css.includes(marker), `${target} missing marker: ${marker}`);
  assert(!css.includes('--tw-'), `${target} must not expose Tailwind internal --tw-* variables`);
  assert(!css.includes('@layer properties'), `${target} must not expose Tailwind properties layer`);
  assert(!css.includes('border: 0 solid'), `${target} must not include Tailwind preflight border reset`);
  assert(!css.includes('body {\n  background-color: var(--background);'), `${target} must not style the host body`);
}

function packFileList() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vela-pack-'));
  const output = execFileSync('npm', ['pack', '--json', '--pack-destination', tmp], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const parsed = JSON.parse(output)[0];
  return parsed.files.map((f) => f.path);
}

async function main() {
  assert(fs.existsSync(path.join(root, 'dist')), 'dist does not exist. Run: pnpm build');
  assert(fs.existsSync(path.join(root, 'dist/index.js')), 'missing dist/index.js');
  assert(fs.existsSync(path.join(root, 'dist/index.d.ts')), 'missing dist/index.d.ts');
  assert(!fs.existsSync(path.join(root, 'dist/index.cjs')), 'ESM-only package must not emit dist/index.cjs');

  const rootImport = await importTarget(resolveExportTarget(pkg.exports['.'], 'import'));
  assert(Object.keys(rootImport).length > 0, 'ESM root import has no exports');

  const entries = componentExportEntries();
  assert(entries.length > 0, 'no component subpath exports found');
  assert(!entries.some(([key]) => key.includes('_internal')), 'exports must not expose _internal');

  for (const [key, value] of entries) {
    assert(value.require === undefined, `${key} must not expose a require condition`);
    for (const condition of ['types', 'import']) {
      const target = resolveExportTarget(value, condition);
      assert(fs.existsSync(path.join(root, target)), `${key} ${condition} target missing: ${target}`);
    }
    assert(!fs.existsSync(path.join(root, `dist/components/${key.slice(2)}/index.cjs`)), `${key} must not emit CJS`);

    const mod = await importTarget(resolveExportTarget(value, 'import'));
    assert(mod.default !== undefined, `${key} ESM default export is missing`);
  }

  assert(!fs.existsSync(path.join(root, 'dist/styles.css')), 'legacy dist/styles.css must not be emitted');
  const indexCss = assertCssExport('./css', '@layer vela-theme, vela-base, vela-components;').css;
  assert(indexCss.includes('@import "./components/index.css" layer(vela-components);'), 'main CSS must layer component imports');
  assertCssExport('./properties.css', '--vela-tw-shadow');
  assertCssExport('./tokens.css', '--background');
  assertCssExport('./base', '@import "./scrollbar.css";');
  assertCssExport('./components.css', '@import "./components/index.css";');
  assert(pkg.exports['./base/*.css'] === './dist/base/*.css', 'missing base CSS pattern export');
  assert(pkg.exports['./components/*.css'] === './dist/components/*.css', 'missing component CSS pattern export');
  assertCssFile('dist/components/button.css', '.button');
  assertCssExport('./themes/default', '@import "../../tokens.css";');
  assertCssExport('./keyframes.css', '@keyframes enter');
  assertCssExport('./fonts.css', '--font-inter');

  const fontsDir = path.join(root, 'dist/fonts');
  assert(fs.existsSync(fontsDir), 'missing dist/fonts');
  assert(fs.readdirSync(fontsDir).some((name) => name.endsWith('.woff2')), 'dist/fonts has no woff2 files');

  const packed = packFileList();
  assert(packed.includes('dist/index.css'), 'npm pack missing dist/index.css');
  assert(packed.includes('dist/tokens.css'), 'npm pack missing dist/tokens.css');
  assert(packed.includes('dist/components.css'), 'npm pack missing dist/components.css');
  assert(packed.includes('dist/components/button.css'), 'npm pack missing component CSS files');
  assert(!packed.includes('dist/styles.css'), 'npm pack must not include legacy dist/styles.css');
  assert(packed.some((p) => p.startsWith('dist/fonts/') && p.endsWith('.woff2')), 'npm pack missing fonts');
  assert(!packed.some((p) => p.includes('heroui-full.css')), 'npm pack should not include heroui-full.css');

  console.log(`smoke ok: ${entries.length} component subpaths`);
}

main().catch((error) => fail(error.stack || error.message));
