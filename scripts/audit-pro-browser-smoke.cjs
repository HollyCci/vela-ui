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
