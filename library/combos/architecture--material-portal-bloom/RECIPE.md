---
id: architecture--material-portal-bloom
name: "Вечір розквітає зсередини"
level: 2
kind: section-variant
status: candidate
section: gallery
meaning: { what: "A growing warm circle blooms outward from a lit window, sweeping the day exterior into evening as you scroll; the circular edge stays visible across the whole scroll and only fills the frame near the end.", when: "An architecture section where the building is the hero and you want one slow, scrubbable atmosphere shift instead of a gallery of stills.", lands: "The visitor watches a circle of evening spread from the window across the facade, as if the light came on inside and the warmth reached the walls from the inside out." }
uses:
  - { atom: daynight-portal-reveal, job: "render+seam/depth" }
pin: { owner: harness, count: 1 }
webgl: false
ease: air
source:
  grammar: "Vide Infra portal bloom: dusk grows from a lit window as a clip-path circle"
  recording: null
  registry_ref: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "one harness pin"
  - "circle bloom visible across scroll not a plain crossfade"
  - "caption legible over the lit facade"
  - "fps>=50 jank<8% under 4x CPU"
---

# Вечір розквітає зсередини · architecture--material-portal-bloom

A single architecture render, two frame-matched stills of the same exterior: one in
daylight, one at dusk. As the visitor scrolls, evening does not fade in flatly. It
blooms outward in a growing circle from a lit window at `60% 62%`, the way light reads
when someone switches a lamp on inside and the warmth spreads across the facade.

## How it is wired

The cited atom `daynight-portal-reveal` builds the day-to-night canon (`window.DayNight`)
with `mode:'manual'` and `reveal:'portal'`, so the night layer carries
`clip-path: circle(t*145% at 60% 62%)`. That canon is PURE: its `set(t)` writes the
clip-path directly for `t` in `0..1`, exactly like `daynight-center-seam`.

### The circle must read as a circle (progress remap)

At this origin and a ~16:9 stage, `circle(t*145%)` already fully covers the frame at
`t ~= 0.59` (radius ~85.5% of the reference). Any `t` past that paints an off-screen
circle: no visible change. So we do **not** scroll `t` linearly `0..1` (that front-loads
the bloom: by `t=0.5` / `circle(72%)` the warm circle has already swallowed the building
and the rest reads as a flat dusk hold). Instead the harness remaps pin progress
`p -> t = ease(p) * T_FILL` with `T_FILL = 0.64` (just past full cover). The warm
circular edge therefore grows **visibly across the whole scroll** and only fills near the
end. Mid-scroll readout: `p=0.25` -> `circle(~29%)`, `p=0.5` -> `circle(~45%)`,
`p=0.75` -> `circle(~67%)`, `p=1.0` -> just covered. A real expanding circle, not a
crossfade.

### Pin + driver

The harness owns the one pin. On every pin update we re-read the LIVE canon via the
`pr.dn` getter (never a cached reference) and call `dn.set(t)`, so the bloom scrubs
forward and backward with the scroll with no autoplay fighting it. We deliberately do NOT
call the atom's `bloomAt`, because that re-creates the canon (destroy + create) per call
and would jump under a scrub.

### Click-to-break guard

The atom binds `host.click -> bloomAt()` whenever motion is not reduced, **regardless of
`hotspot:false`**, and `bloomAt` does `dn.destroy()` + rebuild. Since scroll is the only
driver here, the combo swallows clicks on the host in the **capture phase**
(`addEventListener('click', stop, true)`, which runs before the atom's bubble-phase
listener on the same node), so `bloomAt` can never destroy and recreate the canon
mid-scrub. Combined with re-reading the `pr.dn` getter each frame, a click on the pinned
hero cannot freeze or desync the bloom. The `hotspot` dot is off too: scroll is the only
driver, so a click-to-bloom affordance would mislead.

### Legibility (text clears the bright pixels)

A sparse serif caption rides the same progress on `transform`/`opacity` only, drifting up
and brightening as the evening arrives. The render is the hero; the text sits far from the
bright center-right lit-window cluster, pinned to the lower-left edge. A LEFT-anchored
legibility scrim (a `linear-gradient` whose `opacity` rises with `t`) sits only behind the
caption column, so the body copy stays readable at night while the warm glow stays
untouched as the hero. Pure gradient + opacity, no mix-blend, no backdrop-filter.

## Pin budget

One pin, owned by the harness (`pinOwner: harness`, `expectPins: 1`). The atom is a
MANUAL atom, so it owns no pin of its own: `dn.set(t)` is the only thing the pin drives.

## Bans honoured

No WebGL, no mix-blend, no backdrop-filter, no canvas drawImage. The whole move is
`clip-path` (the circular bloom) plus `transform`/`opacity` (the caption drift and the
legibility scrim, which is a `linear-gradient` faded by `opacity` only). No animated
`width`/`height`/`top`/`left`/`margin`. The video-currentTime ban does not apply (the
media are stills). Ease token: `air`.

## Copy

- Eyebrow: `Архітектура`
- Title: `Вечір розквітає зсередини`
- Note: `Світло з вікна розходиться теплим колом, і той самий дім стає вечором.`

Ukrainian, Fedoriv-voice, sparse. Zero em-dash or en-dash in any visible text.
