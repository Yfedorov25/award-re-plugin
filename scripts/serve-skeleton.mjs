/* ============================================================
   SERVE-SKELETON (трек springs, S3) — хостинг каркаса для звірки
   ------------------------------------------------------------
   Сервить library/combos/<site>/ (index.html, skeleton.css, scene.css,
   choreo.json, springs-engine.js), шрифти з дзеркала, а /assets|/media
   проксює З ЖИВОГО з дисковим кешем (щоб не молотити живий сайт при
   повторних прогонах). Це той самий origin-контракт, що в
   skeleton-verify — але постійним процесом, щоб animation-map.mjs
   міг ходити на нього як на сайт (--origin http://localhost:PORT).

   Запуск: node scripts/serve-skeleton.mjs springs-home [--port 8873]
   ============================================================ */
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import { SITES, REPO } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи: node scripts/serve-skeleton.mjs <${Object.keys(SITES).join('|')}> [--port N]`); process.exit(1); }
const argOf = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const PORT = parseInt(argOf('--port', '8873'), 10);
const dir = join(REPO, 'library/combos', siteName);
const cacheDir = join(site.outDir, '.asset-cache');
mkdirSync(cacheDir, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.avif': 'image/avif',
};
const LOCAL = {
  '/': 'index.html', '/index.html': 'index.html', '/skeleton.css': 'skeleton.css',
  '/scene.css': 'scene.css', '/choreo.json': 'choreo.json', '/springs-engine.js': 'springs-engine.js',
};

let hits = 0, proxied = 0, cached = 0;
createServer(async (req, res) => {
  hits++;
  const u = new URL(req.url, `http://localhost:${PORT}`);
  const send = (code, body, type) => { res.writeHead(code, { 'content-type': type || 'application/octet-stream', 'cache-control': 'no-store' }); res.end(body); };
  try {
    if (LOCAL[u.pathname]) {
      return send(200, readFileSync(join(dir, LOCAL[u.pathname])), MIME[extname(LOCAL[u.pathname])] || MIME['.html']);
    }
    if (site.archive.fontsLocalPrefix && u.pathname.startsWith(site.archive.fontsLocalPrefix)) {
      const f = join(site.archiveDir, 'fonts', basename(u.pathname));
      if (existsSync(f)) return send(200, readFileSync(f), MIME[extname(f)] || 'font/woff2');
    }
    if (site.archive.proxyPrefixes.some((p) => u.pathname.startsWith(p))) {
      const key = u.pathname.replace(/[^a-zA-Z0-9.@_-]/g, '_') + (u.search ? '_' + Buffer.from(u.search).toString('base64url').slice(0, 24) : '');
      const cf = join(cacheDir, key);
      if (existsSync(cf)) { cached++; return send(200, readFileSync(cf), MIME[extname(u.pathname)] || 'application/octet-stream'); }
      const r = await fetch(site.liveOrigin + u.pathname + u.search, { signal: AbortSignal.timeout(20000) });
      const buf = Buffer.from(await r.arrayBuffer());
      if (r.ok) { writeFileSync(cf, buf); proxied++; }
      return send(r.status, buf, r.headers.get('content-type') || MIME[extname(u.pathname)]);
    }
    return send(404, 'not found', 'text/plain');
  } catch (e) {
    return send(502, String(e), 'text/plain');
  }
}).listen(PORT, () => console.log(`serve-skeleton: http://localhost:${PORT}/ (кеш: ${cacheDir})`));
setInterval(() => console.log(`  [stats] запитів ${hits}, проксі ${proxied}, з кеша ${cached}`), 30000).unref();
