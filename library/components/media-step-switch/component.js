/* ============================================================
   media-step-switch — reusable factory
   ------------------------------------------------------------
   Pin a stage; scrub through N steps. Each boundary wipes the next
   full-bleed media over the current one with an organic wavy
   clip-path seam, crossfades the stepped copy, and advances a
   vertical step-rail. Media can be <img> or muted autoplay <video>
   (visibility only — NEVER scrubs video.currentTime). No WebGL.

   Requires (global): gsap, ScrollTrigger, CustomEase.
   Pair with component.css. Markup contract documented in RECIPE.md.

   Usage:
     mediaStepSwitch('#stage', { wave:true, scrub:0.6 });
   ============================================================ */
export function mediaStepSwitch(stageSel, opts = {}) {
  const stage = typeof stageSel === 'string' ? document.querySelector(stageSel) : stageSel;
  if (!stage) return null;

  const o = Object.assign({
    scrub:        true,     // true or a number (smoothing seconds) for ScrollTrigger
    pin:          true,
    stepVH:       100,      // scroll length per transition, in % of viewport height
    wave:         true,     // wavy seam (false = straight horizontal inset wipe)
    waveAmp:      4.5,      // ripple amplitude in % at the wipe midpoint
    waveCols:     8,        // seam edge sample count (detail of the ripple)
    direction:    'down',   // 'down' | 'up' — which way the new media sweeps in
    overscan:     1.06,     // image scale so the parallax push never reveals edges
    pushPercent:  3,        // incoming layer's small positional push, in %
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

  /* --- seam geometry --- */
  function poly(p) {
    // p: 0 = layer fully hidden (seam at top), 1 = fully shown (seam past bottom)
    const up = o.direction === 'up';
    const pts = [];
    const baseY = up ? (108 - p * 116) : (-8 + p * 116);
    const amp = o.wave ? o.waveAmp * Math.sin(p * Math.PI) : 0;
    const cols = o.waveCols;
    for (let i = 0; i <= cols; i++) {
      const x = (i / cols) * 100;
      const y = baseY + amp * Math.sin((i / cols) * Math.PI * 2.2 + p * 4);
      pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
    // close the shape over the visible side
    if (up) pts.push('100% 0%', '0% 0%');
    else    pts.push('100% 100%', '0% 100%');
    return `polygon(${pts.join(',')})`;
  }

  /* --- init state --- */
  layers.forEach((l, i) => {
    const m = l.querySelector('img,video,div');
    if (m) gsap.set(m, { scale: o.overscan });
    gsap.set(l, { clipPath: i === 0 ? poly(1) : poly(0) });
  });
  gsap.set(stepsEls, { opacity: 0 });
  gsap.set(stepsEls[0], { opacity: 1 });
  if (fill) gsap.set(fill, { height: '0%' });
  dots.forEach((d, i) => d.classList.toggle('is-on', i === 0));

  if (reduce) {
    // static, no motion
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

  for (let i = 1; i < N; i++) {
    const at = i - 1;
    const incoming = layers[i], outgoing = layers[i - 1];
    const inStep = stepsEls[i], outStep = stepsEls[i - 1];
    const inMedia = incoming.querySelector('img,video,div');

    tl.to(incoming, { clipPath: poly(1), duration: 0.7, ease: o.wipeEase }, at);
    if (inMedia) {
      const fromY = o.direction === 'up' ? o.pushPercent : -o.pushPercent;
      tl.fromTo(inMedia, { yPercent: fromY }, { yPercent: 0, duration: 0.7, ease: o.wipeEase }, at);
    }
    tl.to(outStep, { opacity: 0, duration: 0.28, ease: 'none' }, at + 0.02)
      .fromTo(inStep, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: o.wipeEase }, at + 0.34);
    if (fill) tl.to(fill, { height: (i / (N - 1)) * 100 + '%', duration: 0.7, ease: o.wipeEase }, at);
    if (dots[i - 1]) tl.set(dots[i - 1], { className: dots[i - 1].className.replace(' is-on', '') }, at + 0.35);
    if (dots[i]) tl.call(() => { dots[i].classList.add('is-on'); o.onStep && o.onStep(i); }, null, at + 0.35);
    // re-close old layer at the very end of the slice so backward scrub re-wipes
    tl.set(outgoing, { clipPath: poly(0) }, at + 0.999);
  }

  return {
    timeline: tl,
    destroy() { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); },
  };
}

export default mediaStepSwitch;
