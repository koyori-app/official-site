import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/ui';

export type NewsEntry = CollectionEntry<'news'>;

/** エントリ ID（例: ja/2026-11-02-site-launch）から言語の接頭辞を外した slug */
export function newsSlug(entry: NewsEntry): string {
  return entry.id.replace(/^[a-z]{2}\//, '');
}

/** 指定した言語のお知らせを新しい順に返す */
export async function getNews(lang: Locale): Promise<NewsEntry[]> {
  const entries = await getCollection('news', (entry) => entry.data.lang === lang);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** 同じ translationKey を持つ他言語の記事 */
export async function findTranslations(entry: NewsEntry): Promise<NewsEntry[]> {
  const key = entry.data.translationKey;
  if (!key) return [];
  return getCollection(
    'news',
    (other) => other.data.translationKey === key && other.data.lang !== entry.data.lang,
  );
}
