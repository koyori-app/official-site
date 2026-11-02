import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// お知らせ。src/content/news/<lang>/<slug>.md に置く。
// 同じ記事の翻訳は translationKey を揃えると、記事ページで相互リンクされる。
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    lang: z.enum(['ja', 'en']),
    translationKey: z.string().optional(),
  }),
});

export const collections = { news };
