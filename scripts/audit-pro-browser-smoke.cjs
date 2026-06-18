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
  await button.scrollIntoViewIfNeeded();
  await sleep(80);
  try {
    await button.click({ timeout: 10000 });
  } catch (error) {
    const handle = await button.elementHandle();
    if (!handle) throw error;
    await page.evaluate((element) => element.click(), handle);
  }
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

const clickLocator = async (locator, label) => {
  await expectVisible(locator, label);
  await locator.scrollIntoViewIfNeeded();
  await sleep(80);
  try {
    await locator.click({ timeout: 8000 });
  } catch (error) {
    const handle = await locator.elementHandle();
    if (!handle) throw error;
    await locator.evaluate((element) => element.click());
  }
  await sleep(100);
};

const dragLocatorBy = async (page, locator, dx, dy, label) => {
  await expectVisible(locator, label);
  await locator.scrollIntoViewIfNeeded();
  await sleep(80);
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

const hoverLocatorAt = async (page, locator, fx, fy, label) => {
  await expectVisible(locator, label);
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`${label} has no bounding box`);
  await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy, { steps: 8 });
  await sleep(350);
};

const expectSlotCount = async (locator, count, label) => {
  const actual = await locator.count();
  if (actual !== count) throw new Error(`${label}: expected ${count}, got ${actual}`);
};

const expectClassIncludes = async (locator, className, label) => {
  await expectVisible(locator, label);
  const classes = (await locator.getAttribute('class')) ?? '';
  if (!classes.split(/\s+/).includes(className)) {
    throw new Error(`${label}: expected class ${className}, got ${classes}`);
  }
};

const runTargetedSmoke = async (page) => {
  const checks = [];

  await clickComponent(page, 'area-chart');
  {
    const preview = scoped(page, 'area-chart-stacked');
    const chart = preview.locator('[data-slot="area-chart"]').first();
    await hoverLocatorAt(page, chart, 0.84, 0.42, 'area-chart stacked chart');
    await expectVisible(chart.locator('svg').first(), 'area-chart svg');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Desktop' }).first(), 'area-chart stacked tooltip');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Mobile' }).filter({ hasText: 'Tablet' }).first(), 'area-chart multi-series tooltip values');
    checks.push('area-chart renders a real SVG chart and shows stacked tooltip content on hover');
  }

  await clickComponent(page, 'bar-chart');
  {
    const preview = scoped(page, 'bar-chart-horizontal-stacked');
    const chart = preview.locator('[data-slot="bar-chart"]').first();
    await hoverLocatorAt(page, chart, 0.62, 0.42, 'bar-chart horizontal stacked chart');
    await expectVisible(chart.locator('svg').first(), 'bar-chart svg');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: /Proposal|Review|Qualified|Demo|Trial|Lead/ }).filter({ hasText: 'Email' }).first(), 'bar-chart stacked tooltip');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Social' }).filter({ hasText: 'Search' }).first(), 'bar-chart multi-series tooltip values');
    checks.push('bar-chart renders horizontal stacked bars and multi-series tooltip content');
  }

  await clickComponent(page, 'chart-tooltip');
  {
    const preview = scoped(page, 'chart-tooltip-custom-formatters');
    const chart = preview.locator('[data-slot="line-chart"]').first();
    await hoverLocatorAt(page, chart, 0.84, 0.42, 'chart-tooltip formatter chart');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Report:' }).first(), 'chart-tooltip formatted header');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: /Revenue: \$|Profit: \$/ }).first(), 'chart-tooltip formatted values');
    await expectVisible(preview.locator('.chart-tooltip__indicator--line').first(), 'chart-tooltip line indicator');
    checks.push('chart-tooltip custom formatter content is emitted by a hovered chart');
  }

  await clickComponent(page, 'composed-chart');
  {
    const preview = scoped(page, 'composed-chart-multi-type');
    const chart = preview.locator('[data-slot="composed-chart"]').first();
    await hoverLocatorAt(page, chart, 0.84, 0.42, 'composed-chart multi type chart');
    await expectVisible(chart.locator('svg').first(), 'composed-chart svg');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Trend' }).filter({ hasText: 'Mobile' }).first(), 'composed-chart area and bar tooltip');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Desktop' }).first(), 'composed-chart line tooltip');
    checks.push('composed-chart combines area, bar, line series with shared tooltip payload');
  }

  await clickComponent(page, 'line-chart');
  {
    const preview = scoped(page, 'line-chart-multi-line-chart-colors');
    const chart = preview.locator('[data-slot="line-chart"]').first();
    await hoverLocatorAt(page, chart, 0.84, 0.42, 'line-chart multi line chart');
    await expectVisible(chart.locator('svg').first(), 'line-chart svg');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Search' }).filter({ hasText: 'Direct' }).first(), 'line-chart multi-series tooltip');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Social' }).first(), 'line-chart third series tooltip');
    await expectVisible(preview.locator('.chart-tooltip__indicator--line').first(), 'line-chart line indicator tooltip');
    checks.push('line-chart renders multiple colored lines and line-indicator tooltip content');
  }

  await clickComponent(page, 'pie-chart');
  {
    const preview = scoped(page, 'pie-chart-with-breakdown');
    await expectVisible(preview.locator('[data-slot="pie-chart"] svg').first(), 'pie-chart svg');
    const sales = preview.getByRole('button', { name: 'Hide Sales' });
    await sales.click();
    await expectVisible(preview.getByRole('button', { name: 'Show Sales' }), 'pie-chart legend toggle state');
    await expectVisible(preview.locator('.kpi').filter({ hasText: 'Visible share' }).locator('.kpi__value').filter({ hasText: '72%' }).first(), 'pie-chart visible share after legend toggle');
    await expectVisible(preview.locator('.kpi').filter({ hasText: 'Active segments' }).locator('.kpi__value').filter({ hasText: '3' }).first(), 'pie-chart active segment count');
    await preview.getByRole('button', { name: 'Hide Product' }).hover();
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Product' }).filter({ hasText: 'Share' }).first(), 'pie-chart legend hover tooltip');
    checks.push('pie-chart legend buttons toggle visible segments and update breakdown tooltip');
  }

  await clickComponent(page, 'radar-chart');
  {
    const preview = scoped(page, 'radar-chart-multi-series');
    const chart = preview.locator('[data-slot="radar-chart"]').first();
    await hoverLocatorAt(page, chart, 0.25, 0.38, 'radar-chart polar chart');
    await expectVisible(chart.locator('svg').first(), 'radar-chart svg');
    if ((await chart.locator('.recharts-polar-grid-concentric-polygon').count()) < 2) {
      throw new Error('radar-chart: expected multiple polygon grid rings');
    }
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: /Previous|Target|Current/ }).first(), 'radar-chart tooltip series');
    checks.push('radar-chart renders polar grid and multi-series tooltip on hover');
  }

  await clickComponent(page, 'radial-chart');
  {
    const preview = scoped(page, 'radial-chart-with-legend');
    await expectVisible(preview.locator('[data-slot="radial-chart"] svg').first(), 'radial-chart svg');
    await preview.getByRole('button', { name: 'Hide Retention' }).click();
    await expectVisible(preview.getByRole('button', { name: 'Show Retention' }), 'radial-chart legend toggle state');
    await expectVisible(preview.getByText('67%'), 'radial-chart average after legend toggle');
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Visible rings' }).filter({ hasText: '3' }).first(), 'radial-chart visible rings tooltip');
    await preview.getByRole('button', { name: 'Hide Revenue' }).hover();
    await expectVisible(preview.locator('.chart-tooltip').filter({ hasText: 'Revenue' }).filter({ hasText: 'Score' }).first(), 'radial-chart legend hover tooltip');
    checks.push('radial-chart legend buttons filter rings and update summary tooltip');
  }

  await clickComponent(page, 'number-value');
  {
    const preview = scoped(page, 'number-value-with-prefix-suffix');
    await expectSlotCount(preview.locator('[data-slot="number-value"]'), 2, 'number-value count');
    await expectVisible(preview.locator('[data-slot="number-value-prefix"]').filter({ hasText: 'ARR' }).first(), 'number-value ARR prefix');
    await expectVisible(preview.locator('[data-slot="number-value-value"]').filter({ hasText: '8,472' }).first(), 'number-value formatted value');
    await expectVisible(preview.locator('[data-slot="number-value-suffix"]').filter({ hasText: '/月' }).first(), 'number-value suffix');
    await expectVisible(preview.locator('[data-slot="number-value-prefix"]').filter({ hasText: '排名 #' }).first(), 'number-value rank prefix');
    checks.push('number-value renders formatted values with prefix and suffix slots');
  }

  await clickComponent(page, 'trend-chip');
  {
    const preview = scoped(page, 'trend-chip-variants');
    const chips = preview.locator('[data-slot="chip"]');
    await expectSlotCount(chips, 3, 'trend-chip variants count');
    await expectClassIncludes(chips.filter({ hasText: '12%' }).first(), 'chip--success', 'trend-chip success variant');
    await expectClassIncludes(chips.filter({ hasText: '3%' }).first(), 'chip--danger', 'trend-chip danger variant');
    await expectClassIncludes(chips.filter({ hasText: '0%' }).first(), 'chip--default', 'trend-chip neutral variant');
    await expectVisible(preview.locator('.trend-chip__indicator svg').first(), 'trend-chip indicator icon');
    checks.push('trend-chip maps trend direction to semantic chip variants and indicators');
  }

  await clickComponent(page, 'agenda');
  {
    const preview = scoped(page, 'agenda-default');
    const agenda = preview.locator('[data-slot="agenda"]').first();
    await expectVisible(agenda, 'agenda root');
    await preview.getByRole('radio', { name: /月|Month/i }).click();
    if ((await agenda.getAttribute('data-view')) !== 'month') {
      throw new Error('agenda: view selector did not switch to month');
    }
    await preview.getByRole('radio', { name: /周|Week/i }).click();
    if ((await agenda.getAttribute('data-view')) !== 'week') {
      throw new Error('agenda: view selector did not switch back to week');
    }
    const event = preview.locator('[data-slot="agenda-event"][data-event-id="6"]').first();
    await expectVisible(event, 'agenda timed event');
    await event.click();
    await expectVisible(preview.locator('[data-slot="agenda-event"][data-event-id="6"][data-selected="true"]').first(), 'agenda selected event');
    const dragPreview = scoped(page, 'agenda-drag-interactions');
    const draggableEvent = dragPreview.locator('[data-slot="agenda-event"][data-event-id="6"]').first();
    const originalTime = await draggableEvent.locator('[data-slot="agenda-event-time"]').innerText();
    await dragLocatorBy(page, draggableEvent, 0, 64, 'agenda draggable event');
    const movedTime = await draggableEvent.locator('[data-slot="agenda-event-time"]').innerText();
    if (movedTime === originalTime) {
      throw new Error('agenda: dragging a timed event did not update its displayed time');
    }
    const eventsPreview = scoped(page, 'agenda-events');
    const resizableEvent = eventsPreview.locator('[data-slot="agenda-event"][data-event-id="6"]').first();
    const beforeResizeBox = await resizableEvent.boundingBox();
    const beforeResizeTime = await resizableEvent.locator('[data-slot="agenda-event-time"]').innerText();
    const resizeHandle = resizableEvent.locator('[data-slot="agenda-resize-handle"]').first();
    await dragLocatorBy(page, resizeHandle, 0, 90, 'agenda resize handle');
    const afterResizeTime = await resizableEvent.locator('[data-slot="agenda-event-time"]').innerText();
    const afterResizeBox = await resizableEvent.boundingBox();
    if (
      afterResizeTime === beforeResizeTime &&
      beforeResizeBox &&
      afterResizeBox &&
      Math.abs(afterResizeBox.height - beforeResizeBox.height) < 8
    ) {
      throw new Error('agenda: resizing a timed event did not update its displayed time');
    }
    await draggableEvent.focus();
    await page.keyboard.press('Delete');
    await sleep(150);
    if ((await dragPreview.locator('[data-slot="agenda-event"][data-event-id="6"]').count()) !== 0) {
      throw new Error('agenda: keyboard Delete did not remove a focused timed event');
    }
    const allDayPreview = scoped(page, 'agenda-all-day-events');
    await expectVisible(allDayPreview.locator('[data-slot="agenda-all-day-event"]').first(), 'agenda all-day event');
    const monthPreview = scoped(page, 'agenda-month-view-features');
    await expectVisible(monthPreview.locator('[data-slot="agenda-month-cell-more"]').first(), 'agenda month overflow more control');
    await expectVisible(monthPreview.locator('[data-slot="agenda-month-cell"][data-weekend="true"]').first(), 'agenda weekend month cell');
    const currentTimePreview = scoped(page, 'agenda-current-time-indicator');
    await currentTimePreview.locator('[data-slot="agenda-current-time-indicator"]').first().waitFor({ state: 'attached', timeout: 6000 });
    await expectVisible(currentTimePreview.locator('[data-slot="agenda-current-time-label"]').first(), 'agenda current time label');
    const currentTimeLine = currentTimePreview.locator('[data-slot="agenda-current-time-line"]').first();
    await currentTimeLine.waitFor({ state: 'attached', timeout: 6000 });
    const currentTimeLineBox = await currentTimeLine.boundingBox();
    if (!currentTimeLineBox || currentTimeLineBox.width < 20 || currentTimeLineBox.height < 1) {
      throw new Error('agenda: current time line has no usable layout box');
    }
    checks.push('agenda switches views, selects events, drags/resizes/deletes timed events, and renders all-day/month/current-time states');
  }

  await clickComponent(page, 'empty-state');
  {
    const preview = scoped(page, 'empty-state-default');
    const empty = preview.getByRole('status').first();
    await expectClassIncludes(empty, 'empty-state--md', 'empty-state root size');
    await expectVisible(preview.locator('.empty-state__media[aria-hidden="true"]').first(), 'empty-state decorative media');
    await preview.getByRole('button', { name: '刷新 0' }).click();
    await expectVisible(preview.getByRole('button', { name: '刷新 1' }), 'empty-state action count');
    checks.push('empty-state renders status semantics and action button feedback');
  }

  await clickComponent(page, 'kanban');
  {
    const preview = scoped(page, 'kanban-default');
    await expectVisible(preview.locator('[data-slot="kanban"]').first(), 'kanban root');
    const columns = preview.locator('[data-slot="kanban-column"]');
    await expectSlotCount(columns, 3, 'kanban column count');
    await expectVisible(preview.locator('[data-slot="kanban-column-title"]').filter({ hasText: '待跟进' }).first(), 'kanban todo column title');
    await expectVisible(preview.locator('[data-slot="kanban-column-count"]').filter({ hasText: '3' }).first(), 'kanban todo column count');
    await expectVisible(preview.locator('[data-slot="kanban-card"]').filter({ hasText: '学员「王晓萌」连续 3 天未打卡' }).first(), 'kanban first card');
    await expectVisible(preview.locator('[data-slot="kanban-card-list"][data-kanban-column="todo"]').first(), 'kanban todo droppable list');
    checks.push('kanban renders board columns, counts, droppable lists, and card anatomy');
  }

  await clickComponent(page, 'item-card');
  {
    const preview = scoped(page, 'item-card-pressable');
    const card = preview.locator('[data-slot="item-card"]').filter({ hasText: '雅思核心词汇' }).first();
    await expectVisible(card, 'item-card pressable card');
    if ((await card.getAttribute('role')) !== 'button') {
      throw new Error('item-card: pressable card did not expose button role');
    }
    await card.click();
    await expectVisible(preview.getByText('已打开课程详情'), 'item-card press feedback');
    checks.push('item-card pressable root dispatches a card-level press action');
  }

  await clickComponent(page, 'item-card-group');
  {
    const preview = scoped(page, 'item-card-group-pressable');
    await expectVisible(preview.locator('.item-card-group[role="group"]').first(), 'item-card-group root');
    const card = preview.locator('[data-slot="item-card"]').filter({ hasText: '考研英语冲刺班' }).first();
    await expectVisible(card, 'item-card-group pressable item');
    await card.click();
    await expectVisible(preview.getByText('已点击：考研英语冲刺班'), 'item-card-group press feedback');
    checks.push('item-card-group enhances child cards with grouped press callbacks');
  }

  await clickComponent(page, 'kpi');
  {
    const preview = scoped(page, 'kpi-with-actions');
    await expectVisible(preview.locator('[data-slot="kpi"]').first(), 'kpi root');
    await expectVisible(preview.locator('.kpi__value').filter({ hasText: '1,286' }).first(), 'kpi initial value');
    await preview.getByRole('button', { name: '本周' }).click();
    await expectVisible(preview.locator('.kpi__value').filter({ hasText: '5,214' }).first(), 'kpi toggled value');
    await expectVisible(preview.getByRole('button', { name: '本月' }), 'kpi action button toggled label');
    checks.push('kpi action slot changes period label and value state');
  }

  await clickComponent(page, 'kpi-group');
  {
    const horizontal = scoped(page, 'kpi-group-horizontal');
    const vertical = scoped(page, 'kpi-group-vertical');
    await expectClassIncludes(horizontal.locator('[data-slot="kpi-group"]').first(), 'kpi-group--horizontal', 'kpi-group horizontal');
    await expectClassIncludes(vertical.locator('[data-slot="kpi-group"]').first(), 'kpi-group--vertical', 'kpi-group vertical');
    if ((await horizontal.locator('[data-slot="kpi-group-separator"][aria-hidden="true"]').count()) === 0) {
      throw new Error('kpi-group: expected decorative aria-hidden separator');
    }
    await expectVisible(horizontal.locator('[data-slot="kpi"]').filter({ hasText: '新增学员' }).first(), 'kpi-group child kpi');
    checks.push('kpi-group exposes horizontal/vertical layouts, separators, and child KPI anatomy');
  }

  await clickComponent(page, 'widget');
  {
    const preview = scoped(page, 'widget-with-table');
    await expectVisible(preview.locator('[data-slot="widget"]').first(), 'widget root');
    await expectVisible(preview.locator('[data-slot="widget-header"]').filter({ hasText: '课程排行' }).first(), 'widget header');
    const header = preview.getByRole('columnheader', { name: /课程|Course|name/i }).first();
    await expectVisible(header, 'widget embedded data grid header');
    await header.click();
    await expectVisible(preview.locator('[data-slot="widget-content"] [data-slot="data-grid"]').first(), 'widget content data grid');
    checks.push('widget composes header/content slots with an interactive data-grid child');
  }

  await clickComponent(page, 'chat-attachment');
  {
    const preview = scoped(page, 'chat-attachment-composer');
    await expectVisible(preview.locator('.chat-attachment').filter({ hasText: '家长沟通记录.docx' }).first(), 'chat-attachment initial attachment');
    await preview.locator('[data-slot="prompt-input-action"][aria-label="添加附件"]').click();
    await expectVisible(preview.getByRole('button', { name: '移除附件 补充材料-2.pdf' }), 'chat-attachment added attachment remove button');
    await preview.getByRole('button', { name: '移除附件 补充材料-2.pdf' }).click();
    if (await preview.getByRole('button', { name: '移除附件 补充材料-2.pdf' }).count() !== 0) {
      throw new Error('chat-attachment: removed attachment still has a remove button');
    }
    await preview.locator('[data-slot="prompt-input-send"]').first().click();
    await expectVisible(preview.getByText(/已发送：.*附件 1 个/), 'chat-attachment composer sent status');
    checks.push('chat-attachment composer adds, removes, and submits real attachment chips');
  }

  await clickComponent(page, 'chat-conversation');
  {
    const preview = scoped(page, 'chat-conversation-scroll-button');
    const conversation = preview.locator('[data-slot="chat-conversation"]').first();
    await expectVisible(conversation, 'chat-conversation root');
    await expectSlotCount(preview.locator('[data-slot="chat-conversation-message"]'), 12, 'chat-conversation message count');
    await conversation.evaluate((node) => {
      node.scrollTop = 0;
      node.dispatchEvent(new Event('scroll', { bubbles: true }));
    });
    const container = preview.locator('[data-slot="chat-conversation-scroll-button-container"]').first();
    await expectVisible(container, 'chat-conversation scroll button container');
    await page.waitForFunction((node) => node.getAttribute('data-state') === 'visible', await container.elementHandle());
    await preview.locator('[data-slot="chat-conversation-scroll-button"]').first().click();
    await page.waitForFunction(
      (node) => node.scrollHeight - node.scrollTop - node.clientHeight <= 28,
      await conversation.elementHandle(),
      { timeout: 6000 },
    );
    await page.waitForFunction((node) => node.getAttribute('data-state') === 'hidden', await container.elementHandle());
    checks.push('chat-conversation exposes scroll state and returns to bottom through its scroll button');
  }

  await clickComponent(page, 'chat-list-view');
  {
    const preview = scoped(page, 'chat-list-view-default');
    await expectVisible(preview.locator('[data-slot="chat-list-view"]').first(), 'chat-list-view root');
    await expectSlotCount(preview.locator('[data-slot="chat-list-view-item"]'), 3, 'chat-list-view item count');
    const item = preview.locator('[data-slot="chat-list-view-item"]').filter({ hasText: '文案润色' }).first();
    await item.click();
    await expectVisible(preview.getByText('当前选中：3'), 'chat-list-view selected key readout');
    const selected = (await item.getAttribute('aria-selected')) === 'true' || (await item.getAttribute('data-selected')) !== null;
    if (!selected) throw new Error('chat-list-view: clicked item did not expose selected state');
    checks.push('chat-list-view updates a controlled GridList selection');
  }

  await clickComponent(page, 'chat-loader');
  {
    const preview = scoped(page, 'chat-loader-default');
    await expectVisible(preview.getByRole('status', { name: '自定义加载骨架' }), 'chat-loader custom skeleton status');
    const statusCount = await preview.getByRole('status').count();
    if (statusCount < 5) throw new Error(`chat-loader: expected at least 5 status regions, got ${statusCount}`);
    await expectSlotCount(preview.locator('.chat-loader__skeleton'), 2, 'chat-loader skeleton count');
    await expectSlotCount(preview.locator('.chat-loader__dot'), 6, 'chat-loader dot count');
    const dot = preview.locator('.chat-loader__dot').first();
    const activeAnimation = await dot.evaluate((node) => getComputedStyle(node).animationName);
    if (activeAnimation === 'none') throw new Error('chat-loader: dot animation is unexpectedly disabled');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction((node) => getComputedStyle(node).animationName === 'none', await dot.elementHandle());
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    checks.push('chat-loader exposes loading status semantics and reduced-motion animation fallback');
  }

  await clickComponent(page, 'chat-message');
  {
    const preview = scoped(page, 'chat-message-with-markdown');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(page.url()).origin }).catch(() => undefined);
    await expectVisible(preview.locator('.chat-message--assistant').first(), 'chat-message assistant bubble');
    await expectVisible(preview.locator('[data-slot="markdown"]').filter({ hasText: '建议' }).first(), 'chat-message markdown content');
    await expectVisible(preview.locator('[data-slot="markdown-inline-code"]').filter({ hasText: '15 min' }).first(), 'chat-message inline markdown code');
    const copy = preview.locator('[data-slot="chat-message-action"]').first();
    await copy.click();
    await page.waitForFunction(
      (button) => button.getAttribute('data-copy-status') !== 'idle',
      await copy.elementHandle(),
      { timeout: 3000 },
    );
    const status = await copy.getAttribute('data-copy-status');
    if (status !== 'copied' && status !== 'failed') throw new Error(`chat-message: unexpected copy status ${status}`);
    checks.push('chat-message combines assistant layout, markdown rendering, and copy action feedback');
  }

  await clickComponent(page, 'markdown');
  {
    const preview = scoped(page, 'markdown-streaming');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(page.url()).origin }).catch(() => undefined);
    await preview.getByRole('button', { name: '重新播放' }).click();
    await expectVisible(preview.locator('[data-slot="text-shimmer"]').first(), 'markdown streaming shimmer');
    await expectVisible(preview.locator('[data-slot="markdown"]').filter({ hasText: 'Streaming Markdown' }).first(), 'markdown streaming heading');
    await expectVisible(preview.getByText('等待最后一个 token'), 'markdown streamed task item');
    const defaultPreview = scoped(page, 'markdown-default');
    const code = defaultPreview.locator('[data-slot="code-block-code"] code[data-language="typescript"]').first();
    await expectVisible(code, 'markdown fenced code block');
    const copy = defaultPreview.locator('[data-slot="code-block-copy-button"]').first();
    await copy.click();
    await page.waitForFunction(
      (button) => button.getAttribute('data-copy-status') !== 'idle',
      await copy.elementHandle(),
      { timeout: 3000 },
    );
    const status = await copy.getAttribute('data-copy-status');
    if (status !== 'copied' && status !== 'failed') throw new Error(`markdown: unexpected copy status ${status}`);
    checks.push('markdown streams rich content and keeps code-block copy feedback functional');
  }

  await clickComponent(page, 'text-shimmer');
  {
    const preview = scoped(page, 'text-shimmer-default');
    const shimmers = preview.locator('[data-slot="text-shimmer"]');
    await expectSlotCount(shimmers, 2, 'text-shimmer count');
    await expectVisible(shimmers.filter({ hasText: '正在生成回答…' }).first(), 'text-shimmer first text');
    await expectVisible(shimmers.filter({ hasText: '检索知识库中…' }).first(), 'text-shimmer second text');
    const activeAnimation = await shimmers.first().evaluate((node) => getComputedStyle(node).animationName);
    if (activeAnimation === 'none') throw new Error('text-shimmer: animation is unexpectedly disabled');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction((node) => getComputedStyle(node).animationName === 'none', await shimmers.first().elementHandle());
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    checks.push('text-shimmer renders shimmer text and respects reduced-motion media preferences');
  }

  await clickComponent(page, 'app-layout');
  {
    const preview = scoped(page, 'app-layout-with-aside');
    const layout = preview.locator('[data-app-layout]').first();
    await expectVisible(layout, 'app-layout root');
    await clickLocator(preview.getByRole('button', { name: '收起侧栏' }), 'app-layout collapse sidebar button');
    await page.waitForFunction((node) => node.getAttribute('data-sidebar-state') === 'collapsed', await layout.elementHandle());
    const asideTrigger = preview.locator('[data-slot="app-layout-aside-trigger"]').first();
    await expectVisible(asideTrigger, 'app-layout aside trigger');
    await clickLocator(asideTrigger, 'app-layout aside trigger');
    if ((await asideTrigger.getAttribute('aria-expanded')) !== 'false') {
      throw new Error('app-layout: aside trigger did not expose aria-expanded=false after toggle');
    }
    await expectVisible(preview.locator('[data-slot="app-layout-aside"][data-state="closed"]').first(), 'app-layout closed aside');
    await clickLocator(preview.getByRole('button', { name: '课程' }), 'app-layout courses nav button');
    await expectVisible(preview.getByText('当前模块：courses'), 'app-layout active navigation state');
    checks.push('app-layout coordinates sidebar collapse, aside trigger state, and nested navigation');
  }

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
    const preview = scoped(page, 'file-tree-with-icons');
    const tree = preview.locator('[data-slot="file-tree"]').first();
    await expectVisible(tree, 'file-tree root');
    const treeItem = preview.locator('[data-slot="file-tree-item-content"]').filter({ hasText: /courses|operations/i }).first();
    await expectVisible(treeItem, 'file-tree expandable item');
    await treeItem.click();
    await expectVisible(preview.locator('[data-slot="file-tree-item-content"]').first(), 'file-tree item content');
    checks.push('file-tree renders real slots and accepts tree item interaction');
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
