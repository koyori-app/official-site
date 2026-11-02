export const locales = ['ja', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ja';

export const localeNames: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
};

export const bcp47: Record<Locale, string> = {
  ja: 'ja-JP',
  en: 'en-US',
};

const ja = {
  'site.name': 'Koyori',
  'site.description':
    'Koyori は、タスク管理・ビジュアルリグレッションテスト・UI ライブラリ・ガントチャートのレンダラーなど、開発チームの日常に寄り添う小さなツール群をオープンソースで作っています。',

  skip: '本文へ移動',

  'nav.home': 'ホーム',
  'nav.products': 'プロダクト',
  'nav.news': 'お知らせ',
  'nav.about': 'Koyori について',
  'nav.github': 'GitHub',
  'nav.menu': 'メニュー',
  'nav.open': 'メニューを開く',
  'nav.close': 'メニューを閉じる',
  'nav.primary': 'メインナビゲーション',

  'locale.label': '言語',

  'hero.word': '紙縒り',
  'hero.reading': 'こより',
  'hero.meaning': '細く切った紙を撚り合わせてつくる紐',
  'hero.title.1': 'チーム開発の道具を、',
  'hero.title.2': 'オープンソースで',
  'hero.lead':
    'タスク管理、ビジュアルリグレッションテスト、Vue と React の UI ライブラリ、ガントチャートのレンダラー。範囲を絞った四つの道具を、すべて GitHub で公開しています。',
  'hero.cta.products': 'プロダクトを見る',
  'hero.cta.github': 'GitHub で見る',

  'products.title': 'プロダクト',
  'products.lead': 'それぞれ単独で使えて、組み合わせるとつながる四つの道具',
  'products.glance': '一覧で比べる',
  'products.viewAll': 'すべてのプロダクト',
  'products.pageDescription':
    'Koyori が開発しているプロダクトの一覧。Task、VRT、UI、Arc の 4 つを紹介します。',

  'product.features': '主な機能',
  'product.stack': '技術スタック',
  'product.license': 'ライセンス',
  'product.links': 'リンク',
  'product.repo': 'リポジトリ',
  'product.others': '他のプロダクト',
  'product.status': '状態',
  'product.status.development': '開発中',
  'product.status.available': '公開中',
  'product.status.alpha': 'アルファ',

  'principles.title': 'つくりかた',
  'principles.lead': '四つのプロダクトに共通する考え方',
  'principles.oss.title': 'すべてオープンソース',
  'principles.oss.body':
    'コードはすべて GitHub の koyori-app オーガニゼーションで公開しています。設計の文書もリポジトリに置き、Issue と Pull Request で開発を進めます。',
  'principles.selfhost.title': '自分たちで動かせる',
  'principles.selfhost.body':
    'Task と VRT は Docker Compose で立ち上がるセルフホスト構成です。データとサーバーを自分たちの手元に置けます。',
  'principles.consistent.title': '使い心地を揃える',
  'principles.consistent.body':
    '共通の UI ライブラリとデザイントークンで見た目と振る舞いを揃え、キーボード操作と読み上げへの配慮をすべてのコンポーネントで行います。',
  'principles.rust.title': 'Rust と Web の組み合わせ',
  'principles.rust.body':
    'バックエンドと計算のコアは Rust、画面は Vue と React で作ります。Arc のように Rust のコアを Wasm にして Web に持ち込む構成も採ります。',

  'news.title': 'お知らせ',
  'news.lead': 'Koyori と各プロダクトの更新情報',
  'news.viewAll': 'すべてのお知らせ',
  'news.empty': 'お知らせはまだありません',
  'news.back': 'お知らせ一覧へ',
  'news.alt': 'English version',
  'news.pageDescription': 'Koyori と各プロダクトの更新情報。',

  'about.title': 'Koyori について',
  'about.lead': 'Koyori は、開発チーム向けのオープンソースなプロダクト群のブランドです',
  'about.what.title': 'なにをしているか',
  'about.what.body':
    'GitHub の koyori-app オーガニゼーションで、タスク管理の Task、ビジュアルリグレッションテストの VRT、UI ライブラリの Koyori UI、ガントチャートレンダラーの Arc を開発しています。どれも開発チームの日常業務に向けた、範囲を絞った道具です。',
  'about.how.title': 'どう作っているか',
  'about.how.body':
    'バックエンドは Rust（axum、SeaORM、apalis）、フロントエンドは Vue 3 と React 19、スタイルは Tailwind CSS を使います。共通の UI は Mitosis の単一ソースから Vue 版と React 版を生成し、同じデザイントークンで色や余白を揃えています。',
  'about.contribute.title': '参加するには',
  'about.contribute.body':
    'バグ報告や提案は各リポジトリの Issue へ、修正や機能追加は Pull Request でお送りください。各リポジトリの README と CLAUDE.md / AGENTS.md に開発の進め方を書いています。',
  'about.pageDescription': 'Koyori の紹介。なにを、どう作っているか、参加の方法。',

  'cta.title': '一緒につくりませんか',
  'cta.title.home': 'Issue と Pull Request を歓迎します',
  'cta.body': 'すべてのコードは GitHub で公開しています。Issue や Pull Request を歓迎します。',
  'cta.body.home':
    '四つのプロダクトはどれも、GitHub の koyori-app オーガニゼーションで開発しています',
  'cta.button': 'koyori-app on GitHub',

  'footer.tagline': '開発チームのための、小さなオープンソースの道具',
  'footer.meaning':
    '紙縒り（こより）: 細く切った紙を撚り合わせてつくる紐。一本ずつは細くても、撚ると強くなる。',
  'footer.products': 'プロダクト',
  'footer.site': 'サイト',
  'footer.rights': '© 2026 Koyori',
  'footer.source': 'このサイトのソース',

  'notfound.eyebrow': '糸がここで途切れています',
  'notfound.title': 'ページが見つかりません',
  'notfound.body': 'お探しのページは移動したか、削除された可能性があります',
  'notfound.home': 'トップへ戻る',
} as const;

export type UIKey = keyof typeof ja;

const en: Record<UIKey, string> = {
  'site.name': 'Koyori',
  'site.description':
    'Koyori builds small, focused open-source tools for the daily work of software teams: task management, visual regression testing, a UI library, and a Gantt chart renderer.',

  skip: 'Skip to content',

  'nav.home': 'Home',
  'nav.products': 'Products',
  'nav.news': 'News',
  'nav.about': 'About',
  'nav.github': 'GitHub',
  'nav.menu': 'Menu',
  'nav.open': 'Open menu',
  'nav.close': 'Close menu',
  'nav.primary': 'Main navigation',

  'locale.label': 'Language',

  'hero.word': '紙縒り',
  'hero.reading': 'koyori',
  'hero.meaning': 'A cord twisted from thin strips of paper',
  'hero.title.1': 'Open-source tools',
  'hero.title.2': 'for software teams',
  'hero.lead':
    'Task management, visual regression testing, a UI library for Vue and React, and a Gantt chart renderer. Four narrowly scoped tools, all developed in the open on GitHub.',
  'hero.cta.products': 'Explore products',
  'hero.cta.github': 'View on GitHub',

  'products.title': 'Products',
  'products.lead': 'Four tools that work on their own and fit together',
  'products.glance': 'At a glance',
  'products.viewAll': 'All products',
  'products.pageDescription': 'The products Koyori is building: Task, VRT, UI, and Arc.',

  'product.features': 'Highlights',
  'product.stack': 'Stack',
  'product.license': 'License',
  'product.links': 'Links',
  'product.repo': 'Repository',
  'product.others': 'More products',
  'product.status': 'Status',
  'product.status.development': 'In development',
  'product.status.available': 'Available',
  'product.status.alpha': 'Alpha',

  'principles.title': 'How we build',
  'principles.lead': 'Four products, one set of principles',
  'principles.oss.title': 'Open source, all of it',
  'principles.oss.body':
    'Every line of code lives in the koyori-app organization on GitHub. Design documents live in the repositories too, and work moves through issues and pull requests.',
  'principles.selfhost.title': 'Run it yourself',
  'principles.selfhost.body':
    'Task and VRT ship with Docker Compose setups for self-hosting, so your data and your servers stay in your hands.',
  'principles.consistent.title': 'Consistent by design',
  'principles.consistent.body':
    'A shared UI library and design tokens keep look and behavior aligned. Every component is built for keyboard use and screen readers.',
  'principles.rust.title': 'Rust meets the web',
  'principles.rust.body':
    'Backends and compute cores are written in Rust; interfaces in Vue and React. Arc compiles its Rust core to Wasm to bring that work to the browser.',

  'news.title': 'News',
  'news.lead': 'Updates from Koyori and its products',
  'news.viewAll': 'All news',
  'news.empty': 'No news yet',
  'news.back': 'Back to news',
  'news.alt': '日本語版',
  'news.pageDescription': 'Updates from Koyori and its products.',

  'about.title': 'About Koyori',
  'about.lead': 'Koyori is a family of open-source products for software teams',
  'about.what.title': 'What we do',
  'about.what.body':
    'Under the koyori-app organization on GitHub we build Task for task management, VRT for visual regression testing, Koyori UI as a shared component library, and Arc, a Gantt chart renderer. Each one is a narrowly scoped tool for the everyday work of a development team.',
  'about.how.title': 'How we build it',
  'about.how.body':
    'Backends use Rust (axum, SeaORM, apalis); frontends use Vue 3 and React 19 with Tailwind CSS. Shared UI is generated from a single Mitosis source into Vue and React packages, and the same design tokens keep colors and spacing aligned across products.',
  'about.contribute.title': 'Get involved',
  'about.contribute.body':
    'Report bugs and share ideas in each repository’s issues, and send fixes and features as pull requests. Each repository’s README and CLAUDE.md / AGENTS.md describe how development works.',
  'about.pageDescription': 'What Koyori is, how we build it, and how to get involved.',

  'cta.title': 'Build with us',
  'cta.title.home': 'Issues and pull requests are welcome',
  'cta.body': 'All of our code is on GitHub. Issues and pull requests are welcome.',
  'cta.body.home': 'All four products are developed in the koyori-app organization on GitHub',
  'cta.button': 'koyori-app on GitHub',

  'footer.tagline': 'Small open-source tools for software teams',
  'footer.meaning':
    'Koyori (紙縒り): a cord made by twisting thin strips of paper. Each strip is thin; twisted together, they hold.',
  'footer.products': 'Products',
  'footer.site': 'Site',
  'footer.rights': '© 2026 Koyori',
  'footer.source': 'Source of this site',

  'notfound.eyebrow': 'The thread ends here',
  'notfound.title': 'Page not found',
  'notfound.body': 'The page you are looking for may have moved or been removed',
  'notfound.home': 'Back to home',
};

export const ui = { ja, en } satisfies Record<Locale, Record<UIKey, string>>;
