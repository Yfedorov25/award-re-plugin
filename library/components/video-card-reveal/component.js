/* ============================================================
   VIDEO-CARD-REVEAL · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger + Observer
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   to-place.co.jp's full-bleed video handoff — a PINNED, wheel/touch-STEPPED, input-LOCKED stack
   of full-viewport <video> panels where each discrete step WIPES the next video VERTICALLY over
   the last (new panel rises from the bottom; one horizontal seam travels upward), with a transient
   scale/inset SETTLE; per-card PLAYBACK GATING (only the active video decodes); fixed play-pause +
   audio-waveform chrome above everything. Built for Higgsfield image->video reels: poster = the
   still -> first painted frame = the still -> the reveal reads as STILL -> MOTION. Harvested from
   D_toplace_video.md (§3).

   Distinct from: fullscreen-media-carousel (HORIZONTAL translateX swipe + arrows/counter),
   hero-video-render-rotator (passive opacity crossfade under a fixed title), render-slice-reveal
   / center-seam-split (centre seam on ONE fixed render), media-step-switch (ONE fixed surface,
   scroll-scrubbed), panel-rise-over (a coloured theme panel, scrubbed). This is the only one that
   is discrete-wheel-stepped + input-locked, full-bleed VIDEO panels translating vertically, with
   per-card play/decode gating (poster->motion).

   THE MOVE:
     - PINNED section; a GSAP Observer (wheel/touch/keys) increments an index; INPUT LOCKED until
       the step timeline finishes (snap feel).
     - PER STEP (~0.8s, expo.out): incoming panel yPercent 100 -> 0 (+ scale 0.94 -> 1 overshoot
       settle); outgoing panel yPercent 0 -> -100. ONE horizontal seam travels up.
     - PLAYBACK GATE (event-driven): on becoming active -> video.play(); on leaving ->
       video.pause() (pause only — never seek currentTime). ONLY ONE video decodes at a time.
     - CHROME (fixed, never moves during a wipe): wordmark; a circular play/pause toggle; an
       audio-waveform that animates while playing, freezes/flattens to a pause glyph when paused.
       The toggle is INDEPENDENT of scroll.
     - When the last card is reached, the pin releases (the page scrolls on); reverse releases up.

   CONFIG-DRIVEN:
     VideoCardReveal.create(target, {              // target = .vcr-stage
       stepDur: 0.8, ease: 'expo.out', overshoot: 0.94, lazy: true, loop: false,
       autoplayActive: true, manageLenis: true
     })
   Markup: .vcr-stage > .vcr-viewport ( .vcr-card > video[muted loop playsinline poster] x N )
   + .vcr-chrome ( .vcr-wordmark + .vcr-toggle( .vcr-wave > .vcr-bar x N ) + .vcr-index ).
   Returns { trigger, observer, go(i), next(), prev(), toggle(), index, destroy }.

   ENGINE LAWS: transform(translateY, scale) + opacity only; GPU; NO mix-blend; NO WebGL; never
   scrub video.currentTime (scroll-driven-hero law). reduced-motion / <=820px -> native vertical
   scroll-snap of the cards, IntersectionObserver playback gating, no pin/lock. Sets __LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      stepDur: options.stepDur != null ? options.stepDur : 0.8,
      ease: options.ease || 'expo.out',
      overshoot: options.overshoot != null ? options.overshoot : 0.94,
      lazy: options.lazy !== false,
      loop: !!options.loop,
      autoplayActive: options.autoplayActive !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var viewport = stage.querySelector('.vcr-viewport');
    var cards = [].slice.call(stage.querySelectorAll('.vcr-card'));
    var toggle = stage.querySelector('.vcr-toggle');
    var wave = stage.querySelector('.vcr-wave');
    var indexEl = stage.querySelector('.vcr-index');
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Observer = global.Observer, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var N = cards.length, cur = 0, locked = false;

    function videoOf(i) { return cards[i] ? cards[i].querySelector('video') : null; }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function loadAround(i) {
      if (!opt.lazy) return;
      cards.forEach(function (c, k) {
        var v = c.querySelector('video');
        if (!v) return;
        var near = Math.abs(k - i) <= 1 || (opt.loop && (Math.abs(k - i) === N - 1));
        if (near) {
          if (v.dataset.src && !v.src) v.src = v.dataset.src;
          // ensure sources mounted
          [].slice.call(v.querySelectorAll('source[data-src]')).forEach(function (s) { if (!s.src) s.src = s.dataset.src; });
          if (v.dataset.src || v.querySelector('source[src]')) { try { v.load && v.load(); } catch (e) {} }
        }
      });
    }

    function gate(i) {
      cards.forEach(function (c, k) {
        var v = c.querySelector('video'); if (!v) return;
        if (k === i) { if (opt.autoplayActive) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
        else { try { v.pause(); } catch (e) {} } // pause only — never seek currentTime (house idiom; the loop resumes fine)
      });
      setWave(true);
    }

    function setIndex(i) { if (indexEl) indexEl.textContent = pad(i + 1) + ' / ' + pad(N); }

    // ---- waveform / play-pause chrome ----
    var paused = false;
    function setWave(on) {
      if (!wave) return;
      wave.classList.toggle('is-playing', !!on);
      if (toggle) toggle.classList.toggle('is-paused', !on);
    }
    function togglePlay() {
      var v = videoOf(cur); if (!v) return;
      if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); paused = false; setWave(true); }
      else { v.pause(); paused = true; setWave(false); }
    }
    if (toggle) toggle.addEventListener('click', function (e) { e.preventDefault(); togglePlay(); });

    // ---- step (the vertical wipe) ----
    function applyStatic(i) {
      cards.forEach(function (c, k) {
        c.style.transform = 'translateY(' + (k === i ? 0 : (k < i ? -100 : 100)) + '%) scale(1)';
        c.style.opacity = k === i ? '1' : '0';
        c.style.zIndex = k === i ? '2' : '1';
      });
    }

    function go(i) {
      if (opt.loop) i = ((i % N) + N) % N; else { if (i < 0 || i > N - 1) return -1; }
      if (i === cur || locked) return 0;
      var outEl = cards[cur], inEl = cards[i], dir = i > cur ? 1 : -1;
      // when looping across the wrap, keep the visual direction sensible
      if (opt.loop) { if (cur === N - 1 && i === 0) dir = 1; if (cur === 0 && i === N - 1) dir = -1; }
      loadAround(i);

      if (!gsap || reduced) {
        cur = i; applyStatic(i); gate(i); setIndex(i); return 1;
      }
      locked = true;
      inEl.style.zIndex = '2'; outEl.style.zIndex = '1';
      gsap.set(inEl, { yPercent: dir * 100, scale: opt.overshoot, autoAlpha: 1 });
      var tl = gsap.timeline({ onComplete: function () { locked = false; outEl.style.zIndex = '1'; } });
      tl.to(inEl, { yPercent: 0, scale: 1, duration: opt.stepDur, ease: opt.ease }, 0)
        .to(outEl, { yPercent: -dir * 100, duration: opt.stepDur, ease: opt.ease }, 0);
      cur = i; gate(i); setIndex(i);
      return 1;
    }
    function next() { return go(cur + 1); }
    function prev() { return go(cur - 1); }

    // init
    cards.forEach(function (c, k) {
      c.style.transform = 'translateY(' + (k === 0 ? 0 : 100) + '%) scale(1)';
      c.style.opacity = k === 0 ? '1' : '0';
      c.style.zIndex = k === 0 ? '2' : '1';
    });
    setIndex(0); loadAround(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      // fallback: native vertical scroll-snap + IntersectionObserver gating
      stage.classList.add('vcr-static');
      cards.forEach(function (c, k) { c.style.transform = 'none'; c.style.opacity = '1'; c.style.position = 'relative'; });
      if (global.IntersectionObserver) {
        var io = new IntersectionObserver(function (ents) {
          ents.forEach(function (e) {
            var v = e.target.querySelector('video'); if (!v) return;
            if (e.isIntersecting && e.intersectionRatio > 0.55) { if (opt.autoplayActive) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
            else { try { v.pause(); } catch (x) {} }
          });
        }, { threshold: [0, 0.55, 1] });
        cards.forEach(function (c) { io.observe(c); });
      }
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, go: go, next: next, prev: prev, toggle: togglePlay, get index() { return cur; }, destroy: function () {} };
    }

    gsap.registerPlugin(ScrollTrigger);
    if (Observer) gsap.registerPlugin(Observer);
    gsap.ticker.lagSmoothing(0);
    var lenis = null;
    if (opt.manageLenis && Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    // pin the stage for the duration of the card stack
    var pinST = ScrollTrigger.create({
      trigger: stage, start: 'top top', end: '+=' + (N * (global.innerHeight || 800)),
      pin: true, pinSpacing: true,
      onEnter: function () { gate(cur); },
      onEnterBack: function () { gate(cur); }
    });

    // Observer drives the discrete steps; lock input until a step completes; release pin at the ends
    var obs = null;
    if (Observer) {
      obs = Observer.create({
        target: stage, type: 'wheel,touch,pointer', wheelSpeed: -1, tolerance: 12, preventDefault: true,
        onDown: function (self) { // wheel up / swipe down -> previous
          if (locked) return;
          if (cur === 0) { obs.disable(); return; } // let the page scroll up out of the section
          prev();
        },
        onUp: function (self) {   // wheel down / swipe up -> next
          if (locked) return;
          if (cur === N - 1) { obs.disable(); return; } // let the page scroll down out
          next();
        }
      });
      // re-enable the observer when the pin region is re-entered
      pinST.vars.onUpdate = function () {};
    }

    function enableObs() { if (obs && !obs.isEnabled) obs.enable(); }
    // re-arm the observer whenever we're inside the pinned region
    var armST = ScrollTrigger.create({
      trigger: stage, start: 'top top', end: '+=' + (N * (global.innerHeight || 800)),
      onToggle: function (self) { if (self.isActive) enableObs(); }
    });

    gate(cur);
    stage.classList.add('vcr-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: pinST, observer: obs, lenis: lenis,
      go: go, next: next, prev: prev, toggle: togglePlay, get index() { return cur; },
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { if (obs) obs.kill(); pinST && pinST.kill(); armST && armST.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.VideoCardReveal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
