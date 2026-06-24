---
id: benefit-wipe-band
name: "Wavy-seam benefit band"
level: 2
kind: combo
status: official
section_job: "a stepped benefits/proof band where each claim swaps media with a crafted seam"
page_beat: proof
meaning:
  what: "A pinned band steps through N benefit statements; each step a wavy seam wipes the next full-bleed media in, with reveal copy and depth riding the same progress."
  when: "A PROOF/benefit act with 2-N stepped statements that each carry their own full-bleed media."
  lands: "Each claim arrives on its own held frame; the page turns like authored chapters."
  not_when: "Hero covers, conversion gates, single-media sections."
source:
  grammar: "Vide Infra benefit-band — wavy-seam stepper"
  recording: null
  registry_ref: []
theme: { skin: neutral, book_end: false }
ease: air
webgl: false
pin: { owner: media-step-switch, count: 1, length: "steps * stepVH" }
owns_pin: true
uses:
  - { atom: media-step-switch, params: { wave: true, pin: true } }
  - { atom: parallax-depth,    params: { rides: pin-progress } }
  - { atom: reveal,            params: { trigger: per-step } }
combines_with: [story-stepper-render-focus, hero-puzzle-monument]
anti_combos: [interiors-cards-cursor]
gated_by: [R_pin_budget, R_anti_combos, R_theme_flow, R_perf_limits, R_timing_layers]
files: [RECIPE.md, combo-lab.html]
acceptance:
  - "exactly ONE pin (media-step-switch owns it)"
  - "seam wipe per step via clip-path, never video.currentTime"
  - "reveal copy fires per step, reversible; fps holds"
verify: "combo-lab.html#__LAB_OK__"
---

# Combo — `benefit-wipe-band`

**Level:** 2 (SECTION recipe — a proven stack of primitives that build one award section)
**Use for:** the "show the material / show the life" section — a pinned, full-bleed media band where the background **wipe-switches** between stepped benefit copy. One clean swap per viewport, fully reversible.

---

## Goal

Make a single benefit land **physically**: as you scroll, the full-bleed background wipes (wavy seam) from one shot to the next while a floating glass card swaps its caption in choreographed lock-step with the wave. The benefit is felt through the material change, not read off a list. Reads expensive, holds the eye, scrubs cleanly both directions.

---

## The stack (ordered, with params)

Build in this order. The first primitive **owns the pin** — nothing else creates a ScrollTrigger pin.

1. **`media-step-switch`** — the spine. `pin:true, scrub:true, stepVH:100` (one viewport per benefit step), wavy seam `wave:true, waveAmp:4.5`, wipe duration `0.7s`.
   → This is the ONLY pin in the section. Its `self.progress` is the master clock everything else reads.

2. **Copy choreography (per step)** — split the caption swap around the seam, never on it:
   - **dim outgoing**: `opacity → 0`, `ease:none`, `0.28s`, fired **BEFORE** the wave reaches the card (≈ seam − 0.05 of step progress).
   - **clarify incoming**: `y:+10px → 0` + `opacity 0→1`, **air** ease, `0.4s`, fired **AFTER** the wave has passed (≈ seam + 0.05).
   - The hard-dim-before / clarify-after is what sells "the wave wiped the old word away."

3. **Dot rail toggle** — advance the active dot at `+0.35` of each step's progress (mid-wipe), so the rail reads as part of the motion, not a lagging afterthought.

4. **Progress hairline** — a thin `scaleX` bar bound directly to `self.progress` of the spine. No separate trigger.

5. **Parallax depth (light)** — the glass card floats **slightly slower** than the background (small negative `yPercent` against scroll). Just enough to separate card from media — do not over-do it or the swap reads detached.

6. **Theme (optional, continuous)** — carry a **tonal deepen** across the steps (e.g. light → dusk) as one continuous interpolation over `self.progress`. **No hard flip** between steps — the wipe is the only hard event.

---

## Video / media rules (non-negotiable)

- Video layers are **autoplay + loop only**. **NEVER** scrub `video.currentTime` — that seeks, stutters, and starves decode (see scroll-hero law).
- **≤ 2 active decoders** at any time (outgoing + incoming). Don't stack the whole step set live.
- **Re-close the outgoing layer at `+0.999`** of the step (snap it back to its pre-wipe state) so reverse-scrub starts from a clean frame — otherwise back-scrub shows a torn seam.

---

## How it reads on scroll

A glass benefit card floats over a full-bleed media band. As you scrub, a **wavy wipe** sweeps across the background. The old caption **hard-dims before** the wave reaches it; the new caption **clarifies after** the wave passes. The dot rail advances mid-wipe and a hairline tracks total progress. The card drifts a touch slower than the media (depth). One clean swap per viewport, fully reversible on back-scroll.

---

## Level-1 components it uses (`library/components/`)

- `media-step-switch` — the pinned wavy-wipe background stepper (owns pin + scrub).
- `copy-clarify` — the `y:+10 → 0` + fade-in "clarify" reveal (incoming caption).
- `copy-dim` — the `ease:none` hard-dim (outgoing caption).
- `dot-rail` — stepped progress dots, `active` toggled by step.
- `progress-hairline` — `scaleX` bar bound to a trigger's progress.
- `parallax-depth` — small scroll-rate offset for the floating card.
- `theme-flow` — continuous tonal interpolation across the section (optional).

> If a component above is missing in `library/components/`, build it there first as a Level-1 primitive — keep this recipe a pure composition.

---

## Pin-budget note

**This section spends exactly ONE pin** — owned by `media-step-switch`. Total pinned scroll length = `stepVH × (number of steps)` viewport-heights (e.g. 3 benefits → ~300vh of pinned scroll). Every other element (copy, rail, hairline, parallax, theme) is **driven off the spine's `self.progress`** and creates **zero** additional ScrollTriggers. Do not nest a second pin inside — it will fight the spine and break reverse-scrub.

---

## How to build (outline)

1. **Markup**: section wrapper → media band (stacked `<video autoplay muted loop playsinline>` / `<img>` layers, absolutely positioned) → floating glass `.card` with one caption node per step → `dot-rail` → `progress-hairline`.
2. **Spine**: instantiate `media-step-switch` with `pin:true, scrub:true, stepVH:100, wave:true, waveAmp:4.5`, wipe `0.7s`. Confirm it pins and the wavy seam runs both directions.
3. **Caption choreography**: for each step, add `copy-dim` on outgoing at `seam − 0.05` and `copy-clarify` on incoming at `seam + 0.05`, timed to the spine's progress (NOT a new trigger).
4. **Rail + hairline**: toggle `dot-rail` active at `+0.35` per step; bind `progress-hairline` `scaleX` to `self.progress`.
5. **Depth**: apply `parallax-depth` (light, negative offset) to `.card` only.
6. **Theme (optional)**: interpolate the tonal deepen continuously over `self.progress`.
7. **Decoder hygiene**: ensure ≤2 videos play at once; pause/reset non-adjacent layers; re-close outgoing at `+0.999`.
8. **Verify** (scroll, both directions): exactly one swap per viewport, captions hard-dim BEFORE / clarify AFTER the wave, no torn seam on back-scroll, no `currentTime` writes, 60fps, single pin in the timeline.
