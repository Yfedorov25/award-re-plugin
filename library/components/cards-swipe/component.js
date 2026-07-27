/* ============================================================================
   cards-swipe  —  pinned horizontal card-track (Zera Studio grammar)
   ----------------------------------------------------------------------------
   A series of full-bleed rounded "cards" (image + info) laid out in a single
   horizontal row. The section PINS and the row translates on X, driven by
   vertical scroll (ScrollTrigger scrub). Cards SNAP one-per-viewport. A small
   circular "stitch" handle rides the seam between cards. Optional pointer-drag
   lets the user fling between cards on top of the scroll-scrub.

   STACK: vanilla + GSAP 3.12.5 + ScrollTrigger (+ optional Draggable/Inertia).
   No build step. Motion is transform-only (translateX). No WebGL.

   USAGE:
     CardsSwipe.init({
       root:      '#cards',        // section that gets pinned
       track:     '.cs-track',     // the flex row that translates
       cards:     '.cs-card',      // each card
       seam:      '.cs-seam',      // optional stitch handle element
       gap:       24,              // px gap between cards (must match CSS)
       scrubPerCard: 0.9,          // viewport-heights of scroll spent per card
       snap:      true,            // snap to one card per viewport
       drag:      true,            // allow pointer fling (needs Draggable)
       parallax:  0.12,            // 0..1 inner-image counter-drift (0 = off)
       ease:      'air',           // CustomEase name for snap settle
       onCard:    (i, card) => {}, // fires when active card changes
     });

   Returns a controller: { goTo(i), refresh(), kill(), get index() }.
   ========================================================================== */

(function (global) {
  'use strict';

  const REDUCE = global.matchMedia &&
    global.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function init(opts) {
    const cfg = Object.assign({
      root: '#cards',
      track: '.cs-track',
      cards: '.cs-card',
      seam: null,
      gap: 24,
      scrubPerCard: 0.9,
      snap: true,
      drag: true,
      parallax: 0.12,
      ease: 'none',
      onCard: null,
    }, opts || {});

    const root  = typeof cfg.root  === 'string' ? document.querySelector(cfg.root)  : cfg.root;
    const track = root.querySelector(cfg.track);
    const cards = Array.from(root.querySelectorAll(cfg.cards));
    const seam  = cfg.seam ? root.querySelector(cfg.seam) : null;
    const n = cards.length;
    if (!root || !track || n === 0) return null;

    // ---- geometry --------------------------------------------------------
    // The track is one card wider than the viewport for every card past the
    // first; total horizontal travel = (n-1) * (cardWidth + gap).
    // We do NOT animate width — we translate the whole track by -travel.
    let travel = 0;
    let cardStep = 0; // cardWidth + gap, the distance one card occupies

    function measure() {
      const first = cards[0].getBoundingClientRect();
      cardStep = first.width + cfg.gap;
      travel = cardStep * (n - 1);
    }
    measure();

    let activeIndex = 0;
    function setActive(i) {
      if (i === activeIndex) return;
      activeIndex = i;
      cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
      if (typeof cfg.onCard === 'function') cfg.onCard(i, cards[i]);
    }
    cards[0].classList.add('is-active');

    // ---- reduced motion: lay cards out as a static vertical stack --------
    if (REDUCE) {
      root.classList.add('cs-reduced');
      // CSS handles the stacked fallback; nothing to animate.
      return {
        goTo() {}, refresh() {}, kill() {},
        get index() { return 0; },
      };
    }

    // ---- the core scrub: pin section, translate track on X --------------
    const st = global.ScrollTrigger;
    if (!st) { console.warn('[cards-swipe] ScrollTrigger missing'); return null; }

    // Pin length: one viewport-height of scroll per card transition.
    const endDistance = () =>
      '+=' + Math.round(global.innerHeight * cfg.scrubPerCard * (n - 1));

    const tween = gsap.to(track, {
      x: () => -travel,
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: endDistance,
        scrub: cfg.parallax ? 0.6 : true, // tiny lag = silk, but keep snap honest
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // snap one card per viewport — the signature "click into place"
        snap: cfg.snap ? {
          snapTo: (value) => Math.round(value * (n - 1)) / (n - 1),
          duration: { min: 0.2, max: 0.5 },
          delay: 0.04,
          ease: cfg.ease,
        } : false,
        onUpdate: (self) => {
          // derive active card from progress, drive seam + active class
          const idx = Math.round(self.progress * (n - 1));
          setActive(idx);
          if (seam) positionSeam(self.progress);
        },
      },
    });

    // ---- the stitch handle: rides the seam between the two cards in view -
    // Between card k and k+1 the seam sits at the gap centre. We park it at
    // the right edge of whichever card is currently leaving the viewport.
    function positionSeam(progress) {
      // continuous card-space position, e.g. 1.4 = 40% between card1 and card2
      const pos = progress * (n - 1);
      const leaving = Math.floor(pos);
      const frac = pos - leaving;               // 0..1 across the current gap
      // seam is visible only mid-transition; fade it at the snap points
      const vis = Math.sin(frac * Math.PI);     // 0 at snap, 1 at mid-gap
      // x of the gap centre in viewport space = right edge of leaving card
      // because the track is pinned, the seam in viewport coords sits at the
      // card boundary; the leaving card's right edge approaches the left edge.
      const xVw = (1 - frac) * 100;             // % of viewport, card sliding L
      gsap.set(seam, {
        left: xVw + '%',
        autoAlpha: 0.25 + vis * 0.75,
        scale: 0.86 + vis * 0.14,
      });
    }
    if (seam) positionSeam(0);

    // ---- inner-image parallax: each card image drifts opposite the track -
    // Cheap depth — the photo lags the card by `parallax` of the card width.
    let imgTweens = [];
    if (cfg.parallax > 0) {
      cards.forEach((card) => {
        const img = card.querySelector('img');
        if (!img) return;
        const t = gsap.fromTo(img,
          { xPercent: -cfg.parallax * 12 },
          {
            xPercent: cfg.parallax * 12, ease: 'none',
            scrollTrigger: {
              trigger: card, containerAnimation: tween,
              start: 'left right', end: 'right left', scrub: true,
            },
          });
        imgTweens.push(t);
      });
    }

    // ---- optional pointer fling on top of the scroll-scrub ---------------
    // Translates a drag into a scroll delta so snap + scrub stay the source of
    // truth (we never fight ScrollTrigger by also setting track.x directly).
    let dragCleanup = null;
    if (cfg.drag) dragCleanup = wireDrag();

    function wireDrag() {
      let startX = 0, startScroll = 0, active = false;
      const stInst = tween.scrollTrigger;
      const pxPerCard = global.innerHeight * cfg.scrubPerCard;

      function down(e) {
        active = true;
        startX = pt(e);
        startScroll = global.scrollY;
        root.classList.add('cs-dragging');
      }
      function moveH(e) {
        if (!active) return;
        const dx = pt(e) - startX;
        // dragging left (negative dx) advances scroll forward
        const targetScroll = startScroll - dx * (pxPerCard / cardStep);
        global.scrollTo(0, targetScroll);
      }
      function up() {
        if (!active) return;
        active = false;
        root.classList.remove('cs-dragging');
        // let ScrollTrigger's snap take it home — nudge a refresh of state
        if (stInst) stInst.update();
      }
      const pt = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

      root.addEventListener('mousedown', down);
      global.addEventListener('mousemove', moveH);
      global.addEventListener('mouseup', up);
      root.addEventListener('touchstart', down, { passive: true });
      root.addEventListener('touchmove', moveH, { passive: true });
      root.addEventListener('touchend', up);

      return () => {
        root.removeEventListener('mousedown', down);
        global.removeEventListener('mousemove', moveH);
        global.removeEventListener('mouseup', up);
        root.removeEventListener('touchstart', down);
        root.removeEventListener('touchmove', moveH);
        root.removeEventListener('touchend', up);
      };
    }

    // ---- public controller ----------------------------------------------
    function goTo(i) {
      i = Math.max(0, Math.min(n - 1, i));
      const stInst = tween.scrollTrigger;
      const p = (n > 1) ? i / (n - 1) : 0;
      const y = stInst.start + (stInst.end - stInst.start) * p;
      gsap.to(global, { scrollTo: y, duration: 0.6, ease: cfg.ease });
    }
    function refresh() { measure(); st.refresh(); }
    function kill() {
      if (dragCleanup) dragCleanup();
      imgTweens.forEach(t => t.scrollTrigger && t.scrollTrigger.kill());
      imgTweens.forEach(t => t.kill());
      tween.scrollTrigger && tween.scrollTrigger.kill();
      tween.kill();
    }

    // recompute geometry when the breakpoint / orientation flips
    let rT;
    global.addEventListener('resize', () => {
      clearTimeout(rT);
      rT = setTimeout(refresh, 200);
    });

    return {
      goTo, refresh, kill,
      get index() { return activeIndex; },
    };
  }

  global.CardsSwipe = { init };
})(window);
