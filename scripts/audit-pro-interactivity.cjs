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
const showcaseAppPath = path.join(root, 'src/showcase/App.tsx');
const publicDir = path.join(root, 'public');

const lineRules = [
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
  {
    name: 'no static reference iframe chain',
    pattern: /(DemoFrame|srcDoc|\/reference\/demos|\/docs-content|dangerouslySetInnerHTML)/,
    message: 'showcase must render Vela React demos instead of static reference HTML',
  },
];

const actionButtonWords = [
  '导出',
  '刷新',
  '删除',
  '复制',
  '打开',
  '下载',
  '移动',
  '上传',
  '保存',
  '提交',
  '确认',
  '确定',
  '取消',
  '关闭',
  '重试',
  '编辑',
  '查看',
  '粘贴',
  '发送',
  '应用',
  '重置',
  '允许',
  '拒绝',
  '清除',
  '移除',
  '添加',
  '归档',
  '分享',
  '创建',
  '新建',
  '更新',
  '同步',
  '发布',
  '完成',
  '开始',
  '停止',
  '清空',
  '搜索',
  '筛选',
  '预览',
];
const actionButtonPattern = new RegExp(actionButtonWords.join('|'));
const hashHrefPattern = /\bhref\s*=\s*(?:"#"|'#'|\{\s*(?:"#"|'#')\s*\})/g;
const buttonHandlerPattern = /\bon(?:Click|Press)\s*=/;
const disabledButtonPattern =
  /(?:\b(?:isDisabled|disabled)\b(?:\s*=\s*(?:\{\s*true\s*\}|["']true["']))?|\baria-disabled\s*=\s*(?:\{\s*true\s*\}|["']true["']))(?=[\s/>])/;
const submitButtonPattern = /\btype\s*=\s*(?:"submit"|'submit'|\{\s*["']submit["']\s*\})/;

// These are not per-demo allowlists. They are compound components that provide
// the interaction behavior for a child button through context/slots.
const interactiveButtonWrappers = new Set([
  'AlertDialog.Trigger',
  'Dialog.Trigger',
  'Drawer.Trigger',
  'Dropdown.Trigger',
  'Menu.Trigger',
  'Modal.Trigger',
  'Popover.Trigger',
  'Sheet.Trigger',
]);

const files = fs
  .readdirSync(demosDir)
  .filter((file) => file.endsWith('-demos.tsx'))
  .map((file) => path.join(demosDir, file));
if (fs.existsSync(showcaseAppPath)) {
  files.push(showcaseAppPath);
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findLastIndex = (items, predicate) => {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index], index)) {
      return index;
    }
  }
  return -1;
};

const readTagName = (source, index) => {
  let end = index;
  while (end < source.length && /[\w.$-]/.test(source[end])) {
    end += 1;
  }
  return source.slice(index, end);
};

const findTagEnd = (source, start) => {
  let quote = null;
  let braceDepth = 0;

  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index];
    const previous = source[index - 1];

    if (quote) {
      if (char === quote && previous !== '\\') {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') {
      braceDepth += 1;
      continue;
    }

    if (char === '}' && braceDepth > 0) {
      braceDepth -= 1;
      continue;
    }

    if (char === '>' && braceDepth === 0) {
      return index;
    }
  }

  return -1;
};

const isSelfClosingTag = (source, tagEnd) => {
  let index = tagEnd - 1;
  while (index >= 0 && /\s/.test(source[index])) {
    index -= 1;
  }
  return source[index] === '/';
};

const createLineLookup = (source) => {
  const lineStarts = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\n') {
      lineStarts.push(index + 1);
    }
  }

  const lineNumberAt = (position) => {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lineStarts[mid] <= position) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return high + 1;
  };

  const textAt = (position) => {
    const lineNumber = lineNumberAt(position);
    const start = lineStarts[lineNumber - 1];
    const nextStart = lineStarts[lineNumber] ?? source.length + 1;
    return source.slice(start, nextStart).trim();
  };

  return { lineNumberAt, textAt };
};

const collectElementRanges = (source) => {
  const stack = [];
  const ranges = [];
  let index = 0;

  while (index < source.length) {
    const start = source.indexOf('<', index);
    if (start === -1) {
      break;
    }

    if (source.startsWith('<!--', start)) {
      const commentEnd = source.indexOf('-->', start + 4);
      index = commentEnd === -1 ? source.length : commentEnd + 3;
      continue;
    }

    const isClosing = source[start + 1] === '/';
    const nameStart = start + (isClosing ? 2 : 1);
    const tagName = readTagName(source, nameStart);
    if (!tagName) {
      index = start + 1;
      continue;
    }

    const tagEnd = findTagEnd(source, start);
    if (tagEnd === -1) {
      break;
    }

    if (isClosing) {
      const stackIndex = findLastIndex(stack, (entry) => entry.name === tagName);
      if (stackIndex !== -1) {
        const entry = stack[stackIndex];
        ranges.push({
          name: entry.name,
          start: entry.start,
          openEnd: entry.openEnd,
          closeStart: start,
          end: tagEnd + 1,
        });
        stack.length = stackIndex;
      }
    } else if (!isSelfClosingTag(source, tagEnd)) {
      stack.push({ name: tagName, start, openEnd: tagEnd });
    }

    index = tagEnd + 1;
  }

  return ranges;
};

const isInsideInteractiveButtonWrapper = (ranges, start, end) =>
  ranges.some(
    (range) =>
      range.start < start &&
      range.end > end &&
      interactiveButtonWrappers.has(range.name),
  );

const findMatchingClosingTag = (source, tagName, startIndex) => {
  const tokenPattern = new RegExp(`<\\/?${escapeRegExp(tagName)}\\b`, 'g');
  tokenPattern.lastIndex = startIndex;
  let depth = 1;
  let match;

  while ((match = tokenPattern.exec(source)) !== null) {
    const start = match.index;
    const isClosing = source[start + 1] === '/';
    const tagEnd = findTagEnd(source, start);

    if (tagEnd === -1) {
      return null;
    }

    if (isClosing) {
      depth -= 1;
      if (depth === 0) {
        return { closeStart: start, closeEnd: tagEnd + 1 };
      }
    } else if (!isSelfClosingTag(source, tagEnd)) {
      depth += 1;
    }

    tokenPattern.lastIndex = tagEnd + 1;
  }

  return null;
};

const readBalancedExpression = (source, start) => {
  let quote = null;
  let depth = 0;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const previous = source[index - 1];

    if (quote) {
      if (char === quote && previous !== '\\') {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          expression: source.slice(start + 1, index),
          end: index,
        };
      }
    }
  }

  return null;
};

const extractStaticStrings = (expression) => {
  const strings = [];
  const stringPattern = /(["'`])((?:\\.|(?!\1)[\s\S])*)\1/g;
  let match;

  while ((match = stringPattern.exec(expression)) !== null) {
    strings.push(match[2]);
  }

  return strings.join(' ');
};

const extractVisibleButtonText = (innerSource) => {
  let text = '';
  let index = 0;

  while (index < innerSource.length) {
    const char = innerSource[index];

    if (char === '<') {
      const tagEnd = findTagEnd(innerSource, index);
      if (tagEnd === -1) {
        break;
      }
      index = tagEnd + 1;
      continue;
    }

    if (char === '{') {
      if (innerSource.startsWith('{/*', index)) {
        const commentEnd = innerSource.indexOf('*/}', index + 3);
        index = commentEnd === -1 ? innerSource.length : commentEnd + 3;
        continue;
      }

      const expression = readBalancedExpression(innerSource, index);
      if (!expression) {
        break;
      }
      text += ` ${extractStaticStrings(expression.expression)}`;
      index = expression.end + 1;
      continue;
    }

    text += char;
    index += 1;
  }

  return text.replace(/\s+/g, ' ').trim();
};

const collectStaticDemoLabels = (source, file, lineLookup, problems) => {
  const tagPattern = /<DemoSection\b/g;
  let match;

  while ((match = tagPattern.exec(source)) !== null) {
    const tagEnd = findTagEnd(source, match.index);
    if (tagEnd === -1) {
      break;
    }

    const attrs = source.slice(match.index, tagEnd + 1);
    if (/\blabel\s*=/.test(attrs) && attrs.includes('静态展示')) {
      problems.push({
        file: path.relative(root, file),
        line: lineLookup.lineNumberAt(match.index),
        rule: 'no static-display demo labels',
        message: 'demo labels must not describe the section as static; wire real interaction/state instead',
        text: lineLookup.textAt(match.index),
      });
    }

    tagPattern.lastIndex = tagEnd + 1;
  }
};

const collectHashHrefs = (source, file, lineLookup, problems) => {
  let match;
  hashHrefPattern.lastIndex = 0;

  while ((match = hashHrefPattern.exec(source)) !== null) {
    problems.push({
      file: path.relative(root, file),
      line: lineLookup.lineNumberAt(match.index),
      rule: 'no hash href',
      message: 'replace href="#" with a real URL/route or a non-link control',
      text: lineLookup.textAt(match.index),
    });
  }
};

const collectNakedActionButtons = (source, file, lineLookup, problems) => {
  const elementRanges = collectElementRanges(source);
  const buttonPattern = /<(Button|button)\b/g;
  let match;

  while ((match = buttonPattern.exec(source)) !== null) {
    const start = match.index;
    const tagName = match[1];
    const openEnd = findTagEnd(source, start);

    if (openEnd === -1) {
      break;
    }

    const attrs = source.slice(start, openEnd + 1);
    if (
      isSelfClosingTag(source, openEnd) ||
      buttonHandlerPattern.test(attrs) ||
      disabledButtonPattern.test(attrs) ||
      submitButtonPattern.test(attrs)
    ) {
      buttonPattern.lastIndex = openEnd + 1;
      continue;
    }

    const closing = findMatchingClosingTag(source, tagName, openEnd + 1);
    if (!closing) {
      buttonPattern.lastIndex = openEnd + 1;
      continue;
    }

    const text = extractVisibleButtonText(source.slice(openEnd + 1, closing.closeStart));
    if (
      text &&
      actionButtonPattern.test(text) &&
      !isInsideInteractiveButtonWrapper(elementRanges, start, closing.closeEnd)
    ) {
      problems.push({
        file: path.relative(root, file),
        line: lineLookup.lineNumberAt(start),
        rule: 'no naked action buttons',
        message: `action-labeled button "${text}" must wire onClick/onPress or use a component trigger/close API`,
        text: lineLookup.textAt(start),
      });
    }

    buttonPattern.lastIndex = openEnd + 1;
  }
};

const problems = [];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split('\n');
  const lineLookup = createLineLookup(source);

  for (const rule of lineRules) {
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

  collectStaticDemoLabels(source, file, lineLookup, problems);
  collectHashHrefs(source, file, lineLookup, problems);
  collectNakedActionButtons(source, file, lineLookup, problems);
}

for (const staticDir of ['reference', 'demo', 'docs-content']) {
  const fullPath = path.join(publicDir, staticDir);
  if (fs.existsSync(fullPath)) {
    problems.push({
      file: path.relative(root, fullPath),
      line: 1,
      rule: 'no generated static demo assets',
      message: `remove public/${staticDir}; showcase demos must be rendered by local Vela components`,
      text: `public/${staticDir}`,
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
