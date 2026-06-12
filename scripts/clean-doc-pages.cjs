/**
 * 清洗采集的文档页 DOM（/tmp/heroui/reference/page-*.html）→ public/reference/pages/<slug>.html
 * - 去 script/注释/Next 运行时残留
 * - demo iframe 指向本地 /demo/<slug>.html（与原站 /docs/react/demos/<slug> 等价）
 * - 静态资源改为原站绝对地址
 */
const fs = require('fs');
const path = require('path');

const SRC = '/tmp/heroui/reference';
const OUT = path.join(__dirname, '..', 'public/reference/pages');
fs.mkdirSync(OUT, { recursive: true });

let n = 0;
for (const f of fs.readdirSync(SRC)) {
  if (!f.startsWith('page-') || !f.endsWith('.html')) continue;
  let h = fs.readFileSync(path.join(SRC, f), 'utf8');
  h = h.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
  h = h.replace(/<script[^>]*\/>/g, '');
  h = h.replace(/<!--[\s\S]*?-->/g, '');
  h = h.replace(/<next-route-announcer[\s\S]*?<\/next-route-announcer>/g, '');
  // demo iframe → 本地等价页
  h = h.replace(/src="\/docs\/react\/demos\/([a-z0-9-]+)[^"]*"/g, 'src="/demo/$1.html"');
  h = h.replace(/src="https:\/\/heroui\.pro\/docs\/react\/demos\/([a-z0-9-]+)[^"]*"/g, 'src="/demo/$1.html"');
  // 其余静态资源走原站
  h = h.replace(/(src|srcset|poster)="\/(docs|images|_next)\//g, '$1="https://heroui.pro/$2/');
  h = h.replace(/url\(\/(docs|images|_next)\//g, 'url(https://heroui.pro/$1/');
  const slug = f.replace(/^page-/, '').replace(/\.html$/, '');
  fs.writeFileSync(path.join(OUT, slug + '.html'), h);
  n++;
}
console.log('doc pages cleaned:', n);
