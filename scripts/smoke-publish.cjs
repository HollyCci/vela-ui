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
    .filter(([key]) => key.startsWith('./') && key !== './styles.css' && key !== './package.json')
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

  const stylesPath = path.join(root, 'dist/styles.css');
  assert(fs.existsSync(stylesPath), 'missing dist/styles.css');
  const styles = fs.readFileSync(stylesPath, 'utf8');
  assert(styles.length > 1000, 'dist/styles.css is unexpectedly small');
  assert(styles.includes('.button'), 'dist/styles.css missing .button marker');
  assert(styles.includes('.card'), 'dist/styles.css missing .card marker');

  const fontsDir = path.join(root, 'dist/fonts');
  assert(fs.existsSync(fontsDir), 'missing dist/fonts');
  assert(fs.readdirSync(fontsDir).some((name) => name.endsWith('.woff2')), 'dist/fonts has no woff2 files');

  const packed = packFileList();
  assert(packed.includes('dist/styles.css'), 'npm pack missing dist/styles.css');
  assert(packed.some((p) => p.startsWith('dist/fonts/') && p.endsWith('.woff2')), 'npm pack missing fonts');
  assert(!packed.some((p) => p.includes('heroui-full.css')), 'npm pack should not include heroui-full.css');

  console.log(`smoke ok: ${entries.length} component subpaths`);
}

main().catch((error) => fail(error.stack || error.message));
