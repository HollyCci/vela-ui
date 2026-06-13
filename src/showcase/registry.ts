import type { ReactNode } from 'react';
import { baseDemos } from './demos/base-demos';
import { formsDemos } from './demos/forms-demos';
import { dataDisplayDemos } from './demos/data-display-demos';
import { feedbackNavDemos } from './demos/feedback-nav-demos';
import { aiOverlayDemos } from './demos/ai-overlay-demos';
import { chartsDemos } from './demos/charts-demos';
import demoIndexJson from './demo-index.json';

/** 组件 → 该组件全部基准 demo slug（采集自 heroui.pro 文档站） */
export const demoIndex: Record<string, string[]> = demoIndexJson;

/** 文档站同款分类（Pro 组件，61 个，全部有像素级基准快照） */
export const PRO_CATEGORIES: Record<string, string[]> = {
  Charts: [
    'area-chart',
    'bar-chart',
    'chart-tooltip',
    'composed-chart',
    'line-chart',
    'pie-chart',
    'radar-chart',
    'radial-chart',
  ],
  'Data Display': [
    'agenda',
    'action-bar',
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
  Feedback: ['emoji-reaction-button', 'number-value', 'pressable-feedback', 'rating', 'trend-chip'],
  Layout: ['resizable'],
  Forms: [
    'cell-color-picker',
    'cell-select',
    'cell-slider',
    'cell-switch',
    'checkbox-button-group',
    'drop-zone',
    'inline-select',
    'native-select',
    'number-stepper',
    'radio-button-group',
  ],
  Navigation: ['app-layout', 'command', 'context-menu', 'navbar', 'segment', 'sidebar', 'stepper'],
  Overlays: ['emoji-picker', 'sheet'],
};

/** 底层基础组件（无独立文档页，仅 React 实现演示） */
export const BASE_CATEGORY: string[] = [
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
  'input',
  'textarea',
  'checkbox',
  'radio',
  'switch',
  'slider',
  'select',
  'search-field',
  'number-field',
  'tag',
  'tabs',
  'pagination',
  'breadcrumbs',
  'progress-bar',
  'progress-circle',
  'meter',
  'toast',
  'tooltip',
  'link',
  'modal',
  'drawer',
  'popover',
  'dropdown',
  'menu-item',
  'alert-dialog',
];

/** 我们的 React 实现演示（与基准快照并列展示，用于比对） */
export const demoRegistry: Record<string, ReactNode> = {
  ...baseDemos,
  ...formsDemos,
  ...dataDisplayDemos,
  ...feedbackNavDemos,
  ...aiOverlayDemos,
  ...chartsDemos,
};

const TITLE_OVERRIDES: Record<string, string> = {
  kpi: 'KPI',
  'kpi-group': 'KPI Group',
  'app-layout': 'AppLayout',
  'floating-toc': 'Floating TOC',
};

export function titleOf(id: string): string {
  if (TITLE_OVERRIDES[id]) return TITLE_OVERRIDES[id];
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** demo slug → 文档站小节标题（default 即 Usage） */
export function sectionTitle(component: string, slug: string): string {
  const suffix = slug === component ? 'default' : slug.slice(component.length + 1);
  if (suffix === 'default') return 'Usage';
  return suffix
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
