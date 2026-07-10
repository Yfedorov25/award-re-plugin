/* ============================================================
   SPRINGS-ENGINE (S3) — снап-хореографія + криві, no-WebGL
   ------------------------------------------------------------
   Вся хореографія — З ДАНИХ choreo.json (генерат choreo-gen.mjs зі
   scene-map + animation-map живого). У коді немає жодного числа руками.

   Desktop: віртуальний скрол — wheel перехоплюється, кожен жест =
   крок по снап-драбині, позиція лерпиться (0.1/кадр) у нативний
   scrollTop. Інтро-гейт hero: перші iEnd px інпуту йдуть у карусель
   (криві по інтро-інпуту), потім скрол відпускається.
   Mobile: чесний нативний скрол (touch), движок лише читає scrollY.

   Криві цілей: bbox-delta повтор — бажаний bbox з карти живого
   мінус природний потік нашого каркаса → inline translate/scale
   (розв'язок через ланцюг забіндьованих предків), opacity/clip
   реплеєм. Sticky-шари/параллакси приходять цим же шляхом.
   ============================================================ */
(async () => {
  const isDesktop = matchMedia('(min-width:1024px)').matches;
  const vpName = isDesktop ? 'desktop' : 'mobile';
  let cfg;
  try {
    cfg = (await (await fetch('/choreo.json')).json()).viewports[vpName];
  } catch (e) { console.warn('[engine] choreo.json недоступний', e); return; }
  if (!cfg) return;

  await new Promise((res) => (document.readyState === 'complete' ? res() : addEventListener('load', res)));
  try { await document.fonts.ready; } catch {}
  /* лейаут доосідає ПІСЛЯ load (декод картинок через проксі) — стейлові
     naturals ламали bbox-розв'язок (розкопка S3, ітерація 5): чекаємо
     два стабільні заміри головного контейнера поспіль */
  {
    let prev = -1;
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 400));
      const h = document.body.scrollHeight + (document.querySelector('.l-gallery__content')?.getBoundingClientRect().height || 0);
      if (Math.abs(h - prev) < 1) break;
      prev = h;
    }
  }

  /* ---------- утиліти ---------- */
  const lerp = (a, b, t) => a + (b - a) * t;
  /* інтерполяція по відсортованому масиву точок {k: число, ...} */
  function interp(arr, keyName, x, valFn) {
    if (!arr.length) return null;
    if (x <= arr[0][keyName]) return valFn(arr[0], arr[0], 0);
    const last = arr[arr.length - 1];
    if (x >= last[keyName]) return valFn(last, last, 0);
    let lo = 0, hi = arr.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; (arr[mid][keyName] <= x ? lo = mid : hi = mid); }
    const a = arr[lo], b = arr[hi];
    const t = (x - a[keyName]) / (b[keyName] - a[keyName] || 1);
    return valFn(a, b, t);
  }
  const numsOf = (str) => (str.match(/-?\d*\.?\d+/g) || []).map(Number);
  /* clip: числова інтерполяція, якщо шаблони збігаються */
  function lerpClip(a, b, t) {
    if (!a) return b; if (!b || a === b || t === 0) return a;
    const pa = a.replace(/-?\d*\.?\d+/g, '#'), pb = b.replace(/-?\d*\.?\d+/g, '#');
    if (pa !== pb) return t < 0.5 ? a : b;
    const na = numsOf(a), nb = numsOf(b);
    let i = 0;
    return a.replace(/-?\d*\.?\d+/g, () => String(Math.round(lerp(na[i], nb[i++], t) * 1000) / 1000));
  }

  /* ---------- сцена: секційні обгортки + травели ---------- */
  const wrappers = {};
  for (const el of document.querySelectorAll(`.sk-vp-${vpName}[data-sk-section]`)) {
    wrappers[el.dataset.skSection] = el;
  }
  const travelOf = {};
  for (const [id, tr] of Object.entries(cfg.travels || {})) {
    if (id === 'header') continue; /* header fixed у scene.css */
    travelOf[id] = (P) => interp(tr, 's', P, (a, b, t) => lerp(a.dev, b.dev, t)) || 0;
  }

  /* корекція обгорток: корінь секції може нести ВЛАСНІ запечені офсети
     (margin-top -1800 у intro тощо) — absolute-обгортка ставиться так,
     щоб КОРІНЬ став точно на top0 сцени (число з scene-map, не руками) */
  const bootScroll = window.scrollY || 0;
  for (const [id, sec] of Object.entries(cfg.sections || {})) {
    if (id === 'header') continue;
    const w = wrappers[id];
    const root = w && w.firstElementChild;
    if (!root) continue;
    const delta = sec.top0 - (root.getBoundingClientRect().top + bootScroll);
    if (Math.abs(delta) > 1) {
      w.style.top = `${(parseFloat(getComputedStyle(w).top) || 0) + delta}px`;
    }
  }

  /* живий движок на ініті: знімає нативний sticky (веде піни transform'ами)
     і ЗНІМАЄ is-invisible--js (пастка 2 — каркас = стан архіву JS-off, де
     клас ще стоїть і ховає картинки). Робимо ті ж два кроки на ОБОХ
     вʼюпортах — на mobile bbox-піни теж веде движок (нативний sticky
     в absolute-обгортці сцени не відтворює живі травели). */
  for (const el of document.querySelectorAll('.is-invisible--js')) el.classList.remove('is-invisible--js');
  for (const el of document.querySelectorAll('*')) {
    if (getComputedStyle(el).position === 'sticky') el.style.position = 'relative';
  }

  /* ---------- резолв прив'язок по сигнатурі ----------
     однакові сигнатури в межах секції роздаються В ПОРЯДКУ ДОКУМЕНТА
     (greedy по одній плутав picture сусідніх image-блоків) */
  function candScore(el, sig) {
    const want = sig.cls ? sig.cls.split(/\s+/).filter(Boolean) : [];
    const have = new Set(el.className && typeof el.className === 'string' ? el.className.trim().split(/\s+/) : []);
    let score = 0;
    for (const c of want) if (have.has(c)) score += 2;
    score -= Math.max(0, have.size - want.length) * 0.1;
    const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (sig.text && txt === sig.text) score += 3;
    else if (sig.text && txt.startsWith(sig.text.slice(0, 15))) score += 1;
    return score;
  }
  const bound = [];
  let unresolved = 0;
  {
    const bySec = {};
    (cfg.bindings || []).forEach((b, i) => (bySec[b.section] = bySec[b.section] || []).push({ b, i }));
    const resolved = new Array((cfg.bindings || []).length).fill(null);
    for (const [secId, list] of Object.entries(bySec)) {
      const wrap = wrappers[secId];
      if (!wrap) continue;
      const used = new Set();
      /* групи однакових сигнатур */
      const groups = {};
      for (const it of list) {
        const key = it.b.sig.tag + '|' + it.b.sig.cls + '|' + it.b.sig.text;
        (groups[key] = groups[key] || []).push(it);
      }
      for (const grp of Object.values(groups)) {
        const sig = grp[0].b.sig;
        const cands = [wrap, ...wrap.querySelectorAll(sig.tag)]
          .filter((el) => el.tagName.toLowerCase() === sig.tag && !used.has(el))
          .map((el) => ({ el, score: candScore(el, sig) }))
          .filter((x) => x.score > 0.5 || (!sig.cls && !sig.text));
        /* док-порядок збережено querySelectorAll; беремо перших N з найкращих:
           відсікаємо слабкі, лишаємо у док-порядку */
        const maxScore = Math.max(...cands.map((x) => x.score), 0);
        const good = cands.filter((x) => x.score >= maxScore - 0.3);
        for (let k = 0; k < grp.length; k++) {
          if (k < good.length) { resolved[grp[k].i] = good[k].el; used.add(good[k].el); }
        }
      }
    }
    (cfg.bindings || []).forEach((b, i) => {
      const el = resolved[i];
      if (!el) { unresolved++; return; }
      for (const a of b.sig.attrs || []) if (!el.hasAttribute(a)) el.setAttribute(a, '');
      bound.push({ ...b, el });
    });
  }
  console.log(`[engine] ${vpName}: прив'язано ${bound.length}/${(cfg.bindings || []).length} (нерозв'язано ${unresolved})`);

  /* ---------- кадр: ГІБРИД (S3, ітерація 7) ----------
     1) Цілі З live-матрицями: ВЕРБАТИМ-повтор матриці (hero content —
        ротація ~28°, тільки так відтворюється) + одноразовий boot-fix
        статичного зсуву каркаса (виміряний, не ручний).
     2) Цілі БЕЗ матриць, чий bbox їде не потоком (sticky-піни,
        background): bbox-delta translate від naturals.
     transform-origin не чіпаємо (запечений зі спеки = live). */
  const bootScroll2 = window.scrollY || 0;
  for (const b of bound) {
    b.el.style.willChange = 'transform';
    b.hasM = (b.curve || []).some((x) => x.m) || (b.intro || []).some((x) => x.m);
    const r = b.el.getBoundingClientRect();
    b.nat = { top: r.top + bootScroll2, left: r.left };
    b.fix = { x: 0, y: 0 };
    if (!b.hasM) {
      const dev = travelOf[b.section] || (() => 0);
      b.own = (b.curve || []).map((x) => ({
        s: x.s, dt: x.top + x.s - b.nat.top - dev(x.s), dl: x.left - b.nat.left,
      }));
    }
  }
  const fmtM = (m) => `matrix(${m.map((v) => Math.round(v * 10000) / 10000).join(',')})`;
  function applyBindings(P, introInput, introMode) {
    for (const b of bound) {
      let d;
      const pick = (a, c, t) => ({
        m: a.m && c.m ? a.m.map((v, i) => lerp(v, c.m[i], t)) : (t < 0.5 ? a.m : c.m),
        o: lerp(a.o ?? 1, c.o ?? 1, t),
        clip: lerpClip(a.clip, c.clip, t),
      });
      if (introMode && b.intro && b.intro.length > 1) d = interp(b.intro, 'input', introInput, pick);
      else if (b.curve && b.curve.length) d = interp(b.curve, 's', P, pick);
      else continue;
      if (!d) continue;
      if (b.hasM) {
        const pre = (b.fix.x || b.fix.y) ? `translate(${b.fix.x.toFixed(2)}px, ${b.fix.y.toFixed(2)}px) ` : '';
        b.el.style.transform = d.m ? pre + fmtM(d.m) : (pre || (b.seedTransform ? 'translate(0px, 0px)' : ''));
      } else {
        const dd = interp(b.own, 's', introMode ? 0 : P, (a, c, t) => ({ dt: lerp(a.dt, c.dt, t), dl: lerp(a.dl, c.dl, t) }));
        if (dd && (Math.abs(dd.dt) > 0.05 || Math.abs(dd.dl) > 0.05)) {
          b.el.style.transform = `translate(${dd.dl.toFixed(2)}px, ${dd.dt.toFixed(2)}px)`;
        } else b.el.style.transform = b.seedTransform ? 'translate(0px, 0px)' : '';
      }
      if (b.moving.opacity || (b.restOpacity !== null && b.restOpacity !== 1)) b.el.style.opacity = String(Math.round(d.o * 1000) / 1000);
      if (d.clip && b.moving.clipPath) b.el.style.clipPath = d.clip;
      else if (b.restClip && !b.moving.clipPath && !b.el.style.clipPath) b.el.style.clipPath = b.restClip;
    }
    /* травели секцій (hero-пін, place-bg, footer-пін) — на обгортках */
    for (const [id, f] of Object.entries(travelOf)) {
      const w = wrappers[id];
      if (w) w.style.transform = `translateY(${f(P).toFixed(2)}px)`;
    }
  }
  /* boot-fix: у стані спокою міряємо фактичний bbox матричних цілей проти
     rest-семпла live і компенсуємо статичний зсув каркаса (батьки перші,
     заміри між фіксами — зсув батька рухає дітей) */
  function bootFix(introMode) {
    applyBindings(0, 0, introMode);
    const withM = bound.filter((b) => b.hasM);
    withM.forEach((b) => {
      b.depth = 0;
      let p = b.el.parentElement;
      while (p) { if (withM.some((x) => x.el === p)) b.depth++; p = p.parentElement; }
    });
    withM.sort((a, c) => a.depth - c.depth);
    for (const b of withM) {
      const rest = introMode && b.intro && b.intro.length > 1 ? b.intro[0] : (b.curve && b.curve[0]);
      if (!rest) continue;
      const r = b.el.getBoundingClientRect();
      const dy = rest.top - r.top, dx = rest.left - r.left;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        b.fix = { x: dx, y: dy };
        const cur = b.el.style.transform || '';
        b.el.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) ` + cur;
      }
    }
  }

  /* ---------- драйвер ---------- */
  if (!isDesktop) {
    /* mobile: нативний скрол, движок лише повторює криві */
    let lastP = -1;
    (function raf() {
      const P = window.scrollY || 0;
      if (Math.abs(P - lastP) > 0.3) { lastP = P; applyBindings(P, 0, false); }
      requestAnimationFrame(raf);
    })();
    bootFix(false);
    return;
  }

  /* desktop: віртуальний скрол — wheel перехоплено, позиція лерпиться
     у НАТИВНИЙ scrollTop (fixed-хедер живе, bbox-математика нативна);
     скролбар ховаємо, щоб не було ручного драга повз снап-движок */
  const st = document.createElement('style');
  st.textContent = 'html{scrollbar-width:none;}html::-webkit-scrollbar{display:none;width:0;}';
  document.head.appendChild(st);
  const setScroll = (v) => { document.documentElement.scrollTop = v; };

  const ladder = cfg.ladder || [0];
  const gate = cfg.introGate;
  let mode = gate ? 'intro' : 'scroll';
  let introTarget = 0, introShown = 0;
  let idx = 0, target = ladder[0], s = ladder[0];
  let travelling = false;

  addEventListener('wheel', (e) => {
    e.preventDefault();
    const dy = e.deltaY;
    if (mode === 'intro') {
      if (dy > 0) {
        introTarget += dy;
        if (introTarget >= gate.iEnd) {
          const overflow = introTarget - gate.iEnd;
          introTarget = gate.iEnd;
          mode = 'scroll';
          if (overflow > 30 && idx < ladder.length - 1) { idx++; target = ladder[idx]; travelling = true; }
        }
      }
      return;
    }
    if (travelling) return;
    if (Math.abs(dy) < 4) return;
    if (dy > 0 && idx < ladder.length - 1) { idx++; target = ladder[idx]; travelling = true; }
    else if (dy < 0 && idx > 0) { idx--; target = ladder[idx]; travelling = true; }
  }, { passive: false });

  /* дебаг-стан для проб (visual-sync/розкопки) */
  window.__ENGINE__ = () => ({ mode, s, target, idx, introTarget, introShown, scrollTop: document.documentElement.scrollTop, bodyH: document.body.scrollHeight });
  /* диф по всіх прив'язках (розкопки фікс-циклів) */
  window.__ENGINE_DIFF__ = () => bound.map((b) => {
    const r = b.el.getBoundingClientRect();
    return {
      sec: b.section, cls: (b.sig.cls || '').slice(0, 44),
      actualVp: Math.round(r.top), actualDoc: Math.round(r.top + document.documentElement.scrollTop),
      inline: (b.el.style.transform || '').slice(0, 44),
    };
  });

  (function raf() {
    let dirty = false;
    if (mode === 'intro' || introShown < gate?.iEnd - 0.5) {
      if (Math.abs(introTarget - introShown) > 0.3) {
        introShown = lerp(introShown, introTarget, 0.1);
        if (Math.abs(introTarget - introShown) < 0.3) introShown = introTarget;
        applyBindings(0, introShown, true);
        dirty = true;
      }
    }
    if (mode === 'scroll') {
      if (Math.abs(target - s) > 0.3) {
        s = lerp(s, target, 0.1);
        if (Math.abs(target - s) < 0.3) s = target;
        dirty = true;
      } else if (travelling) travelling = false;
      if (dirty || s !== target) {
        setScroll(s);
        applyBindings(s, gate ? gate.iEnd : 0, false);
      }
    }
    requestAnimationFrame(raf);
  })();
  bootFix(!!gate);
  console.log(`[engine] desktop: драбина ${ladder.length} снапів, iEnd=${gate ? gate.iEnd : '—'}`);
})();
