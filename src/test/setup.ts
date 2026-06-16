// Testing Library 自定义匹配器（toBeInTheDocument / toHaveAttribute / toHaveFocus 等）
// 并在每个测试后自动 cleanup（@testing-library/react 在存在全局 afterEach 时自动注册）。
import '@testing-library/jest-dom/vitest';

// axe-core 无障碍断言匹配器（toHaveNoViolations）：组件级 ARIA/角色/可访问名自动检测
import { expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';
expect.extend(axeMatchers);
