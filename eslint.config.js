import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'dist-demo',
      'node_modules',
      'coverage',
      '**/*.d.ts',
      'src/styles/**',
      'public/**',
      // showcase 是开发/演示代码，非发布产物；质量闸聚焦库源码（src/components + src/index）
      'src/showcase/**',
      'src/main.tsx',
      // docs 是文档与导出物料（portable-kit 为 Node 配置脚本，非浏览器库源码），同样不进质量闸
      'docs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // 库源码：开 react-hooks（核心价值，捕获 Hook/依赖类 bug）
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, react: reactPlugin },
    settings: { react: { version: 'detect' } },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // 定义该规则（库内已有 disable 注释引用它）；index key 仅静态列表可用，故 warn
      'react/no-array-index-key': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // 测试文件：vitest + jsdom 环境
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // Node 脚本与配置文件：CommonJS / Node 全局，允许 require
    files: ['scripts/**', '**/*.cjs', '*.config.{js,ts,cjs}', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },
);
