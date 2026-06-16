import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import NativeSelect from './index';

describe('NativeSelect', () => {
  it('renders root + select with data-slots and options', () => {
    const { container } = render(
      <NativeSelect>
        <NativeSelect.Label>Campus</NativeSelect.Label>
        <NativeSelect.Trigger defaultValue="bj">
          <NativeSelect.Option value="bj">Beijing</NativeSelect.Option>
          <NativeSelect.Option value="sh">Shanghai</NativeSelect.Option>
        </NativeSelect.Trigger>
      </NativeSelect>,
    );

    expect(container.querySelector('[data-slot="native-select"]')).toHaveClass('native-select');
    const select = container.querySelector('select');
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('data-slot', 'native-select-select');
    expect(within(select as HTMLElement).getByRole('option', { name: 'Beijing' })).toBeInTheDocument();
  });

  // 回归：自定义 id 的 Description 应使 select 的 aria-describedby === 该自定义 id，
  // 且 aria-describedby 指向的元素真实存在（不是自动生成的 useId）。
  it('regression: custom Description id is the select aria-describedby target', () => {
    const { container } = render(
      <NativeSelect>
        <NativeSelect.Trigger defaultValue="a" aria-label="custom-desc-select">
          <NativeSelect.Option value="a">A</NativeSelect.Option>
        </NativeSelect.Trigger>
        <NativeSelect.Description id="custom-x">Helper text</NativeSelect.Description>
      </NativeSelect>,
    );

    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select).toHaveAttribute('aria-describedby', 'custom-x');

    const describedById = select.getAttribute('aria-describedby') as string;
    const target = container.querySelector(`#${describedById}`);
    expect(target).not.toBeNull();
    expect(target).toHaveAttribute('data-slot', 'native-select-description');
    expect(target).toHaveTextContent('Helper text');
  });

  it('without custom id, aria-describedby points to the auto-generated description element', () => {
    const { container } = render(
      <NativeSelect>
        <NativeSelect.Trigger defaultValue="a" aria-label="auto-desc-select">
          <NativeSelect.Option value="a">A</NativeSelect.Option>
        </NativeSelect.Trigger>
        <NativeSelect.Description>Auto helper</NativeSelect.Description>
      </NativeSelect>,
    );

    const select = container.querySelector('select') as HTMLSelectElement;
    const describedById = select.getAttribute('aria-describedby');
    expect(describedById).toBeTruthy();
    const target = container.querySelector(`#${describedById}`);
    expect(target).not.toBeNull();
    expect(target).toHaveTextContent('Auto helper');
  });

  it('Label htmlFor defaults to the generated select id (clicking label focuses select)', () => {
    const { container } = render(
      <NativeSelect>
        <NativeSelect.Label>Pick one</NativeSelect.Label>
        <NativeSelect.Trigger defaultValue="a">
          <NativeSelect.Option value="a">A</NativeSelect.Option>
        </NativeSelect.Trigger>
      </NativeSelect>,
    );

    const label = container.querySelector('label') as HTMLLabelElement;
    const select = container.querySelector('select') as HTMLSelectElement;
    expect(label.getAttribute('for')).toBe(select.id);
    expect(select.id).toBeTruthy();
  });

  it('explicit aria-describedby on Trigger wins over description registration', () => {
    const { container } = render(
      <NativeSelect>
        <NativeSelect.Trigger defaultValue="a" aria-describedby="explicit-id">
          <NativeSelect.Option value="a">A</NativeSelect.Option>
        </NativeSelect.Trigger>
        <NativeSelect.Description id="custom-x">Helper</NativeSelect.Description>
      </NativeSelect>,
    );

    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select).toHaveAttribute('aria-describedby', 'explicit-id');
  });

  it('secondary variant + fullWidth add modifier classes; default renders indicator', () => {
    const { container } = render(
      <NativeSelect variant="secondary" fullWidth>
        <NativeSelect.Trigger defaultValue="a">
          <NativeSelect.Option value="a">A</NativeSelect.Option>
        </NativeSelect.Trigger>
      </NativeSelect>,
    );

    const root = container.querySelector('[data-slot="native-select"]') as HTMLElement;
    expect(root).toHaveClass('native-select--secondary');
    expect(root).toHaveClass('native-select--full-width');
    expect(
      container.querySelector('[data-slot="native-select-trigger"]'),
    ).toHaveClass('native-select__trigger--full-width');
    // default indicator rendered when no Indicator child provided
    expect(container.querySelector('[data-slot="native-select-indicator"] svg')).toBeInTheDocument();
  });

  it('fires onChange when a different option is chosen', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NativeSelect>
        <NativeSelect.Trigger aria-label="fruit" defaultValue="a" onChange={onChange}>
          <NativeSelect.Option value="a">A</NativeSelect.Option>
          <NativeSelect.Option value="b">B</NativeSelect.Option>
        </NativeSelect.Trigger>
      </NativeSelect>,
    );

    await user.selectOptions(screen.getByRole('combobox', { name: 'fruit' }), 'b');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('has no axe a11y violations', async () => {
    // Label sets htmlFor to the generated select id, giving the combobox an accessible name.
    const { container } = render(
      <NativeSelect>
        <NativeSelect.Label>Campus</NativeSelect.Label>
        <NativeSelect.Trigger defaultValue="bj">
          <NativeSelect.Option value="bj">Beijing</NativeSelect.Option>
          <NativeSelect.Option value="sh">Shanghai</NativeSelect.Option>
        </NativeSelect.Trigger>
        <NativeSelect.Description>Pick your campus</NativeSelect.Description>
      </NativeSelect>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
