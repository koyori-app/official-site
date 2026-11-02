import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface NavItem {
  href: string;
  label: string;
  current?: boolean;
  external?: boolean;
}

interface Props {
  items: NavItem[];
  labels: { open: string; close: string; menu: string };
}

export default function MobileNav({ items, labels }: Props) {
  const [open, setOpen] = useState(false);
  // ヘッダーの backdrop-filter が fixed の基準になるので、パネルは body 直下に描画する
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  const icon = (path: string) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className="h-5 w-5"
    >
      <path d={path} />
    </svg>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-fg transition-colors duration-150 hover:bg-bg-3"
      >
        {icon('M4 7h16M4 12h16M4 17h16')}
      </button>

      {mounted &&
        createPortal(
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={labels.menu}
            hidden={!open}
            className="fixed inset-0 z-50"
          >
            <div
              className="absolute inset-0 bg-bg/60 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-line bg-bg-2 shadow-2xl">
              <div className="flex h-16 items-center justify-between border-b border-line px-4">
                <span className="label-mono">{labels.menu}</span>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={labels.close}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-fg transition-colors duration-150 hover:bg-bg-3"
                >
                  {icon('M6 6l12 12M18 6 6 18')}
                </button>
              </div>
              <nav aria-label={labels.menu} className="flex-1 overflow-y-auto p-3">
                <ul className="flex flex-col gap-1">
                  {items.map((item, i) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        rel={item.external ? 'noopener' : undefined}
                        className={`flex min-h-12 items-center gap-4 rounded-lg px-3 text-lg font-medium tracking-tight transition-colors duration-150 ${
                          item.current ? 'bg-bg-3 text-fg' : 'text-fg-2 hover:bg-bg-3 hover:text-fg'
                        }`}
                      >
                        <span className="label-mono w-6 text-sage">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.external && <span aria-hidden="true">↗</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
