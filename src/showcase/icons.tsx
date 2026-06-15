/** 文档站外壳用到的图标（路径数据逐一取自参考 DOM） */

export const LogoIcon = () => (
  <span className="inline-flex items-center gap-2 text-foreground">
    <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-foreground">
      V
    </span>
    <span className="text-sm font-semibold tracking-tight">Vela UI</span>
  </span>
);

export const SearchIcon = () => (
  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" className="size-4">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const ChevronRightSmIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" className="size-3.5">
    <path fill="currentColor" fillRule="evenodd" d="M5.47 13.03a.75.75 0 0 1 0-1.06L9.44 8 5.47 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0" clipRule="evenodd" />
  </svg>
);

export const ThemeToggleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" className="size-3.5">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8 13.5a5.5 5.5 0 0 0 2.263-10.514 5.5 5.5 0 0 1-7.278 7.278A5.5 5.5 0 0 0 8 13.5M1.045 8.795a7.001 7.001 0 1 0 7.75-7.75l-.028-.003A7 7 0 0 0 8 1c-.527 0-.59.842-.185 1.18a4 4 0 0 1 .342.322A4 4 0 1 1 2.18 7.814C1.842 7.41 1 7.474 1 8a7 7 0 0 0 .045.794"
      clipRule="evenodd"
    />
  </svg>
);

export const OpenNewTabIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" className="size-3.5">
    <path fill="currentColor" d="M12.728 2.521a.75.75 0 0 1 .75.75v5.657a.751.751 0 0 1-1.5 0V5.083l-8.176 8.176a.75.75 0 0 1-1.061-1.06l8.176-8.177H7.07a.75.75 0 0 1 .001-1.5z" />
  </svg>
);

export const AnchorLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-link size-3.5 shrink-0 text-muted opacity-0 transition-opacity peer-hover:opacity-100"
    aria-hidden="true"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const TocIcon = () => (
  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" className="size-4">
    <path d="M15 18H3" />
    <path d="M17 6H3" />
    <path d="M21 12H3" />
  </svg>
);
