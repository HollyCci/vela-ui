const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packagePath = path.join(root, 'package.json');
const barrelPath = path.join(root, 'src/components/index.ts');

const FIXED_EXPORTS = {
  '.': {
    types: './dist/index.d.ts',
    import: './dist/index.js',
    default: './dist/index.js',
  },
  './styles.css': './dist/styles.css',
  './package.json': './package.json',
};

function readComponentSlugs() {
  const source = fs.readFileSync(barrelPath, 'utf8');
  const valueExportSource = source.split(/\nexport type \* from /)[0] ?? source;
  const slugs = new Set();
  const re = /from\s+['"]\.\/([a-z0-9-]+)['"]/g;
  let match;

  while ((match = re.exec(valueExportSource)) !== null) {
    slugs.add(match[1]);
  }

  return [...slugs].sort();
}

function buildExports(slugs) {
  const exportsMap = { ...FIXED_EXPORTS };

  for (const slug of slugs) {
    exportsMap[`./${slug}`] = {
      types: `./dist/components/${slug}/index.d.ts`,
      import: `./dist/components/${slug}/index.js`,
      default: `./dist/components/${slug}/index.js`,
    };
  }

  return exportsMap;
}

function stableStringifyPackage(pkg) {
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function main() {
  const isCheck = process.argv.includes('--check');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const slugs = readComponentSlugs();
  const nextExports = buildExports(slugs);
  const current = JSON.stringify(pkg.exports);
  const next = JSON.stringify(nextExports);

  if (isCheck) {
    if (current !== next) {
      console.error('package.json exports is out of sync. Run: pnpm generate:exports');
      process.exit(1);
    }
    console.log(`exports ok: ${slugs.length} component subpaths`);
    return;
  }

  pkg.exports = nextExports;
  fs.writeFileSync(packagePath, stableStringifyPackage(pkg));
  console.log(`generated exports: ${slugs.length} component subpaths`);
}

main();
