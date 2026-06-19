import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';

const entry = fileURLToPath(new URL('./src/index.ts', import.meta.url));

/**
 * 把自有样式分片发布成 HeroUI-style CSS-first 目录：
 * index.css 是分层主入口，子路径给已有设计系统按需集成使用。
 * 不跑 Tailwind —— 组件 CSS 已是预编译产物，消费方无需安装 Tailwind。
 */
const scrollbarUtilitiesStart = '[data-scrollbar=thin]';

function extractPublishBase(css: string) {
  const start = css.indexOf(scrollbarUtilitiesStart);

  if (start === -1) return '';

  return css.slice(start);
}

function scopeTailwindRuntimeVars(css: string) {
  return css
    .replaceAll('Tailwind 内部变量注册', 'Vela 内部变量注册')
    .replaceAll('@layer properties', '@layer vela-properties')
    .replaceAll('--tw-', '--vela-tw-');
}

function readPublishCss(file: string) {
  return scopeTailwindRuntimeVars(readFileSync(file, 'utf8'));
}

function copyStyles() {
  return {
    name: 'vela-copy-styles',
    closeBundle() {
      mkdirSync('dist/fonts', { recursive: true });
      mkdirSync('dist/base', { recursive: true });
      mkdirSync('dist/components', { recursive: true });
      mkdirSync('dist/themes/default', { recursive: true });

      const blocks = JSON.parse(readFileSync('src/styles/_index.json', 'utf8')) as Array<{ file: string }>;
      const propertiesCss = readPublishCss('src/styles/properties.css');
      const tokensCss = readPublishCss('src/styles/tokens.css');
      const baseCss = scopeTailwindRuntimeVars(extractPublishBase(readFileSync('src/styles/base.css', 'utf8')));
      const keyframesCss = readPublishCss('src/styles/keyframes-shared.css');
      const fontsCss = readPublishCss('src/styles/fonts.css');
      const componentBlocks = blocks.map((block) => ({
        file: block.file.replace(/^components\//, ''),
        css: readPublishCss(`src/styles/${block.file}`),
      }));
      const componentImports = componentBlocks.map((block) => `@import "./${block.file}";`).join('\n');

      writeFileSync('dist/properties.css', propertiesCss);
      writeFileSync('dist/tokens.css', tokensCss);
      writeFileSync('dist/base/scrollbar.css', baseCss);
      writeFileSync('dist/base/base.css', '@import "./scrollbar.css";\n');
      writeFileSync('dist/keyframes.css', keyframesCss);
      writeFileSync('dist/fonts.css', fontsCss);
      writeFileSync('dist/components/index.css', `${componentImports}\n`);
      writeFileSync('dist/components.css', '@import "./properties.css";\n@import "./keyframes.css";\n@import "./components/index.css";\n');
      writeFileSync('dist/themes/default/index.css', '@import "../../tokens.css";\n');
      writeFileSync(
        'dist/index.css',
        [
          '@layer vela-theme, vela-base, vela-components;',
          '',
          '@import "./properties.css";',
          '@import "./tokens.css" layer(vela-theme);',
          '@import "./base/base.css" layer(vela-base);',
          '@import "./keyframes.css";',
          '@import "./components/index.css" layer(vela-components);',
          '@import "./fonts.css";',
          '',
        ].join('\n'),
      );

      for (const block of componentBlocks) {
        writeFileSync(`dist/components/${block.file}`, block.css);
      }

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
  // button 用 @heroui/styles 的 buttonVariants(runtime)；不标 external 会被 preserveModules
  // 连 tailwind-variants/merge 一起 vendored 进 dist/node_modules（184KB 冗余 + 版本冻结）
  /^@heroui\/styles($|\/)/,
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
          // 保留位置映射但不内联 .tsx 源码，避免随受限包发出全部源码
          sourcemapExcludeSources: true,
        },
      ],
    },
  },
});
