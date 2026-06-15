import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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

  it('forwards linkProps to the anchor', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item label="外链" href="/x" linkProps={{ target: '_blank' }} />
      </Breadcrumbs>,
    );
    expect(screen.getByText('外链')).toHaveAttribute('target', '_blank');
  });
});
