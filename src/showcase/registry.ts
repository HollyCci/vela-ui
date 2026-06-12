import type { ReactNode } from 'react';
import { baseDemos } from './demos/base-demos';
import { formsDemos } from './demos/forms-demos';
import { dataDisplayDemos } from './demos/data-display-demos';
import { feedbackNavDemos } from './demos/feedback-nav-demos';
import { aiOverlayDemos } from './demos/ai-overlay-demos';

export type ComponentEntry = {
  id: string;
  title: string;
  category: string;
};

export const CATEGORIES: Record<string, string[]> = {
  基础组件: [
    'button',
    'badge',
    'chip',
    'alert',
    'avatar',
    'card',
    'separator',
    'toolbar',
    'spinner',
    'skeleton',
    'kbd',
    'action-bar',
  ],
  图表: [
    'area-chart',
    'bar-chart',
    'chart-tooltip',
    'composed-chart',
    'line-chart',
    'pie-chart',
    'radar-chart',
    'radial-chart',
  ],
  数据展示: [
    'agenda',
    'carousel',
    'data-grid',
    'empty-state',
    'file-tree',
    'floating-toc',
    'hover-card',
    'kanban',
    'item-card',
    'item-card-group',
    'kpi',
    'kpi-group',
    'list-view',
    'widget',
  ],
  AI: [
    'chain-of-thought',
    'chat-attachment',
    'chat-conversation',
    'chat-list-view',
    'chat-loader',
    'chat-message',
    'chat-message-actions',
    'chat-source',
    'chat-tool',
    'code-block',
    'markdown',
    'prompt-input',
    'prompt-suggestion',
    'text-shimmer',
  ],
  反馈: [
    'emoji-reaction-button',
    'number-value',
    'pressable-feedback',
    'rating',
    'trend-chip',
    'progress-bar',
    'progress-circle',
    'meter',
    'toast',
    'tooltip',
  ],
  表单: [
    'input',
    'textarea',
    'checkbox',
    'radio',
    'switch',
    'slider',
    'select',
    'native-select',
    'search-field',
    'number-field',
    'tag',
    'cell-color-picker',
    'cell-select',
    'cell-slider',
    'cell-switch',
    'checkbox-button-group',
    'radio-button-group',
    'drop-zone',
    'inline-select',
    'number-stepper',
  ],
  导航: [
    'app-layout',
    'breadcrumbs',
    'command',
    'context-menu',
    'navbar',
    'pagination',
    'segment',
    'sidebar',
    'stepper',
    'tabs',
    'link',
  ],
  浮层: ['modal', 'drawer', 'popover', 'dropdown', 'menu-item', 'emoji-picker', 'sheet', 'alert-dialog'],
  布局: ['resizable', 'accordion', 'disclosure', 'scroll-shadow', 'table'],
};

/** 各分类下已实现的演示。后续批次往对应 demos/ 文件里加并 merge 进来。 */
export const demoRegistry: Record<string, ReactNode> = {
  ...baseDemos,
  ...formsDemos,
  ...dataDisplayDemos,
  ...feedbackNavDemos,
  ...aiOverlayDemos,
};

const TITLE_OVERRIDES: Record<string, string> = {
  kpi: 'KPI',
  'kpi-group': 'KPI Group',
  ai: 'AI',
};

export function titleOf(id: string): string {
  if (TITLE_OVERRIDES[id]) return TITLE_OVERRIDES[id];
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
