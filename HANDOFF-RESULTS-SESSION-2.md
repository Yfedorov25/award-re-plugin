# HANDOFF → MASTER · SESSION 2 (day/night EXTERIOR sections)

Worker 2 of the 3-hand parallel build. Theme: day/night EXTERIOR sections built thin on `window.DayNight`.
**Delivering 2 sections** the user reviewed live and kept. 2 others were built and then removed at the
user's call (notes at the bottom). Every shipped section ran the full 7-step pipeline: build thin → DOM
facts (Playwright) → smoothness @4x CPU → adversarial skeptic (all CRITICAL+MAJOR fixed + re-verified) →
RECIPE+tokens → record.

Lab server (already running): `cd library/components && python3 -m http.server 8820`.
Assets (frame-matched exterior pair via each section's `renders` symlink): `dn-ext-day.webp` /
`dn-ext-night.webp` (1920x1071, 16:9) + mobile `-m`.

---

## ✅ DELIVERED — ready for your review / gallery / merge

| id | lab | what it is |
|----|-----|-----------|
| **our-house-at-dusk** (A7) | http://localhost:8820/our-house-at-dusk/lab.html | drag a seam, the evening front sweeps across the house, windows ignite only on the swept side |
| **window-constellation-dusk** (A6) | http://localhost:8820/window-constellation-dusk/lab.html | scroll-pinned: the sky deepens and windows ignite one by one like a constellation, each naming the life inside, climaxing all-lit + CTA |

Both: thin on `window.DayNight` (no engine fork), `__LAB_OK__` true + **0 console errors**, DOM-verified,
**smoothness PASS** (60fps / <2% jank @4x CPU), skeptic CRITICAL+MAJOR all fixed, **zero em-dash**,
reduced-motion correct. Verified GREEN against the global gate's checks (fields + files + headless) for
both — see "Base verify".

---

### 1. our-house-at-dusk (A7) — user-ACCEPTED ✅

Files: `library/components/our-house-at-dusk/{component.js,component.css,lab.html,RECIPE.md,tokens.json}`
+ `renders` symlink. Instance `window.__ohd` (`set(t)` 0..1 = seam x; `tweenTo`, `get`); `window.__killDemo()`.

A wide house elevation as one before/after surface split by a draggable seam. The canon (`reveal:'seam'`,
`seamFrom:'right'`) clips the evening still in as the seam sweeps; the seam reads as the EVENING FRONT
advancing across the facade. The twist: windows ignite one by one only as the seam clears each (the glow is
masked to the swept evening side), so the life in the windows belongs only to the part of the day swept
into evening.

Verified (headless): `.dn__night` clip `inset(0 100% 0 0)`→`inset(0 0% 0 0)` (canon owns the seam); glow
group clip tracks the seam; central window opacity 0 AT its centre / 1 just past (ignition trails the
front); canon tags Вечір-left / День-right; aria-valuenow/valuetext set; demo never fights a grab;
reduced-motion = static mid-split with reframed copy; 60fps/0% jank @4x. Skeptic: NO critical; 2 MAJOR
(reduced-motion showed only evening; drag/copy direction mismatch) + MINORs all fixed + re-verified.

> Optional asset to unlock the FULL A7 punchline: a composited STREET render (our house lit + duller
> dark-windowed neighbours, labeled "візуалізація") so "only our house lights, neighbours stay dark" can
> land literally. The shipped single-building version is honest ("Один дім, два різні життя").

---

### 2. window-constellation-dusk (A6) — DONE ✅ (skeptic: "ship it")

Files: `library/components/window-constellation-dusk/{component.js,component.css,lab.html,RECIPE.md,tokens.json}`
+ `renders` symlink. Instance `window.__wc` (`set(t)` 0..1 = day→night; `.st` = the pin ScrollTrigger).

A pinned single scene: scrolling deepens the sky day→dusk→night and the windows ignite one by one like a
constellation, each naming the life inside it (carport → kitchen → living → child's room → terrace),
choreographed as a human evening. Climax: all windows lit against true night + the CTA "Цей вечір може
бути Вашим." Fully reversible on scroll-back. `owns_pin` + `owns_scroll` (one pin per section).

Verified (headless, scroll-driven): pin HOLDS (sceneTop 540→0); scrub drives t; windows ignite IN ORDER
with the correct caption each; base relight is the canon `dn.set(t)` capped at 0.88 so the glows complete
the night; CTA completes by t~0.98; caption hands off before the CTA; reversible. **Aspect-locked 16:9
stage** → the per-window crops register 1:1 with the real windows at ANY viewport (proven on a 16:10
viewport). Reduced-motion = unpinned static night + a caption LIST. 60fps/~1% jank @4x. Skeptic: 2 CRITICAL
(crop-drift on non-16:9; cornice smudge bar) + 2 MAJOR (climax ignition invisible; caption illegible) +
MINORs all fixed + re-verified → "award-grade, no blocking issues, ship it."

Screenshots: `/tmp/award-worker-2/const-day.png`, `const-dusk.png`, `const-evening.png`,
`const-allnight.png`, `const-1610-check.png` (non-16:9 crop-alignment proof).

---

## Base verify (the global gate)

Ran the global gate's exact checks (required frontmatter fields + all 6 contract files + headless
`__LAB_OK__` with 0 console errors) against both shipped components → **GREEN** (both pass). The full
`node scripts/library-verify.mjs` currently CRASHES on a Session-3 in-progress map folder that has no
`RECIPE.md` yet (`ten-minute-tide` at last check) — a cross-session race, NOT a Session-2 defect. Re-run
`node scripts/library-index.mjs && node scripts/library-verify.mjs` once Session 3 lands its RECIPEs;
both Session-2 sections are expected GREEN there.

(Optional hardening: `scripts/lib-frontmatter.mjs` `readRecipe` hard-crashes via `readFileSync` on a
component folder with no `RECIPE.md`, so any one worker's in-progress folder blocks the whole verify.
Guarding that read would make the gate resilient to parallel builds.)

---

## Removed sections (built, then cut at the user's call) — for your awareness

- **the-facade-clock (A5)** — REMOVED. A 24h brass dial wrapping the house; passed all technical gates but
  the user rejected the look ("вона погано виглядає"). Lesson: a radial dial around a WIDE 16:9 frame
  reads awkward (the ring floats in dead space top/bottom); a dial driver wants a square/portrait subject.
- **sun-dial-room-orrery (A3)** — REMOVED. A radial orrery of room portals; mechanically award-grade
  (skeptic: sync/drag/snap/a11y/perf 9-10/10, 60fps/0% jank), BUT the 4 interior pairs on disk (a1-r1..r4)
  are ANGLES OF ONE open-plan studio, not 4 distinct rooms. The user wants 4 genuinely DISTINCT rooms and
  chose to remove the section until the right assets exist.

  > ASSET ASK (media-director / you): **4 DISTINCT frame-matched interior day/night pairs** (e.g. спальня /
  > вітальня / кухня / їдальня — each a different room, geometry-identical day vs night). The orrery code
  > accepted any room set, so with those 4 pairs the section can be rebuilt as the true four-distinct-rooms
  > orrery the A3 spec describes (swap the 4 day/night paths + labels, zero engine change). The code is
  > removed from the plugin but the approach is documented here + in the worker's memory.

---

## Net delivered: 2 sections (A7, A6). STOP — master pulls + reviews.
