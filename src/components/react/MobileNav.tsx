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
        className="inline-flex h-11 w-11 items-center justify-center border border-ink text-ink transition-colors duration-150 hover:bg-ink hover:text-paper-3"
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
              className="absolute inset-0 bg-ink/40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-paper shadow-2xl">
              {/* 紙縒りの帯。メニューの左端に沿わせる */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1.5"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(-60deg, #c4b5df 0 6px, #9fc2a9 6px 10px, #6e5c8f 10px 14px, #536d5a 14px 18px)',
                }}
              />
              <div className="flex h-16 items-center justify-between border-b border-line pr-4 pl-6">
                <span className="label-mono">{labels.menu}</span>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={labels.close}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors duration-150 hover:bg-paper-2"
                >
                  {icon('M6 6l12 12M18 6 6 18')}
                </button>
              </div>
              <nav aria-label={labels.menu} className="flex-1 overflow-y-auto py-4 pr-4 pl-6">
                <ul className="flex flex-col">
                  {items.map((item, i) => (
                    <li key={item.href} className="border-b border-line">
                      <a
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        rel={item.external ? 'noopener' : undefined}
                        className={`flex min-h-16 items-center gap-4 font-serif text-[1.65rem] leading-tight transition-colors duration-150 ${
                          item.current ? 'text-lav-ink italic' : 'text-ink hover:text-lav-ink'
                        }`}
                      >
                        <span className="w-7 font-mono text-xs text-ink-3">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.external && (
                          <span aria-hidden="true" className="font-mono text-base">
                            ↗
                          </span>
                        )}
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
