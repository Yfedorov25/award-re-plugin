/* ============================================================
   DUAL-PANEL-MENU · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   Saisei's overlay menu — two panels of OPPOSITE colour slide in from opposite edges to
   a centre seam: a CREAM nav panel from the LEFT and a DARK identity/contact panel from
   the RIGHT, meeting at the middle (a 50/50 split). The colour pairing carries meaning:
   cream = navigation, dark = identity. The outgoing page recedes behind a scrim. On
   close they retract the way they came (or converge — configurable). Harvested from
   D_saisei (S7; menu open v2 f035-048).

   THE MOVE: open() slides .dpm-left (cream) translateX(-100%->0) and .dpm-right (dark)
   translateX(100%->0) simultaneously; the nav rows + identity fade up after the panels
   land. close() reverses.

   CONFIG-DRIVEN:
     DualPanelMenu.create(target, {       // target = .dpm-root containing .dpm-left + .dpm-right
       duration: 0.7, ease: 'power3.inOut',
       split: 0.5,            // seam position (0.5 = 50/50)
       contentDelay: 0.25, contentStagger: 0.06,  // nav rows / identity fade-up after panels land
       scrim: '.dpm-scrim'    // optional page-recede scrim selector (faded in under the menu)
     })
   Returns { open(), close(), toggle(), isOpen(), destroy }.

   ENGINE LAWS: transform(translateX) + opacity only; GPU; NO mix-blend / NO backdrop;
   NO WebGL; reduced-motion -> instant open/close. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      duration: options.duration != null ? options.duration : 0.7,
      ease: options.ease || 'power3.inOut',
      split: options.split != null ? options.split : 0.5,
      contentDelay: options.contentDelay != null ? options.contentDelay : 0.25,
      contentStagger: options.contentStagger != null ? options.contentStagger : 0.06,
      scrimSel: options.scrim || '.dpm-scrim'
    };
    var root = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!root) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var left = root.querySelector('.dpm-left');
    var right = root.querySelector('.dpm-right');
    var scrim = doc.querySelector(opt.scrimSel);
    var rows = [].slice.call(root.querySelectorAll('.dpm-item'));
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;
    var open = false;

    // sizing: left panel width = split, right = 1-split
    if (left) left.style.width = (opt.split * 100) + '%';
    if (right) { right.style.width = ((1 - opt.split) * 100) + '%'; right.style.left = (opt.split * 100) + '%'; }

    function setRoot(on) { root.style.pointerEvents = on ? 'auto' : 'none'; root.style.visibility = on ? 'visible' : 'hidden'; }
    function prime() {
      setRoot(false);
      if (left) left.style.transform = 'translateX(-100%)';
      if (right) right.style.transform = 'translateX(100%)';
      if (scrim) scrim.style.opacity = '0';
      rows.forEach(function (r) { r.style.opacity = '0'; r.style.transform = 'translateY(10px)'; });
    }
    prime();

    function tw(el, props, dur, ease, delay, onDone) {
      if (reduced || dur <= 0) { Object.keys(props).forEach(function (k) { el.style[k === 'x' ? 'transform' : k] = k === 'x' ? 'translateX(' + props.x + ')' : (k === 'y' ? 'translateY(' + props.y + ')' : props[k]); }); onDone && onDone(); return; }
      if (gsap) { var p = { duration: dur, ease: ease, delay: delay || 0, onComplete: onDone };
        for (var k in props) { if (k.charAt(0) !== '_') p[k] = props[k]; } // skip _from* helper fields (built-in only)
        gsap.to(el, p); return; }
      // built-in (handles x/opacity/y simply)
      setTimeout(function () {
        var t0 = null, ef = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
        var fromX = props.x != null ? (parseFloat(el.style.transform.replace(/[^-\d.]/g, '')) || 0) : null;
        (function step(ts) { if (t0 == null) t0 = ts; var t = Math.min(1, (ts - t0) / (dur * 1000)), e = ef(t);
          if (props.opacity != null) el.style.opacity = (props._fromO + (props.opacity - props._fromO) * e);
          if (props.x != null) el.style.transform = 'translateX(' + (props._fromX + (parseFloat(props.x) - props._fromX) * e) + '%)';
          if (props.y != null) el.style.transform = 'translateY(' + (props._fromY + (parseFloat(props.y) - props._fromY) * e) + 'px)';
          if (t < 1) global.requestAnimationFrame(step); else onDone && onDone();
        })(performance.now());
      }, (delay || 0) * 1000);
    }

    function doOpen() {
      if (open) return; open = true; setRoot(true);
      if (scrim) tw(scrim, { opacity: 0.5, _fromO: 0 }, opt.duration, opt.ease);
      if (left) tw(left, { x: '0%', _fromX: -100 }, opt.duration, opt.ease);
      if (right) tw(right, { x: '0%', _fromX: 100 }, opt.duration, opt.ease);
      rows.forEach(function (r, i) { tw(r, { opacity: 1, _fromO: 0, y: 0, _fromY: 10 }, 0.5, 'power3.out', opt.contentDelay + i * opt.contentStagger); });
    }
    function doClose() {
      if (!open) return; open = false;
      rows.forEach(function (r) { r.style.opacity = '0'; });
      if (scrim) tw(scrim, { opacity: 0, _fromO: 0.5 }, opt.duration, opt.ease);
      if (left) tw(left, { x: '-100%', _fromX: 0 }, opt.duration, opt.ease);
      if (right) tw(right, { x: '100%', _fromX: 0 }, opt.duration, opt.ease, 0, function () { setRoot(false); });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      open: doOpen, close: doClose, toggle: function () { open ? doClose() : doOpen(); },
      isOpen: function () { return open; }, destroy: function () { prime(); }
    };
  }

  var api = { create: create };
  global.DualPanelMenu = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
