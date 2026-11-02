# Koyori 公式サイト

[www.koyori.app](https://www.koyori.app) のソース。Koyori のプロダクト（Task / VRT / UI / Arc）をまとめて紹介する静的サイトです。

## 技術構成

| 役割           | 採用                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| フレームワーク | [Astro](https://astro.build)（静的出力） + React islands                                                     |
| スタイル       | Tailwind CSS v4。ブランド色は [koyori-app/ui](https://github.com/koyori-app/ui) の `tokens.css` に揃えている |
| 多言語         | Astro の i18n ルーティング。日本語が既定（`/`）、英語は `/en/`                                               |
| お知らせ       | Content Collections（Markdown）                                                                              |
| 配信           | GitHub Pages（GitHub Actions でビルド・デプロイ）                                                            |

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
  components/  Astro コンポーネント。home/ にトップのヒーロー、product/ にプロダクトページのモチーフ、
               react/ に React island（モバイルナビ）。ProductCard.astro と StrandMark.astro（糸の印）
  scripts/     ブラウザで動く TypeScript。koyori/ に WebGL のヒーロー（three.js とシェーダー）、
               cord2d.ts / motifs.ts に 2D canvas の紐とモチーフ
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

`public/og.png`（1200×630）はトップのヒーローを 1200×694 のビューポートで開き、WebGL の準備ができて（`canvas[data-ready="true"]`）紐の登場が終わってから、ヘッダー分の 64px を除いて撮ったものです。ヒーローの文言や見た目を変えたら撮り直してください。

### デザインの考え方

紙縒り（こより）は、細く切った紙を撚り合わせてつくる紐です。サイトは生成りの紙（`#f1ece2`）を地に、墨の 3 段階（`ink` / `ink-2` / `ink-3`）を文字に使い、画面の色はそこまでに抑えています。ブランド色のラベンダーとセージは 4 本の糸（Task / VRT / UI / Arc）の色で（`src/data/products.ts` の `strand`）、次の 2 か所にだけ出てきます。

- **トップのヒーロー（唯一の見せ場）**: 4 色の紙の帯を撚った紐が右上から紙を縫うように通り、ほどけて 4 本の糸になり、下に並ぶ 4 つのプロダクトの列へ降りる。見出しは左の何もない紙の上に置き、紐とは重ねない
- **糸の印（`StrandMark.astro`）**: プロダクト名の横に置く、その色で撚った短い糸。カード、一覧表、フッター、プロダクトページで使い、それ以外の装飾には使わない

そのほかの決まりごと。

- 書体は本文と UI が Instrument Sans（和文は Noto Sans JP）、大きな見出しだけ Fraunces（和文は Noto Serif JP の明朝）。等幅の JetBrains Mono はパッケージ名・ライセンス ID・技術スタックなどコードにだけ使う。大文字のラベル、イタリック、飾りの通し番号は使わない
- アクセントは濃いラベンダー `#5a4880` の 1 色で、リンクとフォーカスリングに使う。主ボタンは墨の地に紙色の文字
- 余白は 4px 刻み。角丸はボタン 6px、カードと枠 8px
- 動きは、ヒーローの紐が引かれていく一度きりの登場、紐のゆっくりした撚れ、ポインターで糸が弾かれる反応、プロダクトページのモチーフが画面に入ったときに一度だけ描き進める動きだけ。ホバーは色か面の変化だけ
- 各プロダクトページには、そのプロダクトの糸の色で描く 2D canvas のモチーフ（織り、差分、分岐、依存の弧）を 1 つ置く

デザインは Damir Sokolovsky の [unslop](https://github.com/heydamir/unslop) の手順で見直しています。

### WebGL について

ヒーローは `src/components/home/HomeHero.astro` の `<script>` から、ブラウザが暇になったところで `src/scripts/koyori/scene.ts` を動的 import します。three.js を含むこの chunk は gzip で約 135 KB あり、トップ以外のページでは読み込みません。

- 紐の形はすべて頂点シェーダー（`src/scripts/koyori/shaders.ts`）で計算します。同じ形を「本体」「紙に落ちる影」「紙の裏に透ける色」の 3 通りに描き、紙面には紐が通る穴だけを描きます
- 紐の始点・ほどける点・4 本の出口は DOM の目印（`data-gl-anchor` / `data-gl-exit`）から読むので、レイアウトは CSS 側で調整できます。出口はプロダクトの 4 列（`product-grid`）の糸の印の真上に置いています
- 見出しは DOM のテキストのまま紙の上に重ねます（canvas は背面で `aria-hidden`）
- `prefers-reduced-motion` のときは 1 フレームだけ描いて止め、画面外ではループを止めます。DPR は最大 2 です
- WebGL が使えない環境では、同じ構図の SVG の紐を表示します（デスクトップ用とスマートフォン用の 2 枚）

## デプロイと独自ドメイン

- GitHub Pages の Source は **GitHub Actions** にします（Settings → Pages）
- 独自ドメインは `public/CNAME` の `www.koyori.app`。DNS では `www` の CNAME レコードを `koyori-app.github.io` に向け、Settings → Pages の Custom domain に `www.koyori.app` を入れて **Enforce HTTPS** を有効にします
- `koyori-app.github.io/official-site` で配信したい場合は、`astro.config.mjs` の `site` を `https://koyori-app.github.io`、`base` を `/official-site` にして `public/CNAME` を削除します

## ライセンス

MIT
