/**
 * 把 public/reference/demos/<slug>.html（采集的原站渲染 DOM）
 * 包装成可独立访问的完整页面 public/demo/<slug>.html，
 * 使用原站完整 CSS 与自托管 Inter 渲染，与原站 /docs/react/demos/<slug> 等价。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public/reference/demos');
const OUT = path.join(ROOT, 'public/demo');
fs.mkdirSync(OUT, { recursive: true });

const head = `<!doctype html>
<html class="light" style="--font-inter:'Inter','Inter Fallback'">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="/heroui/fonts.css" />
<link rel="stylesheet" href="/heroui/full.css" />
<style>html,body{margin:0;background:var(--background)}</style>
</head>
<body>`;

let n = 0;
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith('.html')) continue;
  const body = fs.readFileSync(path.join(SRC, f), 'utf8');
  fs.writeFileSync(path.join(OUT, f), head + body + '</body></html>');
  n++;
}
console.log('demo pages:', n);
