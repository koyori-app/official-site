import type { Locale } from '../i18n/ui';

export type Localized<T = string> = Record<Locale, T>;
export type ProductStatus = 'development' | 'available' | 'alpha';
export type ProductSlug = 'task' | 'vrt' | 'ui' | 'arc';

export interface ProductLink {
  label: Localized;
  href: string;
}

export interface Product {
  slug: ProductSlug;
  name: string;
  /** 一覧やカードで使う短い説明 */
  tagline: Localized;
  /** 詳細ページ冒頭の説明 */
  description: Localized;
  features: Localized<string[]>;
  stack: string[];
  license: string;
  status: ProductStatus;
  repo: string;
  links: ProductLink[];
  /**
   * 紙縒りの糸の色。トップの WebGL の紐、糸の印（StrandMark）、プロダクトページのモチーフで使う。
   * 文字色や面の色には使わない。
   */
  strand: { color: string };
}

export const githubOrg = 'https://github.com/koyori-app';

export const products: Product[] = [
  {
    slug: 'task',
    name: 'Koyori Task',
    tagline: {
      ja: 'セルフホストできる、チームのためのタスク管理',
      en: 'Self-hostable task management for teams',
    },
    description: {
      ja: 'タスク、スプリント、タイムトラッキング、ワークロードまでを一か所で扱うタスク管理サービスです。Rust（axum）のバックエンドと Vue 3 のフロントエンドで構成し、Docker Compose でセルフホストできます。デスクトップ、iOS、Android のクライアントも開発しています。',
      en: 'A task management service that brings tasks, sprints, time tracking, and workload into one place. It pairs a Rust (axum) backend with a Vue 3 frontend and can be self-hosted with Docker Compose. Desktop, iOS, and Android clients are in development as well.',
    },
    features: {
      ja: [
        'タスクの CRUD、カスタムステータス、担当者、ラベル、マイルストーン、依存関係',
        'スプリント、スケジュール、ワークロードの管理',
        'タイムトラッキング',
        'カスタムフィールドと Webhook',
        'パスキー、2 段階認証、GitHub / GitLab / OIDC によるログイン',
        '監査ログと管理者機能、`task` CLI',
      ],
      en: [
        'Task CRUD with custom statuses, assignees, labels, milestones, and dependencies',
        'Sprints, scheduling, and workload management',
        'Time tracking',
        'Custom fields and webhooks',
        'Passkeys, two-factor authentication, and GitHub / GitLab / OIDC sign-in',
        'Audit log, admin tools, and the `task` CLI',
      ],
    },
    stack: ['Rust', 'axum', 'SeaORM', 'Vue 3', 'PostgreSQL'],
    license: 'AGPL-3.0',
    status: 'development',
    repo: `${githubOrg}/task`,
    links: [
      { label: { ja: 'デスクトップ版', en: 'Desktop app' }, href: `${githubOrg}/task-desktop` },
      { label: { ja: 'iOS 版', en: 'iOS app' }, href: `${githubOrg}/task-ios` },
      { label: { ja: 'Android 版', en: 'Android app' }, href: `${githubOrg}/task-android` },
    ],
    strand: { color: '#c4b5df' },
  },
  {
    slug: 'vrt',
    name: 'Koyori VRT',
    tagline: {
      ja: 'CI のスクリーンショットをレビューして、次の baseline に',
      en: 'Review the screenshots your CI takes and approve the next baseline',
    },
    description: {
      ja: 'CI が撮ったスクリーンショットを受け取り、承認済みの baseline と 1 枚ずつ突き合わせ、差分を人がレビューして承認すると、その結果が次の baseline になる。その一周を回すためのビジュアルリグレッションテストのサービスです。',
      en: 'VRT receives the screenshots your CI takes, compares each one against the approved baseline, and lets a human review and approve the differences. Approved results become the next baseline, closing the loop.',
    },
    features: {
      ja: [
        'マルチテナント: テナント（組織）> プロジェクト > ビルド > スクリーンショット',
        'CI からは PAT ひとつ: ビルド作成 → PNG アップロード → finalize → ポーリング',
        'サイドバイサイドとオーバーレイの差分表示、キーボード操作のレビュー UI',
        'GitHub App 連携: PR に commit status とビルドリンクのコメントを返す',
        'GitHub Action `koyori-app/vrt-actions` で `uses:` 一行から送信',
        'Storybook モード: ビルド済み Storybook をサーバー側の Chromium で撮影',
      ],
      en: [
        'Multi-tenant: tenant (organization) > project > build > screenshot',
        'One PAT from CI: create build → upload PNGs → finalize → poll',
        'Side-by-side and overlay diff views with keyboard-driven review',
        'GitHub App integration posts commit statuses and build links on pull requests',
        'A one-line `uses:` with the `koyori-app/vrt-actions` GitHub Action',
        'Storybook mode: server-side Chromium captures a built Storybook',
      ],
    },
    stack: ['Rust', 'axum', 'React 19', 'TanStack Start', 'PostgreSQL', 'Valkey'],
    license: 'AGPL-3.0',
    status: 'development',
    repo: `${githubOrg}/vrt`,
    links: [{ label: { ja: 'VRT Actions', en: 'VRT Actions' }, href: `${githubOrg}/vrt-actions` }],
    strand: { color: '#9fc2a9' },
  },
  {
    slug: 'ui',
    name: 'Koyori UI',
    tagline: {
      ja: 'ひとつのソースから、Vue と React のコンポーネントを',
      en: 'Vue and React components from one Mitosis source',
    },
    description: {
      ja: 'Mitosis の共通ソースから Vue 3 と React 向けのコンポーネントを生成する UI ライブラリです。くすんだラベンダーとセージの配色、CSS 変数のデザイントークン、キーボード操作と読み上げへの配慮を、すべてのコンポーネントで揃えています。Vue 版の `@koyori-app/ui-vue` は npm で公開しています。',
      en: 'A component library generated from a single Mitosis source into Vue 3 and React packages. Muted lavender and sage colors, CSS-variable design tokens, and keyboard and screen-reader support are consistent across every component. The Vue package, `@koyori-app/ui-vue`, is published on npm.',
    },
    features: {
      ja: [
        'Button、Dialog、Drawer、Dropdown、DatePicker、Tabs、SplitPane など 30 を超えるコンポーネント',
        'CSS 変数のトークンで角丸・余白・色・モーションを一括調整',
        'prefers-reduced-motion、ホバーできる端末の判定、フォーカスの可視化',
        'Storybook と、Astro で作ったドキュメントサイト',
        'Vue 版は npm で公開、React 版は準備中',
      ],
      en: [
        'More than 30 components: Button, Dialog, Drawer, Dropdown, DatePicker, Tabs, SplitPane, and more',
        'CSS-variable tokens to tune radius, spacing, color, and motion in one place',
        'Honors prefers-reduced-motion, detects hover-capable devices, keeps focus visible',
        'Storybook plus an Astro documentation site',
        'Vue package on npm; React package on the way',
      ],
    },
    stack: ['Mitosis', 'Vue 3', 'React 19', 'TypeScript'],
    license: 'MIT',
    status: 'available',
    repo: `${githubOrg}/ui`,
    links: [
      {
        label: { ja: 'npm: @koyori-app/ui-vue', en: 'npm: @koyori-app/ui-vue' },
        href: 'https://www.npmjs.com/package/@koyori-app/ui-vue',
      },
    ],
    strand: { color: '#6e5c8f' },
  },
  {
    slug: 'arc',
    name: 'Koyori Arc',
    tagline: {
      ja: 'Rust と Wasm で描く、依存関係つきのガントチャート',
      en: 'Gantt charts with dependency arcs, rendered in Rust and Wasm',
    },
    description: {
      ja: 'タスクの依存関係を弧で表すガントチャートのレンダラーです。Rust のコアを Wasm にビルドし、SVG 文字列として出力します。Koyori Task のデータモデルに合わせた入力型を持ち、Vue 3 向けのラッパー `@koyori-app/arc-vue` を提供します。名前は dependency arc、arc discharge、arc furnace の三重の意味から。現在は 0.1.0-alpha 系で、API の互換性はまだ保証していません。',
      en: 'A Gantt chart renderer that draws task dependencies as arcs. The Rust core compiles to Wasm and emits SVG strings. Its input types follow the Koyori Task data model, and a Vue 3 wrapper, `@koyori-app/arc-vue`, is available. The name is a triple pun on dependency arc, arc discharge, and arc furnace. Arc is at 0.1.0-alpha and does not yet promise API compatibility.',
    },
    features: {
      ja: [
        'Rust ネイティブと Wasm の両方で動く単一のコア',
        'SVG 出力なので、どのフレームワークにも埋め込める',
        'Vue 3 ラッパー `@koyori-app/arc-vue`',
        'Koyori Task と同じタスク・依存関係のモデル',
        'Criterion によるレンダリングのベンチマーク',
      ],
      en: [
        'A single core that runs natively in Rust and as Wasm',
        'SVG output that embeds in any framework',
        'Vue 3 wrapper: `@koyori-app/arc-vue`',
        'The same task and dependency model as Koyori Task',
        'Rendering benchmarks with Criterion',
      ],
    },
    stack: ['Rust', 'WebAssembly', 'SVG', 'Vue 3'],
    license: 'MPL-2.0 OR GPL-2.0-or-later',
    status: 'alpha',
    repo: `${githubOrg}/arc`,
    links: [],
    strand: { color: '#5f7a66' },
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
