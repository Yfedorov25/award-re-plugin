---
id: hero--day-to-night-living
name: "Дім, що дихає світлом"
level: 2
kind: section-variant
section: hero
status: base
meaning:
  what: "A PINNED hero where ONE scroll scrubs the SAME exterior view from full day into lit-window night (day-34 <-> night-34, same house, same window): daynight-scroll-scrub owns the pin and ramps the night layer's OPACITY over daynight-engine's two registered frames while a warm window-glow rises and a legibility scrim deepens; the serif title masks up line-by-line; and the WHOLE page field tweens warm -> dark in lockstep with the dissolve. The building breathes light, then exhales the dark, and the page darkens around it."
  when: "The first impression of a residential project whose product IS the atmosphere: the same home felt across the day. Use it as the page opener when the strongest single signal you own is the house lighting up from inside as evening falls, and you want the whole page temperature to move with it rather than a static full-bleed or a load-in arrival."
  lands: "You land on a warm, dawn-paper page and a daytime facade. As you scroll, the SAME facade dissolves into evening, the windows glow warm from within, a soft scrim deepens for legibility, and the entire page field cools from paper-warm to night-dark in the same beat. The title has already risen from under its baseline mask. It reads authored and expensive, a home that breathes light, not a photo that swapped."
source:
  grammar: "The day<->night signature, harvested across three shipped Vide-Infra-level builds (TOWNS toggle, NAHIRNA pinned-scrub hero, SMARTS cursor-seam) and distilled into daynight-engine; this variant takes the NAHIRNA dialect (daynight-scroll-scrub: pinned opacity scrub + warm glow + legibility scrim, reduced-motion static) and welds it to a page-wide warm->dark recolour (theme-tween across the section seam + a live field lerp off the same scrub t). The masked title rise is the Saisei big-title move (mask-up-title)."
  recording: null
  registry_ref: []
uses:
  - { atom: daynight-scroll-scrub, job: "OWNS the one pin. Wraps the daynight-engine canon in mode:'scrub' reveal:'opacity' over the two registered frames (day-34 day layer, night-34 night layer); ramps night OPACITY 0->1, raises a warm window-glow and a legibility scrim, builds the scroll hint, and exposes scrub t via onUpdate. Pins #combo (normal-flow section) so pinSpacing extends the document; injects the render into #heroStage." }
  - { atom: daynight-engine, job: "The canon underneath the scrub dialect: stacks the two frame-matched media (SAME view) in one box and reveals the night layer by OPACITY (never a blend) off a single progress t. Runs INSIDE daynight-scroll-scrub; not instantiated twice." }
  - { atom: mask-up-title, job: "The hero title (#heroTitle) rises line-by-line from under a baseline mask once, at intro (expo.out, stagger 0.13, from 116%). Decoupled from the scrub: it owns the title RISE; the scrub only nudges the whole well's y as night settles." }
  - { atom: theme-tween, job: "Owns the page CHROME colour across the section seam: hero carries the WARM theme, the post-section the DARK theme; theme-tween lerps the root --bg/--ink/--accent toward the centred section's theme (visible on the meta + eyebrow accent). The in-pin field recolour is the scrub's live lerp; the seam handoff is theme-tween's." }
pin:
  owner: daynight-scroll-scrub
  count: 1
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "ONE pin only, owned by daynight-scroll-scrub (probe: ScrollTrigger pins === 1; expectPins:1). The harness creates NO section pin. The pin trigger is the normal-flow #combo section so pinSpacing extends the document and the FULL day->night range is scrollable."
  - "Same-view day<->night by OPACITY, never a blend: day layer = renders/day-34.webp, night layer = renders/night-34.webp (1920x1080 frame-matched pair, same house + same window, cars-free). At pin-end progress===1 => night opacity 1 + glow 1; reversible to day opacity 0 on scroll-up. NO mix-blend, NO video.currentTime."
  - "The whole page field tweens warm -> dark WITH the dissolve: --field lerps rgb(239,230,214) -> rgb(20,17,12) off the scrub t (verified rgb(20,17,12) at progress 1, rgb(239,230,214) back at top), and theme-tween moves --accent warm -> lamp-gold across the hero->post seam."
  - "The title masks up: lines start hidden below the baseline (set(0)) and rise once at intro via mask-up-title.play() (expo.out). DECODE-GUARD: both frames decode() before the intro reveals, so the night frame never flashes black through the rising opacity."
  - "Motion is transform/opacity/clip-path/gradient + CSS-var colour only; reduced-motion -> page settles to the night field, the engine shows the lit night, the title is shown instantly (no intro, no scrub). __LAB_OK__ true (1 pin, all four cited atoms ran, the [data-render-surface] painted a decoded image, 0 console errors)."
  - "Asset-truth: the full-bleed render is the real building, the SAME view day and night, no cross-paired houses, no cars-as-architecture, no dup-image."
webgl: false
ease: air
class: "scroll (day/night scrub)"
---

# hero--day-to-night-living — "Дім, що дихає світлом"

The opener as a single breath of light. ONE pinned scroll carries the SAME facade
from full day into a lit-window night, the windows glowing warm from within while a
legibility scrim deepens, the serif title already risen from under its mask, and the
whole page field cooling from dawn-paper to night-dark in the same beat. The house
breathes light, then exhales the dark, and the page darkens around it.

## The mechanic root (what makes it unmistakable on screen)
A PINNED day->night DISSOLVE of the SAME exterior view, welded to a page-wide
warm->dark recolour off the SAME scroll. No other hero in the family recolours the
entire page field as the building lights up. The signal in a single frame is the
colour temperature of the whole canvas sliding from paper-warm to night-dark while
the windows ignite.

## The coupling (one scroll beat, one pin owner)
- `daynight-scroll-scrub` OWNS the pin. It wraps the `daynight-engine` canon in
  `mode:'scrub' reveal:'opacity'` over two registered frames (day-34 / night-34),
  ramps the night layer's OPACITY, raises a warm window-glow + a legibility scrim,
  and exposes scrub `t` via `onUpdate`. It pins the normal-flow `#combo` section so
  pinSpacing extends the document; the render injects into `#heroStage`.
- Off that ONE `t` we also: lerp the page field `--field` warm -> dark (live), and
  nudge the title well as night settles (gated to AFTER intro so it never fights the
  fade-in). `mask-up-title` ran its rise ONCE at intro. `theme-tween` owns the chrome
  colour across the hero -> post seam.

## Markup + call (shape)
```html
<section id="combo" class="combo-stage"
         data-theme data-theme-bg="#efe6d6" data-theme-ink="#2c2620" data-theme-accent="#b07a4e">
  <div id="heroStage" data-render-surface></div>   <!-- daynight-scroll-scrub injects .dn here -->
  <h1 id="heroTitle" class="dtn__title">
    <span class="mut-line"><span>Дім, що</span></span>
    <span class="mut-line"><span>дихає <span class="dtn__warm">світлом</span></span></span>
  </h1>
</section>
<section class="combo-post" data-theme data-theme-bg="#14110c" data-theme-ink="#efe6d6" data-theme-accent="#e8c9a0"></section>
```
```js
DayNightScrub.create('#heroStage', {
  dayMedia: 'renders/day-34.webp', nightMedia: 'renders/night-34.webp',
  scrub: { trigger: '#combo', start: 'top top', end: '+=130%', pin: true },
  glow: true, scrim: 0.55, headline: [], onUpdate: t => paintField(t)
});
MaskUpTitle.create('#heroTitle', { stagger: 0.13, duration: 1.0, ease: 'expoOut', from: 116 });
ThemeTween.init({ sectionSelector: '[data-theme]', vars: ['--bg','--ink','--accent'], ease: 0.1 });
```

## Gate
Open `combo-lab.html`. `__LAB_OK__` true once ready (1 pin, all four cited atoms ran,
`[data-render-surface]` painted a decoded image, 0 console errors). Scroll the pin:
the SAME facade dissolves day -> lit night (night opacity 0 -> 1, glow rises, scrim
deepens), the page field cools warm -> dark, and `--accent` warms across the seam;
all reversible on scroll-up. Proven headless on our QUADRO renders + Ukrainian copy:
labOK true, pins 1, progress 1 => night opacity 1 + field rgb(20,17,12), reversible
to day at top, 0 errors.

## Anti
NO mix-blend (the engine ramps OPACITY over an identical frame). NO
`video.currentTime` (two registered `<img>` frames). ONE pin only. NO WebGL, NO
backdrop-filter. Never cross-pair different houses: day and night are the SAME view.
