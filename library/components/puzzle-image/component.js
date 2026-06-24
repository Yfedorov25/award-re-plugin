/* ============================================================
   puzzle-image — component.js   (framework-free, GSAP + ScrollTrigger)
   ------------------------------------------------------------
   BASE = pz1 "center-out faithful" (owner-approved, 9/10).
   Re-extracted BYTE-FAITHFULLY from the prototype:
     apps/quadro/public/slide-lab/pz1-center-out-faithful.html
   The closest honest clone of the Zera /work cover beat.

   THE TECHNIQUE (and ONLY this) — two phases on ONE pinned,
   scroll-scrubbed timeline, then a natural release:

     1 ASSEMBLE  Tiles — CSS-sprite SLICES of ONE WIDE LANDSCAPE
                 render (day-front, 16:9) — start SCATTERED + BLURRED
                 + dim across a clean DARK field. As the timeline
                 scrubs forward they FLY HOME CENTER-OUT: the centre
                 tiles seat first, the OUTER tiles fly from FURTHER
                 (a radial REACH bias) and land last. Each tile
                 de-blurs, brightens, un-rotates, scales 0.84 -> 1 as
                 it lands. A ghost serif wordmark (across the top) +
                 a left serif headline + a lower-left caption emerge
                 WITH the seat. The seamless photo + scrim fade in
                 UNDER the tiles right at the seat so any sub-pixel
                 seams vanish into the real cover (the tiles ARE
                 slices of that SAME photo — ZERO two-photo overlap).
                 At assembly the cover already sits near full
                 viewport WIDTH.

     2 GROW      The WHOLE assembled cover (photo + ghost wordmark +
                 captions, ONE DOM unit = .coverWrap) scales up
                 MODESTLY via transform:scale (1 -> ~1.34) until it
                 is full-bleed wide. It STAYS a WIDE landscape cover:
                 the wordmark grows wider WITH the subject; top/bottom
                 crop via .stage overflow:hidden. NOT a clip-path
                 reframe, NOT a 6x over-zoom, NOT a portrait box.

     3 RELEASE   The pin ends; the now-large cover scrolls away
                 naturally and the next section rises. No tween.

   THE LEFT HEADLINE STAYS VISIBLE THROUGHOUT (it is z-index ABOVE the
   cover and is NEVER tweened to opacity 0).

   WHY transform:scale (not clip-path inset): the source grows the
   cover AS ONE UNIT keeping its relative composition. A single MODEST
   uniform scale of the .coverWrap element does exactly that.

   USAGE
     include after GSAP + ScrollTrigger (+ optional CustomEase), then:

       const pz = PuzzleImage(document.querySelector('.puzzle'), {
         src: 'renders/day-front.webp',  // ONE wide render, 16:9, object-fit:cover
         rows: 5, cols: 8,               // 5 x 8 = 40 tiles
         wordmark: 'QUADRO',
         captionLines: ['Золота година.','Власне світло на власному березі.'],
         issueLine: 'Серія · Дім над рікою',
         growPeak: 1.34,         // MODEST uniform scale at peak (full-bleed wide)
         scatter: 0.42,          // radial scatter (fraction of cover); outer fly further
         blurMax: 16,            // <= 20
         pinLengthVh: 300,
       });

     Markup expected inside the root element:
       <section class="puzzle">
         <div class="stage">
           <h1 class="headline">...</h1>
           <p  class="body">...</p>
           <div class="coverWrap">
             <div class="cover">
               <div class="cover__ground"></div>
               <div class="grid"></div>
               <img class="cover__photo" alt="" />
               <div class="cover__scrim"></div>
               <div class="cover__wordmark"></div>
               <div class="cover__caption"></div>
             </div>
           </div>
         </div>
       </section>

   RULES baked in
     • motion is transform / opacity / filter(blur) ONLY. No clip-path reframe.
     • the cover is ONE unit (.coverWrap); the grow is a single transform:scale
       tween on it, so wordmark + captions scale WITH it.
     • cover frame is LANDSCAPE (16:9) sized near full width at rest; .stage has
       overflow:hidden so the MODEST grow crops top/bottom.
     • center-out: a radial REACH bias makes OUTER tiles fly from further so the
       centre seats first, reinforced by a GSAP stagger from:'center'.
     • the photo + scrim fade in UNDER the tiles at the seat — ONE image, no overlap.
     • the LEFT headline is NEVER faded — it stays visible the whole beat.
     • no mix-blend / backdrop-filter over the scrubbed surface (D2).
     • reduced-motion AND mobile show the assembled cover with NO pin / NO scrub
       (pin is desktop-only per the budget, C6/C7).
   ============================================================ */
(function (global) {
  'use strict';

  var DEFAULTS = {
    src: null,
    rows: 5, cols: 8,           // 5 x 8 = 40 tiles (pz1 faithful)
    rowsMobile: 4, colsMobile: 4,
    wordmark: '',
    captionLines: [],
    issueLine: '',
    coverWidthVw: 78,           // assembled (rest) cover WIDTH — wide, near full
    coverAspect: 16 / 9,        // LANDSCAPE cover proportion (day-front is 16:9)
    blurMax: 16,                // px, <= 20
    scatter: 0.42,              // fraction of cover the tiles fly from (radial)
    restTileAlpha: 0.14,        // near-invisible chips at rest
    restScale: 0.84,            // tile rest scale before seat
    assembleEnd: 0.56,          // timeline progress where cover is assembled
    growPeak: 1.34,             // MODEST uniform scale at peak (full-bleed wide)
    scrub: 0.7,
    pinLengthVh: 300,
    ease: 'air',                // CustomEase name; falls back to power3.out
  };

  function PuzzleImage(root, userConfig) {
    if (!root || !global.gsap || !global.ScrollTrigger) return null;
    var gsap = global.gsap;
    gsap.registerPlugin(global.ScrollTrigger);

    var cfg = Object.assign({}, DEFAULTS, userConfig || {});
    if (global.CustomEase && !gsap.parseEase(cfg.ease)) {
      global.CustomEase.create('air', '0.25,0.74,0.22,0.99');
    }
    var EASE = (global.CustomEase && gsap.parseEase('air')) ? 'air' : 'power3.out';
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mobile = matchMedia('(max-width: 720px)').matches;
    var COLS = mobile ? cfg.colsMobile : cfg.cols;
    var ROWS = mobile ? cfg.rowsMobile : cfg.rows;

    var els = {
      stage:    root.querySelector('.stage'),
      coverWrap:root.querySelector('.coverWrap'),
      cover:    root.querySelector('.cover'),
      photo:    root.querySelector('.cover__photo'),
      scrim:    root.querySelector('.cover__scrim'),
      grid:     root.querySelector('.grid'),
      headline: root.querySelector('.headline'),
      body:     root.querySelector('.body'),
      wordmark: root.querySelector('.cover__wordmark'),
      caption:  root.querySelector('.cover__caption'),
    };
    if (!els.coverWrap || !els.cover || !els.grid) return null;

    /* baked typography text */
    if (els.wordmark && cfg.wordmark) els.wordmark.textContent = cfg.wordmark;
    if (els.caption && cfg.captionLines && cfg.captionLines.length) {
      var html = cfg.captionLines.map(function (l) {
        return '<span class="cap">' + l + '</span>';
      }).join('');
      if (cfg.issueLine) html += '<span class="issue">' + cfg.issueLine + '</span>';
      els.caption.innerHTML = html;
    }

    /* cover sizing — WIDE: width-driven, height follows aspect-ratio */
    els.coverWrap.style.width = cfg.coverWidthVw + 'vw';
    els.coverWrap.style.aspectRatio = cfg.coverAspect;

    /* resolve src (string | array of candidates) */
    var candidates = Array.isArray(cfg.src) ? cfg.src : (cfg.src ? [cfg.src] : []);
    resolveImage(candidates, function (url) {
      if (url && els.photo) els.photo.src = url;
      buildTiles(url);
      boot();
    });

    /* ---------- tiles: CSS-sprite slices of the SAME wide photo ---------- */
    var tiles = [];
    function buildTiles(bgUrl) {
      els.grid.innerHTML = '';
      tiles.length = 0;
      var cw = 100 / COLS, ch = 100 / ROWS;
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var t = document.createElement('div');
          t.className = 'tile';
          t.style.left = (c * cw) + '%';
          t.style.top = (r * ch) + '%';
          t.style.width = cw + '%';
          t.style.height = ch + '%';
          if (bgUrl) {
            t.style.backgroundImage = 'url("' + bgUrl + '")';
            t.style.backgroundSize = (COLS * 100) + '% ' + (ROWS * 100) + '%';
            var px = COLS > 1 ? (c / (COLS - 1)) * 100 : 0;
            var py = ROWS > 1 ? (r / (ROWS - 1)) * 100 : 0;
            t.style.backgroundPosition = px + '% ' + py + '%';
          }
          t._c = c; t._r = r;
          els.grid.appendChild(t);
          tiles.push(t);
        }
      }
    }

    /* radial scatter from centre with a REACH bias: outer tiles fly from FURTHER
       (so the centre seats first naturally — the pz1 center-out signature),
       plus a small deterministic jitter so the field is organic, not a clean grid. */
    function scatterOf(t) {
      var cx = (COLS - 1) / 2, cy = (ROWS - 1) / 2;
      var dx = t._c - cx, dy = t._r - cy;
      var len = Math.hypot(dx, dy) || 1;
      var jitter = Math.sin(t._c * 7.3 + t._r * 3.1) * 0.5;
      var maxLen = Math.hypot(cx, cy) || 1;
      var reach = cfg.scatter * (0.55 + 0.45 * (len / maxLen));   // outer -> longer reach
      return {
        x: ((dx / len) * reach + jitter * 0.10) * 100,
        y: ((dy / len) * reach - jitter * 0.08) * 100,
        rot: jitter * 6,
      };
    }

    var st = null;
    function boot() {
      /* reduced-motion OR mobile: show the assembled WIDE cover, NO pin/scrub */
      if (reduce || mobile) {
        gsap.set([els.photo, els.scrim, els.wordmark, els.caption], { opacity: 1 });
        if (els.grid) els.grid.style.display = 'none';
        global.ScrollTrigger.refresh();
        return;
      }

      gsap.set([els.photo, els.scrim], { opacity: 0 });
      gsap.set([els.wordmark, els.caption], { opacity: 0 });
      gsap.set([els.cover, els.coverWrap], { scale: 1 });

      tiles.forEach(function (t) {
        var s = scatterOf(t);
        gsap.set(t, {
          xPercent: s.x, yPercent: s.y, rotation: s.rot,
          scale: cfg.restScale, opacity: cfg.restTileAlpha,
          filter: 'blur(' + cfg.blurMax + 'px)',
        });
      });

      var A = cfg.assembleEnd;
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=' + cfg.pinLengthVh + '%',
          pin: true,
          scrub: cfg.scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });
      st = tl.scrollTrigger;

      /* PHASE 1 — ASSEMBLE: tiles fly home center-out, de-blur, brighten, un-rotate */
      tl.to(tiles, {
        xPercent: 0, yPercent: 0, rotation: 0, scale: 1, opacity: 1,
        filter: 'blur(0px)', ease: EASE, duration: A,
        stagger: { each: 0.014, from: 'center', grid: [ROWS, COLS] },
      }, 0);
      /* seamless photo + scrim fade in UNDER the tiles so seams vanish at seat */
      tl.to([els.photo, els.scrim], { opacity: 1, ease: 'none', duration: 0.12 }, A * 0.82);
      if (els.wordmark) tl.to(els.wordmark, { opacity: 1, ease: EASE, duration: 0.20 }, A * 0.60);
      if (els.caption)  tl.to(els.caption,  { opacity: 1, ease: EASE, duration: 0.20 }, A * 0.74);
      /* NOTE: the LEFT headline + RIGHT body are NEVER faded — they stay visible. */

      /* PHASE 2 — GROW: MODEST uniform transform:scale of the whole cover unit */
      tl.to(els.coverWrap, { scale: cfg.growPeak, ease: EASE, duration: 1 - A }, A);

      global.ScrollTrigger.refresh();
    }

    /* ---------- helpers ---------- */
    function resolveImage(list, done) {
      var i = 0;
      (function next() {
        if (i >= list.length) { done(null); return; }
        var url = list[i++];
        var img = new Image();
        img.onload = function () { done(url); };
        img.onerror = next;
        img.src = url;
      })();
    }

    var onResize = (function () {
      var rt;
      return function () { clearTimeout(rt); rt = setTimeout(function () { global.ScrollTrigger.refresh(); }, 180); };
    })();
    window.addEventListener('resize', onResize);
    window.addEventListener('load', function () { global.ScrollTrigger.refresh(); });

    return {
      refresh: function () { global.ScrollTrigger.refresh(); },
      destroy: function () {
        if (st) st.kill();
        window.removeEventListener('resize', onResize);
        els.grid.innerHTML = '';
      },
    };
  }

  global.PuzzleImage = PuzzleImage;
})(window);
