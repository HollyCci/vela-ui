import type { ForwardedRef } from 'react';

/**
 * 把节点写入一个 forwardRef —— 函数 ref 调用、对象 ref 赋值 current。
 * 内部共享工具（input/number-field/textarea/search-field 等需同时回填
 * 内部 contextRef 与外部 forwardRef 的输入族组件复用）。
 */
export const assignRef = <T,>(ref: ForwardedRef<T>, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null) {
    ref.current = value;
  }
};
