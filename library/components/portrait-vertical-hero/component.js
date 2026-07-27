/* ============================================================
   PORTRAIT-VERTICAL-HERO · component.js  (vanilla + GSAP 3.12.5
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   A composed PORTRAIT 9:16 hero PLATE — the editorial vertical hero for mobile-first /
   portrait-render sites. ONE create() call builds, from data, a centred portrait plate: a
   9:16 framed render (object-fit cover, the hero subject) inside a thin coords/meta frame,
   an EYEBROW above, a SERIF TITLE, and a small bottom META row. On enter the whole plate
   SETTLES (scale 1.04 -> 1 + opacity 0 -> 1) and the type STAGGERS in (eyebrow -> title ->
   meta), each rising opacity + translateY. The plate is self-contained — the host may pin it
   or not (owns_pin false). The most 'section-like' of the portrait family, but still a single
   reusable atom.

   THE MOVE:
     - one settle on enter: the plate transform scale 1.04 -> 1 + opacity 0 -> 1, power3.out.
     - the type staggers in under it: eyebrow, title, meta each opacity 0 -> 1 +
       translateY ~22px -> 0, offset by revealStagger seconds.
     - set(p 0..1) is a PURE reversible function of progress (settle + stagger eased windows),
       no side effects beyond transform/opacity; play() runs the timed reveal once.

   CONFIG-DRIVEN (DATA, builds its own DOM):
     PortraitVerticalHero.create(target, {            // target = an empty mount element
       media:'renders/day-34-portrait.webp',
       eyebrow:'QUADRO',
       title:'Дім, що дивиться на воду',
       meta:['Над річкою','9:16'],                    // string[] | string
       ratio:'9/16', revealStagger:0.1, enterScale:1.04,
       autoplay:true, manageLenis:true
     })

   DECODE-GUARD: the render is decoded (img.decode()) BEFORE the plate is revealed — a hidden
   <img> does not decode, so revealing an undecoded image = black flicker. We hold the plate
   hidden until decode resolves, then settle.

   ENGINE LAWS: transform scale/translateY + opacity only (NO width/height/top/left/margin);
   GPU; NO mix-blend / NO backdrop / NO WebGL / NO canvas; reduced-motion -> static composed
   plate (everything shown, no motion). will-change cleared after the one-shot. Sets
   window.__LAB_OK__ once wired + the render surface painted.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function el(tag, cls) { var n = doc.createElement(tag); if (cls) n.className = cls; return n; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  // eased reveal window for a stagger child: maps global p through [s, s+len] -> 0..1, power3.out
  function win(p, s, len) {
    var t = clamp01((p - s) / len);
    return 1 - Math.pow(1 - t, 3);
  }

  function create(target, options) {
    options = options || {};
    var opt = {
      media: options.media || '',
      eyebrow: options.eyebrow || '',
      title: options.title || '',
      meta: options.meta != null ? options.meta : [],
      ratio: options.ratio || '9/16',
      revealStagger: options.revealStagger != null ? options.revealStagger : 0.1,
      enterScale: options.enterScale != null ? options.enterScale : 1.04,
      autoplay: options.autoplay !== false,
      manageLenis: options.manageLenis !== false
    };
    var mount = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!mount) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var metaItems = Array.isArray(opt.meta) ? opt.meta : (opt.meta ? [opt.meta] : []);

    // ---- build the composed plate (data -> DOM) ----
    mount.classList.add('pvh-stage');
    var plate = el('div', 'pvh-plate');
    plate.style.setProperty('--pvh-ratio', opt.ratio.replace('/', ' / '));

    var figure = el('figure', 'pvh-figure');
    var frame = el('div', 'pvh-frame');
    var img = el('img', 'pvh-img');
    img.alt = opt.title || '';
    img.decoding = 'async';
    frame.appendChild(img);
    // thin coords / meta frame corners (pure stroke chrome, decorative)
    var chrome = el('div', 'pvh-chrome');
    chrome.setAttribute('aria-hidden', 'true');
    chrome.innerHTML = '<span class="pvh-corner pvh-corner--tl"></span><span class="pvh-corner pvh-corner--tr"></span><span class="pvh-corner pvh-corner--bl"></span><span class="pvh-corner pvh-corner--br"></span>';
    figure.appendChild(frame);
    figure.appendChild(chrome);

    var type = el('div', 'pvh-type');
    var eyebrow = el('p', 'pvh-eyebrow'); eyebrow.textContent = opt.eyebrow;
    var title = el('h1', 'pvh-title'); title.textContent = opt.title;
    var metaRow = el('div', 'pvh-meta');
    metaItems.forEach(function (m, i) {
      if (i) { var dot = el('span', 'pvh-meta-dot'); dot.setAttribute('aria-hidden', 'true'); metaRow.appendChild(dot); }
      var span = el('span', 'pvh-meta-item'); span.textContent = m; metaRow.appendChild(span);
    });
    type.appendChild(eyebrow);
    type.appendChild(title);
    if (metaItems.length) type.appendChild(metaRow);

    plate.appendChild(figure);
    plate.appendChild(type);
    mount.appendChild(plate);

    // the staggered children, in reveal order
    var kids = [eyebrow, title].concat(metaItems.length ? [metaRow] : []);

    var gsap = global.gsap, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // PURE set(p): p 0..1 drives the whole composed reveal (plate settle + type stagger).
    // reversible, no side effects beyond transform/opacity.
    function set(p) {
      p = clamp01(p);
      var ps = win(p, 0, 0.6); // plate settle finishes by ~0.6 of the timeline
      var sc = opt.enterScale + ps * (1 - opt.enterScale);
      plate.style.opacity = ps.toFixed(3);
      plate.style.transform = 'scale(' + sc.toFixed(4) + ')';
      // type staggers under the plate
      var startBase = 0.18, step = 0.16, dur = 0.5;
      kids.forEach(function (k, i) {
        var kp = win(p, startBase + i * step, dur);
        k.style.opacity = kp.toFixed(3);
        k.style.transform = 'translateY(' + ((1 - kp) * 22).toFixed(1) + 'px)';
      });
    }

    function showStatic() {
      plate.style.opacity = '1';
      plate.style.transform = 'none';
      plate.style.willChange = 'auto';
      kids.forEach(function (k) { k.style.opacity = '1'; k.style.transform = 'none'; k.style.willChange = 'auto'; });
    }
    function clearWillChange() {
      plate.style.willChange = 'auto';
      kids.forEach(function (k) { k.style.willChange = 'auto'; });
    }

    // DECODE-GUARD: never reveal an undecoded image. Decode first, then paint + reveal.
    var painted = false;
    function markPainted() {
      if (painted) return; painted = true;
      mount.classList.add('pvh-painted');
      try { global.__LAB_OK__ = true; } catch (e) {}
    }
    function forceDecode() {
      if (!opt.media) return Promise.resolve();
      img.src = opt.media;
      if (img.decode) return img.decode().catch(function () {});
      return new Promise(function (res) {
        if (img.complete) return res();
        img.onload = function () { res(); };
        img.onerror = function () { res(); };
      });
    }

    var lenis = null;
    var tween = null;

    function play() {
      if (reduced || !gsap) { showStatic(); return; }
      plate.style.willChange = 'transform, opacity';
      kids.forEach(function (k) { k.style.willChange = 'transform, opacity'; });
      var obj = { p: 0 };
      set(0);
      tween = gsap.to(obj, {
        p: 1, duration: 1.1 + opt.revealStagger * 4, ease: 'none',
        onUpdate: function () { set(obj.p); },
        onComplete: function () { set(1); clearWillChange(); }
      });
    }

    // hold hidden until the render is decoded, then reveal
    set(0);
    forceDecode().then(function () {
      markPainted();
      if (reduced || !gsap) { showStatic(); return; }
      if (gsap && opt.manageLenis && Lenis && !global.__lenis) {
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
        global.__lenis = lenis;
      }
      if (opt.autoplay) play(); else set(1);
    });

    mount.classList.add('pvh-ready');

    return {
      el: mount, plate: plate, img: img,
      set: set,
      play: play,
      destroy: function () {
        if (tween) tween.kill();
        if (lenis) { lenis.destroy(); if (global.__lenis === lenis) global.__lenis = null; }
        mount.classList.remove('pvh-ready', 'pvh-painted');
        plate.parentNode && plate.parentNode.removeChild(plate);
      }
    };
  }

  var api = { create: create };
  global.PortraitVerticalHero = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
