---
id: architecture--dusk-seam
name: "Дім, що зустрічає присмерк"
level: 2
kind: section-variant
status: candidate
section: gallery
meaning: { what: "The whole exterior crosses day into dusk down a centre seam as you scroll, lit windows and path lights arriving with the evening.", when: "The architecture beat of a residential site, when one strong exterior render carries the section and you want light, not a spec list, to sell the building.", lands: "A quiet held breath: the home you saw by day becomes the home you would come back to at night." }
uses:
  - { atom: daynight-center-seam, job: "render+seam/depth" }
pin: { owner: harness, count: 1 }
webgl: false
ease: air
source:
  grammar: "Vide Infra / Saisei day-to-dusk seam reveal on the building exterior"
  recording: null
  registry_ref: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "one harness pin"
  - "frame-matched dn-ext day/night pair crosses down the centre seam"
  - "fps>=50 jank<8% under 4x CPU"
  - "zero em/en-dash in visible copy"
---

# Дім, що зустрічає присмерк

The architecture section as a single sustained shot. One exterior render fills the
viewport edge to edge; as the visitor scrolls, the building parts down its vertical centre
and the evening version grows outward from the seam to both edges. By the bottom of the pin
the windows are lit and the path lights are on, so the reveal does the selling that a
materials list never could.

## Shape, MANUAL atom on the harness pin
`daynight-center-seam` is a PURE `set(t)` atom (0 = day, centre closed; 1 = dusk, fully
revealed). It owns no scroll of its own. The **harness owns the one pin** and feeds the
atom's `set(t)` from scroll progress, so the pin budget stays at exactly one. The same
progress bus drifts the serif caption up a few dozen pixels and warms its opacity, so text
and building move as one gesture rather than two.

- Canon dep loads FIRST: `daynight-engine/component.js` (`window.DayNight`), then
  `daynight-center-seam/component.js` (`window.DayNightCenterSeam`).
- `SectionHarness.pin('#combo', { length:'+=130%', scrub:0.8 })`; `st.onUpdate` calls
  `seam.set(p)` and `gsap.set('[data-spine]', ...)`.
- `declare({ pinOwner:'harness', expectPins:1, atomsCited:['daynight-center-seam'] })`.

## Copy
Sparse, premium, Fedoriv-voice. Eyebrow `вул. Замкова`, a two-word serif title, and one
quiet supporting line about the light. No em-dashes anywhere in visible text. The render is
the hero, the type lives on the rails with generous distance between it and the building.

## Motion laws honoured
clip-path (the centre-parting inset on the night layer) + opacity (seam fade, caption warm)
+ transform (caption drift) only. No WebGL, no mix-blend, no backdrop-filter, no
`video.currentTime` scrub. `prefers-reduced-motion` lands on the static dusk end state via
the atom.

## Render
Real exterior pair from the QUADRO proto set, copy-pasted exactly:
`renders/dn-ext-day.webp` and `renders/dn-ext-night.webp` (the `renders` symlink points the
combo dir at `apps/quadro/public/proto`).
