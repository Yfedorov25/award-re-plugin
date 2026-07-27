/* ============================================================
   COLLECTION-TIER-ANNOUNCE · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's /collection — a vertical STACK of TIER bands, each announcing a product tier with a
   giant serif TITLE + a small body + a STAT-ROW (big numerals + small labels: высота / спальни
   / площадь) + a framed CTA + a DUAL-IMAGE split (interior + city-view). As each tier enters it
   ANNOUNCES (title + body + stat-row + the two images stagger in) AND the page GROUND theme
   TWEENS to that tier's palette (dark-green -> taupe -> cream). The "browse the collection by
   tier" chapter. Harvested from D_r1864 (r18643: ИСТОРИЧЕСКАЯ КОЛЛЕКЦИЯ -> ЧАСТНАЯ -> С
   ТЕРРАСАМИ -> ВИЛЛА -> ПЕНТХАУСЫ, ground green->taupe->cream).

   THE MOVE (per tier, scroll-into-view, progress p 0..1) — applyTier(tier, p):
     - title: fade + translateY 30 -> 0 over 0.0..0.4
     - body:  fade + translateY 20 -> 0 over 0.15..0.5
     - stat-row: each stat fade + translateY 24 -> 0, staggered, over 0.30..0.7
     - cta: fade over 0.40..0.7
     - dual images: each clip-reveal (inset bottom 100%->0) + scale 1.06->1, staggered, 0.45..1.0
     applyTier's set(p) is a PURE scrub.
   THEME-SHIFT: a separate ScrollTrigger per tier flips the STAGE css vars (--cta-bg/ink/...) to
   that tier's theme.json palette when it crosses centre (a short tween), so the ground colour
   travels dark-green -> taupe -> cream as you scroll the tiers. NO scrubbed theme over media.

   CONFIG-DRIVEN:
     CollectionTierAnnounce.create(target, {       // target = .cta-stage
       start: 'top 72%', themeStart: 'top 55%', revealDur: 1.0, themeDur: 0.6,
       ease: 'power3.out', clipFrom: 'bottom', once: true, manageLenis: true
     })
   Markup: .cta-stage > .cta-tier[data-theme='{...}'] x N, each =
     .cta-head( .cta-title + .cta-cta ) + .cta-body + .cta-stats( .cta-stat[ .cta-num + .cta-lab ] ) +
     .cta-split( .cta-img x2 ). Returns { triggers, setTier(i,p), play(), destroy }.

   ENGINE LAWS: clip-path(inset) + transform + opacity + a SHORT css-var theme tween (NOT
   scrubbed over media) only; GPU; NO mix-blend; NO WebGL; reduced-motion / <=820px -> shown,
   each tier static at its own theme. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      start: options.start || 'top 72%',
      themeStart: options.themeStart || 'top 55%',
      revealDur: options.revealDur != null ? options.revealDur : 1.0,
      themeDur: options.themeDur != null ? options.themeDur : 0.6,
      ease: options.ease || 'power3.out',
      clipFrom: options.clipFrom || 'bottom',
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var tiers = [].slice.call(stage.querySelectorAll('.cta-tier'));
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }
    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }

    function insetFor(hidden) {
      var h = (hidden * 100).toFixed(2) + '%';
      switch (opt.clipFrom) {
        case 'top': return 'inset(' + h + ' 0 0 0)';
        case 'left': return 'inset(0 0 0 ' + h + ')';
        case 'right': return 'inset(0 ' + h + ' 0 0)';
        default: return 'inset(0 0 ' + h + ' 0)'; // bottom
      }
    }

    function parseTheme(el) {
      var raw = el.getAttribute('data-theme');
      if (!raw) return null;
      try { return JSON.parse(raw); } catch (e) { return null; }
    }

    // cache per-tier parts
    var T = tiers.map(function (t) {
      return {
        el: t,
        title: t.querySelector('.cta-title'),
        body: t.querySelector('.cta-body'),
        cta: t.querySelector('.cta-cta'),
        stats: [].slice.call(t.querySelectorAll('.cta-stat')),
        imgs: [].slice.call(t.querySelectorAll('.cta-img')),
        theme: parseTheme(t)
      };
    });

    function applyTier(i, p) {
      var t = T[i]; if (!t) return; p = clamp01(p);
      if (t.title) { var tp = efOut(sub01(p, 0.0, 0.4)); t.title.style.opacity = tp.toFixed(3); t.title.style.transform = 'translateY(' + ((1 - tp) * 30).toFixed(1) + 'px)'; }
      if (t.body) { var bp = efOut(sub01(p, 0.15, 0.5)); t.body.style.opacity = bp.toFixed(3); t.body.style.transform = 'translateY(' + ((1 - bp) * 20).toFixed(1) + 'px)'; }
      t.stats.forEach(function (s, k) {
        var a = 0.30 + k * 0.06;
        var sp = efOut(sub01(p, a, a + 0.4));
        s.style.opacity = sp.toFixed(3); s.style.transform = 'translateY(' + ((1 - sp) * 24).toFixed(1) + 'px)';
      });
      if (t.cta) { var cp = efOut(sub01(p, 0.40, 0.7)); t.cta.style.opacity = cp.toFixed(3); }
      t.imgs.forEach(function (im, k) {
        var a = 0.45 + k * 0.14;
        var ip = efOut(sub01(p, a, Math.min(1, a + 0.45)));
        im.style.clipPath = im.style.webkitClipPath = insetFor(1 - ip);
        im.style.transform = 'scale(' + (1.06 + (1 - 1.06) * ip).toFixed(4) + ')';
        im.style.opacity = '1';
      });
    }

    // init hidden
    T.forEach(function (t, i) {
      t.imgs.forEach(function (im) { im.style.clipPath = im.style.webkitClipPath = insetFor(1); im.style.transform = 'scale(1.06)'; });
      applyTier(i, 0);
    });

    // apply first tier theme to the stage immediately
    function setStageTheme(theme, immediate) {
      if (!theme) return;
      var props = { '--cta-bg': theme.bg, '--cta-ink': theme.ink, '--cta-dim': theme.dim, '--cta-line': theme.line };
      if (gsap && !immediate && !reduced) {
        gsap.to(stage, Object.assign({ duration: opt.themeDur, ease: 'power2.inOut', overwrite: 'auto' }, props));
      } else {
        for (var k in props) if (props[k] != null) stage.style.setProperty(k, props[k]);
      }
    }
    if (T[0] && T[0].theme) setStageTheme(T[0].theme, true);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('cta-static');
      T.forEach(function (t, i) { applyTier(i, 1); });
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, setTier: applyTier, play: function () { T.forEach(function (t, i) { applyTier(i, 1); }); }, destroy: function () {} };
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);
    var lenis = null;
    if (opt.manageLenis && Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    var triggers = [];
    T.forEach(function (t, i) {
      var played = false;
      triggers.push(ScrollTrigger.create({
        trigger: t.el, start: opt.start,
        onEnter: function () {
          if (played && opt.once) return; played = true;
          var o = { p: 0 };
          gsap.to(o, { p: 1, duration: opt.revealDur, ease: 'none', onUpdate: function () { applyTier(i, o.p); } });
        },
        onLeaveBack: opt.once ? null : function () { played = false; applyTier(i, 0); }
      }));
      // theme-shift trigger (separate, crosses centre)
      if (t.theme) {
        triggers.push(ScrollTrigger.create({
          trigger: t.el, start: opt.themeStart, end: 'bottom 45%',
          onEnter: function () { setStageTheme(t.theme); },
          onEnterBack: function () { setStageTheme(t.theme); }
        }));
      }
    });

    stage.classList.add('cta-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      triggers: triggers, lenis: lenis, setTier: applyTier,
      play: function () { T.forEach(function (t, i) { applyTier(i, 1); }); },
      setTheme: setStageTheme,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { triggers.forEach(function (x) { x.kill(); }); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.CollectionTierAnnounce = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
