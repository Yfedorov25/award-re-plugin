---
id: conversion-quiet-gate
name: "Quiet conversion gate"
level: 2
kind: combo
status: official
section_job: "the conversion gate where the decision must read cleanly"
page_beat: conversion
meaning:
  what: "Motion budget drops to near-zero: one entrance fade then dead-still; hover-only micro-interactions (swap + hairline draw + cursor), no pin, no scrub, no climax."
  when: "The form / callback / apartments-handoff beat, where the page must STOP and the decision read without competing motion."
  lands: "A full stop — the offer reads cleanly; the eye is not pulled by another moving act."
  not_when: "Any act meant to be cinematic; never pin or scrub this section."
source:
  grammar: "ERA §08 / Springs §09 — conversion gate"
  recording: null
  registry_ref: []
theme: { skin: neutral, book_end: true }
ease: easeOutQuad
webgl: false
pin: { owner: none, count: 0 }
owns_pin: false
uses:
  - { atom: reveal,         params: { trigger: onEnter, once: true } }
  - { atom: parallax-depth, params: { amount: faint-side-drift } }
  - { atom: custom-cursor,  params: { hover-only: true } }
combines_with: []
anti_combos: [hero-puzzle-monument, lifestyle-deck-fan, cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_theme_flow, R_perf_limits, R_timing_layers]
files: [RECIPE.md, combo-lab.html]
acceptance:
  - "ZERO pins, ZERO scrub by design (R_pin_budget conversion exception)"
  - "one entrance fade then dead-still; only hover micro-interactions"
  - "no theme drama; the gate reads as a full stop"
verify: "combo-lab.html#__LAB_OK__"
---

# Combo: conversion-quiet-gate

> **Level-2 SECTION recipe.** A proven stack of primitives that makes ONE award section.
> Copy this, swap in your CTAs/form, build. Do not improvise the motion — the whole point is the absence of it.

- **id:** `conversion-quiet-gate`
- **kind:** section / combo (Level-2)
- **typical slot:** the funnel gate near the end of the page — §08–§09 in a 9-section arc

---

## Goal

The conversion gate where motion deliberately **DROPS** so the decision reads. Two doors (e.g. "Обрати квартиру" / "Записатись на показ") or one form. After the loud acts of the page, this section is the exhale: everything goes still, and the only motion left is *on intent* — the user's own hover. The calm is the conversion mechanism, not decoration.

This is the **ERA §08 / Springs §09 law**: the page spends its motion budget everywhere else; the gate keeps near-zero so nothing competes with the click.

---

## The ordered stack (with params)

1. **NO pin, NO climax — motion budget intentionally near-zero.**
   - No ScrollTrigger pin. No scrubbed timeline. No parallax climax.
   - This is a *rule*, not an omission. If a reviewer asks "why is nothing moving here?" the answer is the recipe.

2. **`reveal` on enter — ONCE.**
   - Target: the CTA pair / form block.
   - `duration: 180ms`, `ease: power2.out`, `y: 16 → 0`, `opacity: 0 → 1`.
   - `ScrollTrigger { once: true, start: "top 80%" }`. Never replays. No scrub.

3. **Per-CTA hover-combo, fired on ONE event (`mouseenter`):**
   - **button clone-content text-swap** — the label flips to its hover variant (e.g. "Обрати квартиру" → "→ Дивитись план"). Clone-content keeps layout width stable so nothing reflows.
   - **outline `svgLength` draw** — the button's border draws itself in `0.4–0.8s` (`stroke-dashoffset` from full length → 0, `ease: power1.inOut`).
   - **cursor button-morph** — the custom cursor scales/labels to signal "this is the action."
   - All three start on the same `mouseenter`, reverse together on `mouseleave`.

4. **`parallax-depth` — shallow, side image ONLY.**
   - One supporting image (the "door" visual / render thumbnail) gets a *gentle* depth offset (`yPercent: ±4` across the section's scroll range).
   - The CTA/form block itself does **not** move. Depth lives only at the edge of the eye.

5. **theme: the quietest ground of the page.**
   - This section sits on the calmest theme token in the page's theme-flow (lowest contrast, most negative space).
   - The page's section-to-section oscillation **stops here** — no theme handoff drama, no shimmer. Stillness as signal.

### Plumbing (invisible, but mandatory)

- **hidden `currentPageLink` auto-bind** — the lead payload silently captures the current page URL / unit context so the form/CTA knows what the user was looking at. No visible field.
- **Barba prefetch destination in background** — prefetch the CTA's target route (`/units`, `/contact`) on `mouseenter` so the click feels instant.

---

## How it reads on scroll

The user scrolls out of the loud final act and the page **goes quiet**. The CTAs (or the form) fade up once — 180ms, then they hold, perfectly still. Nothing parallaxes except a faint drift on the side image at the edge of vision.

Then the user hovers a button. *Now* motion returns, but only here, only on their intent: the label swaps, an outline draws itself around the button over half a second, the cursor morphs into "go." Move the mouse away and it all retracts. The section is asking one thing and answering nothing else. The user stops scrolling and acts.

---

## Level-1 components it uses (from `library/components/`)

- `reveal` — the single one-shot enter animation
- `clone-content` — the stable-width button text-swap
- `svgLength` — the self-drawing outline
- `cursor` (button-morph state) — the intent signal
- `parallax-depth` — shallow side-image drift only
- `theme` — quietest-ground token + the oscillation-stop
- `currentPageLink` — hidden lead context bind
- `barba` (prefetch) — instant-feel destination warm-up

---

## Pin-budget note

**Zero pins. Zero scrub. This is the cheapest section on the page by design.**

- It claims none of the page's pin budget — leave that for the cinematic acts.
- Its only scroll-linked cost is the shallow `parallax-depth` on one image (transform-only, GPU-cheap).
- Everything else is event-driven (`mouseenter`/`mouseleave`) and runs once on enter.
- If this section starts pinning or scrubbing, the recipe is broken — the gate must read as a *full stop*, not another moving act.

---

## How to build (outline)

1. **Lay out the gate.** One block centered/comfortable: either two CTA buttons (the two doors) or a single form. Generous negative space. Pick the quietest theme token from the page's theme-flow.
2. **Wire the enter reveal.** `reveal` on the block, `once:true`, 180ms, `start:"top 80%"`. Confirm it never replays on scroll-back.
3. **Build the hover-combo per CTA.** On `mouseenter`: trigger `clone-content` text-swap + `svgLength` outline draw (0.4–0.8s) + `cursor` button-morph — all from the same handler. Mirror on `mouseleave`.
4. **Add shallow side-image depth.** `parallax-depth` on the one supporting image only, `yPercent: ±4`. Verify the CTA/form block has NO parallax.
5. **Bind plumbing.** Hidden `currentPageLink` into the lead payload; Barba prefetch the CTA destination on hover.
6. **Verify by scrolling.** On enter: one fade, then dead-still. On hover: swap + draw + cursor, reversible. No pin, no scrub, no theme drama. If anything moves without the user's intent (besides the faint side drift), cut it.
