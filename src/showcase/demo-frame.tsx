import { memo, useEffect, useState } from 'react';

export type DemoFrameProps = {
  slug: string;
  width?: number | '100%';
  height?: number | undefined;
};

const FRAME_HEAD = `<!doctype html><html class="light" style="--font-inter:'Inter','Inter Fallback'">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="/heroui/fonts.css" />
<link rel="stylesheet" href="/heroui/full.css" />
<style>html,body{margin:0;background:var(--background)}</style>
</head><body>`;

const cache = new Map<string, string>();

/** 以原站完整 CSS + 采集的基准 DOM 在隔离 iframe 中渲染 demo，保证像素级一致 */
const DemoFrame = memo(({ slug, width = '100%', height = 520 }: DemoFrameProps) => {
  const [html, setHtml] = useState<string | null>(cache.get(slug) ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = cache.get(slug);
    if (cached) {
      setHtml(cached);
      return undefined;
    }
    setHtml(null);
    setError(null);
    const load = async () => {
      try {
        const res = await fetch(`/reference/demos/${slug}.html`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        cache.set(slug, text);
        if (!cancelled) setHtml(text);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) return <div className="sc-frame-error">基准快照加载失败：{error}</div>;
  if (html === null) return <div className="sc-frame-loading" style={{ height }} />;

  return (
    <iframe
      title={slug}
      className="sc-frame"
      style={{ width, height }}
      sandbox="allow-same-origin"
      srcDoc={FRAME_HEAD + html + '</body></html>'}
    />
  );
});

DemoFrame.displayName = 'DemoFrame';

export default DemoFrame;
