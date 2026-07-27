---
id: architecture--windows-light-up
name: "Коли вечір вмикає світло"
level: 2
kind: section-variant
status: candidate
section: gallery
meaning: { what: "As you scroll, the day building holds while its windows ignite one by one into the dusk, the house coming alive at evening.", when: "Architecture section where the hero asset is one strong day/night exterior pair and you want to sell the building's evening life, not its plan.", lands: "Warmth and belonging: this is a home worth coming back to after dark, lamps on, life inside." }
uses:
  - { atom: daynight-masked-windows, job: "render+seam/depth" }
pin: { owner: harness, count: 1 }
webgl: false
ease: air
source:
  grammar: "Vide Infra dusk-ignition: windows light up across their own bands at evening"
  recording: null
  registry_ref: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "one harness pin"
  - "windows ignite across bands on a frame-matched exterior pair"
  - "fps>=50 jank<8% under 4x CPU"
  - "zero em/en-dash in visible copy"
---

# Коли вечір вмикає світло

An architecture section built as a single pinned beat. The render is the hero: one
frame-matched day/night exterior of the building, sized full-bleed into the stage. The
section sells the BUILDING at the moment it becomes a home, not its floorplate.

## How it reads
The visitor scrolls into a pinned daytime building. As the pin scrubs, `daynight-masked-windows`
fades each window's warm glow in across its own staggered band, so the lamps switch on room by
room, carport to far-right, exactly the way a house wakes up at dusk. A quiet dusk wash deepens
over the same progress and a serif title settles low-left while a hairline grows beside it. By
the end every window is lit and the field has fallen into evening.

## The mechanics (load-bearing)
- MANUAL shape. The HARNESS owns the single pin (`SectionHarness.pin('#combo', { length:'+=130%', scrub:0.8 })`).
  The atom is PURE: `mw.set(p)` on the pin's `onUpdate` is the only driver. No second pin.
- Canon dep loads FIRST: `daynight-engine/component.js`, then `daynight-masked-windows/component.js`.
- The render paints into `#winHost[data-render-surface]`; the atom injects `.dn` (day + night
  layers) plus the per-window lit crops there, so the probe's painted-surface assertion holds.
- `windows / band / glow` are LEFT AT THE TUNED DEFAULTS for this exterior render, never overridden.
- Everything that drifts (dusk wash, title, eyebrow, hairline) moves on `transform`/`opacity` only,
  off the same progress scalar. No mix-blend, no backdrop-filter, no canvas, no WebGL.
- Reduced motion: the atom statics to the fully-lit end state on its own.

## Copy
- Eyebrow: `вул. Замкова`
- Title (2 words): `Дім оживає`
- Caption: `Світло вмикається кімната за кімнатою. Вечір, у який хочеться повертатись.`

Ukrainian, Fedoriv-voice, sparse. Zero em/en-dashes anywhere visible. The title is two words; the
caption is one quiet line about light and living, sitting far from the render's bright centre.
