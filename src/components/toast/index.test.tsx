import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, within } from '@testing-library/react';
import Toast, { Toaster, toast, useToast } from './index';
import { renderHook } from '@testing-library/react';

// store 是模块级单例：测试间需清场，否则上一条 toast 残留会污染下一个用例。
// 这里用一条已知 close 的方式收尾（每个用例自行关闭自己加的 toast）。
// startViewTransition：jsdom 不实现，组件会优雅降级为直接 setState（无动画）。
// 为覆盖"真站走 view transition"那条分支，部分用例显式 stub 成同步执行 callback。

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Toast (presentational)', () => {
  it('渲染 title/description, role=alert, BEM class', () => {
    render(<Toast title="已保存" description="你的更改已生效" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('toast');
    expect(within(alert).getByText('已保存')).toBeInTheDocument();
    expect(within(alert).getByText('你的更改已生效')).toBeInTheDocument();
  });

  it('color/placement 生成对应修饰 class; default color 不加颜色 class', () => {
    const { rerender } = render(<Toast title="t" color="success" placement="top" />);
    let alert = screen.getByRole('alert');
    expect(alert).toHaveClass('toast--top');
    expect(alert).toHaveClass('toast--success');

    rerender(<Toast title="t" color="default" placement="bottom-end" />);
    alert = screen.getByRole('alert');
    expect(alert).toHaveClass('toast--bottom-end');
    expect(alert.className).not.toContain('toast--default');
  });

  it('提供 onClose 时渲染关闭按钮并触发回调', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const onClose = vi.fn();
    render(<Toast title="t" onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '关闭' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('isFrontmost=false 时不带 data-frontmost', () => {
    render(<Toast title="t" isFrontmost={false} />);
    expect(screen.getByRole('alert')).not.toHaveAttribute('data-frontmost');
  });
});

describe('Toast 编排器 (store / toast() / Toaster)', () => {
  beforeEach(() => {
    // 真站路径：startViewTransition 存在 → 同步执行 callback 的 mock。
    // 断言 store 在 view-transition 包裹下仍正确插入/移除节点。
    const startViewTransition = vi.fn((cb: () => void) => {
      cb();
      return { finished: Promise.resolve(), ready: Promise.resolve(), updateCallbackDone: Promise.resolve() };
    });
    // 挂到 document 上（组件读 document.startViewTransition）
    (document as unknown as { startViewTransition?: unknown }).startViewTransition = startViewTransition;
  });

  afterEach(() => {
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
  });

  // ── 回归：触发一条 toast 出现, 再 close 它能移除 ──────────────────────────────
  it('回归: toast() 添加后出现, toast.close(id) 后移除 (经 startViewTransition)', async () => {
    render(<Toaster />);

    let id = '';
    act(() => {
      id = toast({ title: '上传成功', timeout: 0 });
    });

    // 出现
    expect(await screen.findByText('上传成功')).toBeInTheDocument();

    // 关闭
    act(() => {
      toast.close(id);
    });

    await waitFor(() => {
      expect(screen.queryByText('上传成功')).not.toBeInTheDocument();
    });
  });

  it('toast() 自动超时后移除', async () => {
    vi.useFakeTimers();
    try {
      render(<Toaster />);
      act(() => {
        toast({ title: '稍后消失', timeout: 50 });
      });
      expect(screen.getByText('稍后消失')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(screen.queryByText('稍后消失')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('Toaster 渲染 region (role=region, aria-label=通知)', () => {
    render(<Toaster />);
    expect(screen.getByRole('region', { name: '通知' })).toBeInTheDocument();
  });

  it('点击栈内 toast 的关闭按钮移除该条', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<Toaster />);
    act(() => {
      toast({ title: '可手动关闭', timeout: 0 });
    });
    expect(await screen.findByText('可手动关闭')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '关闭' }));
    await waitFor(() => {
      expect(screen.queryByText('可手动关闭')).not.toBeInTheDocument();
    });
  });

  it('useToast hook 返回 toast/close, 能添加并移除', async () => {
    render(<Toaster />);
    const { result } = renderHook(() => useToast());

    let id = '';
    act(() => {
      id = result.current.toast({ title: 'hook 弹出', timeout: 0 });
    });
    expect(await screen.findByText('hook 弹出')).toBeInTheDocument();

    act(() => {
      result.current.close(id);
    });
    await waitFor(() => {
      expect(screen.queryByText('hook 弹出')).not.toBeInTheDocument();
    });
  });
});
