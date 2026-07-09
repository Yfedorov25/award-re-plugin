#!/usr/bin/env node
// ink-box: bounding boxes of dark pixels in given regions of two PNGs → exact dx/dy.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(pathToFileURL(process.env.PLAYWRIGHT_FROM));
const { chromium } = require('playwright');

const [oursPng, livePng] = process.argv.slice(2);
// zones: [name, x, y, w, h, darkThreshold]
const ZONES = [
  ['headline', 585, 0, 350, 100, 120],
  ['class-a', 930, 360, 200, 100, 180],
  ['btn-text', 1210, 15, 140, 40, 200],
  ['plus', 1385, 15, 35, 40, 200],
  ['arrow', 1380, 745, 60, 60, 120],
];

const FN = (p) => {
  const { urls, zones } = p;
  function load(u) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; }); }
  return Promise.all(urls.map(load)).then(imgs => {
    const out = {};
    imgs.forEach((img, k) => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      for (const [name, zx, zy, zw, zh, thr] of zones) {
        const d = ctx.getImageData(zx, zy, zw, zh).data;
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
        for (let y = 0; y < zh; y++) for (let x = 0; x < zw; x++) {
          const p4 = (y * zw + x) * 4;
          const lum = 0.299 * d[p4] + 0.587 * d[p4 + 1] + 0.114 * d[p4 + 2];
          const dark = k === 0 || k === 1 ? lum < thr : false;
          if (dark) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        (out[name] = out[name] || [])[k] = n ? { x: zx + x0, y: zy + y0, w: x1 - x0 + 1, h: y1 - y0 + 1, ink: n } : null;
      }
    });
    return out;
  });
};

const toUrl = f => 'data:image/png;base64,' + readFileSync(f).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('about:blank');
const res = await page.evaluate(FN, { urls: [toUrl(oursPng), toUrl(livePng)], zones: ZONES });
for (const [name] of ZONES) {
  const [o, l] = res[name] || [];
  const fmt = b => b ? `x${b.x} y${b.y} ${b.w}×${b.h} ink${b.ink}` : 'EMPTY';
  const d = o && l ? ` | Δx ${o.x - l.x} Δy ${o.y - l.y} Δw ${o.w - l.w} Δh ${o.h - l.h}` : '';
  console.log(`${name.padEnd(9)} OURS ${fmt(o).padEnd(30)} LIVE ${fmt(l)}${d}`);
}
await browser.close();
