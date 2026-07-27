---
id: render-scroll-scale
name: "Render scroll-scale (a bare hero LAYER: one full-bleed render in a fixed clipping frame that scales up on scroll — the reusable 'the hero image breathes/pushes' primitive that wordmark / split-word heroes compose over)"
level: 1
kind: component
status: candidate
entry:
  call: "RenderScrollScale.create(target, opts)  // target = .rss-frame (overflow:hidden) > img.rss-render (or video.rss-render). opts: { scaleFrom, scaleTo, originY, drift, ease, selfTrigger, start, end, manageLenis }. By default host-driven (host calls set(p)); selfTrigger:true gives it its own NON-pinned scrub."
  module: iife
  returns: "{ set(p), trigger, lenis, refresh(), destroy }"
meaning:
  what: "The bare hero LAYER that breathes — a fixed clipping frame holding ONE full-bleed render (<img>/<video>). As progress goes 0 -> 1 the render SCALES scaleFrom -> scaleTo (a scroll-scrubbed push-in) with an optional small translateY drift; the frame is overflow:hidden so the scene grows but the frame box stays put. GPU-only (transform). set(p) is PURE and reversible. By default it is driven by the host hero's pin/scrub; selfTrigger:true lets it own a plain (NON-pinned) ScrollTrigger."
  when: "Under a hero wordmark / split-word title where you want the render to feel ALIVE — a slow push-in as the hero scrolls — without the background taking over or stealing motion from the type. It is the repeating spine of a calm hero: one render, one push, the title held over it. Compose it BEHIND wordmark-docks or split-word; the layer owns no copy and no layout, only the breathing render."
  lands: "A full-bleed exterior render fills the hero. As you scroll the hero, the render slowly pushes in — the frame edges stay put, the scene just grows a little closer — while the title holds steady over it. It feels cinematic and unhurried, the building leaning gently toward you, the words anchored. No black flash on load: the render is decoded before it shows."
  not_when: "A framed render PAIRED L/R with serif copy (use scroll-zoom-image-pair — that owns a 2-column layout + a copy reveal). A gallery of many shots (use a carousel). A pinned set-piece of its own (this layer does NOT pin — the host pins, or it self-scrubs un-pinned). When the render shouldn't move (drop the layer). When the title needs to scrub instead (the title is a separate atom; this only breathes the background)."
source:
  grammar: "Ever / crownd hero renders: a full-bleed exterior render that gently scales/pushes in as the hero scrolls while the wordmark/title holds over it — the background breathing under held type."
  recording: "apps/quadro/.award-re/teardowns/D_finest_video.md (render-scroll-scale was a concept-reference in finest/Ever hero teardowns); proven on QUADRO renders/day-front.webp"
  registry_ref: ["render-scroll-scale-ever-hero-layer"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
ease: "none (linear scrub; set(p) is linear in p — the host/scrub owns any curve)"
motion_props: [transform, clip]
trigger: "host-driven set(p) by default (host hero's pin/scrub) OR an optional self NON-pinned scroll-scrub (selfTrigger)"
timing_layer: [A-background]
owns_pin: false
owns_scroll: false
page_beat: [hero, feature, project-narrative]
combines_with: [bleeding-wordmark, split-word-hero, blur-reveal-stagger-title, brand-overlay-crossfade, scroll-zoom-image-pair]
anti_combos: [pin, scroll-zoom-image-pair]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "one full-bleed render sits in a .rss-frame (overflow hidden, full width, height var --rss-h default 100vh); the render is .rss-render (object-fit cover, position absolute inset 0)"
  - "set(p 0..1) is a PURE, reversible scrub of the scale: render transform scale = scaleFrom + p*(scaleTo - scaleFrom) (default 1.0 -> 1.12), optional translateY drift = (p-0.5)*2*drift; no side effects beyond transform on the render"
  - "the frame CLIPS the overflow (the render grows, the frame box doesn't); GPU-only (transform)"
  - "owns_pin false: by default host-driven (host calls set(p)); selfTrigger:true gives a plain NON-pinned ScrollTrigger over the layer's natural pass (start 'top bottom', end 'bottom top')"
  - "transform scale/translateY (render) + overflow clip (frame) only; NO mix-blend / NO backdrop / NO canvas / NO video.currentTime scrub; NO animating width/height/top/left/margin; NO WebGL"
  - "DECODE-GUARD: the <img> render is force-decoded (img.decode()) before __LAB_OK__ — a hidden img never black-flickers on first paint"
  - "reduced-motion or <=820px -> static (render at scaleFrom); GSAP+ScrollTrigger required only for selfTrigger; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO render fills the frame full-bleed"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll the hero: the QUADRO render slowly scales up WITHIN its frame (the frame edges stay put — overflow clipped) — a calm push-in, no copy, no L/R layout. Verify: scale ramp scaleFrom->scaleTo, the frame clip (overflow hidden), set(p) purity (set(0.5) then set(0) returns scale(1) exactly), the decode-guard (no black flicker on load), and fps. owns_pin false (host-driven or a plain self-scrub, NOT pinned). Distinct from scroll-zoom-image-pair (that's framed + paired with serif copy in a 2-column block)."
note: |
  The bare hero breathing-background LAYER. CONFIRMED DISTINCT from scroll-zoom-image-pair: that
  brick owns a 2-column L/R layout AND a serif copy reveal (a section block); THIS owns nothing but
  a single full-bleed render that scales — meant to sit BEHIND a wordmark / split-word title that
  other atoms supply. owns_pin false: this is a LAYER, it never pins — the host hero's pin/scrub
  calls set(p), or selfTrigger gives it a plain (un-pinned) scrub for standalone use. set(p) is a
  PURE, reversible function of progress (set(0.5)->set(0) returns to scale 1.0000 exactly).
  transform scale + overflow clip = GPU-cheap. DECODE-GUARD: img.decode() resolves before reveal so
  a hidden render never black-flickers (F-40 class lesson). Proven on the QUADRO render
  day-front.webp: scale 1.0 -> 1.12 linear, frame clips, decode-guarded, zero console errors,
  __LAB_OK__ true. Compose under bleeding-wordmark / split-word-hero for a calm Ever-class hero.
---

# render-scroll-scale — a full-bleed render breathes in a clipping frame as the hero scrolls

The bare hero background LAYER: ONE full-bleed render in a fixed clipping frame that scales up on
scroll (the frame clips, the render grows ~1.0 → ~1.12). No copy, no layout — meant to sit BEHIND
a hero wordmark / split-word title. owns_pin false: host-driven by default (the host hero's
pin/scrub calls `set(p)`), or `selfTrigger:true` for an un-pinned standalone scrub.

## Markup + call
```html
<section class="rss-frame" id="hero">
  <img class="rss-render" src="render.webp" alt="">
  <!-- a wordmark / split-word title atom stacks over this layer -->
</section>
```
```js
// standalone (own un-pinned scrub):
RenderScrollScale.create('#hero', { scaleFrom:1.0, scaleTo:1.12, selfTrigger:true });

// host-driven (a hero pin owns the scroll, this is just the layer):
var bg = RenderScrollScale.create('#hero', { scaleFrom:1.0, scaleTo:1.12 });
// ... inside the host's pinned scrub onUpdate:
heroPin.onUpdate = self => bg.set(self.progress);
```

## Proven (the lab)
ONE QUADRO render (renders/day-front.webp) in a 100vh `.rss-frame`, scrubbed by a simple
(non-pinned) ScrollTrigger. Measured live: scale 1.0 → 1.03 → 1.06 → 1.09 → 1.12 across p (linear);
frame `overflow: hidden` (clip confirmed); `set(0.5)` then `set(0)` reverses to `scale(1.0000)`
exactly (PURE). Decode-guard: `img.decode()` resolves before the render is shown (no black flicker).
Zero console errors, `__LAB_OK__` true.
