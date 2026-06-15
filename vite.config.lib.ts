import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';

const entry = fileURLToPath(new URL('./src/index.ts', import.meta.url));

/**
 * 把自有样式分片 + 字体声明合成单一 dist/styles.css，
 * 并随包发布字体文件（fonts.css 用 ./fonts/*.woff2 相对路径）。
 * 不过 Tailwind —— 组件 CSS 已是预编译产物，消费方无需安装 Tailwind。
 */
function copyStyles() {
  return {
    name: 'vela-copy-styles',
    closeBundle() {
      mkdirSync('dist/fonts', { recursive: true });
      const blocks = JSON.parse(readFileSync('src/styles/_index.json', 'utf8')) as Array<{ file: string }>;
      const css = [
        'src/styles/properties.css',
        'src/styles/tokens.css',
        'src/styles/base.css',
        'src/styles/keyframes-shared.css',
        ...blocks.map((block) => `src/styles/${block.file}`),
        'src/styles/fonts.css',
      ]
        .map((p) => readFileSync(p, 'utf8'))
        .join('\n');
      writeFileSync('dist/styles.css', css);
      cpSync('src/styles/fonts', 'dist/fonts', { recursive: true });
    },
  };
}

/**
 * Rollup 默认剥除模块级 'use client' 指令。本插件在产出阶段，把源文件带该指令的
 * chunk 回填首行 'use client'（per-component preserveModules 下每 chunk 对应一个源模块），
 * 使发布产物保留 RSC 客户端边界。自包含，无需第三方插件。
 */
function preserveUseClient() {
  return {
    name: 'vela-preserve-use-client',
    generateBundle(_options: unknown, bundle: Record<string, { type: string; code?: string; facadeModuleId?: string | null }>) {
      for (const file of Object.values(bundle)) {
        if (file.type !== 'chunk' || !file.facadeModuleId || file.code === undefined) continue;
        try {
          const src = readFileSync(file.facadeModuleId, 'utf8');
          if (/^\s*['"]use client['"]/.test(src) && !/^['"]use client['"]/.test(file.code)) {
            file.code = `'use client';\n${file.code}`;
          }
        } catch {
          /* 源文件不可读则跳过 */
        }
      }
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
  plugins: [react(), preserveUseClient(), copyStyles()],
  build: {
    lib: { entry },
    outDir: 'dist',
    sourcemap: true,
    cssCodeSplit: false,
    emptyOutDir: true,
    target: 'es2020',
    minify: false,
    rollupOptions: {
      external,
      // preserveModules：每组件独立产物 → per-file 'use client' 真生效 + 极致 tree-shake
      output: [
        {
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
      ],
    },
  },
});
