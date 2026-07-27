---
id: architecture--material-carousel
name: "Матеріали зблизька"
level: 2
kind: section-variant
status: base
section: architecture
meaning:
  what: "A row of tall material panels, each held inside a fixed editorial ARCH-OVAL frame. The CENTRE panel is in focus (scale 1, brightness 1, caption lit); the sides are dimmed peek-insets (scale 0.9, brightness 0.45) with edge-peek of the next. Round prev/next arrows (plus a N/TOTAL counter, click-a-side-to-centre, drag) rotate WHICH material is centred. Architecture as TACTILITY: pergolas, roof, stone+timber, terrace, glazing, each given its moment."
  when: "The architecture beat when the building's MATERIALS are the argument and the section should let the visitor pull each one into focus by hand, one at a time, rather than scroll a flat gallery. The interactive, take-your-time chapter."
  lands: "The visitor feels the materials the house is made of as objects worth examining: the centre one bright and named, the neighbours waiting dimmed at the edges. Pressing the arrow glides the next material to the middle (~0.8s, expo-out feel), the caption lights, the counter ticks. It reads considered and tactile, not a spec sheet, not a plain slider."
source:
  grammar: "Springs terrace CAROUSEL (D_springs CLIP B): one portrait frame in focus, caption to the side, 1px outline round arrows, ~0.8s expo-out, single restrained transition per interaction. Centre-focus + side-dim + edge-peek = r1864 /comfort 3-up. The arch-OVAL frame + caption-beneath = EVER portrait oval (D_Ever_architecture: static clip-path ellipse, media inside, micro-caps beneath)."
  recording: null
  registry_ref: ["T-cfc-r1864", "T-B1-springs-carousel", "T-A1-ever-oval"]
uses:
  - { atom: center-focus-carousel, job: "the rotation engine: stagger-in on enter, then centre-focus / side-dim layout, arrows + counter + click + drag rotate which material is centred. Owns Lenis." }
  - { atom: oval-mask, job: "static editorial ARCH-OVAL frame on every panel image (clip-path ellipse + 1.08 over-scale). drive:'none' so it adds NO ScrollTrigger and no raf drift, keeping the pin budget at zero." }
pin: { owner: 'none', count: 0 }
webgl: false
ease: air
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl, R_timing_layers]
acceptance:
  - "ZERO pins: center-focus-carousel's only ScrollTrigger is a NON-pin onEnter stagger (no pin:true); oval-mask is drive:'none' (no ScrollTrigger). Harness creates no pin. expectPins:0, ScrollTrigger pin-count == 0."
  - "centre panel reads in focus (scale 1, brightness 1, caption opacity 1); neighbours dimmed (scale 0.9, brightness 0.45, caption faded) with edge-peek of the next panel."
  - "prev/next (and click-a-side / drag) rotate the centred index: the rail glides so the new material centres, the lit caption follows it, the counter updates, loop wraps. slideDur 0.8, power3.out."
  - "each material image sits inside a static arch-oval (clip-path ellipse) framed by a 1px inner ring; the mask shape never deforms; caption micro-caps + serif name beneath."
  - "engine laws: transform + opacity + filter(brightness) only; GPU layers; NO mix-blend / NO backdrop / NO WebGL / NO video.currentTime; Lenis owned by the carousel; window.__LAB_OK__ true."
  - "reduced-motion / <=820px -> carousel static (panels shown, rail scrolls native), oval frames remain; built on OUR QUADRO macro renders + Ukrainian copy."
---

# architecture--material-carousel — "Матеріали зблизька"

The architecture section as TACTILITY: a row of tall material panels, each one a
single thing the house is made of, framed inside a fixed editorial arch-oval. The
centre panel is in focus (full scale, full brightness, caption lit); the sides are
dimmed peek-insets that promise the next material. The visitor rotates focus with
round outline arrows. The render is the hero; the type lives on rails with air.

## The two atoms (and why zero pins)

- **center-focus-carousel** is the rotation engine. On enter it staggers the panels
  up (opacity + translateY 40->0, a NON-pin `onEnter` ScrollTrigger), then `layout()`
  applies the focus geometry: the active panel `scale 1` + `brightness 1` + caption
  `opacity 1`; neighbours `scale 0.9` + `brightness 0.45` + caption faded; the rail
  `translateX` so the active panel centres; an `N / TOTAL` counter. Arrows, a
  click on a side panel, and a drag all rotate `cur`; `slideDur 0.8` with
  `power3.out` (the Springs ~0.8s expo-out feel). It owns Lenis (`manageLenis:true`)
  for the smooth-scroll bus. Because its only ScrollTrigger is the non-pin stagger,
  the section needs no harness pin.
- **oval-mask** is used as a STATIC editorial frame, not a parallax engine:
  `init('[data-oval-mask]', { ratio:0.78, scale:1.08, parallax:0, drive:'none' })`.
  `drive:'none'` means it registers no `mousemove`/`scroll` listeners and no rAF,
  so it adds neither a pin nor a competing drift loop. It only sets the
  `clip-path: ellipse(...)` on each panel's image wrap and a 1.08 over-scale on the
  media so the oval edge never reveals. The mask shape never deforms (EVER law).

`SectionHarness.declare({ pinOwner:'none', expectPins:0, atomsCited:[…] })`. A
pure-interactive section: the click/arrow/drag rotation is the point, no scroll
hijack. The pin budget is honestly zero.

## The skin (stolen real)

- **Arch-oval + caption beneath** (EVER portrait-oval grammar): the rectangular
  bottom scrim the atom paints is suppressed (`.cfc-panel::after{display:none}`)
  because the oval clip already frames the media; the caption moves OUT from over
  the image to a centred block below it, micro-caps clay index (`01`) + serif
  material name + a one-line sans note. A 1px inset ring makes the oval read as a
  framed object, not a hole.
- **1px outline round arrows + tabular counter** (Springs CLIP B controls), centred
  under the row; hover fills cream with `scale(1.04)`, active `scale(.97)`, all on
  `cubic-bezier(.22,1,.36,1)` 0.3s.
- **Editorial type rail** above the row: clay eyebrow with a 34px rule, a serif
  `clamp(40px,7vw,120px)` title (`Матеріали зблизька`, lh .92, tracking -.035em),
  and a 34ch lede pinned to the baseline, corner-opposed for the editorial spread.

## Real content

Five QUADRO macro renders, materials-first, never a generic gallery:
`renders/macro-pergola.webp` (Перголи), `renders/macro-roof.webp` (Дах),
`renders/macro-table.webp` (Камінь і дерево), `renders/terrace-03.webp` (Тераса),
`renders/day-08.webp` (Скління). The carousel opens centred on `Камінь і дерево`
(`go(2)`) so the first read is a material in focus, not a clipped edge.

## Copy (Fedoriv voice, zero em/en-dash)

- Eyebrow: `З чого зроблено`
- Title: `Матеріали зблизька`
- Lede: `Дім, який видно на дотик. Камінь, дерево, скло, перголи, дах. Кожен матеріал отримує свою хвилину у фокусі.`
- Captions: `Перголи` / `Дах` / `Камінь і дерево` / `Тераса` / `Скління`, each with a
  one-line tactile note (`Тінь, що рухається разом із сонцем.` etc.).

## Gate

Open `combo-lab.html` in a real browser (Lenis from jsdelivr). `__LAB_OK__` true
once: the centre oval painted a decoded render, exactly 0 pins, both cited atoms
ran without throwing, 0 real console errors. Eye-check: the centre material is
bright + named, the sides dimmed; pressing the arrow glides the next material to
centre, the caption lights, the counter ticks; reduced-motion / narrow falls back
to a native-scroll static row.
