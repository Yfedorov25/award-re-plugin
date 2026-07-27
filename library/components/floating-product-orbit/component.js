/* ============================================================
   FLOATING-PRODUCT-ORBIT · component.js  (vanilla, CSS-3D transforms; NO WebGL)
   ------------------------------------------------------------
   gapsystudio's services "product on a pedestal" — a staged object floating above a red
   plinth that (1) IDLES with a slow float + drift (gentle, always-on) and (2) TILTS toward
   the pointer (rotateX / rotateY parallax in a perspective scene), with the pedestal + a
   ring reacting at a shallower depth. Harvested from D_gapsy (D /services: glass card +
   red shapes + icons on a red pedestal, slow orbit/parallax).

   HONEST NO-WebGL TRANSLATION: the original is live 3D (WebGL). We do NOT copy that. This
   approximates the FEEL with CSS 3D transforms on a flat object image + a CSS pedestal:
   pointer-tilt + idle float. It is an approximation of an orbiting 3D product, not a real
   3D mesh (precedent: the quadro pre-rendered 3D-viewer). For a true round-trip, swap the
   object image for a pre-rendered turntable frame driven by pointer (see room-dolly-scroll).

   THE MOVE:
     - idle: the object floats translateY +/- a few px + rotates a degree or two, on a slow
       loop (rAF, gated; pauses off-screen)
     - pointer: rotateY = (px-0.5)*maxTilt, rotateX = -(py-0.5)*maxTilt on the object; the
       pedestal + ring tilt at depthFactor (~0.4) for parallax; eased toward the target (lerp)
     - reduced-motion / no-hover: idle only (or static)

   CONFIG-DRIVEN:
     FloatingProductOrbit.create(target, {     // target = .fpo-stage (perspective scene)
       maxTilt: 16,           // deg the object tilts to the pointer edge
       depth: 0.42,           // pedestal/ring tilt = object tilt * depth (parallax)
       float: 10,             // px of idle vertical float
       lerp: 0.08, idle: true
     })
   Markup: .fpo-stage > .fpo-scene > .fpo-object(img) + .fpo-pedestal + [.fpo-ring].
   Returns { set(px,py), destroy }.

   ENGINE LAWS: transform: perspective rotateX/rotateY/translateY only; GPU; NO mix-blend
   over the object; NO WebGL; rAF gated by an IntersectionObserver; reduced-motion -> static.
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      maxTilt: options.maxTilt != null ? options.maxTilt : 16,
      depth: options.depth != null ? options.depth : 0.42,
      float: options.float != null ? options.float : 10,
      lerp: options.lerp != null ? options.lerp : 0.08,
      idle: options.idle !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var scene = stage.querySelector('.fpo-scene') || stage;
    var object = stage.querySelector('.fpo-object');
    var pedestal = stage.querySelector('.fpo-pedestal');
    var ring = stage.querySelector('.fpo-ring');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var tgtX = 0, tgtY = 0, curX = 0, curY = 0;   // tilt targets/current (-1..1)
    var t0 = null, visible = true, raf = 0;

    function onMove(e) {
      var r = stage.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      tgtX = (px - 0.5) * 2; tgtY = (py - 0.5) * 2;
    }
    function onLeave() { tgtX = 0; tgtY = 0; }

    // set(px,py) — manual tilt drive (px,py 0..1), for previews/snapshots (PURE)
    function set(px, py) {
      tgtX = (px - 0.5) * 2; tgtY = (py - 0.5) * 2;
      curX = tgtX; curY = tgtY;
      render(0);
    }

    function render(now) {
      if (t0 == null) t0 = now;
      var el = (now - t0) / 1000;
      // ease current toward target
      curX += (tgtX - curX) * opt.lerp;
      curY += (tgtY - curY) * opt.lerp;
      var rotY = curX * opt.maxTilt;
      var rotX = -curY * opt.maxTilt;
      // idle float + tiny rotate
      var floatY = opt.idle && !reduced ? Math.sin(el * 1.1) * opt.float : 0;
      var idleRot = opt.idle && !reduced ? Math.sin(el * 0.7) * 1.5 : 0;
      if (object) object.style.transform =
        'translateY(' + floatY.toFixed(2) + 'px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + (rotY + idleRot).toFixed(2) + 'deg)';
      if (pedestal) pedestal.style.transform =
        'rotateX(' + (rotX * opt.depth).toFixed(2) + 'deg) rotateY(' + (rotY * opt.depth).toFixed(2) + 'deg)';
      if (ring) ring.style.transform =
        'translateY(' + (floatY * 0.5).toFixed(2) + 'px) rotateX(' + (rotX * (opt.depth + 0.2)).toFixed(2) + 'deg) rotateY(' + (rotY * (opt.depth + 0.2)).toFixed(2) + 'deg)';
    }

    function loop(now) { if (!visible) { raf = 0; return; } render(now); raf = global.requestAnimationFrame(loop); }
    function start() { if (!raf) { t0 = null; raf = global.requestAnimationFrame(loop); } }
    function stop() { if (raf) { global.cancelAnimationFrame(raf); raf = 0; } }

    render(0);

    if (reduced) {
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: set, destroy: function () {} };
    }

    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);

    var io = null;
    if (global.IntersectionObserver) {
      io = new global.IntersectionObserver(function (ents) {
        visible = ents[0].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0.05 });
      io.observe(stage);
    } else { start(); }

    stage.classList.add('fpo-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      set: set, start: start, stop: stop,
      destroy: function () {
        stop(); if (io) io.disconnect();
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerleave', onLeave);
      }
    };
  }

  var api = { create: create };
  global.FloatingProductOrbit = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
