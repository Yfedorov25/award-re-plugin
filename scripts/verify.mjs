#!/usr/bin/env node
/*
  verify.mjs — DOM-факт верифікація (закони A8/B2/B3/B12). Пише
  .award-re/state/verify-report.json. Скріншоти НЕ робить (закон B1).

  Використання:
    node scripts/verify.mjs --url http://localhost:4173 \
      [--routes "/,/flats,/flat/A2-01"] [--content "main section"] \
      [--project /шлях/до/проєкту]

  Перевірки на кожен маршрут:
   - рендер контенту (селектор --content, дефолт "main section, [data-page] section")
   - console.error (повний список, favicon ігнорується)
   - горизонтальний overflow @1440 і @390
   - текст-кліпінг заголовків (scrollWidth > clientWidth + 2)
   - failed requests >= 400 (крім favicon)
*/
import fs from "node:fs";
import path from "node:path";

const arg = (n, d) => {
  const i = process.argv.indexOf("--" + n);
  return i > -1 ? process.argv[i + 1] : d;
};
const URL_BASE = arg("url", "http://localhost:4173");
const ROUTES = arg("routes", "/").split(",").map((s) => s.trim()).filter(Boolean);
const CONTENT_SEL = arg("content", "main section, [data-page] section, #page section");
const PROJECT = arg("project", process.cwd());

let chromium;
try { ({ chromium } = await import("playwright")); }
catch {
  try { ({ chromium } = await import(path.join(PROJECT, "node_modules", "playwright", "index.mjs"))); }
  catch {
    console.error("verify.mjs: playwright не знайдений (ні глобально, ні в проєкті). npm i -D playwright && npx playwright install chromium");
    process.exit(1);
  }
}

const browser = await chromium.launch();
const report = { url: URL_BASE, when: new Date().toISOString(), routes: {}, ok: true };

for (const route of ROUTES) {
  const r = { errors: [], failed: [], rendered: false, overflow: {}, clipped: [] };
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("favicon")) r.errors.push(m.text().slice(0, 160)); });
  page.on("response", (resp) => { if (resp.status() >= 400 && !resp.url().includes("favicon")) r.failed.push(resp.status() + " " + resp.url().slice(0, 120)); });
  try {
    await page.goto(URL_BASE + route, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2500);
    // Реальний горизонтальний скрол = documentElement.scrollWidth (поважає overflow-x:clip/hidden),
    // НЕ body.scrollWidth — той рахує full-bleed/декор-діти що навмисно вилазять за край і
    // обрізані контейнером (award-стиль), даючи фальш-overflow. Звіряємо ще й чи реально можна
    // прокрутити вбік. Кліп-чек ігнорує pointer-events-none декор і masked-reveal спани (yPercent-clip).
    const measure = () => {
      const de = document.documentElement;
      const overflow = Math.max(0, de.scrollWidth - de.clientWidth);
      const sx = window.scrollX; window.scrollTo(50, window.scrollY);
      const canScrollX = window.scrollX > sx; window.scrollTo(sx, window.scrollY);
      return { overflow, canScrollX };
    };
    const f = await page.evaluate((sel) => {
      const rendered = !!document.querySelector(sel);
      const clipped = [...document.querySelectorAll("h1,h2,h3,.ln>span")]
        .filter((el) => {
          if (el.scrollWidth <= el.clientWidth + 2 || el.clientWidth <= 0) return false;
          const cs = getComputedStyle(el);
          if (cs.pointerEvents === "none") return false;
          // masked-reveal спан (батько ховає overflow для yPercent-анімації) — не справжній кліп
          const par = el.parentElement;
          if (par && getComputedStyle(par).overflow !== "visible") return false;
          return true;
        })
        .map((el) => el.textContent.trim().slice(0, 40)).slice(0, 5);
      return { rendered, clipped };
    }, CONTENT_SEL);
    r.rendered = f.rendered;
    r.clipped = f.clipped;
    const md = await page.evaluate(measure);
    r.overflow.desktop = md.overflow;
    r.canScrollX = { desktop: md.canScrollX };
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1200);
    const mm = await page.evaluate(measure);
    r.overflow.mobile = mm.overflow;
    r.canScrollX.mobile = mm.canScrollX;
  } catch (e) {
    r.errors.push("NAV FAIL: " + String(e).slice(0, 140));
  }
  await ctx.close();
  // overflow >2 — лише ПОПЕРЕДЖЕННЯ якщо вбік реально НЕ прокрутити (full-bleed/декор обрізаний);
  // справжній провал = canScrollX (юзер може скролити вбік) АБО кліп тексту/помилки/404.
  const realHScroll = (r.canScrollX && (r.canScrollX.desktop || r.canScrollX.mobile));
  r.pass = r.rendered && r.errors.length === 0 && !realHScroll && r.clipped.length === 0 && r.failed.length === 0;
  if (!realHScroll && (r.overflow.desktop > 2 || r.overflow.mobile > 2)) r.overflowNote = "елементи вилазять за край але обрізані (overflow-x:clip) — не юзер-скрол";
  if (!r.pass) report.ok = false;
  report.routes[route] = r;
  console.log(`${r.pass ? "PASS" : "FAIL"} ${route} rendered=${r.rendered} err=${r.errors.length} ovD=${r.overflow.desktop} ovM=${r.overflow.mobile} clip=${r.clipped.length}`);
}
await browser.close();

const out = path.join(PROJECT, ".award-re", "state");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "verify-report.json"), JSON.stringify(report, null, 2));
console.log((report.ok ? "OK" : "ПРОВАЛЕНО") + " → .award-re/state/verify-report.json");
process.exit(report.ok ? 0 : 1);
