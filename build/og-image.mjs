/**
 * Regenerates public/og-image.png and public/apple-touch-icon.png.
 *
 * Run by hand after a brand or headline change — these are committed assets,
 * not build output, because social unfurlers need a stable URL and Playwright
 * is not a dependency of the app:
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node build/og-image.mjs
 */
import { chromium } from 'playwright'
const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,500&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#fafaf9;font-family:Inter,system-ui;
  display:flex;flex-direction:column;justify-content:center;padding:0 90px 96px;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:
  linear-gradient(to right,rgba(10,10,10,.045) 1px,transparent 1px),
  linear-gradient(to bottom,rgba(10,10,10,.045) 1px,transparent 1px);
  background-size:48px 48px;
  -webkit-mask-image:radial-gradient(ellipse at 30% 50%,#000 35%,transparent 78%)}
.blob{position:absolute;border-radius:50%;filter:blur(90px)}
.b1{width:520px;height:520px;background:#fecdd3;top:-150px;right:-110px;opacity:.75}
.b2{width:420px;height:420px;background:#ddd6fe;bottom:-170px;left:-120px;opacity:.6}
.in{position:relative;z-index:2;max-width:900px}
.pill{display:inline-flex;align-items:center;gap:10px;padding:9px 20px;border-radius:99px;
  background:#fff;border:1px solid rgba(10,10,10,.08);font-size:19px;font-weight:600;color:#404040;
  box-shadow:0 1px 3px rgba(10,10,10,.05)}
.dot{width:9px;height:9px;border-radius:50%;background:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.18)}
h1{font-family:'Playfair Display',Georgia,serif;font-weight:500;font-size:72px;line-height:1.06;
  letter-spacing:-.035em;color:#0a0a0a;margin:30px 0 22px}
h1 em{font-style:italic;background:linear-gradient(135deg,#f43f5e,#d946ef 55%,#8b5cf6);
  -webkit-background-clip:text;background-clip:text;color:transparent}
p{font-size:27px;color:#525252;line-height:1.5;max-width:700px}
.brand{position:absolute;bottom:52px;left:90px;display:flex;align-items:center;gap:13px;z-index:2}
.mark{width:44px;height:44px;border-radius:13px;background:#0a0a0a;color:#fff;display:flex;
  align-items:center;justify-content:center;font-size:22px}
.bt{font-size:27px;font-weight:600;color:#0a0a0a;letter-spacing:-.01em}
</style></head><body>
<div class="grid"></div><div class="blob b1"></div><div class="blob b2"></div>
<div class="in">
  <span class="pill"><span class="dot"></span>Free forever · No credit card</span>
  <h1>Free online wedding invitations,<br><em>reimagined for the phone.</em></h1>
  <p>Design it in minutes. Share one link. Collect RSVPs automatically.</p>
</div>
<div class="brand"><span class="mark">♥</span><span class="bt">Cardogen</span></div>
</body></html>`

const icon = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0}
body{width:180px;height:180px;background:#0a0a0a;display:flex;align-items:center;
  justify-content:center;color:#fff;font-size:104px;line-height:1;font-family:system-ui}
</style></head><body>\u2665</body></html>`

const out = new URL('../public/', import.meta.url)
const browser = await chromium.launch()

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await og.setContent(html, { waitUntil: 'networkidle' })
// Give the webfonts a beat to paint, or the headline renders in the fallback serif.
await og.waitForTimeout(1200)
await og.screenshot({ path: new URL('og-image.png', out).pathname })

const touch = await browser.newPage({ viewport: { width: 180, height: 180 } })
await touch.setContent(icon, { waitUntil: 'networkidle' })
await touch.screenshot({ path: new URL('apple-touch-icon.png', out).pathname })

await browser.close()
console.log('wrote public/og-image.png and public/apple-touch-icon.png')
