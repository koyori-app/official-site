# Koyori 公式サイト

[www.koyori.app](https://www.koyori.app) のソース。Koyori のプロダクト（Task / VRT / UI / Arc）をまとめて紹介する静的サイトです。

## 技術構成

| 役割           | 採用                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| フレームワーク | [Astro](https://astro.build)（静的出力） + React islands                                                             |
| スタイル       | Tailwind CSS v4。色・余白のトークンは [koyori-app/ui](https://github.com/koyori-app/ui) の `tokens.css` に揃えている |
| 多言語         | Astro の i18n ルーティング。日本語が既定（`/`）、英語は `/en/`                                                       |
| お知らせ       | Content Collections（Markdown）                                                                                      |
| 配信           | GitHub Pages（GitHub Actions でビルド・デプロイ）                                                                    |

## 開発

Node.js 24 と pnpm を使います（`packageManager` に固定）。

```sh
pnpm install --frozen-lockfile
pnpm dev            # http://localhost:4321
pnpm check          # 型と Astro の検査
pnpm format         # Prettier
pnpm build          # dist/ に出力
pnpm preview        # dist/ を配信して確認
```

CI（`.github/workflows/deploy.yml`）では `format:check` → `check` → `build` の順に検査し、`main` への push でそのまま GitHub Pages にデプロイします。Pull Request ではビルド検査のみ行います。

## ディレクトリ

```
src/
  i18n/        ui.ts に日英の文言、utils.ts にパスや日付のヘルパー
  data/        products.ts にプロダクトの情報（名前・説明・リンク・ライセンス）
  content/     news/<lang>/<slug>.md にお知らせ
  layouts/     BaseLayout.astro（head のメタ情報、hreflang、OGP、ヘッダー・フッター）
  components/  Astro コンポーネントと react/ の React islands（モバイルナビ、WebGL のヒーロー）
               ProductGlyph.astro にプロダクトごとの線画アイコン
  views/       各ページの本体。言語を props で受け取る
  pages/       ルーティング。日本語は直下、英語は en/ 配下で同じ構成。中身は views を呼ぶだけ
  styles/      global.css（Tailwind とデザイントークン、ボタン、お知らせ本文の見た目）
public/        CNAME、favicon、robots.txt、OG 画像
```

### ページを足す

1. `src/views/` に本体を作り、`lang` を props で受け取って `t(lang)` で文言を引く
2. `src/pages/` と `src/pages/en/` の両方に、その view を呼ぶだけの薄いページを置く
3. 文言は `src/i18n/ui.ts` に日英で追加する（キーが揃っていないと型エラーになる）

### お知らせを書く

`src/content/news/ja/YYYY-MM-DD-slug.md` と `src/content/news/en/YYYY-MM-DD-slug.md` を作ります。フロントマターは次のとおり。

```md
---
title: 記事タイトル
description: 一覧と OGP に使う要約
date: 2026-11-02
lang: ja
translationKey: slug # 日英で同じ値にすると記事ページで相互リンクされる
---
```

片方の言語だけでも構いません。その場合、言語切替はその言語のトップへ向きます。

### プロダクト情報を直す

`src/data/products.ts` を編集します。説明文はすべて日英で持ち、`` `code` `` はインラインコードとして表示されます。

### OG 画像

`public/og.png`（1200×630）はトップのヒーローを 1200×694 のビューポートで開き、ヘッダー分の 64px を除いて撮ったものです。ヒーローの文言や見た目を変えたら撮り直してください。

### WebGL について

ヒーローの帯は `client:idle` で読み込む React island の中で three.js を動的 import しています。three.js の chunk は gzip で約 180 KB あり、トップ以外のページでは読み込みません。`prefers-reduced-motion` のときは 1 フレームだけ描いて止め、画面外ではループを止めます。WebGL が使えない環境では背景のグラデーションだけになります。

## デプロイと独自ドメイン

- GitHub Pages の Source は **GitHub Actions** にします（Settings → Pages）
- 独自ドメインは `public/CNAME` の `www.koyori.app`。DNS では `www` の CNAME レコードを `koyori-app.github.io` に向け、Settings → Pages の Custom domain に `www.koyori.app` を入れて **Enforce HTTPS** を有効にします
- `koyori-app.github.io/official-site` で配信したい場合は、`astro.config.mjs` の `site` を `https://koyori-app.github.io`、`base` を `/official-site` にして `public/CNAME` を削除します

## ライセンス

MIT
