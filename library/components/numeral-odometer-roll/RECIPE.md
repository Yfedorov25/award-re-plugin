---
id: numeral-odometer-roll
name: "Numeral odometer roll (a vertical column of numbers translated on Y inside a one-number-tall clipped window so the active value sits in frame; the number ROLLS — old slides up and out, new rolls up from below — extracted pin-less from stat-odometer so any host pin can drive it)"
level: 1
kind: component
status: candidate
entry:
  call: "NumeralOdometerRoll.create(target, opts)  // target = a .nor-window containing .nor-col(.nor-num*). Values from opts.values or read from .nor-num markup. opts: { values, value, digits, ease, dur }."
  module: iife
  returns: "{ to(n), set(p), value, index, reflow(), destroy }"
meaning:
  what: "The PURE numeral ODOMETER-ROLL mechanic, EXTRACTED out of stat-odometer's own pinned ScrollTrigger so other atoms can borrow the roll WITHOUT importing stat-odometer's pin. A vertical strip of numbers (.nor-num, one per value) sits inside a one-number-tall overflow:hidden window; the column (.nor-col) translates on Y so the active value sits in the window (translateY = -(index + f) * rowHeight). The number visibly rolls — the old value slides up and out, the new rolls up from below. set(p 0..1) maps a host's progress across the whole value sequence; to(n) tweens to a new value."
  when: "Whenever a number must CHANGE on screen and the change should feel mechanical and premium rather than a blunt swap — minutes-to-places in a location band, a stat that counts as you scroll, an arched-window stat headline, a price or area that rolls. Use it as the numeral inside a bigger composition (the host owns the layout, the photo, the pin); this atom is JUST the rolling column. Because owns_pin:false, it slots under a host that already owns the pin (e.g. minutes-bloom) without a pin-budget clash — the host calls set(p) every frame, or you fire to(n) on a discrete event."
  lands: "A single big number sits in a tight window. As the trigger advances, it doesn't blink to the next value — it rolls: the old digit lifts up and out the top while the new one climbs in from below and settles, clean and mechanical, like a railway departures board or an odometer. Multi-digit values (9 then 10) roll as one steady tabular band, no jitter. It reads engineered and calm."
  not_when: "The whole pinned stat-card choreography (bg slide + photo crossfade + numeral + label together) — that's stat-odometer (which OWNS the pin). A number that only ever appears once and never changes (just typeset it). A free-counting tally with no fixed value sequence (use a tween on textContent). When the host needs THIS atom to own scroll — it never does; it's pin-less by design."
source:
  grammar: "stat-odometer / Springs '3 / 9 / 10 / 16' pinned stat-card: the giant serif number changes via an odometer roll — old digit translates up and out, new rolls up from below. This atom is that numeral column, lifted out of the pin."
  recording: "apps/quadro/.award-re/teardowns/D_springs_walkthrough_video.md (S11); extracted from library/components/stat-odometer/component.js (build lines 88-92, roll lines 146-150)"
  registry_ref: ["S11-stat-odometer-springs"]
stack: "vanilla + guarded GSAP 3.12.5 (GSAP optional — to() snaps without it; set(p) needs no library)"
webgl: false
ease: "air (to() = power3.out-class glide); set(p) is linear (tracks the host 1:1)"
motion_props: [transform, opacity]
trigger: "host-driven — set(p) called by a host pin/scrub, or to(n) on a discrete event. NO ScrollTrigger of its own."
timing_layer: [C-content]
owns_pin: false
owns_scroll: false
page_beat: [location, stat, feature, editorial]
combines_with: [minutes-bloom, stat-odometer, district-radiates, reach-ribbon, arched-window-stat-band, line-art-location-map]
anti_combos: [stat-odometer-pin]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a one-number-tall .nor-window (overflow:hidden) holds a .nor-col stack of .nor-num rows; the column translateY = -(index + f) * rowHeight so the active value sits in the window and the rest is CLIPPED"
  - "set(p 0..1) is PURE: fpos = p*(N-1), column translated to fpos every frame, fully reversible (a host pin/scrub drives it); NO ScrollTrigger inside this atom"
  - "to(n) animates the column to value n (matched by value within the sequence): a visible roll, GSAP power3.out-class (ease/dur knobs); the old value slides up/out, the new rolls up from below"
  - "digits knob pads each value with a leading thin-space + tabular-nums so 1-digit and 2-digit values (9, 10) roll as one steady band with no horizontal jitter"
  - "transform translateY (the column) only; overflow:hidden window; GPU layer; will-change cleared after each to() one-shot; NO mix-blend / NO backdrop / NO WebGL / NO width/height/top/left animation"
  - "reduced-motion -> to() SNAPS to the value (no tween); GSAP absent -> to() snaps, set(p) still works; owns_pin:false; window.__LAB_OK__ on init"
  - "asset-substitution gate: a big serif minute number rolling 9 -> 10 -> 6 over real Агрономічне places (хвилини пішки)"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The minute number rolls 9 -> 10 -> 6: drive it with the to(n) buttons AND with the set(p) slider (a stand-in for a host pin). Verify the window shows exactly ONE number (overflow clipped), the change is a translateY ROLL (old up/out, new up from below), multi-digit (9 vs 10) rides a steady tabular band, and there is NO ScrollTrigger inside this atom. Distinct from stat-odometer (which OWNS the pin + bg/photo/label choreography; this is JUST the numeral column, pin-less — so it can sit under minutes-bloom's pin without a pin clash)."
note: |
  Extraction atom (level 1). Springs S11 numeral roll lifted OUT of stat-odometer's
  pinned ScrollTrigger. WHY: stat-odometer owns_pin AND minutes-bloom owns_pin — a
  location band that wants both the bloom pin and a rolling minute number can't import
  stat-odometer's pin without a pin-budget conflict. This sub-atom carries ONLY the
  numeral column (translateY = -(i+f)*rowHeight) with two drivers: set(p) for a host
  pin to scrub, to(n) for a discrete tween. owns_pin:false, owns_scroll:false. Pure
  transform + overflow clip = GPU-cheap, reversible. tabular-nums + thin-space pad
  keeps 9->10 from jittering. Reusable as the numeral inside minutes-as-the-hero, an
  arched-window stat band, or any counter. GSAP optional (snap fallback). Serif
  stand-in = Playfair Display (Canela / PP-Editorial class).
---

# numeral-odometer-roll — the numeral column roll, lifted pin-less out of stat-odometer

The giant serif number from Springs' pinned stat-card, on its own: a vertical column of
numbers in a one-number-tall clipped window, translated on Y so the active value sits in
frame. The number ROLLS — old slides up and out, new rolls up from below. Extracted out of
stat-odometer's pin so a host that already owns the pin (e.g. minutes-bloom) can drive it
without a pin-budget clash.

## Markup + call
```html
<span class="nor-window">
  <span class="nor-col">
    <span class="nor-num">9</span>
    <span class="nor-num">10</span>
    <span class="nor-num">6</span>
  </span>
</span>
```
```js
// values can come from markup OR opts.values
var roll = NumeralOdometerRoll.create('.nor-window', {
  values: [9, 10, 6], value: 9, digits: 2, ease: 'air', dur: 0.6
});

roll.to(10);   // animated roll to a value (discrete event)
roll.set(p);   // PURE: a host pin/scrub calls this 0..1 across the sequence, every frame
```
Set `--nor-row`, `--nor-font`, `--nor-size`, `--nor-weight`, `--nor-ink`, `--nor-align`
on the `.nor-window` to skin it. `--nor-row` must equal one number's height.

## Proven (the lab)
A big serif minute number rolling 9 -> 10 -> 6 over real Агрономічне places (хвилини пішки):
«Траш!», Нова Пошта, до зупинки. Driven both by `to(n)` buttons AND by a synthetic `set(p)`
sweep (no ScrollTrigger anywhere). The window clips to one number; the column translateY =
-(index + f) * rowHeight; the 9 -> 10 step rides a steady tabular band (no horizontal jitter).
will-change cleared after each `to()`. owns_pin:false confirmed — the roll runs with zero
ScrollTrigger of its own, ready to slot under minutes-bloom's pin. window.__LAB_OK__ on init.
