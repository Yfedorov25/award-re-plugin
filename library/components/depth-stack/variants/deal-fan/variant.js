/* ============================================================================
   depth-stack / deal-fan — variant.js  (base-importing engine, NOT a fork)
   ----------------------------------------------------------------------------
   The DEAL / FAN engine, recorded 1:1 from depth-d2-deal-fan.html. It imports
   the SHARED frame (../../component.js → window.DepthStack) and supplies the
   per-frame painter `applyDeal(prog)`. The base owns the pin / scrub:0.7 / snap
   1/(N-1) / reduced-motion scaffolding; this file owns the deal-conveyor + fan
   geometry math. Engine numbers are byte-faithful to the source — do not alter.

   Mental model: a held hand of cards. The DECK is at the top-right corner.
   Scrolling DOWN deals the next card FORWARD and DOWN onto the table; the spent
   card is pushed further forward + down and off the bottom edge.

     p = i - prog  (signed stack position relative to continuous active index)
       p >= 1 : ROLE A — parked deck / HAND, fanned up-and-right with 3D depth.
       0<p<1  : ROLE B incoming — descends from the deck slot to centre (pure DOWN).
       p < 0  : ROLE B spent — continues DOWN past the bottom, toward the viewer.

   SCROLL-DIRECTION LAW (the V4 fix): arrival AND exit both travel DOWN /
   toward-viewer — the same way the wheel pushes. Felt direction == wheel.

   Usage (the variant entry):
     DepthDealFan.init({ stage:'#stage', pad:'#pad', cards:[...], railFill, railChip, railNum, hint })
   ========================================================================== */
(function (global) {
  "use strict";

  /* ===== fan / deck geometry (byte-faithful to depth-d2) ===== */
  var FAN_ROT   = 6.5;    // deg in-plane fan per deck-depth (clockwise into the hand)
  var FAN_X     = 12;     // % up-right offset per deck-depth (toward the deck corner)
  var FAN_Y     = -34;    // % the parked deck is held HIGH & to the right (deals downward)
  var FAN_Z     = -150;   // px pushed back per deck-depth
  var FAN_SCALE = 0.055;  // smaller per deck-depth
  var MAXD      = 3.2;    // clamp deck depth so far cards don't fly away
  var DEAL_OUT  = 104;    // % spent card continues DOWN past the bottom edge
  /* CONTINUITY: the incoming card must START exactly where the deck's depth-1
     slot sits, so there is no jump at the deck->deal handoff (p crossing 1). */
  var DEAL_IN0  = FAN_Y;  // incoming start y == deck depth-1 y (continuous, above centre)

  function init(opts) {
    opts = opts || {};
    if (!global.DepthStack) { console.error("DepthDealFan.init: DepthStack base not loaded"); return null; }
    if (global.gsap && global.ScrollTrigger) gsap.registerPlugin(ScrollTrigger, global.CustomEase || {});
    DepthStack.ensureAir();
    var airEase = (global.gsap && gsap.parseEase("air")) || function (x) { return x; };

    var stage = typeof opts.stage === "string" ? document.querySelector(opts.stage) : (opts.stage || document.getElementById("stage"));
    var pad   = typeof opts.pad   === "string" ? document.querySelector(opts.pad)   : (opts.pad   || document.getElementById("pad"));
    var CARDS = opts.cards || [];
    var N = CARDS.length;

    /* ---- build cards (DOM order back→front so card 0 sits on top at prog=0) ---- */
    var els = [];
    for (var i = 0; i < N; i++) {
      var c = CARDS[i];
      var card = document.createElement("article");
      card.className = "card card--" + c.theme + (c.flip ? " card--flip" : "");
      card.dataset.idx = i;

      var titleHtml = c.title.map(function (w) {
        return '<span class="word"><span>' + w + "</span></span>";
      }).join(" ");
      var featHtml = c.feats.map(function (f) {
        return '<div class="feat"><span>' + f[0] + "</span><span>" + f[1] + "</span></div>";
      }).join("");

      card.innerHTML =
        '<div class="card__grid">' +
          '<div class="card__text">' +
            "<div>" +
              '<div class="card__eyebrow">' +
                '<span class="card__count">(<b>' + String(i + 1).padStart(2, "0") + "</b> / " + String(N).padStart(2, "0") + ")</span>" +
                '<span class="card__rule"></span>' +
                "<span>QUADRO</span>" +
              "</div>" +
              '<div class="card__head">' +
                '<h2 class="card__title serif">' + titleHtml + "</h2>" +
                '<p class="card__desc">' + c.desc + "</p>" +
              "</div>" +
            "</div>" +
            "<div>" +
              '<div class="card__feats">' + featHtml + "</div>" +
              '<div class="card__cta">' +
                '<span class="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
                "<span>" + c.cta + "</span>" +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="card__media">' +
            '<img class="card__img" src="' + c.img + '" alt="" loading="eager" decoding="async" />' +
            '<span class="card__tag">' + c.tag + "</span>" +
            '<span class="card__pip serif">' + String(i + 1).padStart(2, "0") + "</span>" +
          "</div>" +
        "</div>";
      els.push(card);
    }
    /* DOM order back→front: card 0 painted LAST so it sits on top when prog=0 */
    for (var j = N - 1; j >= 0; j--) pad.appendChild(els[j]);

    var imgs  = els.map(function (e) { return e.querySelector(".card__img"); });
    var words = els.map(function (e) { return Array.prototype.slice.call(e.querySelectorAll(".word > span")); });

    /* ===== the DEAL painter (byte-faithful applyDeal) ===== */
    function applyDeal(prog) {
      for (var i = 0; i < N; i++) {
        var p = i - prog;
        var card = els[i];

        if (p >= 1) {
          /* ---- ROLE A: parked deck, fanned up-and-right with depth ---- */
          var d = Math.min(p, MAXD);
          var dClamp = Math.min(p, 3);
          var bright = 1 - Math.min(p, 2.4) * 0.17;
          gsap.set(card, {
            xPercent: d * FAN_X,
            yPercent: d * FAN_Y,
            z:        d * FAN_Z,
            rotationZ: d * FAN_ROT,
            rotationX: 0,
            scale:    1 - dClamp * FAN_SCALE,
            opacity:  p > MAXD ? 0 : 1,
            zIndex:   Math.round(100 - i),
            filter: "brightness(" + bright.toFixed(3) + ")",
            boxShadow: "0 " + (34 + d * 16).toFixed(0) + "px " + (70 + d * 14).toFixed(0) + "px -36px rgba(0,0,0,0.30)"
          });

        } else if (p > 0) {
          /* ---- ROLE B (incoming): descend from above the frame into centre ---- */
          var e = airEase(1 - p);
          gsap.set(card, {
            xPercent: gsap.utils.interpolate(FAN_X, 0, e),     // from deck side -> centre
            yPercent: gsap.utils.interpolate(DEAL_IN0, 0, e),  // from HIGH (=deck d1) -> centre, pure DOWN
            z:        gsap.utils.interpolate(FAN_Z, 0, e),     // matches deck d1 at e=0 (continuous)
            rotationZ: gsap.utils.interpolate(FAN_ROT, 0, e),  // matches deck d1 fan tilt, unwinds to 0
            rotationX: 0,
            scale:    gsap.utils.interpolate(1 - FAN_SCALE, 1, e),
            opacity:  1,                                       // already opaque in the deck; no flash
            zIndex:   112,                                     // rides above the deck while dealt
            filter: "brightness(" + gsap.utils.interpolate(0.83, 1, e).toFixed(3) + ")",
            boxShadow: "0 " + (44 + (1 - e) * 26).toFixed(0) + "px " + (100).toFixed(0) + "px -40px rgba(0,0,0," + gsap.utils.interpolate(0.34, 0.62, e).toFixed(2) + ")"
          });

        } else {
          /* ---- ROLE B (spent): continue DOWN past the bottom, toward viewer ---- */
          var e2 = airEase(Math.min(-p, 1));
          gsap.set(card, {
            xPercent: e2 * -5,                  // small drift as it clears the table
            yPercent: e2 * DEAL_OUT,            // 0 -> below the bottom edge (continues down)
            z:        e2 * 200,                 // toward the viewer (forward, never back)
            rotationZ: e2 * -5,                 // unwinds the SAME rotational way
            rotationX: 0,
            scale:    gsap.utils.interpolate(1, 1.1, e2),
            opacity:  1 - gsap.utils.clamp(0, 1, (-p) * 1.25),
            zIndex:   118,                      // stays above the freshly-landed card a beat
            filter: "brightness(1)",
            boxShadow: "0 70px 130px -40px rgba(0,0,0,0.6)"
          });
        }

        /* ---- KEN BURNS: render drifts most when its card is settled/active ---- */
        var settle = gsap.utils.clamp(0, 1, 1 - Math.abs(p));
        var kb = gsap.utils.interpolate(1.0, 1.07, settle);
        var kx = gsap.utils.interpolate(0, (i % 2 ? -2.2 : 2.2), settle);
        var ky = gsap.utils.interpolate(0, -1.6, settle);
        gsap.set(imgs[i], { scale: kb, xPercent: kx, yPercent: ky });
      }
    }

    /* ---- headline split-reveal: fire once when a card becomes active ---- */
    var lastActive = -1;
    function revealHeadline(active) {
      if (active === lastActive) return;
      lastActive = active;
      words.forEach(function (set, i) {
        if (i === active) {
          gsap.fromTo(set, { yPercent: 115 },
            { yPercent: 0, duration: 0.92, ease: "air", stagger: 0.06, overwrite: true });
        } else {
          gsap.set(set, { yPercent: i < active ? 0 : 115 });
        }
      });
    }

    /* ---- counter / rail / handle / hint ---- */
    var railFill = opts.railFill || document.getElementById("railFill");
    var railChip = opts.railChip || document.getElementById("railChip");
    var railNum  = opts.railNum  || document.getElementById("railNum");
    var hint     = opts.hint     || document.getElementById("hint");

    function updateChrome(prog) {
      var t = prog / (N - 1);
      if (railFill) railFill.style.height = (t * 100) + "%";
      var active = Math.round(prog);
      if (railNum) railNum.textContent = String(active + 1).padStart(2, "0");
      if (hint) {
        hint.textContent = "Карта " + String(active + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");
        hint.style.opacity = prog > N - 1.15 ? 0 : 0.85;
      }
      /* the handle "deals": dips down + tilts a touch mid-transition, snaps flat at rest */
      var frac = prog - Math.floor(prog);
      var ride = Math.sin(frac * Math.PI);     // 0 at snap, 1 mid-deal
      if (railChip) {
        railChip.style.top = (t * 100) + "%";
        railChip.style.transform =
          "translate(-50%,-50%) rotate(" + (-8 - ride * 10).toFixed(1) + "deg) translateY(" + (ride * 4).toFixed(1) + "px)";
      }
    }

    /* ---- INITIAL STATE ---- */
    words.forEach(function (set) { gsap.set(set, { yPercent: 115 }); });

    /* ---- ENTRY painter: first card dealt in from ABOVE the frame ---- */
    gsap.set(els[0], { xPercent: FAN_X, yPercent: DEAL_IN0, z: FAN_Z, rotationZ: FAN_ROT, scale: 1 - FAN_SCALE, opacity: 0, zIndex: 120 });
    function entryFrame(progress, e) {
      gsap.set(els[0], {
        xPercent: gsap.utils.interpolate(FAN_X, 0, e),
        yPercent: gsap.utils.interpolate(DEAL_IN0, 0, e),  // descends from above (down)
        z:        gsap.utils.interpolate(FAN_Z, 0, e),
        rotationZ: gsap.utils.interpolate(FAN_ROT, 0, e),
        scale:    gsap.utils.interpolate(1 - FAN_SCALE, 1, e),
        opacity:  gsap.utils.clamp(0, 1, progress * 1.6)
      });
    }

    /* ---- reduced-motion painter: static, jump between cards, no deal drama ---- */
    function reducedFrame(active) {
      applyDeal(active);
      words.forEach(function (set) { gsap.set(set, { yPercent: 0 }); });
      gsap.set(els[0], { opacity: 1 });
    }

    /* preload renders so the felt never flashes empty */
    CARDS.forEach(function (c) { var im = new Image(); im.src = c.img; });

    /* ---- MOUNT the shared frame, supplying the deal engine ---- */
    return DepthStack.mount(stage, {
      n: N,
      applyFrame: applyDeal,
      entryFrame: entryFrame,
      updateChrome: updateChrome,
      revealHeadline: revealHeadline,
      reducedFrame: reducedFrame,
      endMult: 0.95,        // deal-fan pin budget (depth-d2)
      scrub: 0.7,
      entryScrub: 0.6
    });
  }

  global.DepthDealFan = { init: init };
})(typeof window !== "undefined" ? window : this);
