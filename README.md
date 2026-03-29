# 所沢キャンパス祭 2026 公式ウェブサイト

早稲田大学 所沢キャンパス祭（通称：とこ祭）2026の公式ウェブサイトです。
本リポジトリは、HTML/CSS/JavaScriptを用いた静的サイト構成で、Vercel等のプラットフォームでの公開を前提に管理されています。

---

## 🚀 公開ページ紹介

### 1. トップページ (`index.html`)
サイトのメインエントランスです。

### 2. 新歓特設ページ (`shinkan.html`)
新入生に向けた情報を集約したページです。

### 3. 準備中ページ (`coming.html`)
「とこ祭について」「企画一覧」など、現在制作中のコンテンツを表示する待機ページです。

---

## 🛠 使用技術・ライブラリ

| カテゴリ | 使用技術 |
| :--- | :--- |
| **ベース** | HTML5 / CSS3 / JavaScript (ES6+) |
| **フォント** | Google Fonts ([Klee One](https://fonts.google.com/specimen/Klee+One)) |
| **アニメーション** | [GSAP](https://greensock.com/gsap/) / [Pace.js](https://codebyamir.com/blog/pace-js) |
| **スライダー** | [Swiper.js](https://swiperjs.com/) |
| **ホスティング** | Vercel |

---

## 📂 ディレクトリ構造


```text
.
├── images/             # 各種画像・アイコン
├── scripts/            # JavaScriptファイル群
│   ├── libs/           # 自作スクリプト（スクロール、メニュー制御等）
│   ├── vendors/        # 外部ライブラリ（GSAP, Swiper, Pace.js）
│   └── main.js         # 共通のメイン処理
├── coming.html         # 準備中（Coming Soon）ページ
├── coming.css          # 準備中ページ専用のスタイル
├── shinkan.html        # 新歓特設ページ
├── shinkan.css         # 新歓ページ専用のスタイル
├── shinkan.js          # 新歓ページ専用のスクリプト（モーダル制御等）
├── index.html          # トップページ
├── common.css          # 全ページ共通の構成用スタイル
├── style.css           # トップページのスタイル
└── README.md           # プロジェクト説明書（本ファイル）
