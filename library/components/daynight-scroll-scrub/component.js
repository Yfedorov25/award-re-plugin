/* ============================================================
   DAYNIGHT-SCROLL-SCRUB · component.js  (vanilla, GSAP + ScrollTrigger required)
   ------------------------------------------------------------
   V2 of the day↔night family — the NAHIRNA dialect. Day dissolves to night as you
   scroll a PINNED hero (~110% of viewport-height of scroll = the full day→night
   dissolve). A warm window-glow rises with the dusk and a legibility scrim deepens
   so the caption stays readable as the frame darkens.

   THIS IS NOT A NEW ENGINE. It drives the CANON (window.DayNight) with
   mode:"scrub", reveal:"opacity", glow:true, scrim:0.5 — exactly the three layers
   from the real seed (apps/nahirna/components/sections/00-Hero.tsx):
     tl.fromTo(".hero-night-still",{opacity:0},{opacity:1,ease:"none"},0);  // night
     tl.fromTo(".hero-glow",{opacity:0},{opacity:1,ease:"power1.in"},0);    // glow  (engine: glow)
     tl.fromTo(".hero-day-scrim",{opacity:1},{opacity:0.35,ease:"none"},0); // scrim (engine: scrim)
   The canon's armScrub() builds the pinned ScrollTrigger and writes set(progress);
   the engine already ramps night opacity, glow opacity and scrim opacity off that
   single t — so this variation adds NO scroll machinery of its own.

   WHAT THE VARIATION ADDS OVER THE CANON (the chrome, the Nahirna caption layering):
     • a ONE-TIME intro timeline for the text (kicker pill → masked-line headline →
       sub → scroll hint), expo.out + stagger — NOT tied to scrub (matches the seed's
       `intro` timeline).
     • the masked-line headline (each line in an overflow:hidden mask, slides up once).
     • a "scroll to bring the evening" hint that fades out as the scrub begins.
     • reduced-motion: night hidden, glow/scrim off, text instantly visible (no intro,
       no scrub). The canon disarms its scrub under reduced-motion too.

   daynightScrub.create(target, {
     dayMedia, nightMedia,                 // frame-matched pair (url|selector|element)
     scrub: { start:"top top", end:"+=110%", pin:true },  // forwarded to the canon
     glow: true,                           // warm window-glow rising with t (canon)
     scrim: 0.5,                           // legibility scrim peak (canon)
     kicker, headline, sub, hint,          // caption copy (headline = array of lines)
     onUpdate                              // (t)=>{} forwarded to the canon
   })
   Returns { dn, root, set, get, replay, destroy } — dn is the underlying canon api.

   ENGINE LAWS (inherited): opacity / gradient only on the scrubbed surface; GPU
   compositable; NO canvas drawImage, NO mix-blend, NO backdrop-filter, NO WebGL.
   prefers-reduced-motion → static night-hidden end state. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function elFromCopy(tag, cls, txt) {
    var n = doc.createElement(tag);
    n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  function create(target, options) {
    options = options || {};
    var host = !target ? doc.body : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!host || !global.DayNight) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target or canon not loaded' }; }

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;

    // --- the canon, in NAHIRNA scrub config ---------------------------------
    // The real seed glow + scrim gradients, harvested 1:1:
    var GLOW = 'radial-gradient(60% 35% at 58% 56%, rgba(232,201,160,0.14), transparent 70%)';
    var SCRIM = 'linear-gradient(180deg, rgba(15,15,14,0) 0%, rgba(15,15,14,0) 38%, rgba(15,15,14,0.5) 64%, rgba(15,15,14,0.74) 100%)';

    var canonOpts = {
      dayMedia: options.dayMedia,
      nightMedia: options.nightMedia,
      mode: 'scrub',
      reveal: 'opacity',
      glow: options.glow === false ? false : GLOW,         // warm window-glow rises with t
      scrim: options.scrim != null ? options.scrim : 0.5,  // legibility scrim peaks with t
      scrub: {
        trigger: (options.scrub && options.scrub.trigger) || host,
        start: (options.scrub && options.scrub.start) || 'top top',
        end: (options.scrub && options.scrub.end) || '+=110%',
        pin: !(options.scrub && options.scrub.pin === false),
        pinSpacing: !(options.scrub && options.scrub.pinSpacing === false),
        scrub: (options.scrub && options.scrub.scrub != null) ? options.scrub.scrub : true
      },
      onUpdate: function (t) {
        // hint fades out as the evening starts to arrive (seam with the scrub)
        if (hint) hint.style.opacity = String(Math.max(0, 1 - t * 6));
        if (options.onUpdate) options.onUpdate(t);
      }
    };

    // Override the canon's default scrim gradient with the EXACT Nahirna one. The
    // engine injects .dn__scrim with its own gradient; we re-tint it after create.
    var dn = global.DayNight.create(host, canonOpts);

    var scrimNode = host.querySelector('.dn__scrim');
    if (scrimNode) scrimNode.style.background = SCRIM;

    // --- caption layer (NAHIRNA hero: kicker pill, masked-line headline, sub, hint) ---
    var cap = elFromCopy('div', 'dns-cap');

    var kicker = null;
    if (options.kicker) {
      kicker = elFromCopy('p', 'dns-kicker', null);
      // kicker may be {place, edge} or a plain string
      if (typeof options.kicker === 'object') {
        kicker.appendChild(elFromCopy('span', 'dns-kicker__place', options.kicker.place || ''));
        if (options.kicker.edge) {
          var sep = elFromCopy('span', 'dns-kicker__sep', '');
          sep.setAttribute('aria-hidden', 'true');
          kicker.appendChild(sep);
          kicker.appendChild(elFromCopy('span', 'dns-kicker__edge', options.kicker.edge));
        }
      } else {
        kicker.textContent = options.kicker;
      }
      cap.appendChild(kicker);
    }

    var h1 = elFromCopy('h1', 'dns-h1', null);
    var lines = Array.isArray(options.headline) ? options.headline : [options.headline || ''];
    var lineEls = [];
    lines.forEach(function (text, i) {
      var mask = elFromCopy('span', 'dns-mask', null);          // overflow:hidden mask
      var inner = elFromCopy('span', 'dns-line' + (i === lines.length - 1 ? ' dns-line--warm' : ''), text);
      mask.appendChild(inner);
      h1.appendChild(mask);
      lineEls.push(inner);
    });
    cap.appendChild(h1);

    var sub = null;
    if (options.sub) { sub = elFromCopy('p', 'dns-sub', options.sub); cap.appendChild(sub); }

    host.appendChild(cap);

    var hint = elFromCopy('div', 'dns-hint', null);
    hint.appendChild(elFromCopy('span', 'dns-hint__txt', options.hint || 'гортайте, настає вечір'));
    host.appendChild(hint);

    // --- intro reveal (ONCE, not tied to scrub) -----------------------------
    function staticState() {
      // reduced-motion / no-GSAP: everything visible, day shown, night hidden (canon already at t=0).
      if (kicker) { kicker.style.opacity = '1'; kicker.style.transform = 'none'; }
      lineEls.forEach(function (l) { l.style.transform = 'translateY(0)'; l.style.opacity = '1'; });
      if (sub) { sub.style.opacity = '1'; sub.style.transform = 'none'; }
      hint.style.opacity = '1';
    }

    function intro() {
      if (reduced || !gsap) { staticState(); return; }
      var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      if (kicker) tl.from(kicker, { opacity: 0, y: 16, duration: 1.2, delay: 0.2 });
      tl.from(lineEls, { opacity: 0, yPercent: 110, duration: 1.6, stagger: 0.12 }, kicker ? '-=0.9' : 0);
      if (sub) tl.from(sub, { opacity: 0, y: 18, duration: 1.4 }, '-=1.0');
      tl.from(hint, { opacity: 0, duration: 1.0 }, '-=0.8');
      return tl;
    }

    var introTl = intro();

    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      dn: dn,                       // the underlying canon api (set/get/destroy/...)
      root: host,
      set: dn.set,                  // PURE scrub passthrough (drive from any external t)
      get: dn.get,
      replay: function () {
        if (introTl) introTl.kill();
        lineEls.forEach(function (l) { l.style.transform = ''; l.style.opacity = ''; });
        if (kicker) { kicker.style.opacity = ''; kicker.style.transform = ''; }
        if (sub) { sub.style.opacity = ''; sub.style.transform = ''; }
        hint.style.opacity = '';
        introTl = intro();
      },
      destroy: function () {
        if (introTl) introTl.kill();
        if (dn && dn.destroy) dn.destroy();
        if (cap.parentNode) cap.parentNode.removeChild(cap);
        if (hint.parentNode) hint.parentNode.removeChild(hint);
      }
    };
  }

  var api = { create: create };
  global.DayNightScrub = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
