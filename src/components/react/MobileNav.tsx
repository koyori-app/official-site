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

  // lucide の形。16px ではなく 20px、線幅 1.5
  const icon = (paths: string[]) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="h-5 w-5 shrink-0"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
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
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line-strong text-ink transition-colors duration-150 hover:bg-paper-2"
      >
        {icon(['M4 6h16', 'M4 12h16', 'M4 18h16'])}
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
              className="absolute inset-0 bg-ink/30"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col border-l border-line bg-paper">
              <div className="flex h-16 items-center justify-between border-b border-line pr-4 pl-6">
                <span className="text-[0.9375rem] text-ink-3">{labels.menu}</span>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={labels.close}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink transition-colors duration-150 hover:bg-paper-2"
                >
                  {icon(['M18 6 6 18', 'm6 6 12 12'])}
                </button>
              </div>
              <nav aria-label={labels.menu} className="flex-1 overflow-y-auto px-4 py-4">
                <ul className="flex flex-col gap-1">
                  {items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        rel={item.external ? 'noopener' : undefined}
                        className={`flex min-h-12 items-center gap-2 rounded-md px-2 text-lg transition-colors duration-150 hover:bg-paper-2 ${
                          item.current ? 'bg-paper-2 font-medium text-ink' : 'text-ink-2'
                        }`}
                      >
                        <span className="flex-1">{item.label}</span>
                        {item.external && icon(['M7 7h10v10', 'M7 17 17 7'])}
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
