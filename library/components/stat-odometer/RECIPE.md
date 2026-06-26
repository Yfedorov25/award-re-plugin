---
id: stat-odometer
name: "Pinned stat-card slider — 4 mechanics per step (Springs odometer)"
level: 2
kind: component
status: official
entry:
  call: "StatOdometer.init(target, opts)  // target = the .so-stage el/selector. Markup-first: .so-step children carry data-num / data-label / data-bg / data-photo; the engine BUILDS the bg stack, the card photo stack, the numeral column, the label, and the progress bar. opts: { lerp, pinFactor, snap, manageLenis }."
  module: iife
  returns: "{ trigger, lenis, render, steps, refresh, destroy }  (or { static:true, destroy } under reduced-motion / <=820px / no-libs)"
meaning:
  what: "Springs' '3 / 9 / 10 / 16' pinned STAT-CARD slider — the most engineered module, harvested from the frame-by-frame teardown. ONE pinned scroll range steps through N data points; on EACH step FOUR different mechanics fire AT ONCE: (1) the full-bleed BG photo swaps by a VERTICAL SLIDE-UP; (2) a square CARD PHOTO tile CROSSFADES to the new image; (3) the giant serif NUMERAL changes via an ODOMETER ROLL (a numeral column translates so the active number sits in a one-number-tall window); (4) the all-caps LABEL SWAPS (crossfade, dipping at the mid). Plus a thin PROGRESS BAR and snap to each step. Each mechanic is DIFFERENT (slide / crossfade / roll / swap), all on one scroll step — that choreography is what reads cinematic and expensive. CONFIG-DRIVEN: any N data points, any numbers / labels / photos."
  when: "A proof/location beat that turns dry stats — minutes to the park, to transit, to the centre; counts of amenities; distances — into a cinematic. When you have 3-6 data points that each deserve their own held frame with a matched photo, a big number, and a caption, and you want them choreographed (number rolling, image sliding, photo crossfading) rather than listed in a boring stat row. The 'this data is a story' module."
  lands: "Each fact arrives as its own held cinematic frame: the background slides up to a new matched photo, the card photo crossfades, the giant number rolls to the next value, the caption swaps, the progress bar advances — four things moving together, snapping to rest on each step. It reads engineered and premium, the opposite of a flat icons-and-numbers stat row."
  not_when: "A single number / one hero stat (just typeset it, or use a counter on reveal). Many data points that should be scannable at once (a table / grid). A section that must keep native scrolling or already sits under another pin in the same beat (one scroll owner per page). Body-heavy content. Touch-small -> the static stacked list fallback (you lose the choreography)."
source:
  grammar: "Harvested from the springs.estate 'Place / 3-9-10-16' pinned stat-card module, frame-by-frame: pinned right card; per step bg vertical-slide + card-photo crossfade + numeral odometer-roll + label swap + progress bar + snap. Frame-cited in D_springs_walkthrough_video.md (S11, f_124-f_162)."
  recording: "apps/quadro/.award-re/teardowns/D_springs_walkthrough_video.md (S11)"
  registry_ref: ["T-statodometer-springs"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis 1.1.13 (cdn jsdelivr)"
webgl: false
motion_props: [transform, opacity]
trigger: "ONE pinned scroll-scrub ScrollTrigger (scrub:true, pin:true, snap to 1/(N-1)), Lenis-smoothed, reversible; pin length = innerHeight*pinFactor*(N-1)"
timing_layer: [B-entrance, A-ambient]
owns_pin: true
owns_scroll: false
page_beat: [proof, material, location]
combines_with: [section-curtain-riseover, fluid-type-sizing, watercolor-svg-map, scroll-indicator]
anti_combos: [second-pin, section-pager, dual-slicer, media-step-switch, cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_one_scroll_owner, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "ONE pinned scroll steps through N data points (owns_pin TRUE; one ScrollTrigger pins; snap to each step); render(prog) is a PURE fn of progress; reversible"
  - "per step, FOUR mechanics fire together and DIFFERENTLY: BG vertical slide-up (next rises from bottom pushing old up) + CARD PHOTO crossfade + NUMERAL odometer-roll (column translates so the active number sits in a one-number-tall window) + LABEL swap (crossfade, dips at mid)"
  - "a progress bar advances (scaleX = prog); the numeral window height EQUALS one numeral height (so the roll shows exactly one number — not clipped/partial)"
  - "bg and card photos are real <img> (object-fit:cover) so they composite as SOLID media (NOT background-image — the gate's solid-media check needs an <img>; background-image reads as blank)"
  - "engine laws: Lenis 1.1.13 -> gsap.ticker -> ScrollTrigger.update; lagSmoothing(0); transform + opacity only; GPU layers (will-change); NO mix-blend / NO backdrop over the scrubbed surface; NO WebGL"
  - "CURTAIN/SLICER gate mode (CURTAIN=1): the bg slide-up shows two solid renders during the transition = the technique (coSolid/seam expected); PASS = 0 blank, fps>=50, jank<8%"
  - "reduced-motion / <=820px -> static stacked list; window.__LAB_OK__ set on init; asset-substitution gate: built on OUR QUADRO distances + renders + Ukrainian labels"
gate:
  probe: "Open lab.html in a real browser (Lenis from jsdelivr). __LAB_OK__ true once ready (NOT so-static). Scroll into the pinned range and step through: confirm on each step the bg slides up, the card photo crossfades, the number rolls, the label swaps, the progress advances — and it snaps to rest. Run the smoothness gate in CURTAIN mode (CURTAIN=1): PASS = 0 blank, fps>=50, jank<8% (seam/coSolid expected from the bg slide). The numeral must be fully visible (window height = numeral height). Eye-check in a real browser."
note: |
  Fifth (final) harvested engine per the 2026-06-26 council verdict — Springs #2 of 2.
  With this, the VI grammar is banked (section-pager, fluid-type-sizing, parallax-
  collage, dual-slicer, stat-odometer) and the harvest is complete. Two build lessons
  logged: (1) the numeral WINDOW must be sized to the numeral height (a body-em window
  clips the giant number); (2) bg/photo layers MUST be real <img>, not background-image
  — the runtime gate's solid-media check looks for an <img>, and background-image read
  as blank 100% (false fail). Next phase: assemble COMPOSED sections from these engines
  on our projects (QUADRO/Nahirna/Towns).
---

# stat-odometer — pinned stat-card slider (4 mechanics per step)

Springs' most engineered module: a pinned card that steps through data points, each
step firing four DIFFERENT mechanics at once — bg slide, photo crossfade, numeral
roll, label swap — plus a progress bar and snap. Turns dry stats into a cinematic.

## The four mechanics (one scroll step)
1. **BG** vertical slide-up — next full-bleed photo rises from the bottom, old pushed up.
2. **CARD PHOTO** crossfade — square tile fades to the new image.
3. **NUMERAL** odometer roll — the numeral column translates so the active number
   sits in a one-number-tall window (`.so-num-window` height = numeral height).
4. **LABEL** swap — caption crossfades (opacity dips to 0 at the step mid).
\+ progress bar (`scaleX = prog`), pin, snap.

## Markup + call
```html
<section class="so-stage" id="stat">
  <div class="so-bg"></div>
  <div class="so-card">
    <div class="so-card__photo"></div>
    <div class="so-num-window"><div class="so-num-col"></div></div>
    <div class="so-label"></div>
    <div class="so-progress"><div class="so-progress__fill"></div></div>
  </div>
  <div class="so-step" data-num="3"  data-label="…" data-bg="a.webp" data-photo="p.webp" hidden></div>
  <div class="so-step" data-num="9"  data-label="…" data-bg="b.webp" data-photo="q.webp" hidden></div>
  …
</section>
```
```js
StatOdometer.init('#stat', { lerp: 0.1, pinFactor: 1.2, snap: true });
```
Set `.so-num-window { height: <same clamp as .so-num> }` so the roll shows one number.

## Gate (CURTAIN mode) + lessons
Run with `CURTAIN=1` (bg slide shows two solid renders during the transition = the
technique). Proven on OUR data: 4 QUADRO distances + renders + Ukrainian labels ->
0 blank, 59.9fps, jank 1/725; all four mechanics fire on one step. Two lessons
(logged): numeral window must equal numeral height (else the giant number clips);
bg/photo must be real `<img>` not background-image (the gate's solid-media check
needs an `<img>` — background-image read as blank 100%).
