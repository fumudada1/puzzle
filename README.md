# 幼兒啟蒙認知拼圖

免費的幼兒拼圖遊戲：16 個主題、256 張自製插圖，可選 9／12／16 片，支援「拼圖形」與「方塊」。
純 HTML／CSS／JavaScript，沒有框架、沒有後端；可安裝到手機主畫面（PWA），並支援離線。

網站：<https://fumudada1.github.io/puzzle/>

## 專案結構

| 路徑 | 說明 |
|---|---|
| `index.html`、`app.js`、`style.css` | 遊戲本體 |
| `images/`、`images.js` | 圖片與「類別／圖片」清單（新增內容主要改這裡） |
| `about.html`、`parents.html`、`privacy.html`、`c/` | 靜態內容頁（SEO、家長須知、隱私權政策、各主題說明） |
| `sw.js`、`manifest.webmanifest`、`icons/` | PWA（離線快取、安裝） |
| `ads.js`、`ads-config.js` | 廣告位（預設關閉） |
| `site.json` | 網站設定：網域、聯絡信箱、是否啟用廣告 |
| `tools/` | 建置腳本與 Service Worker 模板 |

## 新增類別或圖片

1. 圖片（SVG，建議 600×600、主體放在中間）放進 `images/`
2. 在 `images.js` 加入類別（`PUZZLE_CATEGORIES`）與圖片（`PUZZLE_IMAGES`，`seq` 填目前最大序號 + 1，會自動出現在「最新圖片」）
3. 若是新類別，在 `tools/build_pages.py` 的 `COPY` 補上該類別的說明文字
   （新增圖片／類別後，先執行 `NODE_PATH=$(npm root -g) node tools/make_og.js` 產生分享預覽圖 `og/*.png`，需要 playwright 與 Pillow）
4. 執行 `python3 tools/build_pages.py`，重新產生靜態頁、網站地圖、`sw.js` 與資源版本號

> `index.html` 內 `SEO:BEGIN~END`、`FOOT:BEGIN~END` 區塊與 `sw.js`、`sitemap.xml`、`c/*.html` 等都是產生的檔案，請改來源（`site.json`、`tools/`、`images.js`）後重跑建置，不要直接手改。

## 設定

- **換網域／聯絡信箱／啟用廣告：** 改 `site.json` 後執行 `python3 tools/build_pages.py`
- **啟用 AdSense 前：** 請先閱讀 `ads.js` 檔頭的說明，並處理其中標註的兒童導向設定（TFCD）

## 本機預覽

```bash
python3 -m http.server 8000
# 開啟 http://localhost:8000/
```

（Service Worker 只在 http(s) 下運作，直接用 `file://` 開啟時離線功能不會啟用。）

## 授權

網站圖片為自製插圖，以 CC0 公眾領域貢獻方式釋出。
