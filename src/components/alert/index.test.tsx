import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Alert from './index';

describe('Alert', () => {
  it('renders role=alert with title and BEM color class', () => {
    render(<Alert color="success" title="Saved" />);
    const root = screen.getByRole('alert');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('alert', 'alert--success');
    expect(screen.getByText('Saved')).toHaveClass('alert__title');
  });

  it('renders description only when provided', () => {
    const { rerender } = render(<Alert title="T" />);
    expect(screen.getByRole('alert').querySelector('.alert__description')).toBeNull();
    rerender(<Alert title="T" description="D" />);
    expect(screen.getByText('D')).toHaveClass('alert__description');
  });

  // 回归：不传 indicator 时渲染默认状态图标 svg[data-slot=alert-default-icon]
  it('regression: shows default status icon when indicator is omitted', () => {
    render(<Alert color="danger" title="Boom" />);
    const root = screen.getByRole('alert');
    const indicator = root.querySelector('.alert__indicator');
    expect(indicator).not.toBeNull();
    const icon = root.querySelector('svg[data-slot="alert-default-icon"]');
    expect(icon).not.toBeNull();
  });

  // 回归：indicator={null} 时无任何 .alert__indicator
  it('regression: renders no indicator wrapper when indicator is null', () => {
    render(<Alert color="warning" title="Quiet" indicator={null} />);
    const root = screen.getByRole('alert');
    expect(root.querySelector('.alert__indicator')).toBeNull();
    expect(root.querySelector('svg[data-slot="alert-default-icon"]')).toBeNull();
  });

  it('renders a custom indicator instead of the default icon', () => {
    render(<Alert title="Custom" indicator={<span data-testid="my-ind">X</span>} />);
    const root = screen.getByRole('alert');
    expect(root.querySelector('.alert__indicator')).not.toBeNull();
    expect(screen.getByTestId('my-ind')).toBeInTheDocument();
    expect(root.querySelector('svg[data-slot="alert-default-icon"]')).toBeNull();
  });

  it('uses the default color when none is passed', () => {
    render(<Alert title="Default" />);
    expect(screen.getByRole('alert')).toHaveClass('alert--default');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <Alert color="success" title="Saved" description="Your changes were saved." />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
