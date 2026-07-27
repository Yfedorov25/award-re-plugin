/*
  lib/trace.mjs — ВИМІР (браузер тільки міряє, ніколи не судить). Етап B, вердикт ради S45.

  Примітиви:
  - censusMovers(page): 5 проб p → УСІ елементи чиї transform/clip/opacity міняються.
    Кожному мōверу ставиться data-sc="N" (стабільна адреса для трейсу). Незадекларований
    мōвер = FAIL 'undeclared mover' (рішення судді: census не вірить декларації).
  - assertPurity(page, scIds): render(0.5) двічі + історія стрибків → стан ідентичний;
    transition-duration на мōверах == 0. Провал = атом not-render-p-pure.
  - captureTrace(page, steps, scIds): ОДИН p.evaluate, індексний цикл i=0..steps,
    window.render(i/steps) раз на точку, читання всіх каналів усіх мōверів → матриця.
    Канали (індекси рядка): 0 tx · 1 ty · 2 clipTop · 3 clipRight · 4 clipBottom ·
    5 clipLeft · 6 opacity · 7 bboxLeft · 8 bboxTop · 9 bboxW · 10 bboxH  (px).
  - сигнальні хелпери над трейсом: chan/activeWindow/plateaus/crossing (чисті функції).
*/

export const CH = { tx:0, ty:1, clipTop:2, clipRight:3, clipBottom:4, clipLeft:5, opacity:6, bx:7, by:8, bw:9, bh:10 };

// ── census: знайти ВСІ рухомі елементи (5 проб) і помітити data-sc ────────────
export async function censusMovers(page){
  return await page.evaluate(() => {
    const probes = [0, 0.25, 0.5, 0.75, 1];
    const els = [...document.querySelectorAll('body *')].slice(0, 1000);
    const cs = getComputedStyle;
    const sig = (el) => { const c = cs(el); return c.transform + '|' + (c.clipPath || '') + '|' + c.opacity; };
    const snaps = els.map(() => new Set());
    for (const p of probes) {
      window.render(p);
      els.forEach((el, i) => snaps[i].add(sig(el)));
    }
    window.render(0);
    const movers = [];
    els.forEach((el, i) => {
      if (snaps[i].size > 1) {
        const sc = 'm' + movers.length;
        el.setAttribute('data-sc', sc);
        const cls = (el.className && typeof el.className === 'string') ? '.' + el.className.trim().split(/\s+/).join('.') : '';
        movers.push({ sc, desc: (el.id ? '#' + el.id : el.tagName.toLowerCase() + cls) });
      }
    });
    return movers;
  });
}

// ── purity: render(p) мусить бути чистою функцією p ──────────────────────────
export async function assertPurity(page){
  return await page.evaluate(() => {
    const cs = getComputedStyle;
    const movers = [...document.querySelectorAll('[data-sc]')];
    const snap = () => JSON.stringify(movers.map(el => { const c = cs(el); return [c.transform, c.clipPath || '', c.opacity]; }));
    window.render(0.5); const a = snap();
    window.render(0.5); const b = snap();
    window.render(0.9); window.render(0.1); window.render(0.5); const c = snap();
    window.render(0);
    // transition-duration на мōверах: будь-який ненульовий = лаг семпла = імпурність
    const trans = movers.filter(el => {
      const c = cs(el);
      return (c.transitionDuration || '0s').split(',').some(d => parseFloat(d) > 0)
        && /all|transform|clip|opacity/.test(c.transitionProperty || 'all');
    }).map(el => el.getAttribute('data-sc'));
    return { pure: a === b && a === c, transMovers: trans };
  });
}

// ── sweep: один evaluate, всі канали всіх мōверів на щільній сітці ───────────
export async function captureTrace(page, steps){
  return await page.evaluate((STEPS) => {
    const cs = getComputedStyle;
    const movers = [...document.querySelectorAll('[data-sc]')];
    const vh = innerHeight, vw = innerWidth;
    const out = { steps: STEPS, vh, vw, sig: {} };
    movers.forEach(el => { out.sig[el.getAttribute('data-sc')] = []; });
    const read = (el) => {
      const c = cs(el);
      const m = new DOMMatrix(c.transform);
      let ct = 0, cr = 0, cb = 0, cl = 0;
      const cp = c.clipPath || c.webkitClipPath || '';
      const mm = cp.match(/inset\(([^)]+)\)/);
      if (mm) {
        const parts = mm[1].trim().split(/\s+/);
        const vals = [parts[0], parts[1] ?? parts[0], parts[2] ?? parts[0], parts[3] ?? parts[1] ?? parts[0]];
        // %→px через offset (НЕ getBoundingClientRect — той пост-transform; вердикт ради Q2)
        const h = el.offsetHeight || vh, w = el.offsetWidth || vw;
        const px = (v, base) => v.endsWith('%') ? parseFloat(v) / 100 * base : (parseFloat(v) || 0);
        ct = px(vals[0], h); cr = px(vals[1], w); cb = px(vals[2], h); cl = px(vals[3], w);
      }
      const r = el.getBoundingClientRect();
      return [m.e, m.f, ct, cr, cb, cl, +c.opacity, r.left, r.top, r.width, r.height];
    };
    for (let i = 0; i <= STEPS; i++) {          // індексний цикл — нуль float-дрейфу
      window.render(i / STEPS);
      for (const el of movers) out.sig[el.getAttribute('data-sc')].push(read(el));
    }
    window.render(0);
    return out;
  }, steps);
}

// ── чисті сигнальні хелпери (Node, без браузера) ─────────────────────────────
export function chan(trace, sc, ch){ const s = trace.sig[sc]; return s ? s.map(r => r[CH[ch]]) : null; }
export const pOf = (trace, i) => i / trace.steps;

// активне вікно руху сигналу: перший/останній крок де |Δ на крок| > stepEps
export function activeWindow(v, stepEps){
  let s = -1, e = -1;
  for (let i = 1; i < v.length; i++) {
    if (Math.abs(v[i] - v[i-1]) > stepEps) { if (s < 0) s = i - 1; e = i; }
  }
  return s < 0 ? null : { startI: s, endI: e };
}

// плато: максимальні відрізки де сигнал тримається біля значення (|v−val0|<=settleEps)
export function plateaus(v, settleEps, minLenSteps){
  const out = [];
  let s = 0;
  for (let i = 1; i <= v.length; i++) {
    if (i === v.length || Math.abs(v[i] - v[s]) > settleEps) {
      if (i - s >= minLenSteps) out.push({ startI: s, endI: i - 1, val: v[s] });
      // новий відрізок: зсунути старт вперед поки в межах settle від v[i]
      s = i;
    }
  }
  return out;
}

// перший перетин рівня val (зі зміною знаку)
export function crossing(v, val){
  for (let i = 1; i < v.length; i++) {
    if ((v[i-1] - val) * (v[i] - val) <= 0 && v[i-1] !== v[i]) return i;
  }
  return null;
}

export const near = (a, b, tol) => a != null && b != null && Math.abs(a - b) <= tol;
