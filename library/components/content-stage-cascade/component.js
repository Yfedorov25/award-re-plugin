/* ============================================================
   CONTENT-STAGE-CASCADE · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   Saisei's content-reveal choreographer — after a page opens, its elements appear in a
   FIXED depth order: background -> accent (awards) -> title -> meta -> header LAST, with
   a small stagger between groups. The header arriving last and quietest is the rule
   ("first the work, then the interface"). Harvested from D_saisei (S4).

   It does not invent the per-element animation — it ORCHESTRATES them: each stage names
   a target + a reveal kind (fade / slide-x / draw-line / custom-fn), and the cascade
   runs them in order with a group stagger. Pair the title stage with mask-up-title and
   the open with center-seam-split.

   CONFIG-DRIVEN:
     ContentStageCascade.create({
       stages: [
         { el: '.hero-bg',   kind: 'fade',     dur: 0.6 },
         { el: '.awards',    kind: 'slide-x',  from: 40, dur: 0.5 },
         { el: '#title',     kind: 'fn', fn: (el)=> titleApi.play() },   // delegate to mask-up-title
         { el: '.meta',      kind: 'fade',     dur: 0.5, stagger: 0.06 },// .meta is a NodeList -> per-item
         { el: 'header',     kind: 'draw-line', dur: 0.6 }               // LAST
       ],
       gap: 0.11   // s between stage starts
     })
   Returns { play(onDone), reset(), destroy }.

   ENGINE LAWS: opacity + transform(translateX) + scaleX(line) only; GPU; NO mix-blend /
   NO backdrop; NO WebGL; reduced-motion -> all shown instantly. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function nodes(sel) {
    if (!sel) return [];
    if (typeof sel === 'string') return [].slice.call(doc.querySelectorAll(sel));
    if (sel.nodeType) return [sel];
    return [].slice.call(sel);
  }

  function create(options) {
    options = options || {};
    var stages = options.stages || [];
    var gap = options.gap != null ? options.gap : 0.11;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;

    // prime: hide everything the cascade controls (except 'fn' stages, which own their state)
    stages.forEach(function (s) {
      if (s.kind === 'fn') return;
      nodes(s.el).forEach(function (el) {
        el.style.willChange = 'opacity, transform';
        if (s.kind === 'fade') el.style.opacity = '0';
        else if (s.kind === 'slide-x') { el.style.opacity = '0'; el.style.transform = 'translateX(' + (s.from || 40) + 'px)'; }
        else if (s.kind === 'draw-line') { el.style.transformOrigin = 'left center'; el.style.transform = 'scaleX(0)'; }
      });
    });

    function runEl(el, s, done) {
      if (reduced) { el.style.opacity = '1'; el.style.transform = 'none'; done && done(); return; }
      var dur = s.dur != null ? s.dur : 0.5, ease = s.ease || 'power3.out';
      if (gsap) {
        if (s.kind === 'fade') gsap.to(el, { opacity: 1, duration: dur, ease: ease, onComplete: done });
        else if (s.kind === 'slide-x') gsap.to(el, { opacity: 1, x: 0, duration: dur, ease: ease, onComplete: done });
        else if (s.kind === 'draw-line') gsap.to(el, { scaleX: 1, duration: dur, ease: ease, onComplete: done });
        return;
      }
      // built-in
      var t0 = null; var efOut = function (t) { return 1 - Math.pow(1 - t, 3); };
      var startX = s.kind === 'slide-x' ? (s.from || 40) : 0;
      (function step(ts) { if (t0 == null) t0 = ts; var t = Math.min(1, (ts - t0) / (dur * 1000)), e = efOut(t);
        if (s.kind === 'fade') el.style.opacity = e;
        else if (s.kind === 'slide-x') { el.style.opacity = e; el.style.transform = 'translateX(' + (startX * (1 - e)).toFixed(1) + 'px)'; }
        else if (s.kind === 'draw-line') el.style.transform = 'scaleX(' + e.toFixed(3) + ')';
        if (t < 1) global.requestAnimationFrame(step); else done && done();
      })(performance.now());
    }

    function runStage(s, done) {
      if (s.kind === 'fn') { try { s.fn(); } catch (e) {} done && done(); return; }
      var els = nodes(s.el); if (!els.length) { done && done(); return; }
      var left = els.length;
      els.forEach(function (el, i) {
        setTimeout(function () { runEl(el, s, function () { if (--left === 0 && done) done(); }); }, i * (s.stagger || 0) * 1000);
      });
    }

    function play(onDone) {
      var i = 0;
      (function next() {
        if (i >= stages.length) { onDone && onDone(); return; }
        var s = stages[i++];
        runStage(s, null);                 // don't await within-stage; cascade is time-based
        if (i < stages.length) setTimeout(next, gap * 1000);
        else setTimeout(function () { onDone && onDone(); }, (s.dur || 0.5) * 1000);
      })();
    }

    function reset() {
      stages.forEach(function (s) {
        if (s.kind === 'fn') return;
        nodes(s.el).forEach(function (el) {
          if (s.kind === 'fade') el.style.opacity = '0';
          else if (s.kind === 'slide-x') { el.style.opacity = '0'; el.style.transform = 'translateX(' + (s.from || 40) + 'px)'; }
          else if (s.kind === 'draw-line') el.style.transform = 'scaleX(0)';
        });
      });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { play: play, reset: reset, destroy: function () {} };
  }

  var api = { create: create };
  global.ContentStageCascade = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
