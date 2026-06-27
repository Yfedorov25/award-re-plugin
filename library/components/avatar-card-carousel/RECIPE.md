---
id: avatar-card-carousel
name: "Avatar card-carousel (a row of portrait cards, several visible, that translateX one at a time; name + role caption under each; a horizontal progress-line with end arrows tracks position)"
level: 2
kind: component
status: official
entry:
  call: "AvatarCardCarousel.create(target, opts)  // target = .acc-stage > .acc-viewport > .acc-track > .acc-card(.acc-media img + .acc-name + .acc-role) + .acc-prev/.acc-next + .acc-progress(.acc-progress-fill). opts: { perView, duration, ease, wheel, drag, index }."
  module: iife
  returns: "{ go(i), next(), prev(), index(), count, destroy }"
meaning:
  what: "gapsystudio's team carousel — a row of PORTRAIT cards (people / avatars), SEVERAL visible at once (perView), that translateX one card at a time. Under each card a NAME + ROLE caption. Below the row a horizontal PROGRESS-LINE whose filled segment tracks position, flanked by round prev/next arrows. Driven by arrows, drag, wheel, keyboard."
  when: "A TEAM / people / testimonials / logos strip where you want SEVERAL items in view and a calm sense of how far through the set you are. The portrait card + name/role caption is the canonical 'meet the team' unit; the progress-line (not dots) reads as understated and premium, good for a set of 5-12. Use it on an /about or /people page, or for any peer set where the caption matters as much as the image."
  lands: "You see three tall cards side by side, each a person with their name and role written underneath. A thin line beneath the row shows how far along you are, with a small round arrow at each end. Press it (or drag, or flick the wheel) and the row slides one card over, the line filling a little more, the next face sliding into view. It feels like leafing through a team, never losing your place."
  not_when: "A single hero item (no carousel). One landscape card in focus with specs (use horizontal-spec-carousel). A huge set that needs search/filter (use a grid). Auto-rotating banners (this is user-driven). When each card needs its own CTA / spec-row (that's horizontal-spec-carousel's job)."
source:
  grammar: "gapsy /about: portrait cards (avatar images), several visible, name + role ('UI/UX Designer') under each; a horizontal progress line with left/right arrows below."
  recording: "apps/quadro/.award-re/teardowns/D_gapsy_video.md (C /about; gapsystudio.com, NO-WebGL basket A)"
  registry_ref: ["C-avatar-card-carousel-gapsy"]
stack: "vanilla (transform-driven; arrows / drag / wheel / keyboard)"
webgl: false
motion_props: [transform, opacity]
trigger: "triggered (arrows / drag / wheel / keyboard), not scroll"
timing_layer: [D-interaction]
owns_pin: false
owns_scroll: false
page_beat: [team, people, testimonials]
combines_with: [script-overline-display-pair, drag-tab-reveal, menu-tracked-stagger, coords-corner-frame]
anti_combos: [auto-rotate, carousel-over-scrubbed-surface]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a row of portrait cards, perView visible at once (card width = 1/perView of the viewport minus gaps); the track translateX(-index * step), step = cardW + gap"
  - "each card has a name (.acc-name) + role (.acc-role) caption UNDER it; off-window cards scale .97 + dim, the visible window is full"
  - "a horizontal progress-line (.acc-progress-fill scaleX = index/maxIdx, transform-origin left) below, flanked by round prev/next arrows"
  - "maxIdx = count - perView; arrows disable at idx 0 and maxIdx (cannot scroll past the last full view)"
  - "driven by arrows, drag/swipe (threshold max(40px, 18% of a card), move/up on WINDOW per F-08), horizontal wheel, Left/Right keys; stage focusable"
  - "transform: translateX + scaleX + scale + opacity only; NO mix-blend / NO backdrop; NO WebGL; reduced-motion -> instant index"
  - "asset-substitution gate: OUR QUADRO portrait renders as the card images + name/role captions + warm palette; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Several portrait cards show with name+role under each; a progress-line + round arrows below. Press next/prev (or drag / wheel / arrow keys) -> the row slides one card, the progress-fill grows (idx/maxIdx), arrows disable at the ends. Distinct from horizontal-spec-carousel (one landscape card + edge-peek + spec-row). Triggered (NOT scroll) -> verify perView + step + progress-fill + end-disable, and run the TRIGGERED smoothness probe."
note: |
  Brick 3 of the gapsystudio harvest (NO-WebGL basket A). A multi-card portrait carousel with
  name/role captions and a progress-LINE (not dots). Confirmed a DISTINCT class from
  horizontal-spec-carousel: that shows ONE landscape card in focus + edge-peek + vertical-pill
  arrow + per-card CTA + a swapping spec-row; this shows MANY portrait cards + caption-under +
  a progress-line with end arrows. Bakes in the F-08 drag law (window pointer). transform +
  opacity = GPU-cheap. owns_pin false. Proven 1:1 on QUADRO renders: perView 3, step = cardW+gap,
  progress-fill = idx/maxIdx, arrows disable at the ends; 0.6% jank @ 59.9fps, zero console
  errors. Display caption stand-in = Anton (condensed grotesque). NOTE: real use wants people
  portraits; here QUADRO renders stand in for the carousel mechanics (no-figures rule respected —
  the engine is the carousel, not the faces).
---

# avatar-card-carousel — portrait cards (several visible) with name/role captions + a progress-line

gapsystudio's team carousel: a row of portrait cards, several visible at once, that translateX
one at a time; a name + role caption under each card; a horizontal progress-line (filled segment
tracks position) flanked by round arrows. Driven by arrows, drag, wheel or keyboard.

## Markup + call
```html
<section class="acc-stage" id="team">
  <div class="acc-viewport">
    <div class="acc-track">
      <article class="acc-card">
        <div class="acc-media"><img src="p.webp"></div>
        <div class="acc-name">Name</div><div class="acc-role">Role</div>
      </article>
      <!-- … more cards … -->
    </div>
  </div>
  <div class="acc-nav">
    <button class="acc-prev">‹</button>
    <div class="acc-progress"><span class="acc-progress-fill"></span></div>
    <button class="acc-next">›</button>
  </div>
</section>
```
```js
AvatarCardCarousel.create('#team', { perView:3, duration:520, wheel:true, drag:true });
```

## Proven (the lab)
5 team cards (perView 3) on OUR QUADRO renders, name+role under each. Measured live: idx0 tx=0
fill=0.00 activeCount=3 (prev disabled); next → idx1 tx=-430 fill=0.50; at-max → idx2 tx=-861
fill=1.00 (next disabled); prev → idx1 fill=0.50. step = 430px = cardW 406 + gap 24; 3 cards
always active; maxIdx=2 (count 5 − perView 3). Progress-fill scaleX tracks idx/maxIdx exactly.
Screenshot (idx1): three portrait QUADRO cards (Марта/Олег/Ірина) with role captions + a
half-filled progress-line + round arrows (matches gapsy /about). Triggered probe (4× CPU
throttle, 5 next/prev cycles): 2/348 long frames (0.6%), 59.9fps → PASS. Zero console errors.
