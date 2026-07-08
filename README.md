# portfolio-2026-anime

Hiroshi Igarashi のポートフォリオサイト。EJS + Sass + webpack で構築する静的サイトプロジェクト。

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

`sass --watch`（SCSS→CSS監視コンパイル）と `webpack serve`（開発サーバー）を並列起動する。ポートは自動割り当て（複数worktreeでの同時起動を想定）。

個別に実行する場合:

```bash
npm run watch:scss   # SCSS監視コンパイルのみ
npm run serve        # 開発サーバーのみ
```

## ビルド

```bash
npm run build
```

SCSSコンパイル後、webpackが `dist/` に本番ビルドを出力する。

## ディレクトリ構成

```
src/
  ejs/
    pages/       # ページテンプレート（再帰的に検出され、各.ejsが1ページとして出力される）
    _inc/        # 共通パーツ（header/footer等）
    site.config.js  # サイト共通定数（全EJSテンプレートに data.site として注入）
  assets/
    scss/        # SCSSソース
    css/          # コンパイル済みCSS（libs等は直接配置）
    js/          # JavaScript
    img/         # 画像
    og/          # OGP画像
  _inc/          # webpackビルド時にdist直下へコピーされる共通ファイル
dist/            # ビルド成果物（gitignore対象）
```

ページ追加は `src/ejs/pages/` 配下に `.ejs` を置くだけでよい。出力パスは `pages/` 以下の相対パスを維持する（例: `pages/works/index.ejs` → `dist/works/index.html`）。
