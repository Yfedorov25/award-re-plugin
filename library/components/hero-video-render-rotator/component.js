/* ============================================================
   HERO-VIDEO-RENDER-ROTATOR · component.js  (vanilla, no GSAP needed)
   ------------------------------------------------------------
   crownd/finest's hero — a full-bleed HERO whose BACKGROUND is a crossfading SLIDESHOW that
   mixes VIDEO clips and RENDER stills, while a big serif WORDMARK stays FIXED and persistent
   over all of them (the title never moves or swaps; only the media behind it rotates). Video
   slides autoplay muted+loop while active and pause when off. Harvested from D_finest (F1:
   drone video -> building render -> pool render, "finest" fixed on top).

   Distinct from editorial-act-crossfade (there the centre WORD swaps per act over a still);
   here ONE fixed title sits over a rotating video/render background — the media is the show.

   THE MOVE:
     - slides are stacked full-bleed; the active one is opacity 1, others 0 (crossfade `fade`)
     - auto-advances every `interval` ms (pauses on hover if hoverPause); dots/arrows optional
     - a video slide plays() on activate, pause()+reset on deactivate (battery/perf)
     - a subtle slow Ken-Burns scale on the active media (optional) for life
     - the .hvr-title layer is ABOVE all media and never animates with the rotation

   CONFIG-DRIVEN:
     HeroVideoRenderRotator.create(target, {     // target = .hvr-stage
       interval: 4200, fade: 1100, kenburns: true, hoverPause: true, auto: true
     })
   Markup: .hvr-stage > .hvr-media(.hvr-slide[.is-video] (img | video) x N) + .hvr-title +
   [.hvr-dots]. Returns { go(i), next(), index(), play(), stop(), destroy }.

   ENGINE LAWS: opacity (crossfade) + transform scale (ken-burns) only; GPU; NO mix-blend over
   the media; NO WebGL; videos muted+playsinline+loop; reduced-motion -> no auto-advance, no
   ken-burns (first slide shown, video paused). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      interval: options.interval != null ? options.interval : 4200,
      fade: options.fade != null ? options.fade : 1100,
      kenburns: options.kenburns !== false,
      hoverPause: options.hoverPause !== false,
      auto: options.auto !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var slides = [].slice.call(stage.querySelectorAll('.hvr-slide'));
    var dots = [].slice.call(stage.querySelectorAll('.hvr-dot'));
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!slides.length) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no slides' }; }

    stage.style.setProperty('--hvr-fade', opt.fade + 'ms');
    var n = slides.length, idx = 0, timer = null, hovering = false;

    function media(s) { return s.querySelector('video') || s.querySelector('img'); }
    function activate(i) {
      slides.forEach(function (s, k) {
        var on = k === i;
        s.classList.toggle('is-active', on);
        if (opt.kenburns && !reduced) s.classList.toggle('is-kb', on);
        var v = s.querySelector('video');
        if (v) {
          // play on activate / pause on deactivate. We do NOT touch video.currentTime
          // (no scrubbing/reset — banned by the scroll-driven-hero law; loop handles repeat).
          if (on && !reduced) { try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
          else { try { v.pause(); } catch (e) {} }
        }
      });
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
      idx = i;
    }

    function go(i) { activate((i + n) % n); }
    function next() { go(idx + 1); }

    function start() {
      if (!opt.auto || reduced || n < 2) return;
      stop();
      timer = global.setInterval(function () { if (!hovering) next(); }, opt.interval);
    }
    function stop() { if (timer) { global.clearInterval(timer); timer = null; } }

    // prep videos
    slides.forEach(function (s) {
      var v = s.querySelector('video');
      if (v) { v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; }
    });

    activate(0);
    if (opt.hoverPause) {
      stage.addEventListener('pointerenter', function () { hovering = true; });
      stage.addEventListener('pointerleave', function () { hovering = false; });
    }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); start(); }); });

    // pause the whole rotator when off-screen
    var io = null;
    if (global.IntersectionObserver) {
      io = new global.IntersectionObserver(function (ents) {
        if (ents[0].isIntersecting) { var v = slides[idx].querySelector('video'); if (v && !reduced) { try { v.play().catch(function () {}); } catch (e) {} } start(); }
        else { stop(); var vv = slides[idx].querySelector('video'); if (vv) { try { vv.pause(); } catch (e) {} } }
      }, { threshold: 0.15 });
      io.observe(stage);
    } else { start(); }

    stage.classList.add('hvr-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      go: go, next: next, index: function () { return idx; }, count: n,
      play: start, stop: stop,
      destroy: function () { stop(); if (io) io.disconnect(); }
    };
  }

  var api = { create: create };
  global.HeroVideoRenderRotator = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
