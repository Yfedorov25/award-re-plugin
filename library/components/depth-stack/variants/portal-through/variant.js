/* ============================================================================
   depth-stack / portal-through — variant.js  (base-importing engine, NOT a fork)
   ----------------------------------------------------------------------------
   The PORTAL / TUNNEL engine, recorded 1:1 from depth-d3-portal-through.html. It
   imports the SHARED frame (../../component.js → window.DepthStack) and supplies
   the per-frame painter `applyTunnel(prog)`. The base owns pin / scrub:0.7 / snap
   1/(N-1) / reduced-motion; this file owns the translateZ tunnel math. Engine
   numbers are byte-faithful to the source — do not alter.

   The whole stack is a TUNNEL of planes along -z. `prog` (0..N-1, continuous) is
   the camera's position in the deck — it grows as you scroll DOWN. For frame i,
   its depth relative to the camera is  d = i - prog.
     d > 0 : AHEAD, deep in the tunnel — small, far, hazed, behind.
     d = 0 : AT the camera plane — full-bleed, in focus.
     d < 0 : BEHIND — you have flown THROUGH it: scales UP past the frame, dissolves.

   SCROLL-LOGIC (the V4 fix): scroll DOWN → prog increases → camera moves FORWARD.
   The next frame's depth d shrinks +1 → 0, so it grows BIGGER and comes FORWARD.
   Nothing rises against the wheel. Forward = down-the-page.

   7 micro-mechanics: scale-through · cross-dissolve · depth-haze · parallax
   text-lag · ken-burns · headline split-reveal · forward-flying depth counter.

   Usage (the variant entry):
     DepthPortalThrough.init({ stage:'#stage', pad:'#pad', frames:[...], depthNum, railFill, railBead, railNum, hint })
   ========================================================================== */
(function (global) {
  "use strict";

  function init(opts) {
    opts = opts || {};
    if (!global.DepthStack) { console.error("DepthPortalThrough.init: DepthStack base not loaded"); return null; }
    if (global.gsap && global.ScrollTrigger) gsap.registerPlugin(ScrollTrigger, global.CustomEase || {});
    DepthStack.ensureAir();
    var airEase = (global.gsap && gsap.parseEase("air")) || function (x) { return x; };

    var stage = typeof opts.stage === "string" ? document.querySelector(opts.stage) : (opts.stage || document.getElementById("stage"));
    var pad   = typeof opts.pad   === "string" ? document.querySelector(opts.pad)   : (opts.pad   || document.getElementById("pad"));
    var FRAMES = opts.frames || [];
    var N = FRAMES.length;

    /* ---- build frames. DOM order = frame 0 first; z-index handled by the model
       so the nearest-to-camera frame always renders on top. ---- */
    var els = [];
    for (var i = 0; i < N; i++) {
      var f = FRAMES[i];
      var el = document.createElement("article");
      el.className = "frame";
      el.dataset.idx = i;

      var titleHtml = f.title.map(function (w) { return '<span class="word"><span>' + w + "</span></span>"; }).join(" ");
      var featHtml  = f.feats.map(function (ft) { return '<div class="feat"><span class="k">' + ft[0] + '</span><span class="v">' + ft[1] + "</span></div>"; }).join("");

      el.innerHTML =
        '<img class="frame__img" src="' + f.img + '" alt="" loading="eager" decoding="async" />' +
        '<div class="frame__haze"></div>' +
        '<span class="frame__tag">' + f.tag + "</span>" +
        '<div class="frame__text">' +
          '<div class="frame__eyebrow">' +
            '<span class="frame__count">(<b>' + String(i + 1).padStart(2, "0") + "</b> / " + String(N).padStart(2, "0") + ")</span>" +
            '<span class="frame__rule"></span>' +
            "<span>QUADRO</span>" +
          "</div>" +
          '<h2 class="frame__title serif">' + titleHtml + "</h2>" +
          '<p class="frame__desc">' + f.desc + "</p>" +
          '<div class="frame__feats">' + featHtml + "</div>" +
        "</div>";
      pad.appendChild(el);
      els.push(el);
    }

    var imgs  = els.map(function (e) { return e.querySelector(".frame__img"); });
    var hazes = els.map(function (e) { return e.querySelector(".frame__haze"); });
    var texts = els.map(function (e) { return e.querySelector(".frame__text"); });
    var words = els.map(function (e) { return Array.prototype.slice.call(e.querySelectorAll(".word > span")); });

    /* ===== the TUNNEL painter (byte-faithful applyTunnel) ===== */
    function applyTunnel(prog) {
      for (var i = 0; i < N; i++) {
        var d = i - prog;                 // signed depth (ahead +, behind -)
        var el = els[i];
        var z, scale, op, blur, hazeOp, zi, brightness;

        if (d >= 0) {
          // AHEAD in the tunnel (or exactly at camera). As d->0 it flies forward.
          var dd = Math.min(d, 3);
          var approach = airEase(gsap.utils.clamp(0, 1, 1 - Math.min(d, 1)));  // 0 far .. 1 at camera
          z      = -dd * 540;                                 // deep planes pushed back
          scale  = gsap.utils.interpolate(0.62, 1, approach); // grows toward 1 at focus
          if (d > 1) scale = gsap.utils.interpolate(0.62, 0.7, gsap.utils.clamp(0, 1, (3 - Math.min(d, 3)) / 2));
          op     = d > 2.4 ? 0 : 1;
          blur   = gsap.utils.interpolate(7, 0, approach);    // far = soft, focus = crisp
          hazeOp = gsap.utils.interpolate(0.82, 0, approach); // depth haze clears on approach
          brightness = gsap.utils.interpolate(0.5, 1, approach);
          zi     = 100 - i;                                   // deeper frame -> lower
        } else {
          // BEHIND camera: we have flown THROUGH it. Scale up past the frame + dissolve.
          var t  = Math.min(-d, 1);                           // 0..1 leaving forward
          var e  = airEase(t);
          z      = e * 360;                                   // rushes toward/past camera
          scale  = gsap.utils.interpolate(1, 1.9, e);         // blows up as you pass through
          op     = 1 - e;                                     // dissolves
          blur   = e * 6;                                     // motion-soft on exit
          hazeOp = 0;
          brightness = gsap.utils.interpolate(1, 1.18, e);    // brief bloom as it engulfs you
          zi     = 200;                                       // the frame you pass through is nearest
        }

        gsap.set(el, {
          z: z,
          scale: scale,
          opacity: op,
          zIndex: Math.round(zi),
          filter: "brightness(" + brightness.toFixed(3) + ") blur(" + blur.toFixed(2) + "px)"
        });
        gsap.set(hazes[i], { opacity: hazeOp.toFixed(3) });

        // ---- (4) PARALLAX: text column rides a nearer z-plane + lags the render ----
        var near = gsap.utils.clamp(0, 1, 1 - Math.abs(d));  // 1 at focus
        var txtY = (d > 0)
          ? gsap.utils.interpolate(46, 0, airEase(near))               // rises INTO place from below as it nears
          : gsap.utils.interpolate(0, -34, airEase(Math.min(-d, 1)));  // continues forward/up as flown-through
        var txtOp = (d >= 0) ? gsap.utils.clamp(0, 1, near * 1.4) : (1 - Math.min(-d, 1));
        gsap.set(texts[i], { yPercent: txtY, opacity: txtOp, z: 60 });

        // ---- (5) KEN-BURNS: active render slowly pushes in; idle when far/passed ----
        var settle = gsap.utils.clamp(0, 1, 1 - Math.abs(d));
        var kb = gsap.utils.interpolate(1.0, 1.06, settle);
        var kx = gsap.utils.interpolate(0, (i % 2 ? -1.8 : 1.8), settle);
        var ky = gsap.utils.interpolate(0, -1.3, settle);
        gsap.set(imgs[i], { scale: kb, xPercent: kx, yPercent: ky });
      }
    }

    /* ---- (6) headline split-reveal: fire once when a frame lands at the camera ---- */
    var lastActive = -1;
    function revealHeadline(active) {
      if (active === lastActive) return;
      lastActive = active;
      words.forEach(function (set, i) {
        if (i === active) {
          gsap.fromTo(set, { yPercent: 118 },
            { yPercent: 0, duration: 0.92, ease: "air", stagger: 0.06, overwrite: true });
        } else {
          gsap.set(set, { yPercent: i < active ? 0 : 118 });
        }
      });
    }

    /* ---- (7) forward-flying depth counter + rail ---- */
    var depthNum = opts.depthNum || document.getElementById("depthNum");
    var railFill = opts.railFill || document.getElementById("railFill");
    var railBead = opts.railBead || document.getElementById("railBead");
    var railNum  = opts.railNum  || document.getElementById("railNum");
    var hint     = opts.hint     || document.getElementById("hint");

    function updateChrome(prog) {
      var t = prog / (N - 1);                 // 0..1 overall
      if (railFill) railFill.style.height = (t * 100) + "%";
      if (railBead) railBead.style.top    = (t * 100) + "%";
      var active = Math.round(prog);
      if (railNum) railNum.textContent = String(active + 1).padStart(2, "0");
      if (hint) {
        hint.textContent = "Кадр " + String(active + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");
        hint.style.opacity = prog > N - 1.12 ? 0 : 0.85;
      }

      // depth counter shows the frame you're arriving INTO and "flies forward"
      // (scales up + fades) at each hand-off — same forward logic as the renders.
      var frac = prog - Math.floor(prog);
      var arriving = Math.round(prog);
      if (depthNum) {
        depthNum.textContent = String(arriving + 1).padStart(2, "0");
        var fly = Math.sin(frac * Math.PI);                 // 0 settled, 1 mid hand-off
        var cscale = Math.max(0.2, 1 + fly * 0.5);          // grows toward you at the seam
        var cOp = gsap.utils.interpolate(0.06, 0.015, fly); // dimmer while flying through
        depthNum.style.transform = "translateX(-50%) scale(" + cscale.toFixed(3) + ")";
        depthNum.style.opacity = cOp.toFixed(3);
      }
    }

    /* ---- INITIAL STATE ---- */
    words.forEach(function (set) { gsap.set(set, { yPercent: 118 }); });

    /* ---- ENTRY painter: camera flies forward into frame 0 over the hero handoff ---- */
    gsap.set(els[0], { z: -520, scale: 0.6, opacity: 0 });
    function entryFrame(progress, e) {
      gsap.set(els[0], {
        z: gsap.utils.interpolate(-520, 0, e),
        scale: gsap.utils.interpolate(0.6, 1, e),
        opacity: gsap.utils.clamp(0, 1, progress * 1.6),
        filter: "brightness(" + gsap.utils.interpolate(0.5, 1, e).toFixed(3) + ") blur(" + gsap.utils.interpolate(7, 0, e).toFixed(2) + "px)"
      });
      gsap.set(hazes[0], { opacity: gsap.utils.interpolate(0.82, 0, e).toFixed(3) });
      gsap.set(texts[0], { yPercent: gsap.utils.interpolate(46, 0, e), opacity: gsap.utils.clamp(0, 1, (progress - 0.25) * 1.8) });
    }

    /* ---- reduced-motion painter: static frames, simple jump, no fly-through drama ---- */
    function reducedFrame(active) {
      els.forEach(function (el, i) { gsap.set(el, { z: 0, scale: 1, opacity: i === active ? 1 : 0, filter: "none", zIndex: i === active ? 200 : 1 }); });
      hazes.forEach(function (h) { gsap.set(h, { opacity: 0 }); });
      texts.forEach(function (tx) { gsap.set(tx, { yPercent: 0, opacity: 1 }); });
      words.forEach(function (set) { gsap.set(set, { yPercent: 0 }); });
    }

    /* preload renders so the tunnel never flashes empty */
    FRAMES.forEach(function (f) { var im = new Image(); im.src = f.img; });

    /* ---- MOUNT the shared frame, supplying the tunnel engine ---- */
    return DepthStack.mount(stage, {
      n: N,
      applyFrame: applyTunnel,
      entryFrame: entryFrame,
      updateChrome: updateChrome,
      revealHeadline: revealHeadline,
      reducedFrame: reducedFrame,
      endMult: 1.0,         // portal-through pin budget (depth-d3)
      scrub: 0.7,
      entryScrub: 0.6
    });
  }

  global.DepthPortalThrough = { init: init };
})(typeof window !== "undefined" ? window : this);
