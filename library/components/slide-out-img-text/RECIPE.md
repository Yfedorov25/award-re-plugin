---
id: slide-out-img-text
name: "Slide-out deck handoff"
level: 1
kind: component
status: official
entry:
  call: "SlideOutImgText.init(root, opts)"
  module: iife
  returns: "void"
meaning:
  what: "A stacked hand of image cards fans out to four corners on a pinned scrub while paired captions cross-fade and a ghost letter/word bleeds behind — the lifestyle 'show life' climax."
  when: "The lifestyle-climax beat: the emotional moment that sells the LIFE, where a deck of life-shots fans open as one authored gesture."
  lands: "The moment that sells the life — the deck blooms and the caption lands the feeling, not a gallery grid."
  not_when: "Spec/material sections, conversion gates, or anywhere two pin-owners would collide."
source:
  grammar: "Vide Infra Sofi — slide-out deck / lifestyle climax"
  recording: null
  registry_ref: ["T-220"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase"
webgl: false
motion_props: [transform, opacity]
trigger: "one pinned scroll-scrub timeline; endVH carries the fan + caption handoff"
timing_layer: [B-entrance, C-emphasis]
owns_pin: true
page_beat: [lifestyle-climax]
combines_with: [counter, parallax-depth, reveal, scroll-indicator]
anti_combos: [second-pin, cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]
variants: [default]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "cards fan from stacked deck to four-corner layout on scrub, transform-only"
  - "captions A/B cross-fade tied to the same pin progress (one clock)"
  - "reduced-motion / mobile collapses to a static legible layout, no pin"
verify: "lab.html#__LAB_OK__"
---

# slide-out-img-text — "slide-out deck handoff"

> Source: zerasoftwarestudio.com (Zera Studio), portfolio hand-off section.
> Ported to the NAHIRNA voice (own riverbank villa), Fedoriv copy, real 9:16 renders.
> User ask: «щоб ось так виїжали картинки і текст наприклад з якоїсь секції».
> Files: `lab.html` (standalone 1:1 demo) · `component.css` · `component.js` · this recipe.

## What it is (one sentence)
A pinned, scroll-scrubbed section where the **prior section's drawer plate hands off**, a centre portrait card **rises forward**, three sibling cards **deal OUT to the corners**, all four **lock with a tiny overshoot**, a **centre headline reveals**, the climax **holds**, and finally the whole wrap **slides up and out** to reveal the next section — all on ONE pinned timeline.

## The 7 phases (TRUE 1:1, scroll progress 0..1)
| progress | what moves | props |
|---|---|---|
| **P1 0.00–0.12 · drawer handoff** | prior "Що ми робимо" plate slides UP+out; stage crossfades light→black; rim ghost words + giant ghost letter fade in; state-A ghost wordmark fades in; hero card lifts toward full | `drawer y 0→-110% + autoAlpha`; `bg-light autoAlpha 1→0`; rims `opacity 0→.13`; ghostL `0→.10`; ghostWm `0→.22`; hero `autoAlpha →.92` |
| **P2 0.12–0.26 · hero beat** | centre portrait card (НАГІРНА, tall 9:16) rises fully forward; its inner img counter-parallax relaxes; ghost wordmark recedes + slow drift | hero `--scl .92→1.0, autoAlpha →1`; img `scale 1.12→1.0`; ghostWm `→.12 scale 1.04` |
| **P3 0.26–0.52 · slide-out** | 3 siblings deal OUT from behind the hero along straight diagonals toward corners, staggered (TR `+0.00`, BL `+0.06`, BR `+0.12`); hero drifts ~60% toward its TL anchor; inner imgs relax | siblings `--tx/--ty → 60–100% of anchor, --scl .95, autoAlpha .85`; imgs `1.12→1.0`; hero `--tx/--ty → anchor*0.6`; ghostWm `→.04` |
| **P4 0.52–0.66 · lock + overshoot** | all 4 cards snap-settle to corner anchors with a tiny `back.out(1.4)` scale overshoot; ghost crossfades state A→state B | each card `--tx/--ty → anchor, autoAlpha 1`; `--scl → anchor.scl` (back.out); ghostWm `→0`, ghostL `→0`, ghostWm2 `0→.10` |
| **P5 0.66–0.82 · centre reveal** | headline "Доказ у самому домі." reveals (y+24→0, fade); long centred rule draws `scaleX 0→1`; "Дивитися" CTA + scroll-dot fade in with lag | headline `autoAlpha 0→1, y 24→0`; ctaWrap `autoAlpha →1`; rule `scaleX 0→1`; cta `autoAlpha →.82 y 8→0`; dot `autoAlpha 0→1 scale .4→1` |
| **P6 0.82–0.90 · hold / read** | climax dwell; no major motion, only micro-parallax for depth; hover stays live | cards `yPercent ±1.0–1.4`; ghostWm2 `yPercent -2.0` |
| **P7 0.90–1.00 · exit / next** | whole pinned wrap translates UP and out (top cards lead a hair → peel feel); pin releases to native scroll; next section's bust + ghost wordmark rise in from below | top cards `yPercent -=120`, bottom `-=110`; centre+dot `autoAlpha 0, y -60`; rims/ghostWm2 `autoAlpha 0`; next bust/wm `y →0, autoAlpha in` |

The centre stays the anchor across all phases → the section is **pinned**; the dot + steady framing confirm scrub, not autoplay.

## Easing + durations (the ONE site ease)
- **One ease only** — the **easeOutQuad / "slideOut" family** (fast lead-out, long glide-to-rest — that is what makes the cards feel *dealt*, not *flung*). NO "air" curve here; the drawer mechanic wants snap.
  - `slideOut  = CustomEase "0.22,1,0.36,1"` → all slide/settle (drawer, hero, siblings, exit).
  - `reveal    = CustomEase "0.25,1,0.3,1"`  → headline + rule + CTA + dot reveal (same family).
  - `back.out(1.4)` → **scale only**, the P4 corner lock overshoot.
  - ghost crossfades → `ease:"none"` (ride the scrub linearly).
  - hover (non-scroll) → `power2.out 0.4s`.
  - If `CustomEase` is absent the JS falls back to `power2.out` (still the right family).
- Because it is **scrubbed**, "duration" = a slice of the pin timeline, not wall-clock (see the phase table for each slice).
- Pin length `endVH = 220%` — seven phases need the room. `scrub:1` for ~1-frame smoothing.

## Trigger
**Scroll-scrub + pin.** `ScrollTrigger { trigger: root, start:"top top", end:"+=220%", pin:true, scrub:1, anticipatePin:1, invalidateOnRefresh:true }`. The next-section bust/wordmark are two small **separate** scrubbed triggers on `.next`.

## DOM structure
```
.sofi                         ← pinned wrap, owns tokens + bg (leaves together in P7)
  .sofi__bg / .sofi__bg-light ← black + light layers (light fades out P1)
  .sofi__rail-l / .sofi__rail-r / .sofi__index   ← static chrome
  .sofi__drawer               ← prior section's plate (slides up+out P1)
  .sofi__stage                ← 100vh, place-items:center (card origin)
    .sofi__ghost
      .sofi__ghost-letter     ← giant faint letterform
      .sofi__ghost-wm         ← state-A wordmark (0→peak→0)
      .sofi__ghost-wm2        ← state-B wordmark (0→peak in P4)
    .sofi__rim.tl/.tr/.bl/.br ← rim ghost words
    .sofi__deck
      .sofi__card[data-role]  ← hero(is-tall) + tr/bl/br(is-sib); top:50% left:50% +
        .sofi__card-inner img    translate(-50%,-50%)+--tx/--ty/--scl/--hv
        .sofi__card-label .sofi__card-cap
    .sofi__copy
      .sofi__center  h2       ← "Доказ у самому домі." (reveal P5)
        .sofi__cta-wrap  .sofi__rule  .sofi__cta
    .sofi__dot                ← scroll indicator
.next                         ← following section, revealed on P7 exit
  .next__bust .ph  /  .next__wm
```
Card identity is by **`data-role`** (`hero|tr|bl|br`), so DOM order is free. Every card is **9:16 portrait** (`.is-tall` hero, `.is-sib` siblings) because the whole Nahirna dataset is true portrait 9:16 (3072×5504) — forcing a portrait render into a landscape box would crop it under `object-fit:cover`. The hero is larger than the siblings for hierarchy, same ratio (G7).

## The key CSS / GSAP that creates it
**CSS** — each card is centred once, then offset by custom props the JS animates (the tween only ever touches `transform`):
```css
.sofi__card{
  top:50%; left:50%;
  --tx:0px; --ty:0px; --scl:1; --hv:1;
  transform:
    translate(-50%,-50%)
    translate(var(--tx),var(--ty))
    scale(calc(var(--scl) * var(--hv)));   /* --hv = hover, multiplied in */
}
```
**JS** — corner targets are computed as fractions of the stage half-box and fed via **function-based values** so `invalidateOnRefresh` recomputes them on resize:
```js
tl.to(card, {
  "--tx": () => anchorPx(role).tx + "px",
  "--ty": () => anchorPx(role).ty + "px",
  "--scl": 0.95, autoAlpha:0.85,
  ease: E_SLIDE, duration: 0.22
}, 0.26 + CONFIG.stagger[role]);   // the deal-out stagger
```
The headline, ghost wordmarks and rule all reveal/crossfade **in place** (`autoAlpha` + tiny `y`, or `scaleX` for the rule) — never sideways.

## Gotchas (what makes it look cheap if done wrong)
- **Don't `left/top/width` the cards** — animate transforms only. Layout writes in the scrub kill 60fps.
- **Wrong ease kills it.** This is an easeOutQuad-family *snap-and-settle*, not the soft "air" curve. Air makes the drawers float instead of *deal*.
- **Stagger is the soul.** Move the 3 siblings on one keyframe and it reads as a cheap "explode"; the `0.00/0.06/0.12` deal-out is what makes it editorial.
- **Counter-parallax the inner `img` (1.12→1.0)** while a card travels — without it the photos feel like flat stickers.
- **Crossfade copy + ghosts in place.** The centre is the anchor; sideways motion fights the cards.
- **Ghost opacity ≤ peak (~.10–.22).** Above that it stops being texture and competes with the headline.
- **Pin length matters:** seven phases at `<180%` collide; `220%` gives each phase room.
- **`will-change:transform` on cards + inner imgs only** (not the whole section).
- **Never scrub `video.currentTime`** (no video here; if you swap one in, do not). Max 2 decoders.
- Respect **prefers-reduced-motion**: jump straight to the settled P5/P6 climax, no scrub/pin.
- Mobile (≤760px): **no pin**, tighten anchors to a clean 2×2, no overlap.
- `ScrollTrigger.refresh()` after any height-affecting change (D16) — the resize handler does this.

## Reusable parameters (the component API)
`SlideOutImgText.init(rootSelector, opts)` where `opts` deep-merges onto `DEFAULT_CONFIG`:
| param | default | what it does |
|---|---|---|
| `anchors` | `{hero,tr,bl,br}` each `{fx,fy,scl}` | END corner anchor of each card as a fraction of the stage half-box (responsive, `-1..+1`). |
| `stagger` | `{tr:0, bl:.06, br:.12}` | per-sibling deal-out progress offset. |
| `scrub` | `1` | ScrollTrigger smoothing. |
| `endVH` | `220` | pin length as % of viewport = total gesture distance. |
| `innerZoom` | `1.12` | inner-img counter-parallax start scale. |
| `ghostWmPeak` / `ghostWm2Peak` / `rimPeak` | `.22 / .10 / .13` | ghost layer peak opacities. |
| `next` | `.next` | the following section element (for the exit reveal). |

`SlideOutImgText.initLenis()` wires guarded Lenis once per page (no-op without Lenis or under reduced-motion).

Card identity = `data-role` attribute. **Direction** = sign of `fx/fy`. **Axis** (corners vs left/right spread) = set all `fy:0`. **Headline / CTA copy** = the `.sofi__center` block. **Ghost text** = `.sofi__ghost-*` / `.sofi__rim` text.

## Quality bar reached
1:1 with the Zera reference, all SEVEN phases: drawer handoff → hero beat → staggered corner slide-out → overshoot lock → in-place centre reveal → hold → wrap exit/next-section. Single easeOutQuad "slideOut" ease, transform/opacity/clip-path only, pinned scrub, real portrait 9:16 NAHIRNA renders, Ukrainian Fedoriv copy (no em-dash, no people figures), no-WebGL, reduced-motion + mobile (no-pin) handled.
