---
id: R_stacking_grammar
kind: rule
gates: [uses, owns_pin, timing_layer]
severity: hard
---

# R_stacking_grammar — how Vide Infra layers 4-5 moves into ONE section

> Source: anatomy of aircenter.space (AIR, Vide Infra · Tekta) 11 home sections,
> cross-referenced to _TECHNIQUE_REGISTRY. The point: an award section is NOT one
> technique — it is a STACK of 3-5, with a defined timing relationship and a theme
> hand-off to the next section. This file is the GRAMMAR (rules of combination).
> Stack: vanilla GSAP+ScrollTrigger+Lenis, NO WebGL. transform/opacity/clip-path only.

---

## 0. The 5 layers every AIR section is built from
Read any section as a stack of up to 5 LAYERS. Most sections fill 3-4 of them.

| Layer | Role | AIR mechanism | Our no-WebGL move |
|---|---|---|---|
| **L0 Anchor** | what holds the frame while content plays | `sectionToSticky` pin / `data-scroll-sticky` | ScrollTrigger `pin:true` |
| **L1 Subject** | the hero visual that transforms | image-scale, clip-reveal-pair, counter-slideshow | clip-path / scale / crossfade |
| **L2 Text** | editorial line(s) that reveal | `splitLines` 60ms/word, `appear` | SplitText + scrub/inview |
| **L3 Depth** | background/decor that moves at a different rate | inline-keyframe parallax, `data-deco` | GSAP fromTo scrub, multiplier |
| **L4 Theme** | the section's light/dark skin + the flip into next | `data-themed-class="ui-light\|ui-dark"` | `changeTheme` IO, CSS vars |

**Rule:** Subject (L1) + Text (L2) almost always co-fire. Anchor (L0) is spent only
on sections that MORPH (counter-slideshow, image-slider, sticky-map). Depth (L3) is
nearly free and runs in EVERY section. Theme (L4) is a per-section property, not a move.

---

## 1. SIMULTANEITY rule — what fires AT ONCE vs in SEQUENCE
- **Co-fire (same scrub window):** background parallax (L3) + subject reveal (L1).
  Depth is always live; the moment the subject enters, depth is already drifting.
- **Sequence (staggered within the pin):** text lines (L2) lag the subject by ~60-180ms,
  then counters/number-fills resolve LAST (they are the "payoff" beat).
- **Theme flip (L4)** fires at the SEAM — triggered when the next section crosses ~50%
  of viewport, never mid-section. One flip per boundary, never two skins in one section.

Canonical order inside a pinned section (scrub 0→1):
```
0.00  L3 depth already drifting (carried in from prev section)
0.05  L1 subject begins (clip/scale/crossfade)
0.10  L2 text lines stagger in (60ms/word, 180ms/group)
0.55  L1 subject seats / counter starts counting
0.85  counter/number-fill resolves  ← payoff beat, last
0.90  hold, release pin
```

---

## 2. PIN BUDGET — the scarce resource
- AIR pins **3 of 11** home sections: Format (counter-slideshow), Impulse + Status
  (sectionToSticky pairs). ~27% of sections. **Rule: pin ≤ 1 in 3 sections.**
- Pinned sections are the MORPH beats (something assembles/counts/swaps). Non-pinned
  sections are REVEAL beats (parallax + text + clip, scroll passes through them).
- Two adjacent pins are allowed ONLY as a `sectionToSticky → sectionFromSticky`
  chain (pin-then-release handoff). Never two independent pins back-to-back.
- Pin length: morph sections `end:'+=100-120%'`. Longer = scroll feels stuck.

---

## 3. THEME FLOW — the rhythm across the whole page
AIR alternates `ui-light \| ui-dark` per section so the page breathes. The flip is a
DRAMATURGY tool, not decoration:
- **Light → Dark** going into a MORPH/climax beat (Format counter, Status waves) =
  spotlight the subject.
- **Dark → Light** coming out into an editorial/bridge statement (a breath).
- A full-bleed **spacer** section (Atmosphere) is a theme "reset" — no subject, no
  text, just a held image, used to absorb the flip cleanly before the next stack.
- **Rule:** decide the theme SEQUENCE for the whole page first (motion-score), then
  build each section to its assigned skin. Never pick theme per-section ad hoc.

---

## 4. WHAT COMBINES WITH WHAT (compatibility)
- **pin + counter** → always together (a counter needs a held frame to count against).
- **pin + image-scale + 3 sticky-layers** → the counter-slideshow signature (Format).
- **clip-reveal-pair + parallax-bg** → reveal beat; NO pin needed (Impulse intro).
- **sticky-card + parallax-bg-under** → card holds, bg drifts beneath (Harmony).
- **sticky-map + metric-counters** → map holds, numbers count up beside it (Life).
- **image-slider + counter + pin** → before/after or 1-of-2 swap (Status waves).
- **splitLines alone (no pin)** → bridge/editorial statement (Designed-with-people).
- **NEVER stack:** two pins independently · two theme skins · counter without a pin ·
  >2 full-bleed subjects adjacent (catalog syndrome — see dramaturgy lens).

---

## 5. PERF LIMITS (no-WebGL, the hard ceiling)
- Animate **only** transform / opacity / clip-path. No top/left/width/height in motion.
- **Max 2 video decoders** alive at once; never scrub `video.currentTime` (seek-jank).
- Parallax values from **design tokens via calc()**, not magic px (registry §2).
- One `appear`/DecodeAhead gate per image before it reveals (decode-ahead 600px).
- A pinned counter-slideshow = static home layers + transform only; the "3 sticky
  layers" are pre-stacked, scroll only cross-fades/scales them (cheap).
- Theme flip = CSS var swap on a class toggle (IO), never re-paint of media.
</content>
</invoke>
