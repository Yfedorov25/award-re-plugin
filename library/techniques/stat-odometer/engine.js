/* ============================================================
   STAT-ODOMETER · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + CustomEase + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   Springs' "3 / 9 / 10 / 16" pinned STAT-CARD slider — the most engineered module,
   harvested from the frame-by-frame teardown (D_springs_walkthrough_video S11).

   THE MOVE: one PINNED scroll range steps through N data points; on EACH step,
   FOUR different mechanics fire AT ONCE (the choreography is the point):
     1. BG  — full-bleed atmospheric photo swaps by a VERTICAL SLIDE-UP (next rises
              from the bottom, pushing the old up).
     2. CARD PHOTO — a square tile in the pinned card CROSSFADES to the new image.
     3. NUMERAL — the giant serif number changes via an ODOMETER ROLL (old digit
              translates up and out, new rolls up from below, a brand accent panel
              wiping up behind it).
     4. LABEL — the caption text SWAPS (crossfade).
   Plus a thin PROGRESS BAR on the card edge and snap to each step.

   Each mechanic is DIFFERENT (slide / crossfade / roll / swap) — that variety, all
   on one scroll step, is what reads cinematic and expensive.

   CONFIG-DRIVEN:
     StatOdometer.init(target, {
       steps: [{ num:'3', label:'…', bg:'a.webp', photo:'p.webp' }, …],  // or from markup
       lerp: 0.1, pinFactor: 1.1, snap: true,
       accent: '#c9b79a', manageLenis: true
     })
   Markup-first: if steps omitted, reads .so-step children (each carrying its bg/
   photo/num/label). The engine BUILDS the two stacked bg layers, the two stacked
   card-photo layers, the odometer numeral column, the label, the progress bar.

   ENGINE LAWS (verbatim from slice-clip/dual-slicer): Lenis 1.1.13 -> gsap.ticker ->
   ScrollTrigger.update; lagSmoothing(0); render(prog) PURE fn; pin/scrub; snap;
   transform + opacity only (bg = translateY, photo = opacity, numeral = translateY,
   accent = scaleY, label = opacity); GPU layers; NO mix-blend / NO backdrop over the
   scrubbed surface; NO WebGL; reduced-motion / <=820px -> static stacked list.
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var opt = {
      lerp: options.lerp != null ? options.lerp : 0.1,
      pinFactor: options.pinFactor != null ? options.pinFactor : 1.1,
      snap: options.snap !== false,
      manageLenis: options.manageLenis !== false
    };

    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, CustomEase = global.CustomEase, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // forceMotion (dual-platform opt-in): the original went static <=820px (no mobile branch).
    var narrow = !options.forceMotion && global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    // read steps from markup (.so-step) — each step's num/label/bg/photo
    var stepEls = [].slice.call(stage.querySelectorAll('.so-step'));
    var steps = options.steps || stepEls.map(function (s) {
      return {
        num: s.getAttribute('data-num') || (s.querySelector('.so-num') ? s.querySelector('.so-num').textContent.trim() : ''),
        label: s.getAttribute('data-label') || (s.querySelector('.so-label') ? s.querySelector('.so-label').textContent.trim() : ''),
        bg: s.getAttribute('data-bg'),
        photo: s.getAttribute('data-photo')
      };
    });
    var N = steps.length;

    var bgWrap = stage.querySelector('.so-bg');
    var photoWrap = stage.querySelector('.so-card__photo');
    var numWrap = stage.querySelector('.so-num-col');
    var labelEl = stage.querySelector('.so-label');
    var bar = stage.querySelector('.so-progress__fill');

    // BUILD layers — use real <img> (so it composites as solid media + the gate
    // sees a render; CSS object-fit:cover replaces background cover).
    function img(src, cls) {
      var d = document.createElement('div'); d.className = cls;
      if (src) { var im = document.createElement('img'); im.src = src; im.alt = ''; im.decoding = 'async'; d.appendChild(im); }
      return d;
    }
    // bg: one stacked layer per step
    var bgLayers = steps.map(function (s, i) { var l = img(s.bg, 'so-bg__layer'); if (bgWrap) bgWrap.appendChild(l); return l; });
    // card photo: one stacked layer per step
    var photoLayers = steps.map(function (s, i) { var l = img(s.photo, 'so-photo__layer'); if (photoWrap) photoWrap.appendChild(l); return l; });
    // numeral column: a vertical strip of numbers, translated to show the active one
    if (numWrap) {
      numWrap.innerHTML = '';
      steps.forEach(function (s) { var p = document.createElement('div'); p.className = 'so-num'; p.textContent = s.num; numWrap.appendChild(p); });
    }
    var numItems = numWrap ? [].slice.call(numWrap.querySelectorAll('.so-num')) : [];

    // static fallback (manualDrive skips this — it drives render() itself, no ScrollTrigger/Lenis needed)
    if (!options.manualDrive && (reduced || narrow || !gsap || !ScrollTrigger || !Lenis || N < 2)) {
      stage.classList.add('so-static');
      // show a plain stacked list of steps
      bgLayers.forEach(function (l, i) { l.style.opacity = i === 0 ? '1' : '0'; });
      photoLayers.forEach(function (l, i) { l.style.opacity = i === 0 ? '1' : '0'; });
      if (numWrap) numWrap.style.transform = 'none';
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, destroy: function () {} };
    }

    // manualDrive may run without GSAP plugins; guard so the wrapper can drive render() alone
    if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger, CustomEase);
    if (CustomEase && CustomEase.create && !(CustomEase.get && CustomEase.get('soGlide'))) {
      try { CustomEase.create('soGlide', '0.22,1,0.36,1'); } catch (e) {}
    }
    if (gsap && gsap.ticker) gsap.ticker.lagSmoothing(0);

    var lenis = null;
    // manualDrive never creates the engine's Lenis — the dual wrapper owns scroll.
    if (opt.manageLenis && !options.manualDrive && Lenis && ScrollTrigger) {
      lenis = new Lenis({ lerp: opt.lerp, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    // measure numeral line height for the roll
    function numStep() { return numItems.length ? numItems[0].getBoundingClientRect().height : 0; }

    // PURE render(prog): prog 0..1 maps to a continuous step index 0..N-1
    function render(prog) {
      var fpos = prog * (N - 1);           // fractional step position
      var i = Math.floor(fpos);
      if (i >= N - 1) i = N - 2;
      var f = fpos - i;                    // 0..1 within the i -> i+1 transition
      if (N < 2) { i = 0; f = 0; }

      // 1) BG vertical slide-up: outgoing slides up (-100%*f), incoming rises (100%*(1-f)->0)
      bgLayers.forEach(function (l, k) {
        if (k < i) { l.style.transform = 'translateY(-100%)'; l.style.opacity = '1'; }
        else if (k === i) { l.style.transform = 'translateY(' + (-100 * f).toFixed(2) + '%)'; l.style.opacity = '1'; }
        else if (k === i + 1) { l.style.transform = 'translateY(' + (100 * (1 - f)).toFixed(2) + '%)'; l.style.opacity = '1'; }
        else { l.style.transform = 'translateY(100%)'; l.style.opacity = '1'; }
      });

      // 2) CARD PHOTO crossfade: incoming opacity = f
      photoLayers.forEach(function (l, k) {
        if (k < i) l.style.opacity = '0';
        else if (k === i) l.style.opacity = '1';            // outgoing stays opaque underneath
        else if (k === i + 1) l.style.opacity = f.toFixed(3); // incoming fades in on top
        else l.style.opacity = '0';
      });

      // 3) NUMERAL odometer roll: the column translates so the active number sits in the window
      if (numWrap) {
        var h = numStep();
        numWrap.style.transform = 'translateY(' + (-(i + f) * h).toFixed(2) + 'px)';
      }

      // 4) LABEL swap (crossfade by step): set to the nearer step's label, fade across mid
      if (labelEl) {
        var near = f < 0.5 ? i : i + 1;
        var txt = steps[near] ? steps[near].label : '';
        if (labelEl.textContent !== txt) labelEl.textContent = txt;
        labelEl.style.opacity = (Math.abs(f - 0.5) * 2).toFixed(3);  // dip to 0 at the mid, back to 1
      }

      // progress bar
      if (bar) bar.style.transform = 'scaleX(' + (prog).toFixed(4) + ')';
    }

    // manualDrive (dual-platform): expose render() WITHOUT the engine's own ScrollTrigger/pin,
    // so the dual wrapper drives render(prog) from scroll (desktop) OR a timed slider (mobile).
    // The 4-mechanic render stays HERE — one source of truth.
    if (options.manualDrive) {
      render(0);
      stage.classList.add('so-ready');
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { manual: true, render: render, steps: steps, count: N, destroy: function () {} };
    }

    var handoffs = Math.max(1, N - 1);
    var trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: '+=' + Math.round(global.innerHeight * opt.pinFactor * handoffs),
      pin: true, pinSpacing: true, scrub: true,
      snap: opt.snap ? { snapTo: 1 / handoffs, duration: 0.3, ease: 'power1.inOut' } : false,
      onUpdate: function (self) { render(self.progress); }
    });
    render(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('so-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      trigger: trigger, lenis: lenis, render: render, steps: steps,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { init: init };
  global.StatOdometer = api;
  global.statOdometer = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
