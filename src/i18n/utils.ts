import { bcp47, defaultLocale, locales, ui, type Locale, type UIKey } from './ui';

export function t(locale: Locale) {
  return (key: UIKey): string => ui[locale][key];
}

/** 言語を含まないパス（例: /products/task/）を、指定した言語の URL パスにする。 */
export function localePath(locale: Locale, path = '/'): string {
  let p = path.startsWith('/') ? path : `/${path}`;
  if (!p.endsWith('/')) p = `${p}/`;
  if (locale === defaultLocale) return p;
  return `/${locale}${p}`;
}

/** URL パスから言語を判定する。 */
export function localeFromPath(pathname: string): Locale {
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
  }
  return defaultLocale;
}

/** URL パスから言語の接頭辞を取り除く。 */
export function stripLocale(pathname: string): string {
  const locale = localeFromPath(pathname);
  if (locale === defaultLocale) return pathname || '/';
  const rest = pathname.slice(`/${locale}`.length);
  return rest === '' ? '/' : rest;
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(bcp47[locale], { dateStyle: 'long', timeZone: 'UTC' }).format(
    date,
  );
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
