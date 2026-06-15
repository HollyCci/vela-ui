import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5180 },
  // 展示站构建输出独立目录，避免 build:demo 覆盖库发布产物 dist/
  build: { outDir: 'dist-demo' },
});
