import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import Resizable, { type ResizableImperativeHandle } from './index';

// react-resizable-panels 依赖 ResizeObserver 测量；jsdom 未实现，mock 之。
// 无真实布局，故不断言尺寸/像素，只测结构/data-slot/role/方向类与命令式句柄存在。
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe('Resizable', () => {
  it('renders group with data-slot and orientation class', () => {
    render(
      <Resizable orientation="horizontal">
        <Resizable.Panel id="a" defaultSize={50}>
          A
        </Resizable.Panel>
        <Resizable.Handle id="h" />
        <Resizable.Panel id="b" defaultSize={50}>
          B
        </Resizable.Panel>
      </Resizable>,
    );
    const group = document.querySelector('[data-slot="resizable"]');
    expect(group).toBeInTheDocument();
    expect(group).toHaveClass('resizable');
    expect(group).toHaveClass('resizable--horizontal');
  });

  it('renders panels and handle with their data-slots', () => {
    render(
      <Resizable>
        <Resizable.Panel id="a" defaultSize={60}>
          Left
        </Resizable.Panel>
        <Resizable.Handle id="h" withIndicator />
        <Resizable.Panel id="b" defaultSize={40}>
          Right
        </Resizable.Panel>
      </Resizable>,
    );
    expect(document.querySelectorAll('[data-slot="resizable-panel"]').length).toBe(2);
    const handle = document.querySelector('[data-slot="resizable-handle"]');
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute('data-type', 'line');
    expect(handle).toHaveAttribute('aria-label', 'Resize handle');
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('Handle renders a pill indicator when withIndicator', () => {
    render(
      <Resizable>
        <Resizable.Panel id="a">A</Resizable.Panel>
        <Resizable.Handle id="h" withIndicator />
        <Resizable.Panel id="b">B</Resizable.Panel>
      </Resizable>,
    );
    const indicator = document.querySelector('[data-slot="resizable-handle-indicator"]');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('resizable__handle-indicator--pill');
  });

  it('Handle type=drag renders the drag-dots icon indicator', () => {
    render(
      <Resizable>
        <Resizable.Panel id="a">A</Resizable.Panel>
        <Resizable.Handle id="h" type="drag" />
        <Resizable.Panel id="b">B</Resizable.Panel>
      </Resizable>,
    );
    expect(
      document.querySelector('[data-slot="resizable-handle-indicator-icon"]'),
    ).toBeInTheDocument();
  });

  it('exposes imperative getLayout/setLayout via handleRef', () => {
    const handleRef = createRef<ResizableImperativeHandle>();
    render(
      <Resizable handleRef={handleRef}>
        <Resizable.Panel id="a" defaultSize={50}>
          A
        </Resizable.Panel>
        <Resizable.Handle id="h" />
        <Resizable.Panel id="b" defaultSize={50}>
          B
        </Resizable.Panel>
      </Resizable>,
    );
    expect(handleRef.current).not.toBeNull();
    expect(typeof handleRef.current?.getLayout).toBe('function');
    expect(typeof handleRef.current?.setLayout).toBe('function');
    // getLayout 返回按面板登记顺序的数组（jsdom 下尺寸值不可靠，仅断言长度/结构）
    const layout = handleRef.current?.getLayout();
    expect(Array.isArray(layout)).toBe(true);
    expect(layout?.length).toBe(2);
  });
});
