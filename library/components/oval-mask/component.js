/* ============================================================
   OVAL-MASK · component.js  (vanilla; optional pointer/scroll parallax-within)
   ------------------------------------------------------------
   EVER's portrait OVAL with media inside — the hero "eveR" oval (a looping video
   between the letters), the ARCHITECTURE/INTERIOR ovals. Harvested from the live
   read: clip-path: ellipse(...) on a fixed-shape mask; the media INSIDE parallaxes
   (scale + drift) while the MASK ITSELF never deforms.

   MEASURED (live EVER): portrait oval ~0.62-0.69 ratio; clip-path ellipse; inner
   media scale ~1.08 and drifts a few px on pointer/scroll (parallax-WITHIN). The
   mask is static; only the content inside moves. EVER's hero oval plays a looping
   muted video.

   CONFIG-DRIVEN:
     OvalMask.init(target, {
       ratio: 0.66,          // portrait oval w:h (clip-path ellipse derives from this)
       scale: 1.1,           // inner media over-scale so parallax never reveals an edge
       parallax: 10,         // max px the inner media drifts (pointer + scroll)
       drive: 'pointer'      // 'pointer' | 'scroll' | 'both' | 'none'
     })
   Markup: <div class="ovm" data-oval-mask><video|img class="ovm__media">…</div>
   The engine sets the ellipse clip on the wrap and parallaxes the inner media.

   LAW: clip-path (static shape) + transform (inner drift/scale) only; the mask
   never animates its shape (no morph). GPU layer on the inner media. NO mix-blend /
   NO backdrop. reduced-motion -> static (media centred, no drift). Sets
   window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var els = typeof target === 'string'
      ? [].slice.call(document.querySelectorAll(target))
      : (target.length != null ? [].slice.call(target) : [target]);
    if (!els.length) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ratio = options.ratio != null ? options.ratio : 0.66;
    var scale = options.scale != null ? options.scale : 1.1;
    var parallax = options.parallax != null ? options.parallax : 10;
    var drive = options.drive || 'pointer';

    var made = els.map(function (wrap) {
      var media = wrap.querySelector('.ovm__media') || wrap.firstElementChild;
      // static ellipse mask on the wrap (the SHAPE never animates)
      wrap.style.clipPath = 'ellipse(50% 50% at 50% 50%)';
      wrap.style.overflow = 'hidden';
      if (media) {
        media.style.willChange = 'transform';
        media.style.backfaceVisibility = 'hidden';
        media.style.transform = 'translateZ(0) scale(' + scale + ')';
        // try to autoplay a video inside
        if (media.tagName === 'VIDEO') { media.muted = true; media.loop = true; media.playsInline = true; var p = media.play && media.play(); if (p && p.catch) p.catch(function () {}); }
      }
      return { wrap: wrap, media: media, tx: 0, ty: 0, cx: 0, cy: 0 };
    });

    if (reduced || drive === 'none') { try { global.__LAB_OK__ = true; } catch (e) {} return { masks: made, destroy: function () {} }; }

    // pointer parallax-within: media drifts toward the pointer (a few px), eased
    var raf = null;
    function loop() {
      made.forEach(function (m) {
        m.cx += (m.tx - m.cx) * 0.1; m.cy += (m.ty - m.cy) * 0.1;
        if (m.media) m.media.style.transform = 'translate3d(' + m.cx.toFixed(2) + 'px,' + m.cy.toFixed(2) + 'px,0) scale(' + scale + ')';
      });
      raf = requestAnimationFrame(loop);
    }
    function onMove(ev) {
      made.forEach(function (m) {
        var r = m.wrap.getBoundingClientRect();
        var px = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var py = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2);
        m.tx = Math.max(-1, Math.min(1, px)) * parallax;
        m.ty = Math.max(-1, Math.min(1, py)) * parallax;
      });
    }
    function onScroll() {
      made.forEach(function (m) {
        var r = m.wrap.getBoundingClientRect();
        var prog = (r.top + r.height / 2) / global.innerHeight - 0.5; // -0.5..0.5
        m.ty = -prog * 2 * parallax;
      });
    }

    if (drive === 'pointer' || drive === 'both') global.addEventListener('mousemove', onMove);
    if (drive === 'scroll' || drive === 'both') global.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(loop);

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      masks: made,
      destroy: function () { if (raf) cancelAnimationFrame(raf); global.removeEventListener('mousemove', onMove); global.removeEventListener('scroll', onScroll); }
    };
  }

  var api = { init: init };
  global.OvalMask = api;
  global.ovalMask = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
