import type { CSSProperties } from 'react';

/**
 * 视觉隐藏但保留可访问性的原生控件样式：原生 input/控件用它承载语义，
 * 屏幕阅读器仍可达，视觉上由自绘的 BEM 元素呈现。
 * 内部共享常量（radio/checkbox/switch 等手写原生 DOM 的基础组件复用）。
 */
export const VISUALLY_HIDDEN: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
};
