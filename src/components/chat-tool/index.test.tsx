import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ChatTool from './index';

describe('ChatTool', () => {
  it('has no axe a11y violations', async () => {
    const { container } = render(
      <ChatTool label="search_web" status="success" statusLabel="Done" defaultExpanded>
        <ChatTool.Args>{'{ "query": "weather" }'}</ChatTool.Args>
        <ChatTool.Result>Sunny, 24°C</ChatTool.Result>
      </ChatTool>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
