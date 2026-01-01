![Threads Wrapped](images/threads-wrapped_cover.webp)

# Threads Wrapped

你的 Threads 年終回顧工具 — 將你一整年的串文數據轉化為精美的統計報告。

## 隱私聲明

本工具 100% 尊重使用者隱私：

- 無伺服器：完全在你的瀏覽器本地運行
- 無資料上傳：你的資料不會離開你的裝置
- 無資料儲存：所有處理都在記憶體中完成，關閉頁面即清除
- 無追蹤：不使用任何分析工具或 Cookie
- 開源透明：所有程式碼公開可查

簡單來說，你的資料只屬於你。

## 功能特色

- 統計你的年度發文數量與字數
- 找出你最活躍的日子與時段
- 分析你的連續發文紀錄
- 列出獲得最多讚的貼文
- 提取你的熱門關鍵詞與 Emoji
- 追蹤粉絲成長趨勢

## 使用方式

### 步驟一：下載你的 Threads 資料

1. 開啟 Instagram App
2. 前往「設定和動態」→「帳號管理中心」→「你的資訊和權限」→「下載你的資訊」
3. 選擇「部分資訊」
4. 只勾選「Threads」
5. 選擇格式為「JSON」、日期範圍「所有時間」
6. 提交申請，等待 Instagram 寄送下載連結（通常幾分鐘到幾小時）

### 步驟二：上傳資料

1. 前往 Threads Wrapped 網站
2. 上傳下載的 ZIP 檔案，或解壓後上傳整個資料夾
3. 等待分析完成

### 步驟三：查看你的年終回顧

- 瀏覽統計結果頁面
- 點選「播放故事」觀看動態呈現
- 截圖分享你的年終回顧

## 技術架構

```
threads-wrapped/
├── index.html          # 上傳頁面
├── result.html         # 統計結果頁面
├── story.html          # 故事流頁面
├── css/                # 樣式檔案
│   ├── global.css
│   ├── upload.css
│   ├── result.css
│   └── stories.css
├── js/
│   ├── upload.js       # 上傳邏輯
│   ├── parser.js       # JSON 解析器
│   ├── analyzer.js     # 統計分析引擎
│   ├── renderer.js     # 結果渲染
│   ├── result.js       # 結果頁互動
│   ├── zip-handler.js  # ZIP 處理
│   └── stories/        # 故事流模組
│       ├── StoryEngine.js
│       ├── StoryPage.js
│       └── pages/      # 14 個故事頁面
└── lib/                # 外部函式庫
```

技術棧：
- HTML5 + CSS3 + 原生 JavaScript（ES6 Module）
- zip.js（處理 ZIP 檔案）
- 無框架依賴，輕量快速

## 本地開發

```bash
# 複製專案
git clone https://github.com/haunchen/threads-wrapped.git
cd threads-wrapped

# 啟動本地伺服器（任選一種）
python3 -m http.server 8000
# 或
npx serve
# 或
npx live-server

# 開啟瀏覽器
open http://localhost:8000
```

## 授權

本專案採用 [MIT License](LICENSE) 授權。

## 第三方套件

- [zip.js](https://gildas-lormeau.github.io/zip.js/) - BSD-3-Clause

## Author

Made by [法蘭克](https://www.threads.com/@frankchen.tw) & [阿璋](https://www.threads.com/@azlife_1224)

Tech Blog: [frankchen.tw](https://www.frankchen.tw/)

Hao Tool: [haotool.org](https://haotool.org/)

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-支持我們-orange?style=flat-square&logo=buy-me-a-coffee)](https://buymeacoffee.com/frankchentw)
