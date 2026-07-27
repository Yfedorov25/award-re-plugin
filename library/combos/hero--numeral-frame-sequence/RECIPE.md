---
id: hero--numeral-frame-sequence
name: "Число, що стає світом"
level: 2
kind: section-variant
section: hero
status: base
meaning:
  what: "A cinematic title sequence built on a giant STROKE-ONLY outline numeral that holds a small framed glimpse of the building inside its counters. On one pinned scroll the aperture dilates to a full-bleed photograph while the outline digits dissolve, a serif display title rises from under a mask, a slow parallax pan holds, then the whole hero rises out as the next section arrives, the page theme tweening with it."
  when: "The very first impression of a residence whose NUMBER means something, a house number or a year that is also the address. The hero where the brand wants the building to literally emerge from inside its own numeral, the strongest, most authored beat on the page, reading as a film title card rather than a big-title-over-photo slide."
  lands: "You meet a vast outline number with a tiny window of the house living inside it; as you scroll, that window opens until the house fills the screen, the number melts away, the title lifts into place, the view drifts, and the hero floats up and out while the page warms into the next chapter. It reads engineered, slow, and expensive, unmistakably one heroic moment, not a montage."
source:
  grammar: "numeral-frame-expand-hero is harvested frame-by-frame from r1864's signature hero (D_r1864): outline year 1864 holding a framed Kremlin-through-columns view that expands to a full-bleed embankment photo, serif title in, parallax pan, exit-rise, four reported hero fragments absorbed into one pinned engine. corner-frame-meta is the Saisei S8 corner-label plate (D_saisei). theme-tween is the EVER per-section color engine (slate to brown to green) that recolors the chrome across each seam. The award lineage: r1864 title-sequence hero plus Saisei framed-plate meta plus EVER seam-recolor, welded onto ONE scroll owned by the numeral engine."
  recording: null
  registry_ref: []
uses:
  - { atom: numeral-frame-expand-hero, job: "OWNS the one pin. The whole 4-stage narrative on one pinned scroll-scrub: A frame-expand (outline numeral 34 holds a framed glimpse, clip-inset and scale open it to full-bleed while the digits dissolve), B serif title rises from under, C parallax pan, D exit-rise into the next section. PURE set(p). Paints the real day-34 render into [data-render-surface]." }
  - { atom: corner-frame-meta, job: "PURE set(p), owns NO pin. The four corner labels (brand top-left, latitude bottom-left, status bottom-right, index right-centre) fade in welded to the SAME scroll progress (chained onto the hero trigger vars.onUpdate, ramped across the frame-open window), making the full-bleed read as an authored plate." }
  - { atom: theme-tween, job: "Owns NO pin (rAF plus IntersectionObserver). Tweens the root --bg/--ink/--accent from the hero warm-black field toward the next section lighter theme across the exit-rise seam, so the page theme tweens WITH the hero leaving." }
pin:
  owner: numeral-frame-expand-hero
  count: 1
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "Exactly ONE pinned ScrollTrigger exists and it is owned by numeral-frame-expand-hero (the harness creates no section pin); pinFactor 2.4 gives roughly 2.4 viewports of one continuous narrative; set(p) is a PURE function of progress and reverses on scroll-up."
  - "The giant outline numeral 34 is stroke-only (text-stroke, transparent fill) and is the real house number of the building shown; on scroll the framed glimpse dilates clip-inset 36 percent to 0 and scale 0.60 to 1 to a full-bleed day-34 render while the numerals fade out by roughly progress 0.30. NO second cover, NO preloader, NO second pin."
  - "The serif title rises from under (translateY plus opacity, expo.out) over the photo at progress 0.30 to 0.55, the sub-line a beat later; the four corner-frame-meta labels fade in on the SAME scroll across progress 0.10 to 0.45 via the one hero trigger, never a second ScrollTrigger."
  - "theme-tween recolors :root --bg/--ink/--accent from #16130f toward the next section #ece4d6 across the exit-rise seam, color custom-properties only, no layout or transform from it; reduced-motion snaps instead of tweening."
  - "Engine laws: transform, opacity, clip-path, filter only; GPU layers; decode-guard force-decodes the hero render before the aperture opens (no black flicker); NO mix-blend, NO backdrop-filter, NO video.currentTime scrub, NO WebGL; reduced-motion and <=820px fall back to the final state (photo plus title shown)."
  - "Asset-truth: the full-bleed subject is renders/day-34.webp, the real building, 1920x1080, cars-free landscape crop; the numeral 34 is that building's actual house number; copy is sparse Ukrainian, proof-not-promises, zero em-dash or en-dash anywhere."
webgl: false
ease: air
class: "scroll (pinned 4-stage)"
---

# hero--numeral-frame-sequence · "Число, що стає світом"

The first impression for a residence whose number is also its address. A vast
stroke-only outline `34` holds a small framed window of the house inside its
counters; on one pinned scroll that window dilates to a full-bleed photograph
while the digits dissolve, the serif title rises, the view drifts in parallax,
and the hero floats up and out as the page warms into the next chapter.

## The one mechanic (distinct root)
Outline-numeral-as-aperture. No other hero on the page uses giant stroked
numerals as a dilating window onto the building. It is unmistakable in a single
screenshot, not just in the code.

## The three atoms, one scroll
- **numeral-frame-expand-hero** OWNS the single pin and runs the whole 4-stage
  narrative as a PURE `set(p)`. It paints the real `day-34` render into
  `[data-render-surface]`.
- **corner-frame-meta** is a PURE `set(p)` plate. Its four corner labels are
  welded to the hero's own scroll by chaining a second callback onto the hero
  trigger's `vars.onUpdate`, so there is never a second ScrollTrigger.
- **theme-tween** owns no pin (rAF + IntersectionObserver). It tweens the root
  color vars from the hero's warm-black field toward the next section's lighter
  theme across the exit-rise seam, so the page theme leaves with the hero.

## Pin budget
Exactly one pin, owned by `numeral-frame-expand-hero`. The harness creates no
section pin (declared `pinOwner: numeral-frame-expand-hero`, `expectPins: 1`).
corner-frame-meta and theme-tween own none. Anti: no preloader, no second pin,
no second cover.

## Copy (Ukrainian, Fedoriv voice, zero em/en-dash)
- Title: `Число, що стає світом`
- Kicker: `вул. Замкова, 34`
- Sub: `Шість домів. Власна вулиця. Початок числа.`
- Corners: `ЕРУ ДІМ` / `широта 49.84 N` / `статус ЗАСЕЛЕННЯ 2026` / `N°34`
