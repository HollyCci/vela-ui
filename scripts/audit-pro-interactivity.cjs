#!/usr/bin/env node
/**
 * Audits hard interaction red flags in Pro demos.
 *
 * This is intentionally stricter than visual coverage: demos should exercise
 * Vela component APIs, not static DOM snapshots or no-op controls.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const demosDir = path.join(root, 'src/showcase/demos');

const rules = [
  {
    name: 'no noop demo handlers',
    pattern: /\bnoop\b/,
    message: 'replace noop demo handlers with visible state changes',
  },
  {
    name: 'no direct HeroUI imports in demos',
    pattern: /from ['"]@heroui\/react['"]/,
    message: 'demo code must exercise Vela component APIs instead of importing HeroUI primitives',
  },
  {
    name: 'no direct HeroUI dropdown/menu aliases in demos',
    pattern: /(Dropdown\s+as\s+HeroDropdown|Menu\s+as\s+HeroMenu|<HeroDropdown|<HeroMenu)/,
    message: 'use src/components/dropdown and src/components/menu-item wrappers',
  },
  {
    name: 'no direct HeroUI listbox in demos',
    pattern: /<(ListBox|ColorArea|ColorSlider|ColorSwatchPicker)\b/,
    message: 'wrap collection and color primitives through the relevant Vela Pro component',
  },
  {
    name: 'no handwritten chat message internals in demos',
    pattern: /(ConversationBubble|chat-message__(bubble|content)|data-slot=["']chat-message)/,
    message: 'render the ChatMessage component instead of copying internal classes',
  },
  {
    name: 'no static-positioning demo labels',
    pattern: /静态定位/,
    message: 'demo should use real trigger/popover behavior',
  },
  {
    name: 'no chart placeholder text',
    pattern: /图表占位区域/,
    message: 'demo should render a meaningful live visualization or component state',
  },
];

const files = fs
  .readdirSync(demosDir)
  .filter((file) => file.endsWith('-demos.tsx'))
  .map((file) => path.join(demosDir, file));

const problems = [];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split('\n');
  for (const rule of rules) {
    lines.forEach((line, index) => {
      if (rule.pattern.test(line)) {
        problems.push({
          file: path.relative(root, file),
          line: index + 1,
          rule: rule.name,
          message: rule.message,
          text: line.trim(),
        });
      }
    });
  }
}

if (problems.length === 0) {
  console.log('Pro interactivity audit: passed');
  process.exit(0);
}

console.error('Pro interactivity audit: failed');
for (const problem of problems) {
  console.error(
    `- ${problem.file}:${problem.line} [${problem.rule}] ${problem.message}: ${problem.text}`,
  );
}
process.exitCode = 1;
