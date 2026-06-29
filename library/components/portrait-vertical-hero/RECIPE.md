---
id: portrait-vertical-hero
name: "Portrait vertical hero (a composed 9:16 portrait hero PLATE — a framed render in a thin coords frame, an eyebrow, a serif title, a small meta row, centred; on enter the plate settles scale 1.04->1 + opacity and the type staggers in)"
level: 2
kind: component
status: candidate
entry:
  call: "PortraitVerticalHero.create(target, opts)  // target = an EMPTY mount element (the atom builds the plate DOM from data). opts: { media, eyebrow, title, meta (string|string[]), ratio:'9/16', revealStagger:0.1, enterScale:1.04, autoplay:true, manageLenis:true }."
  module: iife
  returns: "{ el, plate, img, set(p), play(), destroy() }"
meaning:
  what: "A composed PORTRAIT 9:16 hero PLATE — the editorial vertical hero for mobile-first / portrait-render sites. ONE create() call builds, from data, a centred portrait plate: a 9:16 framed render (object-fit cover, the hero subject) inside a thin coords/meta frame, an eyebrow above, a serif title, and a small bottom meta row. On enter the whole plate SETTLES (scale 1.04 -> 1 + opacity 0 -> 1, power3.out) and the type STAGGERS in (eyebrow -> title -> meta), each rising opacity + translateY. The most 'section-like' of the portrait family but still a single reusable atom."
  when: "The hero of a portrait-first / mobile-first project — a single vertical render that IS the subject (a tower, a facade shot, a person at the door), framed and centred with generous air, the title and a one-line meta beneath. Use it where a full-bleed landscape hero would crop the subject badly and where the composition should read like a printed plate: one render, one thought, one settle. The opposite of a busy hero — a calm, composed vertical card that the eye lands on whole."
  lands: "A tall portrait render sits in a neat thin-cornered frame, dead centre with air all around. As the page arrives, the whole plate settles a touch closer (a small scale-down to rest) and fades up as one piece, then the eyebrow, the serif title and a small meta line rise into place one after another. It feels like a magazine cover settling onto the table — composed, unhurried, premium."
  not_when: "A full-bleed landscape hero (use hero-video-render-rotator / numeral-frame-expand-hero). A swipeable deck of portrait shots (use portrait-carousel / center-focus-carousel). A vertical list of award lines (use vertical-awards-rail). When the render must move on scroll inside a frame (use scroll-zoom-image-pair). When you need many renders at once (use a gallery)."
source:
  grammar: "the editorial vertical hero: a portrait 9:16 render in a thin frame, centred, with eyebrow + serif title + a small meta row beneath — the mobile-first / portrait-render hero plate. Composed from the library's frame + media + type primitives; no existing atom composes a vertical hero (vertical-awards-rail and portrait-carousel are adjacent but different)."
  recording: "library composition (frame + media + type) for portrait-render sites; demonstrated on apps/quadro/public/proto/day-34-portrait.webp"
  registry_ref: ["portrait-vertical-hero-composed-plate"]
stack: "vanilla + GSAP 3.12.5 (optional; +guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity]
trigger: "a one-shot composed reveal on init (after decode); or host-driven set(p) scrub"
timing_layer: [A-arrival, B-reveal, C-content]
owns_pin: false
owns_scroll: false
page_beat: [hero, intro, portrait, mobile-first]
combines_with: [hero-title-to-nav-pill, scroll-zoom-image-pair, corner-frame-meta, blur-reveal-stagger-title, line-art-location-map]
anti_combos: [full-bleed-hero, hero-video-render-rotator]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE create(target, opts) call on an EMPTY mount builds the composed plate from data: a .pvh-frame (overflow hidden, aspect-ratio 9/16) with the render (object-fit cover) inside a thin coords/meta frame (.pvh-chrome corners), + .pvh-eyebrow, .pvh-title (serif), .pvh-meta row"
  - "on enter the whole plate SETTLES: transform scale enterScale (1.04) -> 1 + opacity 0 -> 1, power3.out; the type STAGGERS in under it (eyebrow -> title -> meta), each opacity 0->1 + translateY ~22px->0, offset by revealStagger"
  - "set(p 0..1) is a PURE reversible function of the composed reveal (settle + per-child eased windows): set(0) hidden, set(1) full plate; no side effects beyond transform/opacity; play() runs the timed reveal once"
  - "DECODE-GUARD: img.decode() resolves BEFORE the plate is revealed (never show an undecoded <img> = no black flicker); will-change cleared after the one-shot"
  - "transform scale/translateY + opacity ONLY (NO width/height/top/left/margin); NO mix-blend / NO backdrop / NO WebGL / NO canvas; owns_pin false (self-contained plate; host may pin or not)"
  - "reduced-motion or no-GSAP -> static composed plate (everything shown, no motion); window.__LAB_OK__ true once wired + render painted"
  - "asset-substitution gate: OUR QUADRO portrait render in the 9:16 frame + sparse UA serif title + a one-line meta; reads award-grade as a standalone centred plate with generous air"
gate:
  probe: "Open lab.html. __LAB_OK__ true (set once the render is decode-guarded + painted). Watch the enter: the portrait 9:16 plate settles (scale 1.04 -> 1 + opacity) and the type staggers in (eyebrow -> serif title -> meta), centred with air all around. set(0) hides the plate, set(1) shows the full composed plate (pure, reversible scrub). reduced-motion -> static composed plate. Distinct from vertical-awards-rail (a list of lines) and portrait-carousel (a swipeable deck) — this is ONE composed hero plate, the most section-like of the three but still one create() call."
note: |
  The composed PORTRAIT 9:16 hero PLATE — the missing 'editorial vertical hero' for mobile-first /
  portrait-render sites. CONFIRMED NEW: no existing atom composes a vertical hero; vertical-awards-rail
  (a list) and portrait-carousel (a deck) are adjacent but different. This is the most 'section-like' of
  the portrait family — frame + media + type composed into one plate — yet still a reusable ATOM: one
  data-driven create() call, returning { set, play, destroy }. set(p) is PURE (settle + per-child eased
  windows) so a host can pin-scrub it; autoplay runs it once on enter. owns_pin false (self-contained; the
  host pins or not). transform scale/translateY + opacity only = GPU-cheap, no layout props animated.
  DECODE-GUARD holds the plate hidden until img.decode() resolves (a hidden img doesn't decode -> revealing
  undecoded = black flicker). Demonstrated on OUR QUADRO render day-34-portrait.webp with sparse UA copy.
  Serif stand-in = Playfair Display (Canela / PP-Editorial class). Pair with hero-title-to-nav-pill (the
  title docks to a nav pill) or corner-frame-meta; alternate with scroll-zoom-image-pair down the page.
---

# portrait-vertical-hero — a composed 9:16 portrait hero plate that settles + staggers in

The editorial vertical hero for mobile-first / portrait-render sites. ONE `create()` call builds, from
data, a centred portrait plate: a 9:16 framed render (object-fit cover) inside a thin coords/meta frame,
an eyebrow, a serif title, and a small bottom meta row. On enter the whole plate settles (scale 1.04 → 1
+ opacity) and the type staggers in (eyebrow → title → meta). Not pinned — self-contained; the host may
pin it or not.

## Markup + call
```html
<!-- target is an EMPTY mount; the atom builds the plate DOM from data -->
<section id="hero" class="pvh-host"></section>
```
```js
PortraitVerticalHero.create('#hero', {
  media: 'renders/day-34-portrait.webp',
  eyebrow: 'QUADRO',
  title: 'Дім над водою',
  meta: ['Над річкою', '9:16'],
  ratio: '9/16',
  revealStagger: 0.1,
  enterScale: 1.04,
  autoplay: true,
  manageLenis: false
});
```

## Pure scrub (host-driven)
```js
var hero = PortraitVerticalHero.create('#hero', { /* …, */ autoplay: false });
// drive the composed reveal yourself (e.g. from a pin ScrollTrigger):
hero.set(0);   // hidden
hero.set(0.5); // mid settle + part-staggered
hero.set(1);   // full composed plate
```

## Proven (the lab)
A single plate on OUR QUADRO render `renders/day-34-portrait.webp` with sparse UA copy: eyebrow
"QUADRO", serif title "Дім над водою", meta "Над річкою · 9:16". The render is force-decoded before
the plate is revealed (no black flicker), then the plate settles scale 1.04 → 1 + opacity and the type
staggers in (eyebrow → title → meta). `set(p)` confirmed PURE + reversible (set(0) hidden, set(1) full
plate). `__LAB_OK__` flips true once wired + the render painted. transform scale/translateY + opacity
only — zero layout-animating props, no mix-blend, no backdrop, no WebGL. Reads award-grade as a
standalone centred plate with generous air. Serif stand-in = Playfair Display (Canela / PP-Editorial
class).
