---
id: hero-title-to-nav-pill
name: "Hero title to nav pill (giant cursive wordmark scroll-scrubs into a frosted top-centre pill)"
level: 2
kind: component
status: official
entry:
  call: "HeroTitleToNavPill.create(target, opts)  // target = .htp-stage; contains .htp-render(img) + .htp-scrim + .htp-pill + .htp-mark(the wordmark). opts: { pillScale, pillY, pinFactor, ease, scrim, manageLenis }."
  module: iife
  returns: "{ trigger, set(p), refresh, destroy }  (or { static:true, set, destroy } under reduced-motion / <=820px / no-libs)"
meaning:
  what: "11tanjung's signature move — the full-screen cursive hero wordmark scroll-scrubs scale + translateY DOWN into a small frosted-glass pill fixed at top-centre. It is the SAME DOM node the whole way (no swap): giant title -> shrinks + rises -> docks in a backdrop-blur pill that becomes the persistent nav mark. A readability scrim under the big title fades as it shrinks. set(p) is a PURE scrub."
  when: "The hero of a brand-led site whose wordmark IS the centrepiece — let the user scroll the giant name down into the sticky nav instead of a static logo + a separate hero title. The opening beat that turns the hero title into the persistent brand mark in one continuous move, freeing the centre for the next headline (blur-reveal-stagger-title)."
  lands: "The name fills the screen in flowing italic; as you scroll it shrinks and lifts, settling into a small frosted pill at the very top — the same letters, now the navigation mark — while the centre clears for the story to begin. It reads as the brand introducing itself once, big, then stepping into its place. The scrim under the big title keeps it crisp over a bright render."
  not_when: "A site whose logo and hero title are different things (this fuses them). A hero that must stay full and static. When there's no persistent top-centre nav to dock into. Over a scrubbed VIDEO background (the title scrub + a moving bg compounds; keep the render static). A page that can't own a pin here."
source:
  grammar: "11tanjung hero: the giant '11 tanjung' cursive wordmark scroll-scrubs scale+translateY into a dark frosted squircle pill at top-centre (same element), while the next title blur-reveals in the freed centre."
  recording: "apps/quadro/.award-re/teardowns/D_11tanjung_video.md (H1 hero-title-to-nav-pill + H2 adaptive-frosted-pill; a016-a028)"
  registry_ref: ["H1-title-to-pill-11tanjung"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + guarded Lenis 1.1.13"
webgl: false
motion_props: [transform, opacity, backdrop-filter]
trigger: "ONE pinned scroll-scrub ScrollTrigger (pin:true, scrub:true, start 'top top', end '+=innerHeight*pinFactor'), Lenis-smoothed; progress -> mark scale+translateY, pill opacity, scrim opacity"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
owns_scroll: false
page_beat: [hero]
combines_with: [preloader-band-collapse, blur-reveal-stagger-title, render-scroll-scale, coords-corner-frame]
anti_combos: [second-pin, scrubbed-video-bg]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_one_scroll_owner]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE pinned scroll-scrub maps progress 0..1 to the wordmark scale(1 -> pillScale) + translateY(0 -> pillY vh); the SAME .htp-mark node throughout (no swap); set(p) is PURE"
  - "a frosted .htp-pill plate (backdrop-filter) fades in LATE (under the shrunk mark) and becomes the docked top-centre nav mark"
  - "a radial .htp-scrim under the big title fades over the first ~60% so the cursive stays legible over a light render (resolves the 'title dirty over light photo' issue)"
  - "transform + opacity + backdrop-filter (static pill) only; NO mix-blend over the scrubbed render; NO WebGL"
  - "reduced-motion / <=820px -> docked pill shown; window.__LAB_OK__ on init; owns_pin TRUE (one scroll owner)"
  - "asset-substitution gate: OUR QUADRO hero + cursive wordmark + warm palette"
gate:
  probe: "Open lab.html (Lenis from jsdelivr). __LAB_OK__ true (htp-ready). Scroll: the giant cursive '11 tanjung' shrinks + rises into a frosted pill top-centre (scale 1->0.17 power2.inOut), the pill plate fading in late, the scrim fading so the title stays legible. At rest = docked pill, centre cleared. Verify the dock curve + smoothness (fps>=50, jank<8%); the backdrop-filter pill is a STATIC plate (perf-safe, not over the scrubbed render)."
note: |
  Brick 2 of the 11tanjung harvest — the signature hero move (and the fix for Brick 1's
  'title sits dirty over a light render': here the title LEAVES the centre, docking into
  the pill, and a scrim keeps it legible while big). Same DOM node giant->pill (no swap).
  The frosted pill is a static backdrop-filter plate (safe) — do NOT put backdrop-filter
  over a scrubbed/video surface (quadro-scroll-perf). Pair: preloader-band-collapse ->
  this (title docks) -> blur-reveal-stagger-title (next headline in the freed centre).
  Cursive display = Canela / PP Editorial Italic class (Playfair italic free stand-in).
  Proven 1:1 on QUADRO: scale 1->0.17, pill late, scrim fade, 0.1% jank.
---

# hero-title-to-nav-pill — giant cursive wordmark scrolls into a frosted top-centre pill

11tanjung's signature: the full-screen cursive hero wordmark scroll-scrubs scale +
translateY down into a small frosted-glass pill at top-centre — the same DOM node, no
swap — becoming the persistent nav mark, while a scrim under the big title fades so it
stays legible over a bright render.

## Markup + call
```html
<section class="htp-stage" id="hero">
  <div class="htp-render"><img src="…"></div>
  <div class="htp-scrim"></div>
  <div class="htp-pill"></div>
  <div class="htp-mark"><div class="word">11 tanjung</div></div>
</section>
```
```js
HeroTitleToNavPill.create('#hero', { pillScale: 0.17, pillY: -43, ease: 'power2.inOut', scrim: true });
```

## Proven (the lab)
OUR QUADRO hero: the cursive "11 tanjung" (Playfair italic, Canela-class) scroll-scrubs
scale 1→0.17 (power2.inOut) + up into a frosted pill top-centre, the pill plate fading in
late (0→0.49→0.94→1) and the scrim fading over the first 60% (0.5→0) so the title stays
legible over the light render. At rest = docked pill, centre cleared for the next title.
Resolves Brick-1's "title dirty over light photo". Probe (4× CPU throttle): 1/695 long
frames (0.1%), 59.9fps.
