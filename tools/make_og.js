// 產生分享用預覽圖 og/*.png（1200x630）：首頁、每個主題、每張圖片。
// 用法：NODE_PATH=$(npm root -g) node tools/make_og.js      （需要 playwright、Pillow 與中文字型）
// 圖片或主題有增減時重跑一次，再跑 python3 tools/build_pages.py
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(ROOT, 'images.js'), 'utf8');
const cats = [...js.matchAll(/\{\s*id:\s*'(\w+)',\s*icon:\s*'([^']+)',\s*name:\s*'([^']+)'\s*\}/g)].map(m => ({ id: m[1], icon: m[2], name: m[3] })).filter(c => c.id !== 'new');
const imgs = [...js.matchAll(/\{\s*id:\s*'(\w+)',\s*seq:\s*(\d+),\s*cat:\s*'(\w+)',\s*name:\s*'([^']+)',\s*src:\s*'([^']+)'/g)].map(m => ({ id: m[1], cat: m[3], name: m[4], src: m[5] }));
const NAME = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8')).siteName;
const url = f => 'file://' + path.join(ROOT, f);
const css = `*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:#FFF6DD;font-family:"PingFang TC","Noto Sans TC","Microsoft JhengHei","WenQuanYi Zen Hei",sans-serif;color:#4a3b2a;position:relative;overflow:hidden;border:14px solid #FFD43B}
.brand{position:absolute;left:60px;top:46px;font-size:34px;font-weight:800}
.tag{position:absolute;left:60px;bottom:46px;font-size:30px;font-weight:700;color:#c2540a}
.txt{position:absolute;left:60px;top:130px;bottom:130px;width:560px;display:flex;flex-direction:column;justify-content:center;gap:28px}
.t{font-size:84px;font-weight:900;line-height:1.2}
.s{font-size:36px;line-height:1.5}
.card{position:absolute;right:70px;top:80px;width:470px;height:470px;border-radius:44px;overflow:hidden;box-shadow:0 10px 0 #e5d6ad;background:#fff}
.card img{width:100%;height:100%;display:block}
.grid{position:absolute;right:60px;top:60px;width:500px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.grid img{width:100%;aspect-ratio:1;border-radius:24px;box-shadow:0 5px 0 #e5d6ad;display:block}`;
function html(kind, o) {
  let l, r;
  if (kind === 'home') {
    const pick = ['cat', 'apple', 'sun', 'car', 'trex', 'whale', 'rocket', 'bee', 'pizza'].map(id => imgs.find(i => i.id === id) || imgs[0]);
    l = `<div class="txt"><div class="t">${NAME}</div><div class="s">${cats.length} 個主題・${imgs.length} 張可愛圖片<br>9／12／25 片，免費、免註冊</div></div>`;
    r = `<div class="grid">${pick.map(i => `<img src="${url(i.src)}">`).join('')}</div>`;
  } else if (kind === 'cat') {
    const ims = imgs.filter(i => i.cat === o.id).slice(0, 9);
    l = `<div class="txt"><div class="t">${o.name}拼圖</div><div class="s">${o.icon} 共 16 張圖片<br>9／12／25 片，免費免註冊</div></div>`;
    r = `<div class="grid">${ims.map(i => `<img src="${url(i.src)}">`).join('')}</div>`;
  } else {
    const c = cats.find(c => c.id === o.cat);
    l = `<div class="txt"><div class="t">${o.name}拼圖</div><div class="s">${c.icon} ${c.name}主題<br>9／12／25 片，免費免註冊</div></div>`;
    r = `<div class="card"><img src="${url(o.src)}"></div>`;
  }
  return `<!doctype html><meta charset="utf-8"><style>${css}</style><body><div class="brand">🧩 ${NAME}</div>${l}${r}${kind === 'home' ? '<div class="tag">適合 2～6 歲的孩子</div>' : ''}</body>`;
}
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const tmp = path.join(os.tmpdir(), 'og-tmp.html');
  fs.mkdirSync(path.join(ROOT, 'og'), { recursive: true });
  const jobs = [['home', {}, 'og/home.png']].concat(cats.map(c => ['cat', c, `og/c-${c.id}.png`]), imgs.map(i => ['img', i, `og/p-${i.id}.png`]));
  for (const [k, o, out] of jobs) {
    fs.writeFileSync(tmp, html(k, o));
    await p.goto('file://' + tmp);
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    await p.screenshot({ path: path.join(ROOT, out) });
  }
  await b.close();
  // 平面色塊的圖轉成 256 色調色盤，檔案約縮小到 1/3（需要 Pillow）
  require('child_process').execFileSync('python3', ['-c', 'import glob,sys\nfrom PIL import Image\nfor f in glob.glob(sys.argv[1]+"/og/*.png"):\n    Image.open(f).convert("RGB").quantize(256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).save(f,optimize=True)', ROOT]);
  console.log('完成', jobs.length, '張');
})();
