/* 廣告位控制（Google AdSense）
 * - 預設關閉：ads-config.js 為 null 時什麼都不做，也不會連到 Google。
 * - 只有標記為 .ad-slot 的位置會放廣告：首頁（home）、App 內類別頁（category）、各主題說明頁（theme）。
 *   拼圖遊戲畫面不放廣告；廣告容器都在 #menu 內，遊戲開始時整個 #menu 會被隱藏。
 * - 只做「橫幅廣告」：水平方向的顯示廣告（data-ad-format="horizontal"），不做插頁、彈出、置底懸浮、全螢幕等會打斷遊戲或容易讓幼兒誤點的形式。
 *   請在 AdSense 後台：關閉本網站的「自動廣告」（含錨點廣告、插頁式廣告 Vignette），廣告單元類型選「展示廣告」。
 * - 廣告位高度事先預留（避免畫面跳動），沒有廣告填入時整個廣告位自動收起。
 * - 啟用方式：site.json 設定 adsEnabled=true 與 adsense.client / adsense.slots，再執行 python3 tools/build_pages.py
 */
(function () {
  'use strict';
  var cfg = window.ADS_CONFIG;
  var loaded = false, done = {};

  function loadLibrary() {
    if (loaded) return; loaded = true;
    window.adsbygoogle = window.adsbygoogle || [];
    // 兒童網站：只要非個人化廣告
    window.adsbygoogle.requestNonPersonalizedAds = 1;
    // 兒童導向：除了這裡每個廣告都加上 data-tag-for-child-directed-treatment="1"，也請在 AdSense 後台把本網站標示為兒童導向
    var s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(cfg.client);
    document.head.appendChild(s);
  }

  // 顯示指定名稱的廣告位。每個版位每次載入頁面只填一次（不手動重新整理廣告，符合 AdSense 政策）。
  function show(name) {
    if (!cfg || !cfg.client || done[name]) return;
    var slotId = cfg.slots && cfg.slots[name];
    if (!slotId) return;
    var el = document.querySelector('.ad-slot[data-slot="' + name + '"]');
    // 廣告位本身預設是 hidden，所以改檢查它的外層容器：容器目前不可見（例如在隱藏的畫面裡）就先不放
    if (!el || !el.parentElement || el.parentElement.getClientRects().length === 0) return;
    if (el.closest('#game')) return;                   // 保險：遊戲畫面裡絕不放
    done[name] = true; loadLibrary();
    el.innerHTML = '<div class="ad-label">廣告</div><ins class="adsbygoogle" style="display:block" data-ad-client="' + cfg.client +
      '" data-ad-slot="' + slotId + '" data-ad-format="horizontal" data-full-width-responsive="false" data-tag-for-child-directed-treatment="1"></ins>';
    el.hidden = false;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }

  window.PuzzleAds = { show: show, enabled: !!(cfg && cfg.client) };
  // 靜態頁面：頁面載入後，顯示所有看得到的廣告位
  document.addEventListener('DOMContentLoaded', function () {
    var els = document.querySelectorAll('.ad-slot');
    for (var i = 0; i < els.length; i++) {
      var n = els[i].getAttribute('data-slot');
      if (n === 'theme') show(n);
    }
  });
})();
