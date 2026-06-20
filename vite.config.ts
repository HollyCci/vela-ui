import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5180 },
  // GitHub Pages 项目页需 /vela-ui/ 前缀；仅部署 workflow 设 VELA_PAGES_BASE，
  // 本地 dev / 本地 build:demo 不设 → base '/'，不受影响。
  base: process.env.VELA_PAGES_BASE || '/',
  // 展示站构建输出独立目录，避免 build:demo 覆盖库发布产物 dist/
  build: { outDir: 'dist-demo' },
});
