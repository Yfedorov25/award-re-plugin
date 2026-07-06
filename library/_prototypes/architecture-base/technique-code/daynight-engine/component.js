/* ============================================================
   DAYNIGHT-ENGINE · component.js   (vanilla, GSAP optional)
   ------------------------------------------------------------
   THE SIGNATURE MOVE — two frame-matched media of the SAME scene (a daytime render and
   a nighttime render) stacked in one box, with a single normalized progress t (0..1)
   driving the reveal. t=0 = pure day, t=1 = pure night. This is the user's house feature:
   "the same house, the same window — now it's evening." It exists nowhere else as a
   building block; distilled here from the three real implementations we shipped:

     • TOWNS  (toggle / opacity)  — data-mode flip + sliding pill thumb. Seed: plan.js.
     • NAHIRNA (scrub / opacity)  — pinned ScrollTrigger scrub + warm glow + legibility
                                    scrim + reduced-motion static. Seed: 00-Hero.tsx.
     • SMARTS (cursor / seam)     — clip-path inset(0 0 0 var(--split)) following the
                                    cursor via gsap.quickTo; touch-drag twin. Seed: interiors.js.

   ONE ENGINE, TWO PLUGGABLE AXES:
     driver  — what writes t:  "toggle" | "scrub" | "cursor" | "hover" | "autoloop" | "manual"
     reveal  — how the night layer appears for a given t:
                 "opacity"  night.opacity = t                              (Towns / Nahirna)
                 "seam"     night clip-path inset peels from one edge       (Smarts)
                 "portal"   night clip-path circle() blooms from an origin
                 "mask"     handled by composites (per-window thresholds) — see daynight-masked-windows

   daynight-engine.create(target, {
     // --- media (required): two frame-matched layers, identical composition ---
     dayMedia,            // selector | element | url   (bottom, always opacity 1)
     nightMedia,          // selector | element | url   (top, revealed by t)
     // --- the two axes ---
     mode: "scrub",       // driver (alias: driver)
     reveal: "opacity",   // "opacity" | "seam" | "portal"
     seamAxis: "x",       // reveal:"seam"  -> "x" (vertical wipe) | "y" (sky falls)
     seamFrom: "right",   // reveal:"seam"  -> which edge the night enters from
     portalOrigin: "50% 50%",  // reveal:"portal" -> CSS position of the circle centre
     // --- driver options ---
     ease: 0.5,           // cursor/hover smoothing seconds (gsap.quickTo / built-in lerp)
     rest: 0,             // cursor: t to relax to on mouseleave (0=day)
     loop: { period: 8 },        // mode:"autoloop" -> seconds per full day<->night<->day
     scrub: { trigger, start:"top top", end:"+=110%", pin:true }, // mode:"scrub" only
     // --- optional cinematic layers (ride the same t) ---
     scrim: 0.0,          // legibility darkening overlay peak opacity (0 = off)  (Nahirna)
     glow: false,         // warm window-glow that rises with t  (true | css-gradient string)
     labels: null,        // ["День","Ніч"] static corner tags (null = none)
     onUpdate: null,      // (t) => {}  expose t for app-side sync (text beats, counters)
   })
   Returns { root, set(t), get(), toggle(), play(), pause(), setMode(m), destroy }.
     set(t)  — PURE: write progress directly (drive from ANY external scrub).
     get()   — current t.

   ENGINE LAWS: opacity / clip-path / transform / CSS-gradient only. GPU-compositable.
   NO canvas drawImage (Nahirna rejected it for iOS), NO mix-blend, NO backdrop-filter,
   NO WebGL. prefers-reduced-motion -> static end state, drivers disarmed.
   Frame-match rule: if the night frame is NOT geometry-identical to day, do NOT crossfade
   (it "jumps") — fall back to a static frame. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function el(t, host) {
    if (!t) return null;
    if (typeof t === 'string') {
      // a url (has a dot + slash/extension) vs a selector
      if (/\.(webp|jpg|jpeg|png|avif|gif|mp4|webm)(\?|$)/i.test(t)) {
        var im = doc.createElement(/\.(mp4|webm)(\?|$)/i.test(t) ? 'video' : 'img');
        im.src = t; im.setAttribute('loading', 'eager'); im.setAttribute('decoding', 'async');
        if (im.tagName === 'VIDEO') { im.muted = true; im.loop = true; im.playsInline = true; im.autoplay = true; }
        return im;
      }
      return (host || doc).querySelector(t);
    }
    return t;
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // reveal -> CSS for the NIGHT layer at progress t. For "seam", t IS the seam position as a
  // fraction along the axis (0 = left/top edge .. 1 = right/bottom edge); the seam sits at the
  // cursor and the NIGHT layer occupies one side of it. This is the SMARTS curtain 1:1:
  //   .night { clip-path: inset(0 0 0 var(--split)) }  with --split = cursorX/width
  // => night is shown to the side the cursor REVEALS. With seamFrom:"left" (default) the night
  //    sits to the RIGHT of the seam, so sweeping the cursor left->right uncovers the evening
  //    ahead of it (the night region grows as the seam moves right). This is the Smarts feel.
  function revealCSS(opt, t) {
    if (opt.reveal === 'seam') {
      var p = (t * 100).toFixed(3) + '%';           // seam position = clip from the leading edge
      var inv = ((1 - t) * 100).toFixed(3) + '%';
      if (opt.seamAxis === 'y') {
        return opt.seamFrom === 'bottom'
          ? { clipPath: 'inset(0 0 ' + inv + ' 0)' }  // night below the seam (reveal downward)
          : { clipPath: 'inset(' + p + ' 0 0 0)' };   // night below the seam, clipped from top (default)
      }
      return opt.seamFrom === 'right'
        ? { clipPath: 'inset(0 ' + inv + ' 0 0)' }    // night to the LEFT of the seam
        : { clipPath: 'inset(0 0 0 ' + p + ')' };     // night to the RIGHT of the seam (Smarts default)
    }
    if (opt.reveal === 'portal') {
      var r = (t * 145).toFixed(2) + '%';
      return { clipPath: 'circle(' + r + ' at ' + opt.portalOrigin + ')' };
    }
    return { opacity: String(t) };                       // "opacity"
  }

  // the seam line sits exactly at the cursor/progress t (the grip rides the day/night boundary).
  function seamPos(opt, t) { return t; }

  function create(target, options) {
    options = options || {};
    var host = !target ? doc.body : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var opt = {
      mode: options.mode || options.driver || 'scrub',
      reveal: options.reveal || 'opacity',
      seamAxis: options.seamAxis === 'y' ? 'y' : 'x',
      // default seamFrom 'left' (x) / 'top' (y): the seam sits at the cursor and night fills the
      // region swept past it, so left->right (or top->down) REVEALS night following the cursor.
      seamFrom: options.seamFrom || (options.seamAxis === 'y' ? 'top' : 'left'),
      portalOrigin: options.portalOrigin || '50% 50%',
      ease: options.ease != null ? options.ease : 0.5,
      rest: options.rest != null ? options.rest : 0,
      loop: options.loop || { period: 8 },
      scrub: options.scrub || null,
      scrim: options.scrim != null ? options.scrim : 0,
      glow: options.glow || false,
      labels: options.labels || null,
      onUpdate: options.onUpdate || null
    };

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;

    // ---- stage ----
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.style.overflow = host.style.overflow || 'hidden';

    var stage = doc.createElement('div');
    stage.className = 'dn';
    stage.style.cssText = 'position:absolute;inset:0;overflow:hidden';

    var dayEl = el(options.dayMedia, host);
    var nightEl = el(options.nightMedia, host);
    function layer(node, isNight) {
      var w = doc.createElement('div');
      w.className = 'dn__layer ' + (isNight ? 'dn__night' : 'dn__day');
      w.style.cssText = 'position:absolute;inset:0';
      if (node) {
        node.style.position = 'absolute'; node.style.inset = '0';
        node.style.width = '100%'; node.style.height = '100%'; node.style.objectFit = 'cover';
        node.style.display = 'block';
        w.appendChild(node);
      }
      if (isNight) w.style.willChange = (opt.reveal === 'opacity') ? 'opacity' : 'clip-path';
      return w;
    }
    var dayLayer = layer(dayEl, false);
    var nightLayer = layer(nightEl, true);
    stage.appendChild(dayLayer);
    stage.appendChild(nightLayer);

    // optional warm glow that rises with t (Nahirna)
    var glowEl = null;
    if (opt.glow) {
      glowEl = doc.createElement('div');
      glowEl.className = 'dn__glow';
      glowEl.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;background:' +
        (typeof opt.glow === 'string' ? opt.glow : 'radial-gradient(60% 35% at 58% 56%, rgba(232,201,160,0.16), transparent 70%)');
      stage.appendChild(glowEl);
    }
    // optional legibility scrim that rises with t (Nahirna)
    var scrimEl = null;
    if (opt.scrim > 0) {
      scrimEl = doc.createElement('div');
      scrimEl.className = 'dn__scrim';
      scrimEl.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;' +
        'background:linear-gradient(to top, rgba(12,12,11,0.9) 0%, rgba(12,12,11,0.32) 34%, transparent 62%)';
      stage.appendChild(scrimEl);
    }
    host.appendChild(stage);

    // optional static UX tags
    if (opt.labels && opt.labels.length === 2) {
      var tagD = doc.createElement('span'), tagN = doc.createElement('span');
      tagD.className = 'dn__tag dn__tag--day'; tagD.textContent = opt.labels[0];
      tagN.className = 'dn__tag dn__tag--night'; tagN.textContent = opt.labels[1];
      stage.appendChild(tagD); stage.appendChild(tagN);
    }

    // seam line (created eagerly for seam reveals so apply() can ride it on the LIVE t — no lag)
    var seamEl = null;
    if (opt.reveal === 'seam') {
      seamEl = doc.createElement('i');
      seamEl.className = 'dn__seamline';
      seamEl.style.cssText = 'position:absolute;pointer-events:none;z-index:4;' +
        (opt.seamAxis === 'y' ? 'left:0;right:0;height:2px;' : 'top:0;bottom:0;width:2px;');
      stage.appendChild(seamEl);
    }

    // ---- the single source of truth ----
    var t = 0;
    function apply(v) {
      t = clamp(v, 0, 1);
      var css = revealCSS(opt, t);
      for (var k in css) { nightLayer.style[k] = css[k]; if (k === 'clipPath') nightLayer.style.webkitClipPath = css[k]; }
      if (seamEl) seamEl.style[opt.seamAxis === 'y' ? 'top' : 'left'] = (seamPos(opt, t) * 100) + '%';
      if (glowEl) glowEl.style.opacity = String(t);
      if (scrimEl) scrimEl.style.opacity = String(t * opt.scrim);
      if (opt.onUpdate) opt.onUpdate(t);
    }
    apply(0);

    // ---- drivers ----
    var listeners = [];
    function on(node, ev, fn, o) { node.addEventListener(ev, fn, o); listeners.push([node, ev, fn, o]); }

    var quick = (gsap && gsap.quickTo)
      ? gsap.quickTo({ get v() { return t; }, set v(x) { apply(x); } }, 'v', { duration: opt.ease, ease: 'power3.out' })
      : null;
    // built-in lerp fallback for smoothing (when GSAP absent)
    var lerpTarget = 0, lerpRAF = null;
    function lerpTo(to) {
      if (quick) { quick(to); return; }
      lerpTarget = to;
      if (lerpRAF) return;
      (function tick() {
        var d = lerpTarget - t;
        if (Math.abs(d) < 0.001) { apply(lerpTarget); lerpRAF = null; return; }
        apply(t + d * 0.18);
        lerpRAF = global.requestAnimationFrame(tick);
      })();
    }

    var loopRAF = null, loopT0 = null, scrubST = null;
    function disarmLoop() { if (loopRAF) { global.cancelAnimationFrame(loopRAF); loopRAF = null; loopT0 = null; } }

    function armToggle() { /* driven externally via toggle()/set() — nothing to bind */ }

    function armCursor() {
      if (reduced) return;
      // The seam sits AT the cursor; t = the cursor's position along the axis. With seamFrom
      // 'left' (x) / 'top' (y) the night fills the region the cursor has swept past, so moving
      // left->right (or top->down) reveals the evening FOLLOWING the cursor (the Smarts curtain).
      function move(clientPos) {
        var r = stage.getBoundingClientRect();
        var ratio = opt.seamAxis === 'y'
          ? clamp((clientPos - r.top) / r.height, 0, 1)
          : clamp((clientPos - r.left) / r.width, 0, 1);
        lerpTo(ratio);  // seam follows the cursor; apply() rides the live t (no lag)
      }
      on(stage, 'mousemove', function (e) { move(opt.seamAxis === 'y' ? e.clientY : e.clientX); });
      on(stage, 'touchmove', function (e) { var tt = e.touches[0]; move(opt.seamAxis === 'y' ? tt.clientY : tt.clientX); }, { passive: true });
      on(stage, 'mouseleave', function () { lerpTo(opt.rest); });
    }

    function armHover() {
      if (reduced) return;
      on(stage, 'mouseenter', function () { lerpTo(1); });
      on(stage, 'mouseleave', function () { lerpTo(0); });
      on(stage, 'click', function () { lerpTo(t < 0.5 ? 1 : 0); }); // touch fallback
    }

    function armAutoloop() {
      if (reduced) { apply(1); return; }
      var period = (opt.loop.period || 8) * 1000;
      function step(ts) {
        if (loopT0 == null) loopT0 = ts;
        var phase = ((ts - loopT0) % period) / period;      // 0..1
        apply(phase < 0.5 ? phase * 2 : (1 - phase) * 2);    // ping-pong day<->night
        loopRAF = global.requestAnimationFrame(step);
      }
      loopRAF = global.requestAnimationFrame(step);
    }

    function armScrub() {
      if (reduced || !gsap || !global.ScrollTrigger || !opt.scrub) { return; }
      var cfg = opt.scrub;
      scrubST = global.ScrollTrigger.create({
        trigger: cfg.trigger || host,
        start: cfg.start || 'top top',
        end: cfg.end || '+=110%',
        scrub: cfg.scrub != null ? cfg.scrub : true,
        pin: cfg.pin != null ? cfg.pin : true,
        pinSpacing: cfg.pinSpacing != null ? cfg.pinSpacing : true,
        anticipatePin: 1,
        onUpdate: function (st) { apply(st.progress); }
      });
    }

    function arm() {
      switch (opt.mode) {
        case 'toggle': armToggle(); break;
        case 'cursor': armCursor(); break;
        case 'hover': armHover(); break;
        case 'autoloop': armAutoloop(); break;
        case 'scrub': armScrub(); break;
        case 'manual': default: break; // external set(t) only
      }
      if (reduced && opt.mode !== 'autoloop') apply(opt.mode === 'scrub' ? 1 : opt.rest); // static end state
    }
    arm();

    function teardown() {
      disarmLoop();
      if (lerpRAF) { global.cancelAnimationFrame(lerpRAF); lerpRAF = null; }
      if (scrubST) { scrubST.kill(); scrubST = null; }
      listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
      listeners = [];
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      root: stage,
      set: apply,                          // PURE scrub
      get: function () { return t; },
      toggle: function () { lerpTo(t < 0.5 ? 1 : 0); },
      play: function () { if (opt.mode === 'autoloop') { disarmLoop(); armAutoloop(); } },
      pause: function () { disarmLoop(); },
      setMode: function (m) { teardown(); opt.mode = m; arm(); },
      destroy: function () { teardown(); stage.parentNode && stage.parentNode.removeChild(stage); }
    };
  }

  var api = { create: create, revealCSS: revealCSS };
  global.DayNight = api;
  global.daynightEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
