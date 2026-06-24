/* ============================================================
   media-step-switch — reusable factory  (TRUE 1:1, WAVE-2)
   ------------------------------------------------------------
   Pin a stage; scrub through N steps. Each boundary wipes the next
   full-bleed media over the current one with an organic wavy
   clip-path seam, crossfades the stepped copy with a deliberate
   SOFT OVERLAP (a brief ghosted double-exposure of both headings),
   and advances a vertical step-rail. Media can be <img> or muted
   autoplay <video> (visibility only — NEVER scrubs video.currentTime).
   No WebGL. transform/opacity/clip-path only.

   Source: Zera / Naveera "image-video-switch". The seam reveal goes
   BOTTOM→UP by default (direction:'up') to match the source.

   CORRECTIONS over the earlier draft (kept here for the record):
     • amplitude is sine-gated PER FRAME via a {p} proxy + onUpdate, so
       the ripple is 0 at both ends and peaks mid-wipe (interpolating the
       polygon STRING linearly collapses the peak — wrong).
     • copy-out is a soft 'power1.out' that OVERLAPS the 'air' copy-in →
       the ghosted double-exposure (the hard zero-overlap dim was wrong).
     • prior layers stay flat at poly(1) — they are the steady background;
       do NOT re-close them to poly(0) (that made them vanish).
     • dot toggle is reverse-safe (onStart / onReverseComplete).

   Requires (global): gsap, ScrollTrigger, CustomEase.
   Pair with component.css. Markup contract documented in RECIPE.md.

   Usage:
     mediaStepSwitch('#stage', { wave:true, scrub:1, direction:'up' });
   ============================================================ */
export function mediaStepSwitch(stageSel, opts = {}) {
  const stage = typeof stageSel === 'string' ? document.querySelector(stageSel) : stageSel;
  if (!stage) return null;

  const o = Object.assign({
    scrub:        1,        // true or a number (smoothing seconds) for ScrollTrigger
    pin:          true,
    stepVH:       100,      // scroll length per transition, in % of viewport height
    wave:         true,     // wavy seam (false = straight horizontal inset wipe)
    waveAmp:      7,        // ripple amplitude in % at the wipe midpoint
    waveCols:     14,       // seam edge sample count (detail of the ripple)
    waveFreq:     1.5,      // number of sine humps across the width
    direction:    'up',     // 'up' (source) | 'down' — which way the new media sweeps in
    overscan:     1.06,     // image scale so the parallax push never reveals edges
    pushPercent:  4,        // incoming layer's small positional push, in %
    wipeEase:     'air',    // CustomEase name (must be registered) or any gsap ease
    onStep:       null,     // (index) => {}  callback fired when a dot turns on
  }, opts);

  const layers = gsap.utils.toArray(stage.querySelectorAll('[data-layer]'));
  const stepsEls = gsap.utils.toArray(stage.querySelectorAll('[data-step]'));
  const dots = gsap.utils.toArray(stage.querySelectorAll('.msw-dot, .rail .dot'));
  const fill = stage.querySelector('.msw-fill, .rail .fill');
  const progress = stage.querySelector('.msw-progress, .stage-progress');
  const N = stepsEls.length;
  if (N < 2) return null;

  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!gsap.parseEase(o.wipeEase)) o.wipeEase = 'power2.out';

  const TAU = Math.PI * 2;

  /* --- seam geometry: p:0 = layer hidden (seam off-stage), 1 = fully shown --- */
  function poly(p) {
    const amp = o.wave ? o.waveAmp * Math.sin(p * Math.PI) : 0;   // sine-gated peak
    const cols = o.wave ? o.waveCols : 1;
    const phase = p * Math.PI;
    if (o.direction === 'up') {
      // bottom→up reveal: visible region is BELOW the seam; seam rises 108% → -8%.
      const baseY = 108 - p * 116;
      const pts = [];
      for (let i = 0; i <= cols; i++) {
        const x = (i / cols) * 100;
        const y = baseY + amp * Math.sin((i / cols) * TAU * o.waveFreq + phase);
        pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
      }
      pts.push('100% 100%', '0% 100%');            // close over the BOTTOM corners
      return `polygon(${pts.join(',')})`;
    }
    const baseY = -8 + p * 116;                     // seam descends -8% → 108%
    const pts = [];
    for (let i = 0; i <= cols; i++) {
      const x = (i / cols) * 100;
      const y = baseY + amp * Math.sin((i / cols) * TAU * o.waveFreq + phase);
      pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
    pts.push('100% 100%', '0% 100%');               // close over the BOTTOM corners
    return `polygon(${pts.join(',')})`;
  }

  /* --- init state: layer 0 flat (poly(1)), the rest hidden (poly(0)) --- */
  layers.forEach((l, i) => {
    const m = l.querySelector('img,video,div');
    if (m) gsap.set(m, { scale: o.overscan });
    l.style.clipPath = i === 0 ? poly(1) : poly(0);
  });
  gsap.set(stepsEls, { autoAlpha: 0 });
  gsap.set(stepsEls[0], { autoAlpha: 1 });
  if (fill) gsap.set(fill, { height: '0%' });
  dots.forEach((d, i) => d.classList.toggle('is-on', i === 0));

  function setActiveDot(i) {
    dots.forEach((d, idx) => d.classList.toggle('is-on', idx === i));
    o.onStep && o.onStep(i);
  }

  if (reduce) {
    return { destroy() {}, reduced: true };
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: '+=' + ((N - 1) * o.stepVH) + '%',
      scrub: o.scrub,
      pin: o.pin,
      anticipatePin: 1,
      onUpdate: progress ? (self) => gsap.set(progress, { scaleX: self.progress }) : undefined,
    },
  });

  /* RATIOS of one slice — copy-in STARTS where copy-out starts → soft overlap/ghost */
  const R = { wipe: 1.0, copyOut: 0.30, copyOutAt: 0.40, copyIn: 0.42, copyInAt: 0.40, rail: 0.85, dotAt: 0.35 };

  for (let i = 0; i < N - 1; i++) {
    const at = i;
    const incoming = layers[i + 1];
    const inStep = stepsEls[i + 1], outStep = stepsEls[i];
    const inMedia = incoming.querySelector('img,video,div');

    /* WIPE — proxy-driven so amp is recomputed (sine-gated) every frame */
    const px = { p: 0 };
    incoming.style.clipPath = poly(0);
    tl.to(px, { p: 1, duration: R.wipe, ease: o.wipeEase,
      onUpdate() { incoming.style.clipPath = poly(px.p); } }, at);

    /* MEDIA PUSH — overscan hides the bared edge */
    if (inMedia) {
      const fromY = o.direction === 'up' ? o.pushPercent : -o.pushPercent;
      tl.fromTo(inMedia, { yPercent: fromY }, { yPercent: 0, duration: R.wipe, ease: o.wipeEase }, at);
    }

    /* SOFT COPY-OUT (power1.out) overlapping COPY-IN (air) → ghosted double-exposure.
       Each step element holds its own eyebrow+heading+body, so the eyebrow
       crossfades together with the heading. */
    tl.to(outStep, { autoAlpha: 0, duration: R.copyOut, ease: 'power1.out' }, at + R.copyOutAt);
    tl.fromTo(inStep, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: R.copyIn, ease: o.wipeEase }, at + R.copyInAt);

    /* RAIL fill */
    if (fill) tl.to(fill, { height: ((i + 1) / (N - 1)) * 100 + '%', duration: R.rail, ease: o.wipeEase }, at);

    /* DOT — reverse-safe */
    tl.to({}, { duration: 0,
      onStart() { setActiveDot(i + 1); },
      onReverseComplete() { setActiveDot(i); } }, at + R.dotAt);

    /* prior layers stay flat at poly(1) — they are the steady background. The proxy
       owns both ends of `incoming`: forward → poly(1), backward → poly(0). */
  }

  let rT;
  const onResize = () => { clearTimeout(rT); rT = setTimeout(() => ScrollTrigger.refresh(), 200); };
  addEventListener('resize', onResize);

  return {
    timeline: tl,
    destroy() {
      removeEventListener('resize', onResize);
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
    },
  };
}

export default mediaStepSwitch;
