import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// 组件单元/回归测试：jsdom + Testing Library。不过 Tailwind（css:false），
// 测试聚焦行为/DOM 结构/data-slot/可访问性，不依赖真实样式渲染。
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/components/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    clearMocks: true,
  },
});
