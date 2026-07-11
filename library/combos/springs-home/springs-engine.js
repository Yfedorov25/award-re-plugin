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
  /* z-БАБЛІНГ коренів (S11): travel-transform на обгортці створює
     stacking context і вбиває явний z кореня (split z:44 лишався ПІД
     hero, хоча в live вони сиблінги в одному шарі і split малюється
     поверх сітки на інтро). ТІЛЬКИ в introMode: на скрол-позах live
     тримає split ПОЗА кадром (top -911 на s900), а наш травел-пін
     з'їжджає на коліні релізу — глобальний z ламав s900 (1.57→89).
     Скрол-фаза split = S12 (травел-коліно релізу шару). */
  const introZ = {};
  for (const [id, w] of Object.entries(wrappers)) {
    const root = w.firstElementChild;
    if (!root) continue;
    const z = getComputedStyle(root).zIndex;
    if (z !== 'auto' && z !== '0') introZ[id] = z;
  }
  let introZApplied = null;
  const applyIntroZ = (on) => {
    if (introZApplied === on) return;
    introZApplied = on;
    for (const [id, z] of Object.entries(introZ)) {
      if (wrappers[id]) wrappers[id].style.zIndex = on ? z : '';
    }
  };
  /* ancestor-clip'и секцій (S9, choreo.sections[id].ancClip зі спеки):
     статичний CSS-clip живого (.sticky--under-next + .sticky--under-previous
     → inset(100svh 0 0)) ховає перші 100svh секції; корінь ТЕЧЕ з
     документом (clip-лінія статична в док-координатах), а шар піниться
     transform'ами повз неї — це і є вайп under-previous. На обгортці з
     травелом clip їде разом із transform → віднімаємо власний травел. */
  /* клип — ШИРОКИМ полігоном, не inset: бокс обгортки МЕНШИЙ за корінь
     (від'ємні маргіни тягнуть корінь вище top обгортки) — polygon приймає
     координати поза боксом і ріже ЛИШЕ над лінією */
  const ancClipPoly = (y) =>
    `polygon(-100000px ${y.toFixed(1)}px, 100000px ${y.toFixed(1)}px, 100000px 1000000px, -100000px 1000000px)`;
  const ancClipLocal = {};
  for (const [id, sec] of Object.entries(cfg.sections || {})) {
    const w = wrappers[id];
    if (!sec.ancClip || !w) continue;
    const wTop = w.getBoundingClientRect().top + (window.scrollY || 0);
    ancClipLocal[id] = sec.top0 + sec.ancClip.top - wTop;
    w.style.clipPath = ancClipPoly(ancClipLocal[id]);
  }
  /* слаби-підкладки фарби оболонок (S8a, choreo.shell зі shell-bg.json):
     фон секцій живе на предках ПОЗА коренем спеки (l-gallery-container
     ui-dark #162d24) — каркас білий. Слаб = ПЕРША дитина обгортки
     (успадковує травел обгортки, контент секції малюється поверх),
     top у doc-координатах ПІСЛЯ бут-корекції, h = bbox предка live. */
  /* S10: слаби — СТАТИЧНІ діви в док-координатах ПІД усіма обгортками
     (live: фарба на static-предках, ті не травелять і не кліпляться
     ancClip'ом секцій). Дедуп по (docTop,h,bg): спільний предок
     `section ui-dark` (h 28170, topRel -top0) = фон усієї сторінки,
     який per-wrapper слаби дублювали зі зсунутим top і НАКРИВАЛИ
     контент ранніх обгорток (слаб hero ховав gallery-split). */
  {
    const shellLayer = document.createElement('div');
    shellLayer.className = 'sk-shell-layer sk-vp-' + vpName;
    shellLayer.style.cssText = 'position:absolute;top:0;left:0;right:0;height:0;z-index:-1;pointer-events:none;';
    document.body.insertBefore(shellLayer, document.body.firstChild);
    const seen = new Set();
    for (const [id, sh] of Object.entries(cfg.shell || {})) {
      const sec = (cfg.sections || {})[id];
      if (!sec || !sh || sh.own) continue;
      const docTop = sec.top0 + (sh.topRel || 0);
      const key = `${Math.round(docTop)}|${sh.h}|${sh.bgc}|${sh.bgi || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const slab = document.createElement('div');
      slab.className = 'sk-shell-bg';
      slab.style.cssText = `position:absolute;left:0;right:0;top:${docTop.toFixed(1)}px;`
        + `height:${sh.h}px;background:${sh.bgc};${sh.bgi ? `background-image:${sh.bgi};` : ''}pointer-events:none;`;
      shellLayer.appendChild(slab);
    }
  }

  /* канвас-текстури (S9a, texture-map → choreo.textures): у live вміст
     малює WebGL-канвас (жінка wellness), наш канвас мертвий/прозорий —
     underlay-див з bg-асетом мобільного варіанта секції (закон 4) */
  for (const [id, tx] of Object.entries(cfg.textures || {})) {
    const w = wrappers[id];
    if (!w || !tx || !tx.asset) continue;
    for (const spec of tx.canvases || []) {
      const cls = (spec.canvasCls || '').split(/\s+/)[0];
      if (!cls) continue;
      /* канвас може жити в ІНШІЙ обгортці, ніж live-секція (спека ріже
         вкладені секції: js-nature-canvas у l-nature-bg = place-bg) —
         фолбек: пошук по всіх обгортках вʼюпорта */
      let cands = w.querySelectorAll('canvas.' + CSS.escape(cls));
      if (!cands.length) cands = document.querySelectorAll(`.sk-vp-${vpName} canvas.` + CSS.escape(cls));
      for (const c of cands) {
        const p = c.parentElement;
        if (!p || p.querySelector(':scope > .sk-canvas-tx')) continue;
        if (getComputedStyle(p).position === 'static') p.style.position = 'relative';
        if (tx.layers) {
          /* справжні webgl-шари live (S9a): простір текстур = бокс канваса
             1:1 (bg 2880×1800 = 2× канваса 1440×900) → 100%/100%, без
             реєстрації; color-шар ріжеться alpha-маскою live */
          for (const L of tx.layers) {
            const u = document.createElement('div');
            u.className = 'sk-canvas-tx';
            u.style.cssText = 'position:absolute;inset:0;pointer-events:none;'
              + 'background-image:url("' + L.src + '");background-repeat:no-repeat;'
              + 'background-size:100% 100%;'
              + (L.mask ? 'mask-image:url("' + L.mask + '");mask-size:100% 100%;mask-repeat:no-repeat;'
                + '-webkit-mask-image:url("' + L.mask + '");-webkit-mask-size:100% 100%;-webkit-mask-repeat:no-repeat;' : '');
            p.insertBefore(u, c);
          }
          continue;
        }
        const u = document.createElement('div');
        u.className = 'sk-canvas-tx';
        /* фреймінг з texture-fit (registration до live-шота): px відносно
           бокса канваса; без fit underlay не створюється (choreo фільтрує) */
        const f = tx.fit;
        const bgGeom = f
          ? 'background-size:' + f.sizePx[0] + 'px ' + f.sizePx[1] + 'px;background-position:' + f.posPx[0] + 'px ' + f.posPx[1] + 'px;'
          : 'background-size:cover;background-position:center;';
        u.style.cssText = 'position:absolute;inset:0;background-image:url("' + tx.asset + '");background-repeat:no-repeat;' + bgGeom + 'pointer-events:none;';
        p.insertBefore(u, c);
      }
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
  /* shell-фікс: хедер живого видимий у ВСІХ позах (live-shots), а каркас
     несе запечену o:0 (клас видимості додає рантайм живого) */
  for (const hdr of document.querySelectorAll('[data-sk-section="header"] > *')) {
    if (parseFloat(getComputedStyle(hdr).opacity) < 1) hdr.style.opacity = '1';
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
    /* text-сигнатура '<img …' = вміст noscript на живому (текст при
       увімкненому JS); в архіві JS-off noscript РОЗПАРСЕНИЙ → text
       порожній. Такий text не матчимо — скоримо по data-атрибутах. */
    const markupText = sig.text && sig.text.startsWith('<');
    const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (sig.text && !markupText && txt === sig.text) score += 3;
    else if (sig.text && !markupText && txt.startsWith(sig.text.slice(0, 15))) score += 1;
    if (markupText) {
      for (const a of sig.attrs || []) if (el.hasAttribute(a)) score += 1;
      /* скелет стріпає data-атрибути — структурний мінімум: усередині
         є img (решту вирішує rest-bbox метрика групи) */
      if (el.querySelector('img')) score += 1;
    }
    /* img src із live-карти (S6, пастка 26): єдиний надійний
       дискримінатор однакових picture-груп — вміст, не bbox.
       S8: розмірний суфікс НОРМАЛІЗУЄТЬСЯ (@xs/@xxl/%40xxxl → база):
       live mobile віддає @xs, скелет пече @xxl — те саме фото */
    if (sig.src) {
      const normSrc = (v) => (v || '').replace(/(%40|@)[a-z0-9-]+\./i, '.');
      const im = el.tagName.toLowerCase() === 'img' ? el : el.querySelector('img');
      const s = im && (im.currentSrc || im.src || im.getAttribute('data-src') || '');
      if (s && normSrc(s.split('?')[0].split('/').pop()) === normSrc(sig.src)) score += 4;
    }
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
        /* src у ключі (S6): пул кандидатів групи скориться сигнатурою
           ПЕРШОГО біндінга — без src у ключі два однакові picture з
           різним вмістом падають в одну групу і другий лишається
           без кандидата (його img відфільтровано чужим src) */
        const key = it.b.sig.tag + '|' + it.b.sig.cls + '|' + it.b.sig.text + '|' + (it.b.sig.src || '');
        (groups[key] = groups[key] || []).push(it);
      }
      for (const grp of Object.values(groups)) {
        const sig = grp[0].b.sig;
        /* body-псевдо-ціль (S7): тема сторінки — поза секційною обгорткою */
        if (sig.tag === 'body') {
          resolved[grp[0].i] = document.body;
          continue;
        }
        /* обгортка sk-vp — інфраструктура сцени, НЕ кандидат резолва:
           безіменна сигнатура (без cls/text) проходила фільтр і сідала
           вербатим-матрицею на обгортку (nature стискався scale 0.1438,
           clip-лінія ancClip скейлилась — розкопка S9) */
        const cands = [...wrap.querySelectorAll(sig.tag)]
          .filter((el) => el.tagName.toLowerCase() === sig.tag && !used.has(el))
          .map((el) => ({ el, score: candScore(el, sig) }))
          .filter((x) => x.score > 0.5 || (!sig.cls && !sig.text));
        const maxScore = Math.max(...cands.map((x) => x.score), 0);
        const good = cands.filter((x) => x.score >= maxScore - 0.3);
        /* щільна група (біндінгів ≥ половини кандидатів — набори майже
           збігаються): ДОК-ПОРЯДОК структурно правильний. Розріджена
           (live взяв кілька з багатьох, напр. 3 parallax-img з 20 lazy):
           найближчий НЕЙТРАЛІЗОВАНИЙ rest-bbox (мінус власний transform;
           без transform нейтралізація неможлива — зсув у матриці батька,
           тому щільним групам proximity бреше — розкопки іт.13-15) */
        {
          const sc0 = window.scrollY || 0;
          /* нейтралізація повної матриці (S6, пастка 26): scale навколо
             центру + translate (раніше лише translate — два однакові
             parallax-img з rest scale 1.2 не розрізнялись, і криву
             отримував чужий кандидат). Ротації (b,c≠0) — лише translate,
             без розмірного терму (bbox ротації не інвертується так). */
          const neut = (top, left, w, h, m) => {
            if (!m) return { top, left, w, h, sized: true };
            const rot = Math.abs(m[1]) > 0.02 || Math.abs(m[2]) > 0.02;
            if (rot) return { top: top - m[5], left: left - m[4], w, h, sized: false };
            const w0 = m[0] ? w / m[0] : w, h0 = m[3] ? h / m[3] : h;
            const cx0 = left + w / 2 - m[4], cy0 = top + h / 2 - m[5];
            return { top: cy0 - h0 / 2, left: cx0 - w0 / 2, w: w0, h: h0, sized: true };
          };
          const parseM = (tr) => {
            const nums = tr && tr !== 'none' && tr.startsWith('matrix(')
              ? tr.slice(7, -1).split(',').map(Number) : null;
            return nums && nums.length === 6 ? nums : null;
          };
          const rects = good.map((x) => {
            const r = x.el.getBoundingClientRect();
            return neut(r.top + sc0, r.left, r.width, r.height, parseM(getComputedStyle(x.el).transform));
          });
          const freeIdx = new Set(good.map((_, i) => i));
          for (const it of grp) {
            const raw = (it.b.intro && it.b.intro[0]) || (it.b.curve && it.b.curve[0]);
            const rest = raw && neut(raw.top, raw.left, raw.w, raw.h, raw.m);
            let pick = null, best = Infinity;
            for (const i of freeIdx) {
              let d;
              if (!rest) d = i;
              else {
                d = Math.abs(rects[i].top - rest.top) + Math.abs(rects[i].left - rest.left);
                if (rest.sized && rects[i].sized && rest.w > 0 && rects[i].w > 0) {
                  d += Math.abs(rects[i].w - rest.w) + Math.abs(rects[i].h - rest.h);
                }
              }
              if (d < best) { best = d; pick = i; }
            }
            if (pick !== null) { resolved[it.i] = good[pick].el; used.add(good[pick].el); freeIdx.delete(pick); }
          }
        }
      }
    }
    window.__ENGINE_UNRESOLVED__ = (cfg.bindings || [])
      .map((b, i) => (!resolved[i] ? { sec: b.section, sig: b.sig } : null))
      .filter(Boolean);
    (cfg.bindings || []).forEach((b, i) => {
      const el = resolved[i];
      if (!el) { unresolved++; return; }
      for (const a of b.sig.attrs || []) if (!el.hasAttribute(a)) el.setAttribute(a, '');
      bound.push({ ...b, el });
    });
  }
  console.log(`[engine] ${vpName}: прив'язано ${bound.length}/${(cfg.bindings || []).length} (нерозв'язано ${unresolved})`);

  /* steady-нормалізація незабіндьованих (та сама філософія, що
     NORMALIZE_CSS гейтів): [data-reveal]-заглушки o≈0 запечені з
     архіву, а живий у спокої показує контент; анімовані елементи
     мають біндінги і керуються кривими — решту з o≈0 піднімаємо */
  {
    const boundEls = new Set(bound.map((b) => b.el));
    const secIds = new Set(bound.map((b) => b.section));
    for (const id of secIds) {
      const w = wrappers[id];
      if (!w) continue;
      for (const el of w.querySelectorAll('picture, img, h1, h2, h3, p, [class*="__title"], [class*="caption"]')) {
        if (boundEls.has(el)) continue;
        if (parseFloat(getComputedStyle(el).opacity) <= 0.05) el.style.opacity = '1';
      }
    }
  }

  /* ---------- кадр: ГІБРИД (S3, ітерація 7) ----------
     1) Цілі З live-матрицями: ВЕРБАТИМ-повтор матриці (hero content —
        ротація ~28°, тільки так відтворюється) + одноразовий boot-fix
        статичного зсуву каркаса (виміряний, не ручний).
     2) Цілі БЕЗ матриць, чий bbox їде не потоком (sticky-піни,
        background): bbox-delta translate від naturals.
     transform-origin не чіпаємо (запечений зі спеки = live). */
  const bootScroll2 = window.scrollY || 0;
  /* Класифікація (розкопки іт.6-8):
     - shape-матриця (ротація/скейл — лінійна частина не одинична):
       ВЕРБАТИМ повтор + boot-fix статики каркаса.
     - чистий translate УСЕРЕДИНІ shape-предка (елементи каруселі в
       ротованому content): вербатим у ЛОКАЛЬНИХ координатах (екранна
       bbox-дельта в ротованому базисі бреше).
     - решта муверів: bbox-delta translate (сам поглинає статику каркаса),
       з відніманням динаміки найближчого власного предка (щоб пін
       батька не подвоювався в дитині). */
  const shapeM = (m) => m && (Math.abs(m[0] - 1) > 0.02 || Math.abs(m[3] - 1) > 0.02 || Math.abs(m[1]) > 0.02 || Math.abs(m[2]) > 0.02);
  for (const b of bound) {
    /* body: willChange:transform зробив би body containing block'ом
       для fixed (хедер їхав зі сторінкою) — body поза геометрією */
    if (b.sig.tag !== 'body') b.el.style.willChange = 'transform';
    b.hasM = (b.curve || []).some((x) => shapeM(x.m)) || (b.intro || []).some((x) => shapeM(x.m));
    const r = b.el.getBoundingClientRect();
    b.nat = { top: r.top + bootScroll2, left: r.left };
    b.fix = { x: 0, y: 0 };
  }
  for (const b of bound) {
    b.anc = null;
    let p = b.el.parentElement;
    while (p && !b.anc) {
      /* body — bg-псевдоціль (S7) ПОЗА геометрією: у live body стоїть
         (top=0 завжди, віртуальний скрол), тож формула dt=top+s−nat−dev
         фабрикує йому фіктивний рух s−dev(s) — як ancOwn він труїв
         ВСІ корені −(s−dev) (S8-розкопка: s2969 2.08%→77%) */
      const hit = bound.find((x) => x !== b && x.el === p && x.sig.tag !== 'body');
      if (hit) b.anc = hit;
      p = p.parentElement;
    }
    b.inShape = false;
    let a = b.anc;
    while (a) { if (a.hasM) { b.inShape = true; break; } a = a.anc; }
  }
  function buildOwn() {
    const sc = window.scrollY || 0;
    for (const b of bound) {
      /* body: жодної own-геометрії (bg-only, див. коментар в anc-скані) */
      if (b.hasM || b.inShape || b.sig.tag === 'body') continue;
      /* fixed-обгортка (header у scene.css): елементи живуть у
         VIEWPORT-просторі — без +x.s і без scrollY у nat (S6) */
      const wrapEl = wrappers[b.section];
      b.fixedSpace = !!wrapEl && getComputedStyle(wrapEl).position === 'fixed';
      const r = b.el.getBoundingClientRect();
      b.nat = { top: r.top + (b.fixedSpace ? 0 : sc), left: r.left, w: r.width, h: r.height };
      /* fixed-контейнер зі змінною live-висотою (компакт-хедер 100→70):
         height реплеїться напряму, scale тут зіпсував би дітей */
      {
        const hs = (b.curve || []).map((x) => x.h).filter((v) => v > 0);
        b.setH = b.fixedSpace && hs.length > 1 && Math.max(...hs) - Math.min(...hs) > 5;
        /* КОНСТАНТНА live-висота ≠ каркасній (S8: header__left 24 vs 44 —
           рантайм live стискає лого одразу на буті, архів цього не знає):
           steady-h один раз; nat переміряється після — умова гасне сама */
        if (b.fixedSpace && !b.setH && hs.length > 1
          && Math.abs(hs[0] - b.nat.h) > 5) {
          b.el.style.height = `${hs[0].toFixed(1)}px`;
        }
      }
      const dev = travelOf[b.section] || (() => 0);
      /* дельти ПО ЦЕНТРУ (для sw=1 тотожно top-left): дозволяє scale
         з дефолтним origin 50% 50% (спани-кружечки wellness пульсують
         розміром без матриці — w/h кривої) */
      const cx = b.nat.left + b.nat.w / 2, cy = b.nat.top + b.nat.h / 2;
      const mk = (x, sKey) => {
        const sw = b.nat.w > 1 && x.w > 0 ? x.w / b.nat.w : 1;
        const sh = b.nat.h > 1 && x.h > 0 ? x.h / b.nat.h : 1;
        const scaled = !b.setH && (Math.abs(sw - 1) > 0.05 || Math.abs(sh - 1) > 0.05);
        const addS = sKey === 's' && !b.fixedSpace ? x.s : 0;
        const devS = sKey === 's' && !b.fixedSpace ? dev(x.s) : 0;
        /* центр-анкер ЛИШЕ при реальному scale (спани-кружечки):
           при статичній різниці розмірів центр ≠ top-left і зсуває */
        return scaled
          ? { [sKey]: x[sKey], dt: (x.top + x.h / 2) + addS - cy - devS, dl: (x.left + x.w / 2) - cx, sw, sh }
          : { [sKey]: x[sKey], dt: x.top + addS - b.nat.top - devS, dl: x.left - b.nat.left, sw: 1, sh: 1, h: b.setH ? x.h : undefined };
      };
      b.own = (b.curve || []).map((x) => mk(x, 's'));
      if (b.intro && b.intro.length > 1) {
        b.ownIntro = b.intro.map((x) => mk(x, 'input'));
      }
      /* найближчий власний (own) предок — його динаміка віднімається */
      b.ancOwn = null;
      let a = b.anc;
      while (a) { if (!a.hasM && !a.inShape) { b.ancOwn = a; break; } a = a.anc; }
    }
  }
  const fmtM = (m) => `matrix(${m.map((v) => Math.round(v * 10000) / 10000).join(',')})`;
  function applyBindings(P, introInput, introMode) {
    applyIntroZ(!!introMode);
    for (const b of bound) {
      let d;
      /* m=null у кривій = transform:'none' живого = ІДЕНТИЧНІСТЬ —
         інтерполюємо крізь неї (паралакс scale 1.1 з дірами 'none'
         інакше випадав і губив скейл на half-точках) */
      const IDM = [1, 0, 0, 1, 0, 0];
      const lerpColor = (a, c, t) => {
        if (!a) return c; if (!c || a === c) return a;
        const na = numsOf(a), nc = numsOf(c);
        if (na.length !== nc.length) return t < 0.5 ? a : c;
        let i = 0;
        return a.replace(/-?\d*\.?\d+/g, () => String(Math.round(lerp(na[i], nc[i++], t) * 100) / 100));
      };
      const pick = (a, c, t) => ({
        m: (a.m || c.m) ? (a.m || IDM).map((v, i) => lerp(v, (c.m || IDM)[i], t)) : null,
        o: lerp(a.o ?? 1, c.o ?? 1, t),
        clip: lerpClip(a.clip, c.clip, t),
        bg: lerpColor(a.bg, c.bg, t),
      });
      /* геометричний reveal-латч (виняток 6): потік + o-ступінь по
         входу у вʼюпорт; transform/clip не застосовуються */
      if (b.revealGeom) {
        if (b.sAt === undefined) {
          const r = b.el.getBoundingClientRect();
          b.sAt = r.top + document.documentElement.scrollTop - innerHeight + 40;
        }
        b.el.style.transform = '';
        b.el.style.opacity = (introMode ? 0 : P) >= b.sAt ? '1' : '0';
        continue;
      }
      if (introMode && b.intro && b.intro.length > 1) d = interp(b.intro, 'input', introInput, pick);
      else if (b.curve && b.curve.length) d = interp(b.curve, 's', P, pick);
      else continue;
      if (!d) continue;
      /* body: ЛИШЕ фон (тема ui-dark/ui-light) — transform на body
         зсунув би всю сторінку */
      if (b.sig.tag === 'body') {
        if (d.bg && b.moving.bg) b.el.style.backgroundColor = d.bg;
        continue;
      }
      if (b.hasM || b.inShape) {
        const pre = (b.fix.x || b.fix.y) ? `translate(${b.fix.x.toFixed(2)}px, ${b.fix.y.toFixed(2)}px) ` : '';
        b.el.style.transform = d.m ? pre + fmtM(d.m) : (pre || (b.seedTransform ? 'translate(0px, 0px)' : ''));
      } else {
        const dpick = (a, c, t) => ({ dt: lerp(a.dt, c.dt, t), dl: lerp(a.dl, c.dl, t), sw: lerp(a.sw ?? 1, c.sw ?? 1, t), sh: lerp(a.sh ?? 1, c.sh ?? 1, t), h: a.h != null && c.h != null ? lerp(a.h, c.h, t) : undefined });
        let dd = (introMode && b.ownIntro)
          ? interp(b.ownIntro, 'input', introInput, dpick)
          : (b.own && b.own.length ? interp(b.own, 's', introMode ? 0 : P, dpick) : null);
        /* мінус динаміка власного предка (пін батька вже рухає дитину).
           S7: у ТОМУ Ж режимі, що й dd — раніше introMode пропускав
           віднімання, тож boot-стан (introMode=true) мав ПОДВІЙНИЙ зсув
           (layer + div по -3600), bootFix запікав хибний fix у дітей-
           матриць (opening-2 їхав на +3600 на скрол-позах) */
        if (dd && b.ancOwn) {
          const anc = b.ancOwn;
          const ad = (introMode && anc.ownIntro)
            ? interp(anc.ownIntro, 'input', introInput, dpick)
            : (anc.own && anc.own.length ? interp(anc.own, 's', introMode ? 0 : P, dpick) : null);
          if (ad) dd = { ...dd, dt: dd.dt - ad.dt, dl: dd.dl - ad.dl };
        }
        const hasScale = dd && (Math.abs(dd.sw - 1) > 0.03 || Math.abs(dd.sh - 1) > 0.03);
        if (dd && (Math.abs(dd.dt) > 0.05 || Math.abs(dd.dl) > 0.05 || hasScale)) {
          b.el.style.transform = `translate(${dd.dl.toFixed(2)}px, ${dd.dt.toFixed(2)}px)` + (hasScale ? ` scale(${dd.sw.toFixed(4)}, ${dd.sh.toFixed(4)})` : '');
        } else b.el.style.transform = b.seedTransform ? 'translate(0px, 0px)' : '';
        if (b.setH && dd && dd.h > 0) b.el.style.height = `${dd.h.toFixed(1)}px`;
      }
      /* inline opacity ЗАВЖДИ, де є live-значення: каркас (архів JS-off)
         має запечені o:0 у місцях, де живий рантайм показує (hero-галерея) */
      if (b.restOpacity !== null && Number.isFinite(d.o)) b.el.style.opacity = String(Math.round(d.o * 1000) / 1000);
      if (d.bg && b.moving && b.moving.bg) b.el.style.backgroundColor = d.bg;
      if (b.clipStep && !(introMode && d.clip)) {
        /* clip-вайп: степ по live-тригеру sOpen (перший осілий семпл
           з фінальним clip — S6; DOM-геометрія бреше для фулскрін-
           слайдів пінованого шару: nat.top=0 → «відкрито з s=0»).
           S10: в introMode інтро-clip-крива (морф сплита) пріоритетніша
           за скрол-фазовий степ */
        if (b.sAtGeom === undefined) {
          const r = b.el.getBoundingClientRect();
          b.sAtGeom = r.top + document.documentElement.scrollTop - innerHeight + 40;
        }
        const trig = b.clipStep.sOpen != null ? b.clipStep.sOpen - 1 : b.sAtGeom;
        const open = (introMode ? 0 : P) >= trig;
        b.el.style.clipPath = (open ? b.clipStep.open : b.clipStep.closed) || '';
      } else if (d.clip && b.moving.clipPath) b.el.style.clipPath = d.clip;
      else if (b.restClip && !b.moving.clipPath && !b.el.style.clipPath) b.el.style.clipPath = b.restClip;
    }
    /* TIMED-кроки (S8b): фінальні стани часових переходів (вайпи/свапи
       слайдера при стоячому одометрі) — ПІСЛЯ s-кривих, бо s-криві цих
       цілей контаміновані (пастка 23-стиль). Крок у бакеті: ?step=K
       (пікс-гейт) або останній прибулий (реальний скрол). */
    for (const b of bound) {
      if (!b.timed || introMode) continue;
      const arrived = b.timed.filter((x) => x.s <= P + 60);
      if (!arrived.length) {
        /* до першого приходу: якщо ціль існує лише в timed (curve
           порожня), лишаємо каркасний стан — нічого не робимо */
        continue;
      }
      const last = arrived[arrived.length - 1];
      const bucket = arrived.filter((x) => Math.abs(x.s - last.s) <= 120);
      let pick = last;
      const poseStep = window.__POSE_STEP__ ?? null;
      if (poseStep !== null && Number.isFinite(poseStep)) {
        const want = Math.min(poseStep, bucket.length - 1);
        pick = bucket.find((x) => x.step === want) || bucket[Math.min(want, bucket.length - 1)] || last;
      }
      const f = pick.final;
      if (f.disp === 'none') b.el.style.display = 'none';
      else if (f.disp === 'visible') {
        b.el.style.display = 'block';
        /* каркас ховає слайд через display:none на ПРЕДКУ (is-hidden
           обгортка слайда) — розховуємо ланцюг у межах обгортки секції */
        let p = b.el.parentElement, hops = 0;
        while (p && hops < 4 && !p.dataset?.skSection) {
          if (getComputedStyle(p).display === 'none') p.style.display = 'block';
          p = p.parentElement; hops++;
        }
      }
      if (Number.isFinite(f.o)) b.el.style.opacity = String(f.o);
      if (f.clip) b.el.style.clipPath = f.clip;
      else if (f.clip === null && f.disp) b.el.style.clipPath = '';
    }
    /* травели секцій (hero-пін, place-bg, footer-пін) — на обгортках */
    for (const [id, f] of Object.entries(travelOf)) {
      const w = wrappers[id];
      if (!w) continue;
      const T = f(P);
      w.style.transform = `translateY(${T.toFixed(2)}px)`;
      /* ancClip: клип-лінія статична в доці, transform тягне її з собою */
      if (ancClipLocal[id] !== undefined) {
        w.style.clipPath = ancClipPoly(ancClipLocal[id] - T);
      }
    }
  }
  /* boot-fix: у стані спокою міряємо фактичний bbox матричних цілей проти
     rest-семпла live і компенсуємо статичний зсув каркаса (батьки перші,
     заміри між фіксами — зсув батька рухає дітей) */
  function bootFix(introMode) {
    buildOwn();
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
    const qm = new URLSearchParams(location.search);
    if (qm.has('step')) window.__POSE_STEP__ = parseInt(qm.get('step'), 10);
    if (qm.has('s')) window.scrollTo(0, parseFloat(qm.get('s')) || 0);
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
  /* S8b: крок timed-бакета для пікс-поз (?step=K); null = останній прибулий */
  window.__POSE_STEP__ = null;

  /* снап-крок комітиться ПІСЛЯ КІНЦЯ wheel-burst (140мс тиші) — так
     працює живий Lethargy: травел стартує по завершенню жесту
     (розкопка іт.12: старт з першої події з'їдав середину кривої) */
  let burstAcc = 0, burstTimer = null;
  const commitBurst = () => {
    burstTimer = null;
    const dy = burstAcc;
    burstAcc = 0;
    if (travelling || Math.abs(dy) < 4) return;
    if (dy > 0 && idx < ladder.length - 1) { idx++; target = ladder[idx]; travelling = true; }
    else if (dy < 0 && idx > 0) { idx--; target = ladder[idx]; travelling = true; }
  };
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
          if (overflow > 30) { burstAcc = overflow; if (!burstTimer) burstTimer = setTimeout(commitBurst, 140); }
        }
      }
      return;
    }
    if (travelling) return;
    burstAcc += dy;
    clearTimeout(burstTimer);
    burstTimer = setTimeout(commitBurst, 140);
  }, { passive: false });

  /* дебаг-стан для проб (visual-sync/розкопки) */
  window.__ENGINE__ = () => ({ mode, s, target, idx, introTarget, introShown, scrollTop: document.documentElement.scrollTop, bodyH: document.body.scrollHeight });
  /* стан біндінгів для розкопок (nat, scale-точки, латчі) */
  window.__ENGINE_BINDINGS__ = (secFilter) => bound
    .filter((b) => !secFilter || b.section === secFilter)
    .map((b) => ({
      sec: b.section, cls: (b.sig.cls || '').slice(0, 44), src: b.sig.src,
      nat: b.nat, hasM: b.hasM, inShape: b.inShape, fix: b.fix,
      ancOwn: b.ancOwn ? (b.ancOwn.sig.cls || '').slice(0, 30) : null,
      scaledPts: (b.own || []).filter((p) => p.sw !== 1 || p.sh !== 1).length,
      ownPts: (b.own || []).length,
      ownHi: (b.own || []).filter((p) => p.s > 4300 && p.s < 4600).slice(0, 3),
      sAt: b.sAt, sAtGeom: b.sAtGeom, clipStep: b.clipStep || null,
      revealGeom: b.revealGeom || false,
    }));
  /* розкопка S8: розкладка dd на компоненти на довільному P */
  window.__ENGINE_OWN__ = (P) => bound.map((b) => {
    const dpick = (a, c, t) => ({ dt: lerp(a.dt, c.dt, t), dl: lerp(a.dl, c.dl, t) });
    const dd = b.own && b.own.length ? interp(b.own, 's', P, dpick) : null;
    const anc = b.ancOwn;
    const ad = anc && anc.own && anc.own.length ? interp(anc.own, 's', P, dpick) : null;
    return {
      sec: b.section, cls: (b.sig.cls || b.sig.tag).slice(0, 40),
      nat: b.nat ? { t: Math.round(b.nat.top), l: Math.round(b.nat.left) } : null,
      dd: dd ? Math.round(dd.dt * 10) / 10 : null,
      ancCls: anc ? (anc.sig.cls || anc.sig.tag).slice(0, 25) : null,
      ad: ad ? Math.round(ad.dt * 10) / 10 : null,
      hasM: b.hasM, inShape: b.inShape,
    };
  });
  /* диф по всіх прив'язках (розкопки фікс-циклів) */
  window.__ENGINE_DIFF__ = () => bound.map((b) => {
    const r = b.el.getBoundingClientRect();
    return {
      sec: b.section, cls: (b.sig.cls || '').slice(0, 44),
      actualVp: Math.round(r.top), actualDoc: Math.round(r.top + document.documentElement.scrollTop),
      inline: (b.el.style.transform || '').slice(0, 44),
    };
  });

  /* лерп У WALL-TIME (0.1 на кадр 60fps): rAF без тротлінга (headless,
     120Hz-екрани) інакше пролітає травел миттєво — розкопка іт.11 */
  let lastT = performance.now();
  (function raf(now) {
    const dtMs = Math.min(100, (now || performance.now()) - lastT);
    lastT = now || performance.now();
    const k = 1 - Math.pow(0.9, dtMs / 16.67);
    let dirty = false;
    if (mode === 'intro' || introShown < gate?.iEnd - 0.5) {
      if (Math.abs(introTarget - introShown) > 0.3) {
        introShown = lerp(introShown, introTarget, k);
        if (Math.abs(introTarget - introShown) < 0.3) introShown = introTarget;
        applyBindings(0, introShown, true);
        dirty = true;
      }
    }
    if (mode === 'scroll') {
      if (Math.abs(target - s) > 0.3) {
        s = lerp(s, target, k);
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
  /* детермінована ПОЗА для піксельної звірки (VISUAL-GATE):
     ?s=N — скрол-стан (та сама поза, що дає движок на цьому s),
     ?intro=I — інтро-стан hero по cumulative input */
  {
    const q = new URLSearchParams(location.search);
    if (q.has('s')) {
      const S = parseFloat(q.get('s')) || 0;
      if (q.has('step')) window.__POSE_STEP__ = parseInt(q.get('step'), 10);
      mode = 'scroll';
      introTarget = introShown = gate ? gate.iEnd : 0;
      idx = ladder.reduce((bi, v, i2) => (Math.abs(v - S) < Math.abs(ladder[bi] - S) ? i2 : bi), 0);
      s = target = S;
      setScroll(S);
      applyBindings(S, gate ? gate.iEnd : 0, false);
    } else if (q.has('intro') && gate) {
      const I = Math.min(parseFloat(q.get('intro')) || 0, gate.iEnd);
      introTarget = introShown = I;
      applyBindings(0, I, true);
    }
  }
  console.log(`[engine] desktop: драбина ${ladder.length} снапів, iEnd=${gate ? gate.iEnd : '—'}`);
})();
