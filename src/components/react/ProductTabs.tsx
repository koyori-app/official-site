import { useId, useRef, useState, type KeyboardEvent } from 'react';

export interface TabProduct {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  stack: string[];
  statusLabel: string;
  href: string;
  tone: 'lavender' | 'sage';
}

interface Props {
  products: TabProduct[];
  labels: { features: string; detail: string; list: string };
}

export default function ProductTabs({ products, labels }: Props) {
  const [index, setIndex] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (next: number) => {
    const wrapped = (next + products.length) % products.length;
    setIndex(wrapped);
    tabRefs.current[wrapped]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusTab(i + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusTab(i - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(products.length - 1);
        break;
    }
  };

  const active = products[index] ?? products[0];
  if (!active) return null;
  const toneClass =
    active.tone === 'sage'
      ? 'from-accent-soft via-surface-raised to-surface-raised'
      : 'from-accent-subtle via-surface-raised to-surface-raised';

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <div
        role="tablist"
        aria-label={labels.list}
        aria-orientation="vertical"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
      >
        {products.map((product, i) => {
          const selected = i === index;
          return (
            <button
              key={product.slug}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${product.slug}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${product.slug}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setIndex(i)}
              onKeyDown={(event) => onKeyDown(event, i)}
              className={`flex shrink-0 flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors duration-150 ${
                selected
                  ? 'border-accent bg-accent-subtle text-ink'
                  : 'border-border bg-surface-raised text-ink-secondary hover:bg-surface-hover hover:text-ink'
              }`}
            >
              <span className="text-base font-semibold">{product.name}</span>
              <span className="mt-0.5 text-xs">{product.statusLabel}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${active.slug}`}
        aria-labelledby={`${baseId}-tab-${active.slug}`}
        tabIndex={0}
        className={`rounded-2xl border border-border bg-linear-to-br p-6 sm:p-8 ${toneClass}`}
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          {active.name}
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {active.tagline}
        </h3>
        <p className="mt-4 max-w-prose text-ink-secondary">{active.description}</p>

        <h4 className="mt-6 text-sm font-semibold text-ink">{labels.features}</h4>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {active.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-ink-secondary">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <ul className="flex flex-wrap gap-1.5">
            {active.stack.map((item) => (
              <li
                key={item}
                className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-medium text-ink-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
          <a href={active.href} className="btn btn-primary">
            {labels.detail}
          </a>
        </div>
      </div>
    </div>
  );
}
