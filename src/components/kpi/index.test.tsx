import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Kpi from './index';

describe('Kpi', () => {
  it('renders root with data-slot and BEM class', () => {
    render(
      <Kpi>
        <Kpi.Title>Weekly learners</Kpi.Title>
        <Kpi.Value>1,286</Kpi.Value>
      </Kpi>,
    );
    const root = document.querySelector('[data-slot="kpi"]') as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('kpi');
    expect(screen.getByText('Weekly learners')).toBeInTheDocument();
    expect(screen.getByText('1,286')).toBeInTheDocument();
  });

  it('renders composed sections with their BEM classes', () => {
    render(
      <Kpi>
        <Kpi.Header>
          <Kpi.Icon status="success">i</Kpi.Icon>
          <Kpi.Title>title</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>10</Kpi.Value>
          <Kpi.Trend>+5%</Kpi.Trend>
        </Kpi.Content>
        <Kpi.Separator />
        <Kpi.Footer>footer</Kpi.Footer>
      </Kpi>,
    );
    expect(document.querySelector('.kpi__header')).toBeInTheDocument();
    expect(document.querySelector('.kpi__content')).toBeInTheDocument();
    expect(document.querySelector('.kpi__value')).toHaveTextContent('10');
    expect(document.querySelector('.kpi__trend')).toHaveTextContent('+5%');
    expect(document.querySelector('.kpi__footer')).toHaveTextContent('footer');
  });

  it('Value formats a numeric value with toLocaleString by default', () => {
    render(<Kpi.Value value={1286} />);
    const value = document.querySelector('.kpi__value') as HTMLElement;
    expect(value).toHaveTextContent((1286).toLocaleString());
  });

  it('Value supports a render-function child receiving the formatted value', () => {
    render(<Kpi.Value value={76.5}>{(formatted) => `${formatted}%`}</Kpi.Value>);
    expect(document.querySelector('.kpi__value')).toHaveTextContent('76.5%');
  });

  it('Value falls back to children when no value prop is given', () => {
    render(<Kpi.Value>42 分钟</Kpi.Value>);
    expect(document.querySelector('.kpi__value')).toHaveTextContent('42 分钟');
  });

  it('Trend renders a TrendChip when given a value', () => {
    render(<Kpi.Trend trend="up" value="+12.4%" />);
    const trend = document.querySelector('.kpi__trend') as HTMLElement;
    expect(trend).toBeInTheDocument();
    expect(trend).toHaveTextContent('+12.4%');
  });

  it('Trend without direction sets no data-trend and renders children only', () => {
    render(<Kpi.Trend>+5%</Kpi.Trend>);
    const trend = document.querySelector('.kpi__trend') as HTMLElement;
    expect(trend).not.toHaveAttribute('data-trend');
    expect(trend).toHaveTextContent('+5%');
  });

  it('Icon reflects status via data-status and is aria-hidden', () => {
    render(<Kpi.Icon status="warning">!</Kpi.Icon>);
    const icon = document.querySelector('.kpi__icon') as HTMLElement;
    expect(icon).toHaveAttribute('data-status', 'warning');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('Separator has role=separator and separator classes', () => {
    render(<Kpi.Separator />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveClass('kpi__separator', 'separator', 'separator--horizontal');
  });

  it('has no axe a11y violations', async () => {
    const { container } = render(
      <Kpi>
        <Kpi.Header>
          <Kpi.Icon status="success">i</Kpi.Icon>
          <Kpi.Title>Weekly learners</Kpi.Title>
        </Kpi.Header>
        <Kpi.Content>
          <Kpi.Value>1,286</Kpi.Value>
          <Kpi.Trend>+5%</Kpi.Trend>
        </Kpi.Content>
        <Kpi.Separator />
        <Kpi.Footer>vs. last week</Kpi.Footer>
      </Kpi>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
