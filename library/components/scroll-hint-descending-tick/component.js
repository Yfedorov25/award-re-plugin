/* ============================================================
   SCROLL-HINT-DESCENDING-TICK · component.js  (vanilla; GSAP optional; no ScrollTrigger needed)
   ------------------------------------------------------------
   to-place.co.jp's scroll BAIT — a small serif "scroll" label over a faint vertical TRACK with a
   bright TICK that AUTOPLAYS descending top->bottom (drip + empty beat), gated to the FIRST
   viewport, fading out + swapping to an audio-bars glyph once the user scrolls. Its job is to
   convince a STATIONARY user (scroll = 0) that the page scrolls — the single most-reusable atom
   for any dark-ground hero. Harvested from D_toplace_video.md (§2).

   THE CRITICAL INVERSION (the whole trick): it AUTOPLAYS at rest. It is NOT a scrollbar thumb and
   NOT bound to scroll position. Scroll-binding it defeats its only purpose (a dead first screen
   shows no motion). This is the exact inverse of shared/scroll-indicator (a progress reporter).

   THE MOVE (continuous autoplay loop, ~1.9s/cycle):
     - the bright tick spawns at the TOP of the track (~22px, quick fade-in to full white 255),
     - translates DOWN, SHORTENING (~22->8px) + DIMMING toward the bottom, fades to 0,
     - an EMPTY BEAT (~0.15s) before the next drip (so it reads as discrete drips, not a marquee),
     - DOWN only, never yoyo. Soft glow on the tick.
   LIFETIME: gated to the first viewport via IntersectionObserver on a sentinel (or the hero el) —
   fades 1->0 as the hero leaves; optionally swaps to a small audio-bars glyph (reuse for the
   "now playing" state on the interior video sections).

   CONFIG-DRIVEN:
     ScrollHintDescendingTick.create(target, {     // target = the hint container (.shd-hint)
       label: 'scroll', trackH: 100, tickH: 22, tickMin: 8, cycle: 1.9, gap: 0.15,
       glow: true, gateTo: null (selector|el for the IntersectionObserver; default = hint's own
       offset > 0), swapToBars: true, autoplay: true
     })
   Markup (minimal): .shd-hint > .shd-label + .shd-track ; (optional) .shd-bars > .shd-bar x N.
   If the markup is missing pieces the engine builds them. Returns { stop, start, hide, show, destroy }.

   ENGINE LAWS: transform(translateY, scaleY) + opacity only; GPU; NO mix-blend; NO WebGL. The
   loop runs via CSS @keyframes (injected) OR a GSAP timeline if gsap is present. reduced-motion ->
   a single slow pulse (no perpetual loop; matters on mobile). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var STYLE_ID = 'shd-keyframes';

  function injectKeyframes() {
    if (doc.getElementById(STYLE_ID)) return;
    var css =
      '@keyframes shd-drip{' +
        '0%{transform:translateY(-100%) scaleY(1);opacity:0}' +
        '14%{opacity:1}' +
        '70%{opacity:1}' +
        '100%{transform:translateY(var(--shd-travel,100px)) scaleY(var(--shd-minscale,0.36));opacity:0}' +
      '}' +
      '@keyframes shd-pulse{0%,100%{opacity:.25}50%{opacity:1}}' +
      '@keyframes shd-bar{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}';
    var s = doc.createElement('style'); s.id = STYLE_ID; s.textContent = css; doc.head.appendChild(s);
  }

  function create(target, options) {
    options = options || {};
    var opt = {
      label: options.label != null ? options.label : 'scroll',
      trackH: options.trackH != null ? options.trackH : 100,
      tickH: options.tickH != null ? options.tickH : 22,
      tickMin: options.tickMin != null ? options.tickMin : 8,
      cycle: options.cycle != null ? options.cycle : 1.9,
      gap: options.gap != null ? options.gap : 0.15,
      glow: options.glow !== false,
      gateTo: options.gateTo || null,        // selector or element; null = gate on window scroll
      swapToBars: options.swapToBars !== false,
      autoplay: options.autoplay !== false
    };
    var hint = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!hint) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    injectKeyframes();
    var gsap = global.gsap;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // build missing parts
    var label = hint.querySelector('.shd-label');
    if (!label) { label = doc.createElement('span'); label.className = 'shd-label'; label.textContent = opt.label; hint.appendChild(label); }
    var track = hint.querySelector('.shd-track');
    if (!track) { track = doc.createElement('span'); track.className = 'shd-track'; hint.appendChild(track); }
    var tick = track.querySelector('.shd-tick');
    if (!tick) { tick = doc.createElement('span'); tick.className = 'shd-tick'; track.appendChild(tick); }
    var bars = hint.querySelector('.shd-bars');
    if (!bars && opt.swapToBars) {
      bars = doc.createElement('span'); bars.className = 'shd-bars';
      for (var i = 0; i < 4; i++) { var b = doc.createElement('span'); b.className = 'shd-bar'; bars.appendChild(b); }
      hint.appendChild(bars);
    }

    // geometry vars
    track.style.height = opt.trackH + 'px';
    tick.style.height = opt.tickH + 'px';
    track.style.setProperty('--shd-travel', (opt.trackH - 0) + 'px');
    track.style.setProperty('--shd-minscale', (opt.tickMin / opt.tickH).toFixed(3));
    if (opt.glow) tick.style.boxShadow = '0 0 6px rgba(255,255,255,.5)';

    var bars_arr = bars ? [].slice.call(bars.querySelectorAll('.shd-bar')) : [];

    // ---- the loop ----
    var loopTween = null, running = false;
    function startLoop() {
      if (running) return; running = true;
      if (reduced) {
        // single slow pulse, no perpetual loop (battery on mobile)
        tick.style.animation = 'shd-pulse 2.4s ease-in-out 1 both';
        return;
      }
      if (gsap) {
        var tl = gsap.timeline({ repeat: -1, repeatDelay: opt.gap });
        tl.set(tick, { y: -opt.tickH, height: opt.tickH, opacity: 0 })
          .to(tick, { opacity: 1, duration: opt.cycle * 0.14, ease: 'power1.out' }, 0)
          .to(tick, { y: opt.trackH, height: opt.tickMin, duration: opt.cycle, ease: 'power1.in' }, 0)
          .to(tick, { opacity: 0, duration: opt.cycle * 0.3, ease: 'power1.in' }, opt.cycle * 0.7);
        loopTween = tl;
      } else {
        tick.style.animation = 'shd-drip ' + opt.cycle + 's cubic-bezier(.4,0,.6,1) ' + opt.gap + 's infinite';
      }
    }
    function stopLoop() {
      running = false;
      if (loopTween) { loopTween.kill(); loopTween = null; }
      tick.style.animation = 'none'; tick.style.opacity = '0';
    }

    function startBars() {
      if (!bars) return;
      bars.classList.add('is-on');
      bars_arr.forEach(function (b, i) {
        b.style.animation = 'shd-bar ' + (0.7 + i * 0.12).toFixed(2) + 's ease-in-out ' + (i * 0.1).toFixed(2) + 's infinite';
      });
    }
    function stopBars() { if (bars) { bars.classList.remove('is-on'); bars_arr.forEach(function (b) { b.style.animation = 'none'; }); } }

    // ---- first-viewport gating ----
    var atTop = true;
    function showHint() { hint.classList.remove('shd-gone'); hint.classList.add('shd-active'); stopBars(); startLoop(); }
    function hideHint() { hint.classList.add('shd-gone'); hint.classList.remove('shd-active'); stopLoop(); if (opt.swapToBars) startBars(); }

    function evalGate() {
      var past;
      if (opt.gateTo) {
        var g = typeof opt.gateTo === 'string' ? doc.querySelector(opt.gateTo) : opt.gateTo;
        if (g && g.getBoundingClientRect) { past = g.getBoundingClientRect().bottom <= (global.innerHeight * 0.5); }
        else past = (global.scrollY || global.pageYOffset || 0) > 40;
      } else {
        past = (global.scrollY || global.pageYOffset || 0) > 40;
      }
      if (past && atTop) { atTop = false; hideHint(); }
      else if (!past && !atTop) { atTop = true; showHint(); }
    }

    var io = null;
    if (opt.gateTo && global.IntersectionObserver) {
      var g2 = typeof opt.gateTo === 'string' ? doc.querySelector(opt.gateTo) : opt.gateTo;
      if (g2) {
        io = new IntersectionObserver(function (entries) {
          var e = entries[0];
          if (e.intersectionRatio < 0.5 && atTop) { atTop = false; hideHint(); }
          else if (e.intersectionRatio >= 0.5 && !atTop) { atTop = true; showHint(); }
        }, { threshold: [0, 0.5, 1] });
        io.observe(g2);
      }
    }
    var onScroll = function () { if (!io) evalGate(); };
    global.addEventListener('scroll', onScroll, { passive: true });

    if (opt.autoplay) showHint();
    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      start: showHint, stop: stopLoop, hide: hideHint, show: showHint,
      el: hint,
      destroy: function () {
        stopLoop(); stopBars();
        global.removeEventListener('scroll', onScroll);
        if (io) io.disconnect();
      }
    };
  }

  var api = { create: create };
  global.ScrollHintDescendingTick = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
