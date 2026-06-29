Disk reality confirms the council's two critical corrections: the "missing" atoms (parallax-depth, reveal, scroll-indicator, splitLines) live in `shared/` so verify resolves them today, and the existing combo-lab is a text placeholder scaffold (`<h1>hero-puzzle-monument</h1>`, no atom imports, no render) while the gallery walks only `components/`. The plan must account for both. Here is the synthesized plan.

---

# Section-Variants: The Build Plan
*Hybrid A→B. Atoms taught the grammar; now we compose it into full sections, judge them on a live board, and the winners become the base units whole sites are assembled from.*

---

## 1. THE UNIT — what a section-variant is

**Definition.** A section-variant is ONE complete, scrollable section that fills exactly ONE `SECTIONS.yaml` role (hero, architecture, interiors…) for the full height-and-width of that section's scroll. It owns the four parts the pivot names — **a render surface, a text-presentation layer, depth/parallax, and a seam in/out** — and reads as **one scroll gesture**. It is the existing `library/combos/<id>/` unit, sharpened: renamed `kind: section-variant`, made per-role and competitive.

**The boundary (this is the whole pivot).**
- An **ATOM** (`library/components/<id>/`, `level:1`, `kind:component`) is ONE move on ONE surface — "how a word reveals", "how a render opens", "how a seam wipes". It ships real `component.js`/`.css` with a callable `entry`. It is *grammar*, not a *place*. The owner cannot drop it on a page and feel a section — that is the exact complaint.
- A **SECTION-VARIANT** (`library/combos/<id>/`, `level:2`) ASSIGNS atoms to the four jobs and reads as a section filling a slot. It writes **zero new mechanic code**: it CITES atoms by id in an ordered `uses:` list, supplies only `params` + `media` + `copy`, and a thin `combo-lab.html` that binds every cited atom to **ONE shared pin progress**.
- **The test that separates them:** if it *animates a surface itself* → atom. If it *assigns atoms to render/text/depth/seam and reads as one section* → section-variant. A section-variant with a forked `component.js` inside it is a HARD FAIL.
- **"5–10 variants of EACH section"** = N sibling folders, SAME `role`, DIFFERENT signature/atom-assignment/params. They are PEERS competing for one slot (e.g. `architecture--dusk-seam-spine` vs `architecture--windows-light-up-at-dusk`), surfaced side by side. Distinct INDEX rows — unlike component `variants/`, which are param-deltas of one base.

**Schema** (RECIPE.md front-matter; bold = additions the pivot needs; ★ already present in `hero-puzzle-monument`):

```yaml
id: architecture--dusk-seam-spine     # kebab == folder == INDEX key
name: "Day into night down one seam"
level: 2
kind: section-variant                  # renamed from `combo` (verify reads combos/ dir unchanged)
status: seed|wip|candidate|official    # official REQUIRES green verify
role: architecture                     # ★NEW exactly ONE SECTIONS.yaml role — the slot it competes for
page_beat: architecture                # kept for gallery resolver / aliases
section_job: "show the building as one object that crosses day→night"
signature: "the day/night seam IS the scroll spine; one word rides the line"  # ★NEW the ONE move (names the AXIS)
text_density: low|medium|high          # ★NEW pivot law "renders not walls of text" — board filter + soft-gate
motion_budget: { pins: 1, blur_px_max: 20, scrub: true }   # ★NEW perf ceiling the gate checks
theme: { skin: dark, book_end: true }
ease: air                              # ONE ease across the section
pin: { owner: daynight-center-seam, count: 1, length: "+=120%" }   # ✓ verify enforces ≤1
uses:                                  # ✓ ORDERED atom→job map, OWNER FIRST. THIS is the compose rule, as data.
  - { atom: daynight-center-seam, job: render, params: {axis: vertical, pin: true} }
  - { atom: parallax-depth,       job: depth,  params: {rides: pin-progress} }
  - { atom: mask-up-title,        job: text,   params: {rides-seam: true} }
  - { atom: scroll-indicator,     job: seam,   params: {is-finished: true} }
media:                                 # ★NEW frame-matched render slots — VERIFIED real paths
  - { slot: day,   src: "renders/exterior-day-1.webp",   kind: render, daynight: true }
  - { slot: night, src: "renders/exterior-night-1.webp", kind: render, daynight: true }
copy: { eyebrow: "вул. Замкова", title: "Дім, що зустрічає ніч" }   # zero em-dash, Fedoriv voice
combines_with: [story-stepper-render-focus]
anti_combos: [lifestyle-deck-fan]
gated_by: [R_pin_budget, R_anti_combos, R_theme_flow, R_perf_limits, R_timing_layers]
files: [RECIPE.md, combo-lab.html]
acceptance:                            # each string maps to a __LAB_OK__ probe
  - "exactly ONE pin (daynight-center-seam owns it)"
  - "day render recognizable before the seam crosses (~p0.4)"
  - "title bbox never intersects the render's center focal third"
  - "transform/opacity/clip-path/filter only; fps holds"
verify: "combo-lab.html#__LAB_OK__"
```

*Required-non-empty for `official`:* `id, name, kind, status, role, signature, meaning.when, meaning.lands, source, gated_by, acceptance`, and `uses[]` with the owner first. **A section-variant must fill `render` + at least one of `text/depth/seam`** — a render-only section is an atom, not a section.

**Compose rule = the `uses:` list.** A data-only ASSIGNMENT of atoms to four jobs, never a re-implementation:
- **RENDER** (carries the house): the lane's render-bearing atom — *usually the pin owner, MUST be `uses[0]`.* (architecture: `daynight-center-seam` / `focus-render-switch` / `slicer-reveal` / `our-house-at-dusk`; hero: `puzzle-image` / `render-slice-reveal` / `daynight-engine` / `hero-video-render-rotator`.)
- **TEXT** (sparse copy over/beside the render): `mask-up-title` / `splitLines` / `content-stage-cascade` / `stroke-draw-title`. `text_density` caps how much.
- **DEPTH** (parallax/layering, never flat): `parallax-depth` / `depth-stack` / `corner-frame-meta` riding the SAME pin progress, transform-only. Never a second pin; never mix-blend/backdrop-filter over a scrubbed surface.
- **SEAM** (estafette in/out to neighbours): `transitions/seams` / `theme-tween` / `scroll-indicator` / `scroll-hint-descending-tick`. This is what stitches variants into a site in phase B.

Laws baked into the rule, so a compose can't cheat the grammar: (1) `uses[0] == pin.owner == render atom`; (2) one pin / one ease / one signature; (3) dramaturgy not catalog — object as the point, max 2 full plans, estafette via the SEAM job; (4) sell life not figures — `copy[]` carries emotion, `media[]` carries real frame-matched renders, no drawn human figures; (5) NO WebGL, transform/opacity/clip-path/filter only.

**Storage — lives in the existing tree, no parallel system.** One folder per variant: `library/combos/<id>/RECIPE.md` + `combo-lab.html` (+ optional `renders → apps/{nahirna,quadro}/public/...` symlink, the pattern the labs already use). 7 combos already exist. A phase-B site is a thin `apps/<site>/.award-re/composition.yaml` listing `[{role, variant-id}]` in order — cites ids, copies no code.

**Verified by the same gate** — `node scripts/library-verify.mjs` already does combos/. It (1) checks required front-matter (we ADD `role`, `signature` to the required set), (2) checks contract files exist, (3) **dangling-uses**: every `uses[].atom` resolves to a real `components/` or `shared/` id (this is the `toBuild` signal made enforceable), (4) **one-pin law** (≤1 `owns_pin`, owner-first), (5) motion-props lint (no banned layout props, no `video.currentTime` scrub), (6) **HEADLESS**: opens `combo-lab.html`, asserts `window.__LAB_OK__===true` AND console-error-count===0 — this IS the "60fps / 0 errors" gate. WebGL = skip (we're NO-WebGL anyway).

> **Disk-confirmed correction (load-bearing).** The current `combo-lab.html` is a PROOF SCAFFOLD — it prints `<h1>hero-puzzle-monument</h1>`, never imports any atom's `component.js`, never paints a render, and `__LAB_OK__` only asserts `pins===1` + zero errors. A variant that wires nothing and paints nothing passes today. **That reproduces the owner's complaint one level up: the board would show grey text cards, not sections.** So before any new authoring we build the lab harness ONCE (Step 0 below) and EXTEND the probe to also assert *every cited atom's `entry` ran without throwing* and *the render element painted non-zero size.* "Green badge over a grey card" is the bug to kill.

**How a good one becomes a base unit:** build N candidates → live board → owner picks "class" in chat → `award-re:learn --promote` points at the winner (its existing pass: CLASSIFY stack-on-one-progress → section-variant, EXTRACT params/copy, fill `meaning.when/lands` + `signature` + `source.recording`, run verify to GREEN, flip `status:official`, then `library-index.mjs` writes the INDEX/COVERAGE row and the combine-graph picks it up). Losers stay `candidate` as reference (not deleted). A loser that taught a failure → F-entry; a recurring failure → constitution patch. **The promoted variant is now a first-class citable id for phase B.**

---

## 2. FIRST BATCH — decisive

**Section first: ARCHITECTURE. Not hero.** Three reasons, all three council seats agree:
1. **Zero blockers.** The four strongest architecture variants are 100% buildable *today* from shipped atoms + verified-real frame-matched nahirna renders — no to-build atom, no Higgsfield render pipeline. The owner judges *finished sections*, not stubs. Hero's two sharpest (circular-monogram ring→portal morph, puzzle-mosaic tile engine) carry to-build flags that would muddy a first read.
2. **Catalog-syndrome lives here.** Architecture is the section most in need of the dramaturgy fix, so it is the truest test of whether the pivot works.
3. **Cleanest anchor.** The shipped `smarts architecture.js` (= depth-stack-collage) is a known-good control to judge the radical variants against.

**How many: 5 variants** (not 8). Deliberately maximally distinct, each named by its **reveal AXIS** so the owner picks a *direction*, not splits hairs. Two council seats argued for 4; I take 5 because `cinema-cut` adds the only *moving-video* axis using assets that already exist (nahirna `video/5d/render1..3.mp4` + posters), and a 5th costs ~25 min once the harness exists. Hero is cut from 9→~6 distinct axes *after* the architecture verdict locks the framework (the framework learning — esp. the text-placement law — must settle on architecture first).

**The exact 5 to build** (all `role: architecture`, all cite only already-resolvable `components/` or `shared/` ids, all point at verified-real media):

| # | id | axis / signature | atoms (owner first) | media |
|---|----|----|----|----|
| 1 | `architecture--depth-stack-collage` | **multi-render collage** — three depths assemble then breathe apart. The known-good ANCHOR / deliberate "most-text" control (text_density: medium). | depth-stack* + masked-heritage-split + slicer-reveal + mask-up-title | front-facade-day + corner-columns-day + macro-clinker |
| 2 | `architecture--dusk-seam-spine` | **horizontal day→night wipe** down one travelling seam IS the spine; one word rides the line (low). | daynight-center-seam* + parallax-depth + mask-up-title + scroll-indicator | exterior-day-1 / exterior-night-1 (frame-matched pair) |
| 3 | `architecture--material-portal-bloom` | **radial zoom-OUT** — open on macro clinker, circular portal blooms to the whole house behind its own texture (low). | daynight-portal-reveal* + oval-mask + venn-ring-portal-reveal + script-overline-display-pair | gallery macro-clinker + front-facade-day |
| 4 | `architecture--windows-light-up-at-dusk` | **motionless / restraint** — building dead still, windows warm on top-floors-first; "sell life not figures" pole (near-zero). | daynight-masked-windows* + our-house-at-dusk + theme-tween + corner-frame-meta | exterior-night-1/2 + facade-night-warm |
| 5 | `architecture--cinema-cut-render-rotator` | **moving-video shot-swap** — 3 clips hard-cut on scroll, one line baton-passed across each wipe (low). | hero-video-render-rotator* + focus-render-switch + video-card-reveal + fluid-type-sizing | nahirna video/5d/render1..3.mp4 + posters |

That set spans the full register: *collage / horizontal-transform / radial-zoom-out / motionless-stillness / moving-video.* The owner can say "the stillness one is class, kill the collage" and the verdict actually means a direction.

**Explicitly DEFERRED to batch 2** (real to-build, would block the first board on the render pipeline or atom-building): `object-on-the-turntable` (needs exterior orbit frame-sequence), `vertical-facade-ascent` (needs stitched tall elevation), `corner-reveal-slicer` (needs the genuinely-missing `coords-corner-frame` animated survey-frame atom).

**The live-board form.** Extend `scripts/library-gallery.mjs` to ALSO walk `library/combos/` and, per role lane, emit a **"ВАРІАНТИ СЕКЦІЇ"** strip of side-by-side iframe cards (one per candidate), reusing the existing iframe-card machinery and the `kind:'section'` "секція" ribbon that nothing emits yet. Each card shows `signature` + `text_density` + a green/red verify badge. **Critical fix:** the gallery currently walks `COMPDIR` (components/) only and the 8820 server is rooted at `library/components/`, so combo-labs at `library/combos/<id>/combo-lab.html` will not resolve — the path/server root must be fixed so the iframes load. **Perf guard:** cards default to a static poster + "open lab" link, hydrating the live pinned-GSAP iframe only for the card in view (8 lanes × ~10 live ScrollTriggers would jank and falsely make a good variant look bad). Served on the SAME `:8820`. Owner gets ONE localhost link to the architecture lane — not screenshots (standing law).

---

## 3. THE LOOP — build batch → board → owner picks → promote → next section

**Execution order is corrected from the brief: the board is NOT last.** Owners cannot pick class from RECIPE.md.

```
STEP 0  HARNESS + SCHEMA (the one upfront cost, do ONCE)
        · Write library/_lab/combo-binder.html + library/_lab/boot.js: registers GSAP/ScrollTrigger/
          CustomEase from ONE shared source; reads the variant's uses[]; <script src>s each cited
          atom's component.js (or shared util.js); creates ONE pin owned by uses[0]; calls each atom's
          entry against that pin progress; paints a real <img>/<video> from the renders/ symlink.
        · EXTEND __LAB_OK__: keep pins===1 + 0 console errors, ADD "every cited atom's entry ran
          without throwing" + "render element painted non-zero size".
        · PROVE it by rewriting hero-puzzle-monument's lab on the binder — it must show the ACTUAL
          puzzle assembling a REAL nahirna render (not the <h1> placeholder) and pass extended verify.
          If atom entry signatures diverge, add a thin per-atom adapter map in boot.js (write once).
        · SCHEMA: add role, signature, text_density, motion_budget to front-matter as EMITTED but
          verify-OPTIONAL; BACKFILL the 7 existing combos so nothing goes red; flip role+signature to
          REQUIRED in checkFields only after the backfill.  → verify GREEN.

STEP 1  BOARD FIRST (same-day, before authoring): extend library-gallery.mjs to walk combos/, emit the
        "ВАРІАНТИ СЕКЦІЇ" strip, fix the :8820 path so combo-labs load. Prove it by rendering the one
        existing combo card side-by-side BEFORE any new authoring. (Build 5 sections the owner can't
        see = the owner got nothing.)

STEP 2  AUTHOR the 5 architecture variants → each = combos/<id>/ folder (RECIPE.md + binder-derived
        combo-lab.html on REAL renders) → each GREEN via `node scripts/library-verify.mjs` at
        status:candidate (exactly one pin, owner-first uses[], transform/opacity/clip-path/filter only,
        extended __LAB_OK__ true, 0 console errors, every media src resolves — not 404).

STEP 3  HAND OWNER ONE LOCALHOST LINK to the architecture lane. He scrolls 5 real competing sections
        side by side, names which read as "class" in chat (free text, copy-variants-in-chat law).

STEP 4  PROMOTE: `award-re:learn --promote` → winner flips status:official (requires green) + writes
        INDEX/COVERAGE row + combine-graph picks it up. Losers stay candidate (reference, not deleted).
        Any taught failure → F-entry; recurring → constitution patch.

STEP 5  HARD GATE: only AFTER the owner has picked on architecture do we open the NEXT lane (hero,
        re-scoped 9→~6 axes using the locked framework). Repeat 2→4 per lane. Never author breadth
        before one lane is owner-validated — 8 lanes × 5–10 = 40–80 folders authored blind is itself
        the catalog-syndrome the owner hates.
```

Two laws the framework must lock during the architecture loop, because the system enforces word-count but not these: **(a) text-PLACEMENT** — the title bbox must never intersect the render's center focal third (a one-word title dead-center over the house is still a wall); the lab asserts it. **(b) frame-match is load-bearing** — a day/night variant on an *unmatched* pair reads as two-photos-swapping (junior), not time-passing; never claim `daynight` on an unmatched pair.

---

## 4. HOW THIS REACHES WHOLE SITES (Phase B)

B starts only when a role has at least one `official` variant. A whole site is **assembled, not coded**:

1. **A site = a composition file.** `apps/<site>/.award-re/composition.yaml` lists the chosen variant ids in section order: `[{role: hero, variant: hero--…}, {role: architecture, variant: architecture--dusk-seam-spine}, …]`. It cites ids only — same cite-don't-inline law as combos. The build reads it and stitches the labs of the chosen variants into the page.
2. **The SEAM job is what makes assembly work.** Each variant already owns its in/out seam; in B the seams hand off section-to-section (estafette) instead of each section starting cold.
3. **Rhythm is a SITE property, invisible at the variant level.** A single architecture variant in isolation cannot show scale-rhythm — 8 beautiful-in-isolation full-bleed monuments in a row IS the synapse/catalog syndrome the memory warns against. So **before promoting hardens into a site, the board must show at least one estafette PAIR** — "section A handing to section B" — proving scale-contrast and the seam survive assembly. That pair is the phase-A→B bridge.
4. **First B target:** nahirna (villa) and quadro (house), the two projects whose frame-matched day/night renders + exteriors already back the variants. A composition of 5–6 promoted variants becomes a real site to QA on localhost, then the owner judges the *sequence*, not the *sections*.

---

## 5. HONEST NEXT STEP — this session

**The single thing that unblocks everything is the binder harness (Step 0), because the existing combo-lab is a placeholder and the board walks the wrong directory — confirmed on disk, not assumed.** Concretely, this session:

1. Write `library/_lab/boot.js` + `combo-binder.html`; rewrite `hero-puzzle-monument/combo-lab.html` on it so it shows the **actual puzzle assembling a real nahirna render** and passes the EXTENDED `__LAB_OK__`. This validates (or surfaces the cost of) the assumption that atom `entry` signatures are uniform — the thing that decides whether the harness is half a day or a day. **First action even before writing code:** `ls apps/nahirna/public` and `apps/quadro/public` and copy-paste the exact render filenames (`exterior-day-1.webp`, the `5d/renderN.mp4` names, the gallery `macro-clinker` path) — the image law: never type render paths by hand; a typo paints a blank card and verify goes misleadingly red.
2. Schema: add `role/signature/text_density/motion_budget` as emitted-but-optional, backfill the 7 combos, keep verify GREEN.
3. Patch `library-gallery.mjs` to walk `combos/` + emit the "ВАРІАНТИ СЕКЦІЇ" strip + fix the `:8820` path, and prove it by rendering the one rebuilt `hero-puzzle-monument` card side by side.

That ends the session with a *proven* harness + a *visible* board + GREEN verify — the rails the 5 architecture variants then drop onto. **Do not author the 5 variants until the binder paints one real assembled section**, or they are vaporware over a board that lies. Building 5 sections behind an invisible/placeholder board = the owner gets nothing to judge, which is the exact failure this pivot exists to fix.

**Files (absolute):**
- Library root: `/Users/yehorfedorov/Downloads/award-re-plugin/library/`
- Combos to add: `/Users/yehorfedorov/Downloads/award-re-plugin/library/combos/architecture--{depth-stack-collage,dusk-seam-spine,material-portal-bloom,windows-light-up-at-dusk,cinema-cut-render-rotator}/`
- Harness to create: `/Users/yehorfedorov/Downloads/award-re-plugin/library/_lab/{boot.js,combo-binder.html}`
- Gate to extend: `/Users/yehorfedorov/Downloads/award-re-plugin/scripts/library-verify.mjs` (checkFields required set; the `__LAB_OK__` probe)
- Board to extend: `/Users/yehorfedorov/Downloads/award-re-plugin/scripts/library-gallery.mjs` (walk `combos/`, emit `kind:'section'` ribbon strip, fix `:8820` path) → output `/Users/yehorfedorov/Downloads/award-re-plugin/library/GALLERY.html`
- Reference scaffold to rewrite: `/Users/yehorfedorov/Downloads/award-re-plugin/library/combos/hero-puzzle-monument/combo-lab.html`
- Real media source dirs: `/Users/yehorfedorov/Downloads/eruhomist/apps/nahirna/public/` and `/Users/yehorfedorov/Downloads/eruhomist/apps/quadro/public/`