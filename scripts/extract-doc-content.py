#!/usr/bin/env python3
"""
从 public/reference/pages/<slug>.html 提取文档正文：
- article 内容按 demo 预览容器切分为有序块（html 块 / demo 占位）
- 提取右侧 TOC 锚点列表（含层级缩进）
输出 public/docs-content/<slug>.json，供展示站按需加载。
"""
import json
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'public/reference/pages')
OUT = os.path.join(ROOT, 'public/docs-content')
os.makedirs(OUT, exist_ok=True)

TAG_RE = re.compile(r'<(/?)(div|article)\b[^>]*>', re.I)


def find_element(html: str, open_tag_re: str) -> tuple[int, int] | None:
    """返回匹配元素（含标签）的 [start, end) 区间，按 div/article 深度配对。"""
    m = re.search(open_tag_re, html)
    if not m:
        return None
    start = m.start()
    tag = re.match(r'<(\w+)', m.group(0)).group(1).lower()
    depth = 0
    pair_re = re.compile(r'<(/?)%s\b[^>]*>' % tag, re.I)
    for mm in pair_re.finditer(html, start):
        if mm.group(1) == '/':
            depth -= 1
            if depth == 0:
                return (start, mm.end())
        else:
            depth += 1
    return None


def inner_of(html: str, span: tuple[int, int]) -> str:
    seg = html[span[0]:span[1]]
    open_end = seg.index('>') + 1
    close_start = seg.rindex('<')
    return seg[open_end:close_start]


def extract(slug: str) -> dict | None:
    path = os.path.join(SRC, slug + '.html')
    with open(path) as f:
        html = f.read()

    art_span = find_element(html, r'<article\b[^>]*id="nd-page"[^>]*>')
    if art_span is None:
        art_span = find_element(html, r'<article\b[^>]*>')
    if art_span is None:
        return None
    article = inner_of(html, art_span)

    # 切出 demo 预览容器
    blocks = []
    rest = article
    while True:
        span = find_element(rest, r'<div\b[^>]*class="component-preview-container[^"]*"[^>]*>')
        if span is None:
            break
        before = rest[:span[0]]
        container = rest[span[0]:span[1]]
        demo = re.search(r'data-name="([a-z0-9-]+)"', container)
        if before.strip():
            blocks.append({'type': 'html', 'html': before})
        blocks.append({'type': 'demo', 'slug': demo.group(1) if demo else ''})
        rest = rest[span[1]:]
    if rest.strip():
        blocks.append({'type': 'html', 'html': rest})

    # TOC：原样保留锚点容器 HTML（data-active 重置为 false）
    toc_html = ''
    toc_span = find_element(html, r'<div\b[^>]*id="nd-toc"[^>]*>')
    if toc_span:
        toc_seg = html[toc_span[0]:toc_span[1]]
        list_span = find_element(toc_seg, r'<div\b[^>]*class="flex flex-col"[^>]*>')
        if list_span:
            toc_html = inner_of(toc_seg, list_span)
            toc_html = toc_html.replace('data-active="true"', 'data-active="false"')

    return {'blocks': blocks, 'tocHtml': toc_html}


count = 0
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.html'):
        continue
    slug = f[:-5]
    data = extract(slug)
    if data is None:
        print('SKIP (no article):', slug)
        continue
    with open(os.path.join(OUT, slug + '.json'), 'w') as fp:
        json.dump(data, fp, ensure_ascii=False)
    count += 1
print('extracted:', count)
