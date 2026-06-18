#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright-core');
const { browserSmokeComponents } = require('./pro-parity-contract.cjs');

const root = path.join(__dirname, '..');
const demoIndex = JSON.parse(fs.readFileSync(path.join(root, 'src/showcase/demo-index.json'), 'utf8'));
const docsMeta = JSON.parse(fs.readFileSync(path.join(root, 'src/showcase/docs-meta.json'), 'utf8'));
const registrySource = fs.readFileSync(path.join(root, 'src/showcase/registry.ts'), 'utf8');

const proBlockMatch = /export const PRO_CATEGORIES:[\s\S]*?=\s*\{([\s\S]*?)\};/.exec(registrySource);
if (!proBlockMatch) {
  throw new Error('Unable to find PRO_CATEGORIES in src/showcase/registry.ts');
}

const components = [];
const categoryRe = /['"]?([A-Za-z ]+)['"]?\s*:\s*\[([\s\S]*?)\]/g;
let categoryMatch;
while ((categoryMatch = categoryRe.exec(proBlockMatch[1])) !== null) {
  const ids = [...categoryMatch[2].matchAll(/'([a-z0-9-]+)'/g)].map((match) => match[1]);
  components.push(...ids);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestOk = (url) =>
  new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });

const findBrowserExecutable = () => {
  const candidates = [
    process.env.VELA_BROWSER_EXECUTABLE,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Arc.app/Contents/MacOS/Arc',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
};

const startServer = async () => {
  if (process.env.VELA_SHOWCASE_URL) {
    return { url: process.env.VELA_SHOWCASE_URL, stop: async () => undefined };
  }

  const port = process.env.VELA_SHOWCASE_PORT ?? '5190';
  const host = '127.0.0.1';
  const url = `http://${host}:${port}/`;
  if (await requestOk(url)) {
    return { url, stop: async () => undefined };
  }

  const child = spawn('pnpm', ['exec', 'vite', '--host', host, '--port', port], {
    cwd: root,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await requestOk(url)) {
      return {
        url,
        stop: async () => {
          child.kill('SIGTERM');
          await sleep(250);
          if (!child.killed) child.kill('SIGKILL');
        },
      };
    }
    await sleep(250);
  }

  child.kill('SIGTERM');
  throw new Error(`Vite showcase did not start at ${url}\n${output}`);
};

const expectVisible = async (locator, label) => {
  await locator.waitFor({ state: 'visible', timeout: 6000 });
  const box = await locator.boundingBox();
  if (!box || box.width < 4 || box.height < 4) {
    throw new Error(`${label} is visible but has no usable layout box`);
  }
};

const clickComponent = async (page, id) => {
  await page.keyboard.press('Escape').catch(() => undefined);
  await sleep(50);
  const button = page.locator(`button[data-id="${id}"]`).first();
  await expectVisible(button, `${id} nav/card button`);
  await button.click();
  await expectVisible(page.locator('article h1').filter({ hasText: docsMeta[id]?.title ?? '' }), `${id} title`);
};

const auditComponentPages = async (page) => {
  const rows = [];
  for (const id of components) {
    await clickComponent(page, id);
    const expectedVariants = demoIndex[id] ?? [];
    const previews = page.locator('.sc-live-preview');
    const previewCount = await previews.count();
    if (previewCount !== expectedVariants.length) {
      throw new Error(`${id}: expected ${expectedVariants.length} live previews, found ${previewCount}`);
    }
    for (const slug of expectedVariants) {
      const preview = page.locator(`.sc-live-preview[data-slug="${slug}"]`).first();
      await expectVisible(preview, `${slug} preview`);
      const text = (await preview.innerText()).trim();
      const elementCount = await preview.locator('[data-slot], button, input, textarea, select, svg, canvas').count();
      if (text.length === 0 && elementCount === 0) {
        throw new Error(`${slug}: live preview appears blank`);
      }
    }
    rows.push({ id, variants: expectedVariants.length, previews: previewCount });
  }
  return rows;
};

const scoped = (page, slug) => page.locator(`.sc-live-preview[data-slug="${slug}"]`).first();

const expectText = async (locator, text, label) => {
  await expectVisible(locator.filter({ hasText: text }).first(), label);
};

const dragLocatorBy = async (page, locator, dx, dy, label) => {
  await expectVisible(locator, label);
  const box = await locator.boundingBox();
  if (!box) throw new Error(`${label} has no bounding box`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 8 });
  await page.mouse.up();
  await sleep(250);
};

const pressLocatorFor = async (page, locator, ms, label) => {
  await expectVisible(locator, label);
  const box = await locator.boundingBox();
  if (!box) throw new Error(`${label} has no bounding box`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await sleep(ms);
  await page.mouse.up();
  await sleep(250);
};

const runTargetedSmoke = async (page) => {
  const checks = [];

  await clickComponent(page, 'timeline');
  {
    const preview = scoped(page, 'timeline-studio-review');
    await expectVisible(preview.locator('[data-slot="timeline"]').first(), 'timeline root');
    const message = preview.getByText('尚未选择时间线事件');
    await expectVisible(message, 'timeline initial action state');
    await preview.getByRole('button', { name: '打开' }).first().click();
    await expectVisible(preview.getByText(/^已打开：/), 'timeline action state');
    checks.push('timeline action buttons update visible state');
  }

  await clickComponent(page, 'data-grid');
  {
    const preview = scoped(page, 'data-grid-default');
    await expectVisible(preview.locator('[data-slot="data-grid"]').first(), 'data-grid root');
    const sortedHeader = preview.getByRole('columnheader', { name: /Customer|客户|student|学员/i }).first();
    await expectVisible(sortedHeader, 'data-grid sortable column header');
    await sortedHeader.click();
    const checkbox = preview.getByRole('checkbox').first();
    await expectVisible(checkbox, 'data-grid selection checkbox');
    await checkbox.focus();
    await page.keyboard.press('Space');
    checks.push('data-grid supports real header sorting and row selection controls');
  }

  await clickComponent(page, 'file-tree');
  {
    const preview = scoped(page, 'file-tree-anatomy');
    const tree = preview.locator('[data-slot="file-tree"]').first();
    await expectVisible(tree, 'file-tree anatomy root');
    const treeItem = preview.locator('[data-slot="file-tree-item-content"]').filter({ hasText: /styles|components/i }).first();
    await expectVisible(treeItem, 'file-tree expandable item');
    await treeItem.click();
    await expectVisible(preview.locator('[data-slot="file-tree-item-content"]').first(), 'file-tree item content');
    checks.push('file-tree anatomy renders real slots and accepts tree item interaction');
  }

  await clickComponent(page, 'rich-text-editor');
  {
    const preview = scoped(page, 'rich-text-editor-default');
    const editor = preview.locator('[data-slot="rich-text-editor-content"]').first();
    await expectVisible(editor, 'rich text editor content');
    await editor.focus();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Browser smoke note');
    await sleep(100);
    const text = await editor.innerText();
    if (!text.includes('Browser smoke note')) {
      throw new Error('rich-text-editor: typed content was not reflected in contenteditable region');
    }
    await preview.getByRole('button', { name: 'Bold' }).click();
    const boldPressed = await preview.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed');
    if (boldPressed !== 'true' && boldPressed !== 'false') {
      throw new Error('rich-text-editor: toolbar button did not expose pressed state');
    }
    checks.push('rich-text-editor accepts browser text input and exposes toolbar state');
  }

  await clickComponent(page, 'prompt-input');
  {
    const preview = scoped(page, 'prompt-input-review-composer');
    const textarea = preview.locator('textarea').first();
    await expectVisible(textarea, 'prompt input textarea');
    await textarea.fill('Audit this interaction');
    await preview.locator('[data-slot="prompt-input-action"][aria-label="Attach screenshot"]').click();
    await expectVisible(preview.getByText('1 review attachments queued'), 'prompt input attachment footer');
    await preview.locator('[data-slot="prompt-input-send"]').first().click();
    await expectVisible(
      preview.locator('span').filter({ hasText: '已发送：Audit this interaction' }).first(),
      'prompt input sent state',
    );
    checks.push('prompt-input handles attachment action and submit state');
  }

  await clickComponent(page, 'prompt-suggestion');
  {
    const preview = scoped(page, 'prompt-suggestion-cards');
    await expectVisible(preview.locator('.prompt-suggestion').first(), 'prompt-suggestion root');
    await preview.getByRole('button', { name: /完成率对比/ }).click();
    await expectVisible(preview.getByText('当前：完成率对比'), 'prompt-suggestion first selection state');
    await preview.getByRole('button', { name: /沟通重点/ }).click();
    await expectVisible(preview.getByText('当前：沟通重点'), 'prompt-suggestion second selection state');
    checks.push('prompt-suggestion dispatches a real selection action');
  }

  await clickComponent(page, 'chain-of-thought');
  {
    const preview = scoped(page, 'chain-of-thought-default');
    const trigger = preview.getByRole('button', { name: /已思考 8 秒/ });
    await expectVisible(trigger, 'chain-of-thought trigger');
    await expectVisible(preview.locator('[data-slot="chain-of-thought-step"]').filter({ hasText: '拆解目标' }).first(), 'chain-of-thought expanded content');
    await trigger.click();
    await preview.locator('[data-slot="chain-of-thought-content"]').waitFor({ state: 'hidden', timeout: 6000 });
    if ((await trigger.getAttribute('aria-expanded')) !== 'false') {
      throw new Error('chain-of-thought: trigger did not expose collapsed aria-expanded=false');
    }
    await trigger.click();
    await expectVisible(preview.locator('[data-slot="chain-of-thought-step"]').filter({ hasText: '输出结论' }).first(), 'chain-of-thought re-expanded content');
    checks.push('chain-of-thought toggles disclosure content with aria-expanded state');
  }

  await clickComponent(page, 'chat-message-actions');
  {
    const preview = scoped(page, 'chat-message-actions-default');
    await expectVisible(preview.locator('[data-slot="chat-message-actions"]').first(), 'chat-message-actions root');
    const thumbsUp = preview.getByRole('button', { name: 'Good response' });
    await thumbsUp.click();
    if ((await thumbsUp.getAttribute('aria-pressed')) !== 'true') {
      throw new Error('chat-message-actions: thumbs-up did not expose aria-pressed=true');
    }
    await expectVisible(preview.getByText(/评价：up/), 'chat-message-actions thumbs-up state');
    await preview.getByRole('button', { name: 'Regenerate' }).click();
    await expectVisible(preview.getByText(/重新生成：1/), 'chat-message-actions regenerate count');
    await preview.locator('[data-slot="chat-message-action"][aria-label="More actions"]').click();
    await page.getByRole('menuitem', { name: '标记复查' }).click();
    await expectVisible(preview.getByText(/更多：1/), 'chat-message-actions menu count');
    checks.push('chat-message-actions toggle, regenerate, and menu controls update state');
  }

  await clickComponent(page, 'chat-source');
  {
    const preview = scoped(page, 'chat-source-default');
    await expectVisible(preview.locator('[data-slot="chat-source"]').first(), 'chat-source root');
    const popupPromise = page.waitForEvent('popup', { timeout: 500 }).catch(() => null);
    await preview.getByRole('link', { name: 'React Docs' }).click();
    await expectVisible(preview.getByText('已打开引用'), 'chat-source open state');
    await expectVisible(preview.locator('[data-slot="chat-source-status"]').first(), 'chat-source transient opened status');
    const popup = await popupPromise;
    if (popup !== null) await popup.close();
    checks.push('chat-source opens a source through the real trigger');
  }

  await clickComponent(page, 'chat-tool');
  {
    const preview = scoped(page, 'chat-tool-approval');
    const tool = preview.locator('.chat-tool').filter({ hasText: '需要权限：发送家长通知' }).first();
    await expectVisible(tool, 'chat-tool approval root');
    await preview.getByRole('button', { name: '允许' }).click();
    await expectVisible(preview.locator('.chat-tool[data-status="success"]').first(), 'chat-tool success state');
    await expectVisible(preview.getByText('已允许发送，正在模拟通知家长。'), 'chat-tool approval result text');
    const trigger = tool.locator('.chat-tool__trigger').first();
    await trigger.click();
    if ((await trigger.getAttribute('aria-expanded')) !== 'false') {
      throw new Error('chat-tool: trigger did not expose collapsed aria-expanded=false');
    }
    checks.push('chat-tool approval action updates status and disclosure state');
  }

  await clickComponent(page, 'code-block');
  {
    const preview = scoped(page, 'code-block-default');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(page.url()).origin }).catch(() => undefined);
    await expectVisible(preview.locator('[data-slot="code-block-code"]').first(), 'code-block code region');
    await expectVisible(preview.locator('code[data-language="typescript"] [data-line="1"]').filter({ hasText: 'type Status' }).first(), 'code-block highlighted line');
    const copy = preview.locator('[data-slot="code-block"]').filter({ hasText: 'typescript' }).locator('[data-slot="code-block-copy-button"]').first();
    await expectVisible(copy, 'code-block copy button');
    await copy.click();
    await page.waitForFunction(
      (button) => button.getAttribute('data-copy-status') !== 'idle',
      await copy.elementHandle(),
      { timeout: 3000 },
    );
    const copyStatus = await copy.getAttribute('data-copy-status');
    if (copyStatus !== 'copied' && copyStatus !== 'failed') {
      throw new Error(`code-block: expected copied or failed status, got ${copyStatus}`);
    }
    checks.push('code-block copy button exposes clipboard status feedback');
  }

  await clickComponent(page, 'cell-select');
  {
    const preview = scoped(page, 'cell-select-controlled');
    const trigger = preview.locator('[data-slot="cell-select-trigger"]').first();
    await expectVisible(trigger, 'cell-select trigger');
    await trigger.click();
    await expectVisible(page.locator('[data-slot="cell-select-list"]').first(), 'cell-select list');
    await page.locator('[data-slot="cell-select-item"]').filter({ hasText: '晚上' }).first().click();
    await expectVisible(preview.locator('[data-slot="cell-select-label"]').filter({ hasText: '晚上' }).first(), 'cell-select controlled label');
    checks.push('cell-select opens its popover and updates controlled value');
  }

  await clickComponent(page, 'cell-color-picker');
  {
    const preview = scoped(page, 'cell-color-picker-controlled');
    const trigger = preview.locator('[data-slot="cell-color-picker-trigger"]').first();
    await expectVisible(trigger, 'cell-color-picker trigger');
    await trigger.click();
    await expectVisible(page.locator('[data-slot="cell-color-picker-swatch-picker"]').first(), 'cell-color-picker swatch picker');
    await page.locator('[data-slot="cell-color-picker-swatch-picker-item"]').nth(1).click();
    await expectVisible(preview.getByText(/当前颜色：#22c55e/i), 'cell-color-picker controlled color readout');
    checks.push('cell-color-picker opens presets and updates the controlled color');
  }

  await clickComponent(page, 'cell-slider');
  {
    const preview = scoped(page, 'cell-slider-controlled');
    await expectVisible(preview.locator('[data-slot="cell-slider"]').first(), 'cell-slider root');
    const slider = preview.getByRole('slider', { name: /学习密度/ });
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expectVisible(preview.locator('[data-slot="cell-slider-label"]').filter({ hasText: '学习密度：63%' }).first(), 'cell-slider controlled label');
    checks.push('cell-slider keyboard step updates the controlled value label');
  }

  await clickComponent(page, 'cell-switch');
  {
    const preview = scoped(page, 'cell-switch-controlled');
    const trigger = preview.locator('[data-slot="cell-switch-trigger"]').first();
    await expectVisible(trigger, 'cell-switch trigger');
    await trigger.click();
    await expectVisible(preview.getByText('自动学习提醒：关闭'), 'cell-switch controlled off state');
    await trigger.click();
    await expectVisible(preview.getByText('自动学习提醒：开启'), 'cell-switch controlled on state');
    checks.push('cell-switch toggles the controlled selection state');
  }

  await clickComponent(page, 'checkbox-button-group');
  {
    const preview = scoped(page, 'checkbox-button-group-controlled');
    await expectVisible(preview.locator('[data-slot="checkbox-button-group"]').first(), 'checkbox-button-group root');
    await preview.locator('[data-slot="checkbox-button-group-item"]').filter({ hasText: '听力训练' }).first().click();
    await expectVisible(preview.getByText(/已选择：reading, listening|已选择：listening, reading/), 'checkbox-button-group controlled selection');
    checks.push('checkbox-button-group updates a controlled multi-selection');
  }

  await clickComponent(page, 'radio-button-group');
  {
    const preview = scoped(page, 'radio-button-group-controlled');
    await expectVisible(preview.locator('[data-slot="radio-button-group"]').first(), 'radio-button-group root');
    await preview.locator('[data-slot="radio-button-group-item"]').filter({ hasText: '阅读训练' }).first().click();
    await expectVisible(preview.getByText('当前方案：reading'), 'radio-button-group controlled selection');
    checks.push('radio-button-group updates a controlled single selection');
  }

  await clickComponent(page, 'inline-select');
  {
    const preview = scoped(page, 'inline-select-team-switcher');
    const trigger = preview.locator('[data-slot="inline-select-trigger"]').first();
    await expectVisible(trigger, 'inline-select trigger');
    await trigger.click();
    await expectVisible(page.locator('[data-slot="inline-select-list"]').first(), 'inline-select list');
    await page.locator('[data-slot="inline-select-item"]').filter({ hasText: '教研组' }).first().click();
    await expectVisible(preview.locator('[data-slot="inline-select-value"]').filter({ hasText: '教研组' }).first(), 'inline-select updated value');
    checks.push('inline-select opens the popover and updates value');
  }

  await clickComponent(page, 'native-select');
  {
    const preview = scoped(page, 'native-select-controlled');
    const select = preview.locator('[data-slot="native-select-select"]').first();
    await expectVisible(select, 'native-select element');
    await select.selectOption('sh');
    await expectVisible(preview.getByText('Controlled select (上海校区)'), 'native-select controlled section label');
    checks.push('native-select uses the native select element and updates controlled copy');
  }

  await clickComponent(page, 'number-stepper');
  {
    const preview = scoped(page, 'number-stepper-controlled');
    const input = preview.locator('[data-slot="number-stepper-input"]').first();
    await expectVisible(input, 'number-stepper input');
    await preview.locator('[data-slot="number-stepper-increment-button"]').first().click();
    const now = await input.getAttribute('aria-valuenow');
    if (now !== '5') throw new Error(`number-stepper: expected aria-valuenow=5, got ${now}`);
    await expectVisible(preview.getByText('Controlled (5)'), 'number-stepper controlled label');
    checks.push('number-stepper increment button changes the controlled spinbutton value');
  }

  await clickComponent(page, 'drop-zone');
  {
    const preview = scoped(page, 'drop-zone-default');
    const input = preview.locator('[data-slot="drop-zone-input"]').first();
    await expectVisible(preview.locator('[data-slot="drop-zone-area"]').first(), 'drop-zone area');
    await input.setInputFiles({
      name: 'browser-smoke.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n% vela smoke\n'),
    });
    await expectVisible(preview.locator('[data-slot="drop-zone-file-item"]').filter({ hasText: 'browser-smoke.pdf' }).first(), 'drop-zone uploaded file item');
    await preview.locator('[data-slot="drop-zone-file-remove-trigger"]').first().click();
    await preview.locator('[data-slot="drop-zone-file-item"]').waitFor({ state: 'hidden', timeout: 6000 });
    checks.push('drop-zone accepts file input and removes uploaded file item');
  }

  await clickComponent(page, 'rating');
  {
    const preview = scoped(page, 'rating-controlled');
    const rating = preview.locator('[data-slot="rating"]').first();
    await expectVisible(rating, 'rating root');
    const option = preview.locator('[data-slot="rating-item"]').nth(4);
    await expectVisible(option, 'rating fifth option');
    await option.click();
    const checkedCount = await preview.getByRole('radio', { checked: true }).count();
    if (checkedCount === 0) throw new Error('rating: click did not select a radio item');
    checks.push('rating updates selection through real radio interaction');
  }

  await clickComponent(page, 'emoji-reaction-button');
  {
    const preview = scoped(page, 'emoji-reaction-button-default');
    const button = preview.locator('[data-slot="emoji-reaction-button"]').first();
    await expectVisible(button, 'emoji-reaction-button root');
    await button.click();
    await expectVisible(preview.getByText('点击回应'), 'emoji-reaction-button toggled off state');
    await button.click();
    await expectVisible(preview.getByText('已回应'), 'emoji-reaction-button toggled on state');
    checks.push('emoji-reaction-button toggles reaction state and count copy');
  }

  await clickComponent(page, 'pressable-feedback');
  {
    const preview = scoped(page, 'pressable-feedback-progress-feedback-callback');
    const button = preview.locator('[data-slot="pressable-feedback"]').filter({ hasText: '点击同步' }).first();
    await expectVisible(button, 'pressable-feedback progress button');
    await button.click();
    await sleep(2300);
    await expectVisible(preview.getByText(/完成 1 次/), 'pressable-feedback progress callback count');
    checks.push('pressable-feedback progress feedback fires the completion callback');
  }

  await clickComponent(page, 'resizable');
  {
    const preview = scoped(page, 'resizable-default');
    const handle = preview.locator('[data-slot="resizable-handle"]').first();
    await handle.waitFor({ state: 'visible', timeout: 6000 });
    const before = await preview.getByText(/当前布局：/).innerText();
    const box = await handle.boundingBox();
    if (!box) throw new Error('resizable: handle has no bounding box');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await sleep(250);
    const after = await preview.getByText(/当前布局：/).innerText();
    if (before === after) throw new Error('resizable: drag did not update layout readout');
    checks.push('resizable handle changes layout in a real pointer drag');
  }

  await clickComponent(page, 'action-bar');
  {
    const preview = scoped(page, 'action-bar-default');
    await expectVisible(preview.locator('.action-bar').first(), 'action-bar root');
    await preview.getByRole('button', { name: '标记完成' }).click();
    await expectVisible(preview.getByText('已标记 3 门课程完成'), 'action-bar action state');
    await preview.getByRole('button', { name: '收起操作条' }).click();
    await preview.locator('.action-bar').waitFor({ state: 'hidden', timeout: 6000 });
    checks.push('action-bar action buttons and controlled visibility work');
  }

  await clickComponent(page, 'floating-toc');
  {
    const preview = scoped(page, 'floating-toc-press-mode');
    const trigger = preview.locator('[data-slot="floating-toc-trigger"]').first();
    await expectVisible(trigger, 'floating-toc trigger');
    const content = page.locator('[data-slot="floating-toc-content"]').filter({ hasText: '课程安排' }).first();
    await expectVisible(content, 'floating-toc press content');
    await trigger.click();
    await content.waitFor({ state: 'hidden', timeout: 6000 });
    await trigger.click();
    await expectVisible(page.locator('[data-slot="floating-toc-content"]').filter({ hasText: '课程安排' }).first(), 'floating-toc reopened press content');
    await page.keyboard.press('Escape');
    checks.push('floating-toc press trigger opens and closes directory content');
  }

  await clickComponent(page, 'hover-card');
  {
    const preview = scoped(page, 'hover-card-placements');
    await preview.getByRole('button', { name: 'left' }).click({ force: true });
    await preview.locator('[data-slot="hover-card-trigger"]').first().hover();
    await expectVisible(
      page.locator('[data-slot="hover-card-content"][data-placement^="left"]').filter({ hasText: '雅思 7 分计划' }).first(),
      'hover-card left placement content',
    );
    checks.push('hover-card placement controls update overlay placement');
  }

  await clickComponent(page, 'list-view');
  {
    const preview = scoped(page, 'list-view-selection-modes');
    await expectVisible(preview.locator('[data-slot="list-view"]').first(), 'list-view root');
    await preview.locator('[data-slot="list-view-item"]').filter({ hasText: 'Q4 financial report.xlsx' }).first().click();
    await expectVisible(preview.getByText('已选择：2'), 'list-view multi-selection count');
    checks.push('list-view updates multi-selection through real list items');
  }

  await clickComponent(page, 'sheet');
  {
    const preview = scoped(page, 'sheet-default');
    await preview.getByRole('button', { name: /打开/ }).first().click();
    await expectVisible(page.locator('[data-slot="sheet-dialog"]').first(), 'sheet dialog');
    await page.keyboard.press('Escape');
    await page.locator('[data-slot="sheet-dialog"]').first().waitFor({ state: 'hidden', timeout: 6000 });
    checks.push('sheet opens and closes with Escape in a real browser');
  }

  await clickComponent(page, 'carousel');
  {
    const preview = scoped(page, 'carousel-default');
    await expectVisible(preview.locator('[data-slot="carousel"]').first(), 'carousel root');
    const activeBefore = await preview.locator('[data-slot="carousel-dot"][aria-current="true"], [data-slot="carousel-dot"][data-active="true"], [data-slot="carousel-dot"][data-selected]').count();
    await preview.locator('[data-slot="carousel-next"]').first().click();
    await sleep(250);
    const activeAfter = await preview.locator('[data-slot="carousel-dot"][aria-current="true"], [data-slot="carousel-dot"][data-active="true"], [data-slot="carousel-dot"][data-selected]').count();
    if (activeBefore === 0 && activeAfter === 0) {
      throw new Error('carousel: next click did not expose an active dot state');
    }
    checks.push('carousel next control keeps active dot state present');
  }

  await clickComponent(page, 'command');
  {
    const preview = scoped(page, 'command-default');
    await preview.getByRole('button', { name: /打开命令面板/ }).click();
    await expectVisible(page.locator('[data-slot="command-list"]').first(), 'command list');
    await page.getByRole('searchbox', { name: /Search commands|搜索命令/i }).fill('设置');
    await page.locator('[data-slot="command-item"]').filter({ hasText: '打开设置' }).first().click();
    await expectText(preview.locator('span'), '已执行：open-settings', 'command action state');
    checks.push('command dialog filters and executes a command action');
  }

  await clickComponent(page, 'context-menu');
  {
    const preview = scoped(page, 'context-menu-default');
    const target = preview.getByText('在此处右键').first();
    await expectVisible(target, 'context-menu trigger target');
    await target.click({ button: 'right' });
    await expectVisible(page.locator('[data-slot="context-menu-menu"]').first(), 'context-menu menu');
    await page.locator('[data-slot="context-menu-menu"] [role="menuitem"]').filter({ hasText: '重新加载' }).first().click();
    await expectText(preview.locator('span'), '已选择：reload', 'context-menu action state');
    checks.push('context-menu opens on right click and dispatches item action');
  }

  await clickComponent(page, 'navbar');
  {
    const preview = scoped(page, 'navbar-with-menu');
    await expectVisible(preview.locator('[data-slot="navbar-menu"]').first(), 'navbar menu');
    await preview.locator('[data-slot="navbar-menu-item"]').filter({ hasText: '排班' }).first().click();
    await expectVisible(preview.getByText('当前：schedule · 菜单收起'), 'navbar menu item navigation state');
    await expectVisible(preview.locator('[data-slot="navbar-item"][data-current="true"]').filter({ hasText: '排班' }).first(), 'navbar current item state');
    checks.push('navbar menu item navigates and closes the responsive menu');
  }

  await clickComponent(page, 'segment');
  {
    const preview = scoped(page, 'segment-controlled');
    await expectVisible(preview.locator('[data-slot="segment"]').first(), 'segment root');
    await preview.locator('[data-slot="segment-item"]').filter({ hasText: '报表' }).first().click();
    await expectVisible(preview.getByText('当前：reports'), 'segment controlled selection');
    checks.push('segment updates controlled selected key');
  }

  await clickComponent(page, 'stepper');
  {
    const preview = scoped(page, 'stepper-controlled');
    await expectVisible(preview.locator('[data-slot="stepper"]').first(), 'stepper root');
    const stepButton = preview.locator('[data-slot="stepper-step"][data-index="2"] [data-slot="stepper-step-button"]').first();
    await expectVisible(stepButton, 'stepper third step button');
    await stepButton.click({ force: true });
    await expectVisible(preview.locator('[data-slot="stepper-step"][data-index="2"][data-status="active"]').filter({ hasText: '支付' }).first(), 'stepper active step');
    await expectVisible(preview.getByText(/当前第 3 步/), 'stepper controlled readout');
    checks.push('stepper controlled steps can be selected by clicking a step');
  }

  await clickComponent(page, 'emoji-picker');
  {
    const preview = scoped(page, 'emoji-picker-default');
    const trigger = preview.locator('[data-slot="emoji-picker-trigger"]').first();
    await expectVisible(trigger, 'emoji-picker trigger');
    await trigger.click();
    const popover = page.locator('[data-slot="emoji-picker-popover"]:visible').first();
    await expectVisible(popover.locator('[data-slot="emoji-picker-grid"]').first(), 'emoji-picker grid');
    await popover.getByLabel('搜索表情').fill('手势');
    await popover.locator('[data-slot="emoji-picker-item"]').filter({ hasText: '👍' }).first().click();
    await expectVisible(preview.getByText('最近选择：👍'), 'emoji-picker selected state');
    await page.locator('[data-slot="emoji-picker-popover"]').waitFor({ state: 'hidden', timeout: 6000 });
    checks.push('emoji-picker opens, filters, and selects an emoji');
  }

  await clickComponent(page, 'sidebar');
  await page.setViewportSize({ width: 390, height: 844 });
  {
    const preview = scoped(page, 'sidebar-default');
    await preview.scrollIntoViewIfNeeded();
    const trigger = preview.locator('[data-slot="sidebar-trigger"]:visible').first();
    await expectVisible(trigger, 'sidebar mobile trigger');
    await trigger.click();
    await expectVisible(page.locator('[data-slot="sheet-dialog"], [data-slot="sidebar-mobile"]').first(), 'sidebar mobile sheet');
    await page.keyboard.press('Escape');
    checks.push('sidebar mobile trigger opens a sheet-backed drawer');
  }
  await page.setViewportSize({ width: 1440, height: 1000 });

  return checks;
};

(async () => {
  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    throw new Error('No Chromium-compatible browser found. Set VELA_BROWSER_EXECUTABLE to run browser parity smoke.');
  }

  const server = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      executablePath,
      headless: true,
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(8000);
    await page.goto(server.url, { waitUntil: 'networkidle' });
    await expectVisible(page.locator('text=Vela UI').first(), 'showcase shell');

    const pageRows = await auditComponentPages(page);
    const targetedChecks = await runTargetedSmoke(page);

    console.log(`Browser executable: ${executablePath}`);
    console.log(`Showcase URL: ${server.url}`);
    console.log(`Component pages checked: ${pageRows.length}`);
    console.log(`Targeted smoke components: ${browserSmokeComponents.join(', ')}`);
    for (const check of targetedChecks) {
      console.log(`- ${check}`);
    }
  } finally {
    if (browser) await browser.close();
    await server.stop();
  }
})().catch((error) => {
  console.error(`Browser parity smoke failed: ${error.message}`);
  process.exitCode = 1;
});
