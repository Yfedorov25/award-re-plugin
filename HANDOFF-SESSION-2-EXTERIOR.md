# SESSION 2 — ENTRY PROMPT (paste this whole file as your first message)

You are **Worker Session 2** of a 3-hand parallel build of award-winning real-estate web SECTIONS for
the `award-re` plugin. There is a MASTER session (the human's main Claude) that owns the canon engines,
the base, final review, and the gallery. Two worker sessions (you = Session 2, and Session 3) build
sections in parallel. Your scope is NARROW and fixed. Do only what is below, then STOP.

## FIRST: read the master context 100%, in full, before touching anything
`/Users/yehorfedorov/Downloads/award-re-plugin/HANDOFF-SECTIONS-MASTER-CONTEXT.md`
It defines the repo layout, the lab server, Playwright, the NON-NEGOTIABLE LAWS, the EXACT canon-engine
APIs (`window.DayNight`, `window.LocMap`), the real assets, the 7-step PIPELINE (build thin → DOM-fact
check → smoothness probe @4× CPU → adversarial skeptic → RECIPE → record → STOP), the RECIPE schema, and
the lessons from the master's builds. Everything there applies to you. Do not deviate.

## YOUR THEME: day/night EXTERIOR / facade sections (built on `window.DayNight`)
Read each section's full spec (composition, navigation, interaction, wow-beat, ASCII layout, recombines,
no-webgl notes) in:
`/Users/yehorfedorov/Downloads/eruhomist/apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md`

Real exterior assets you have (frame-matched): `dn-ext-day.webp` / `dn-ext-night.webp` (the house, 16:9)
and mobile `-m` variants. The night render's lit windows are a warm band across the lower-middle facade.

### Build these, ONE AT A TIME, each through the full 7-step pipeline:

1. **`the-facade-clock`** (A5, exterior). A brass 24-hour DIAL wraps the house; dragging the hand (or
   scrubbing) rotates the day, and sky + cornice + windows + the rewriting copy all answer that one hand.
   Continuous staged dusk. Built on DayNight (a day↔night ramp; windows ignite at the right hour like a
   time-curve). The radial DIAL is your chrome; DayNight does the relight. The hand angle = time of day.

2. **`our-house-at-dusk`** (A7, exterior, the cheapest/highest-wow). A before/after SEAM wipes the wider
   shot day→night, BUT only OUR house lights up (its windows warm) while the rest stays dark — a wordless
   sales punchline. Built on DayNight `reveal:"seam"` (cursor or scrub driven) + a window-mask limited to
   the property. (Spec names it "our-street"; build it about the HOUSE, not a street — we have a house pair.)

3. **`sun-dial-room-orrery`** (A3, exterior/interior hybrid — treat as exterior-facing). A circular sun-dial
   at the centre of a ring of room/facade portals; dragging the sun around rotates the day and the portal the
   sun points at fills the stage at that hour. Radial driver. (Difficulty L — if assets/time are tight, build
   the dial + facade day↔night first and note any room-portal asset you'd need; do NOT invent file paths.)

4. **`window-constellation-dusk`** (A6, exterior). The facade as a dark sky; as you scroll into evening the
   WINDOWS ignite one by one like stars, each a micro-portal. Built on DayNight masked-windows behaviour
   (per-window thresholds) driven by scroll. Reuse the night render's lit-window positions.

(If you finish all 4 with time to spare, STOP anyway and report — do not pull work from other sessions.)

## WHERE TO PUT RESULTS
- Each section: `library/components/<id>/` (all 6 files + `renders` symlink). Use the ids above as folder names.
- Append one row PER SECTION to your results log (create it if missing):
  `/Users/yehorfedorov/Downloads/award-re-plugin/HANDOFF-RESULTS-SESSION-2.md`
  Each row: `### <id>` then: lab url (`http://localhost:8820/<id>/lab.html`), the DOM-fact verification
  (what you measured), the smoothness numbers (fps + jank @4×), the skeptic's findings + confirmation each
  CRITICAL/MAJOR is fixed, screenshot paths (in `/tmp/award-worker-2/`), and any missing-asset note.
- Run `node scripts/library-index.mjs && node scripts/library-verify.mjs` → must be GREEN before you log a section as done.

## HARD BOUNDARIES (do not cross)
- Do NOT modify the canon engines (`daynight-engine/`, `locmap-engine/`).
- Do NOT touch Session 3's or the master's component ids. You own ONLY the 4 ids above.
- Do NOT deploy, push, or edit production sites in `/Users/yehorfedorov/Downloads/eruhomist/apps/*`.
- Do NOT do anything outside this list. When the 4 are done + logged + verify GREEN, STOP and say so.
- Every section must pass: `__LAB_OK__` true, 0 console errors, DOM move verified, smoothness PASS,
  skeptic critical+major fixed, base verify GREEN, zero em-dash in visible copy.

Start by reading the master context file in full, then section 1 (`the-facade-clock`). Work one section at a
time, fully verified, before the next. STOP when all four are logged.
