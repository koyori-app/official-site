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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink transition-colors duration-150 hover:bg-surface-hover"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
          className="h-5 w-5"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
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
              className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-border bg-surface shadow-2xl">
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <span className="font-semibold text-ink">{labels.menu}</span>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={labels.close}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors duration-150 hover:bg-surface-hover"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                    focusable="false"
                    className="h-5 w-5"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <nav aria-label={labels.menu} className="flex-1 overflow-y-auto p-3">
                <ul className="flex flex-col gap-1">
                  {items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        rel={item.external ? 'noopener' : undefined}
                        className={`flex min-h-11 items-center justify-between rounded-md px-3 text-base font-medium transition-colors duration-150 ${
                          item.current
                            ? 'bg-accent-subtle text-ink'
                            : 'text-ink-secondary hover:bg-surface-hover hover:text-ink'
                        }`}
                      >
                        {item.label}
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
