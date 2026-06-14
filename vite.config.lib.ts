import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';

const entry = fileURLToPath(new URL('./src/index.ts', import.meta.url));

/**
 * 把自包含的 heroui-full.css + data-grid 分片 + 字体声明合成单一 dist/styles.css，
 * 并随包发布字体文件（fonts.css 用 ./fonts/*.woff2 相对路径）。
 * 不过 Tailwind —— heroui-full.css 已是预编译产物，消费方无需安装 Tailwind。
 */
function copyStyles() {
  return {
    name: 'vela-copy-styles',
    closeBundle() {
      mkdirSync('dist/fonts', { recursive: true });
      const css = [
        'src/styles/heroui-full.css',
        'src/styles/components/data-grid.css',
        'src/styles/fonts.css',
      ]
        .map((p) => readFileSync(p, 'utf8'))
        .join('\n');
      writeFileSync('dist/styles.css', css);
      cpSync('src/styles/fonts', 'dist/fonts', { recursive: true });
    },
  };
}

// 运行时由宿主提供 / 库自身依赖均外部化，不打进产物
const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom/client',
  'react-dom/server',
  /^@heroui\/react($|\/)/,
  /^react-aria-components($|\/)/,
  'clsx',
  /^embla-carousel($|-react$)/,
  /^motion($|\/)/,
  '@number-flow/react',
  'react-resizable-panels',
  /^recharts($|\/)/,
];

export default defineConfig({
  plugins: [react(), copyStyles()],
  build: {
    lib: {
      entry,
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    outDir: 'dist',
    sourcemap: true,
    cssCodeSplit: false,
    emptyOutDir: true,
    target: 'es2020',
    minify: false,
    rollupOptions: { external },
  },
});
