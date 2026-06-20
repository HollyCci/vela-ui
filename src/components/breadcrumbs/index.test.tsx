import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Breadcrumbs from './index';

describe('Breadcrumbs', () => {
  it('renders a labelled nav with an ordered list', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item label="首页" href="/" />
        <Breadcrumbs.Item label="设置" href="/settings" />
        <Breadcrumbs.Item label="个人资料" isCurrent />
      </Breadcrumbs>,
    );
    const nav = screen.getByRole('navigation', { name: '面包屑' });
    expect(nav).toBeInTheDocument();
    const list = within(nav).getByRole('list');
    expect(list).toHaveClass('breadcrumbs');
  });

  it('renders href links for non-current items', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item label="首页" href="/home" />
      </Breadcrumbs>,
    );
    const link = screen.getByText('首页');
    expect(link).toHaveAttribute('href', '/home');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('current item drops href and gets aria-current=page', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item label="当前页" href="/should-be-ignored" isCurrent />
      </Breadcrumbs>,
    );
    const link = screen.getByText('当前页');
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveAttribute('data-current', 'true');
  });

  it('renders a separator only for non-current items', () => {
    const { container } = render(
      <Breadcrumbs>
        <Breadcrumbs.Item label="A" href="/a" />
        <Breadcrumbs.Item label="B" isCurrent />
      </Breadcrumbs>,
    );
    // 仅第一项（非 current）渲染 separator
    expect(container.querySelectorAll('.breadcrumbs__separator')).toHaveLength(1);
  });

  it('falls back to the default chevron separator when none is provided', () => {
    const { container } = render(
      <Breadcrumbs>
        <Breadcrumbs.Item label="A" href="/a" />
        <Breadcrumbs.Item label="B" isCurrent />
      </Breadcrumbs>,
    );
    const sep = container.querySelector('.breadcrumbs__separator');
    // 默认分隔符是内置 chevron svg，并带 OSS 对齐的 data-slot
    expect(sep?.tagName.toLowerCase()).toBe('svg');
    expect(sep).toHaveAttribute('data-slot', 'breadcrumbs-separator');
  });

  it('renders a custom element separator with injected class + data-slot, preserving its props', () => {
    const { container } = render(
      <Breadcrumbs separator={<span className="my-sep">/</span>}>
        <Breadcrumbs.Item label="A" href="/a" />
        <Breadcrumbs.Item label="B" href="/b" />
        <Breadcrumbs.Item label="C" isCurrent />
      </Breadcrumbs>,
    );
    const seps = container.querySelectorAll('.breadcrumbs__separator');
    // 两个非 current 项各渲染一个自定义 separator
    expect(seps).toHaveLength(2);
    seps.forEach((sep) => {
      // cloneElement 注入：分隔符 class（保留原 className）+ data-slot
      expect(sep.tagName.toLowerCase()).toBe('span');
      expect(sep).toHaveClass('breadcrumbs__separator');
      expect(sep).toHaveClass('my-sep');
      expect(sep).toHaveAttribute('data-slot', 'breadcrumbs-separator');
      expect(sep).toHaveTextContent('/');
    });
    // 不应再渲染默认 chevron svg
    expect(container.querySelector('svg.breadcrumbs__separator')).toBeNull();
  });

  it('renders a non-element (string) separator verbatim', () => {
    const { container } = render(
      <Breadcrumbs separator="›">
        <Breadcrumbs.Item label="A" href="/a" />
        <Breadcrumbs.Item label="B" isCurrent />
      </Breadcrumbs>,
    );
    const firstItem = container.querySelector('.breadcrumbs__item');
    // 字符串 separator 原样渲染，不包裹、不注入 class
    expect(firstItem).toHaveTextContent('A›');
    expect(container.querySelector('.breadcrumbs__separator')).toBeNull();
  });

  it('keeps a custom separator off the last/current item', () => {
    const { container } = render(
      <Breadcrumbs separator={<span className="my-sep">/</span>}>
        <Breadcrumbs.Item label="A" href="/a" />
        <Breadcrumbs.Item label="B" isCurrent />
      </Breadcrumbs>,
    );
    // 末项（current）不渲染 separator
    expect(container.querySelectorAll('.breadcrumbs__separator')).toHaveLength(1);
  });

  it('forwards linkProps to the anchor', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item label="外链" href="/x" linkProps={{ target: '_blank' }} />
      </Breadcrumbs>,
    );
    expect(screen.getByText('外链')).toHaveAttribute('target', '_blank');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <Breadcrumbs>
        <Breadcrumbs.Item label="首页" href="/" />
        <Breadcrumbs.Item label="设置" href="/settings" />
        <Breadcrumbs.Item label="个人资料" isCurrent />
      </Breadcrumbs>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe a11y violations with a custom separator', async () => {
    const { container } = render(
      <Breadcrumbs separator={<span aria-hidden="true">/</span>}>
        <Breadcrumbs.Item label="首页" href="/" />
        <Breadcrumbs.Item label="设置" href="/settings" />
        <Breadcrumbs.Item label="个人资料" isCurrent />
      </Breadcrumbs>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
