I have everything I need from the briefing and the council's positions. The four seats agree on the substance and split on one ordering question (harvest-first vs. combine-graph-first). Let me synthesize decisively.

# Award-RE Roadmap — UPDATED (gallery is live)

## 1. WHERE WE ARE

The gallery is **built, live, regenerable, and owner-approved**. `library/SECTIONS.yaml` (19 roles across 3 tiers + a 5-id mechanic class + ~150-entry alias map) is the spine; `node scripts/library-gallery.mjs` emits `library/GALLERY.html` — 93 bricks in 19 lanes + a 9-item mechanics shelf, live iframe previews, coverage badges, a red gap list, and filters. Old Stages 0+1 are **done**. The gallery's real value is that it turned guesses into ground truth, and the truth reframes the whole backlog: the bottleneck is **not** atmosphere — hero is over-built at 23 and architecture at 18 — it is **section closers and proof** (cta=2 on a section that ends every page), **one CORE lane** (floorplan=1, required by all three project types), and an **almost-empty CUSTOM tier** (facts=0, price=0, compare=0, commercial=0, invest=0, scenarios=0, tour3d=0; only visual-search=3). Two facts make the next moves obvious: (a) the two named example projects — **nahirna** and **towns Замкова** — both crash into empty lanes, so neither can be assembled honest-and-complete today; and (b) `apps/towns/public/prototypes/` holds **54 already-built section prototypes** (PRICE-* variants, GLB-viewer/FLY-* tour shells, ARCH*, transition strips) that are pre-made fuel for the exact gap lanes the old plan treated as a from-scratch hunt.

## 2. THE UPDATED STAGED PLAN FROM HERE

### Central question: harvest gaps first (a), assemble-with-placeholders now (b), or interleave (c)?

**Decision: (a) — harvest the three critical-frequency gaps FIRST, then assemble. Specifically a tightly-bounded harvest (cta → floorplan → facts only), immediately followed by the nahirna composition.** Not all gaps — just the three that wall the named example pages.

**Why (a) and not (b):** the measured data forbids (b) for the named targets. nahirna has facts=0, cta=2, floorplan=1; towns has price=0, tour3d=0, plan=1, cta=2. A composition built today is a holey strip with red placeholders — and the owner's entire pain is *"I keep getting half-baked junk."* Shipping a red-holed example as the first thing he points at re-triggers that pain and mis-teaches the agent (it would treat red holes as a finished pattern). You must fix the walls first.

**Why (a) and not (c) in full:** a blanket interleave invites the catalog-first bloat the owner is tired of — harvesting all 7 empty + 3 thin lanes before any example is exactly the wrong order. So the harvest is **surgically scoped to 3 lanes**, then we compose. The *rest* of the CUSTOM tier is harvested lazily, demand-gated — which is a small, deliberate interleave, not a batch.

**Where the seats split — and the call:** three seats (owner-advocate, engineer, art director) say *harvest cta/floorplan/facts first, then compose* — adopted as the spine. The **AI-pipeline architect dissents**: he says the real precondition is a **combine-graph linter** (`combine_with`/`anti_combos` references currently dangle — he found ~18 broken refs incl. a `circular-UI-language` casing bug — and there's no resolved graph an agent can read), and that harvesting bricks into a referentially-broken graph just adds more broken nodes. **Resolution: he is right that the graph integrity matters and wrong that it must come strictly first.** The 18 dangling refs are real and cheap to fix, but they don't block a single hand-built nahirna composition. So I **fold his linter in as Stage 1 (one day, runs in parallel with / immediately before the harvest)** rather than gating everything behind it — and I **adopt his discipline** that any harvested brick (including the 54 towns prototypes) must go through the existing 5-artifact CONTRACT before entering the graph, so harvesting doesn't pollute it. His point about the prototypes being raw HTML demos, not CONTRACT bricks, is the one correction that saves us from a fake "fast win."

---

**Stage 0 — Stamp DONE + relocate the plan. (S, ~0.5h)**
- Goal: the plan lives next to what it governs.
- Deliverable: Stages 0+1 marked DONE with the verified bands (hero 23, arch 18, location 9, cta 2, trust 7, units 3, facts 0, floorplan 1); the plan file copied to `~/Downloads/award-re-plugin/library/PLAN.md` (it currently sits in `apps/quadro/.award-re/` — away from the artifacts).
- Done: plan file exists beside `SECTIONS.yaml`; numbers match generator output.

**Stage 1 — Combine-graph linter + `COMBINE.json`. (M, ~1d)**
- Goal: the machine-readable combine layer is verified-consistent and exposed, not just populated-on-disk.
- Deliverable: `scripts/combine-graph.mjs` that (1) validates every `combines_with` / `anti_combos` / `uses.atom` / `gated_by` target resolves to a real brick id or mechanic atom and every `page_beat` resolves through `SECTIONS.yaml` to a lane; (2) fixes the ~18 dangling refs (case-fold `circular-UI-language`→`circular-ui-language`; alias the mechanic atoms `parallax-depth`/`reveal`/`scroll-indicator` so they're referenceable); (3) emits `library/COMBINE.json` (per-brick resolved graph + reverse lane→combos index); (4) is wired into `library-verify` so a future bad edit fails the build, gap-list-style.
- Done: `node scripts/combine-graph.mjs` exits 0 with **0 dangling**, writes `COMBINE.json`, and a deliberately-broken ref fails the build.

**Stage 2 — Urgent harvest: cta → floorplan → facts. (M, ~half-day to 1.5d)**
- Goal: make the nahirna example assemblable with zero red holes; raise the one CORE thin lane.
- Deliverable: cta 2→≥3, floorplan 1→≥3, facts 0→≥1, each entering through the 5-artifact CONTRACT (RECIPE/tokens/lab `__LAB_OK__`/etc.), several sourced from the 54 towns prototypes (ARCH* → architecture is already deep so skip; floorplan from towns `plan` + nahirna `04-Floorplan`; facts from nahirna `07-Facts`; cta harvested fresh or from existing CTA shells). **Drop trust from the urgent list — it's already 7.** **Stop harvesting hero (23) and architecture (18) entirely.**
- Done: generator's gap list no longer contains `facts`; cta≥3 and floorplan≥3 visible as live iframe cards in their lanes.

**Stage 3 — Compositions: nahirna (honest-complete) + towns (shows-the-wall). (M, ~half-day)**
- Goal: the first thing the owner can point at and SEE assemble.
- Deliverable: `library/compositions/nahirna.yaml` (ordered `[{lane, brick_id, why}]`, validated against `SECTIONS.yaml` lane order + `COMBINE.json` for no adjacent `anti_combos`, no two `owns_pin` adjacent) → rendered by a small `compose.mjs` to a scrollable strip of live iframe cards. nahirna = all 10 slots green. `towns.yaml` built the same way with `price`/`tour3d` shown **RED on purpose** — the visible contrast is the teaching artifact, shown openly, not hidden.
- Done: nahirna strip clicks through with **zero red holes**; owner makes **≤1 correction round**; towns strip shows its 2 red lanes honestly.

**Stage 4 — S/M/L skeletons per project type. (M, ~1d)**
- Goal: "point at a project type → get the right section set."
- Deliverable: `library/skeletons/{villa,townhouse,zhk}.yaml` — ordered lane templates; the composition validator scores any composition against its skeleton (coverage vs gap). Set expectation up front: **villa-S and townhouse-S read near-green; ЖК-L reads mostly RED in the CUSTOM tier** until that cluster is harvested — an honest aspirational map, stated to the owner before he sees it.
- Done: 3 skeleton files exist; a coverage-vs-skeleton badge renders per slot; ЖК-L's red is labeled as known-aspirational.

**Stage 5 — Rhythm / storyboard lint. (L, ~2d) — the real differentiator.**
- Goal: arrangement quality, now that count is solved (hero 23, arch 18 prove count is not the constraint).
- Deliverable: `scripts/storyboard-lint.mjs` encoding the catalog-syndrome memory: scale-rhythm (loud↔quiet alternation), no-2-similar-adjacent, max-2-full-plans, one-pin-per-section, closer-must-be-cta, beat estafette across the seam.
- Done: lint flags a deliberately bad composition and passes the nahirna composition.

**Stage 6 — Teach-combine to memory + /learn. (S, ~0.5d, byproduct of Stage 3.)**
- Goal: the agent reproduces the combine method without re-explanation.
- Deliverable: one memory note + `/award-re:learn` entry capturing the combine grammar (skeleton → `COMBINE.json` → composition validator → rhythm-lint).
- Done: a `/learn` entry exists; the agent can name the four-step combine loop unprompted.

**Stage 7 — Pipeline rework. (L, FENCED — LATER.)** See §6.

**Lazy track (demand-gated, not a milestone):** harvest the remaining CUSTOM lanes — price, tour3d (from towns prototypes), then compare/commercial/invest/scenarios (smarts has all five as source files) — only when a real project needs them. **Explicitly NOT a done-criterion to fill every CUSTOM lane.**

## 3. THE GAP-FILL QUEUE

Ordered by **frequency-on-page**, not catalog depth:

1. **cta (2 → ≥3)** — ends *every* page of *every* project type. Highest-leverage single brick. One new cta brick beats ten new hero bricks.
2. **floorplan (1 → ≥3)** — CORE-tier and required by all three types (villa single-plan, ЖК numbered plate, townhouse plan). The most dangerous thin lane; old plan never flagged it.
3. **facts (0 → ≥1)** — needed by nahirna AND smarts; blocks the honest nahirna example.
4. **price (0)** — townhouse/ЖК; harvest from towns' 7 PRICE-* prototypes when towns or a ЖК is built.
5. **tour3d (0)** — harvest from towns' GLB-viewer + FLY-* shells when towns is built.
6. **compare / commercial / invest / scenarios (0 each)** — ЖК-specific CUSTOM cluster; smarts has all five as source. Harvest lazily, gated by the next real ЖК.

**Dropped from the urgent list:** trust (already 7 — the old plan's "trust=0" was stale). **Frozen:** hero (23), architecture (18) — over-built; any new brick there is waste.

## 4. STORYBOARDS (the S/M/L skeletons)

- **Artifact form: YAML, surfaced as a tab/strip in the existing gallery — not a new HTML build pipeline.** A skeleton is an *ordered list of lanes with a coverage badge per slot*; that is data, not a new renderer. The engineer's pushback is adopted: **storyboards = data + the gallery view; only the rhythm-lint earns new code** (rhythm rules can't be expressed in a doc).
- **Three files:** `library/skeletons/villa.yaml`, `townhouse.yaml`, `zhk.yaml`. Each: `[{lane, role: required|optional, note}]` in legal scroll order.
  - villa (~10): hero · water/atmosphere · architecture · floorplan · space/interiors · landscape · gallery · location · facts · cta
  - townhouse (~10): hero · architecture · location · plan/floorplan · price · units · yard/amenities · tour3d · trust · cta
  - ЖК (~16): hero · manifesto · architecture · location · floorplan/visual-search · units · price · compare · amenities · interiors · gallery · trust · commercial · invest · scenarios · cta
- **Coverage-vs-skeleton shown** by reusing the gallery's existing badge system: each skeleton slot resolves against `INDEX.json`/`COMBINE.json` and renders **green** (≥1 real brick), **amber** (thin, 1–2), or **red** (0). The validator (`compose.mjs`) checks a real composition against its skeleton and lists missing slots. The owner sees, per project type, exactly which slots are real today and which are aspirational — villa/townhouse near-green, ЖК mostly-red in CUSTOM, stated honestly before he looks.

## 5. TEACH-THE-AGENT-TO-COMBINE

Recorded as a **byproduct of Stage 3** (don't wait until the end), finalized after Stage 5:

- **What gets recorded:** the four-step combine loop — (1) pick skeleton for project type → (2) resolve each lane to a brick via `COMBINE.json` (respect `anti_combos`, one-pin-per-section, `gated_by`) → (3) validate composition order against `SECTIONS.yaml` + skeleton coverage → (4) pass `storyboard-lint.mjs` (scale-rhythm, no-2-similar-adjacent, closer=cta). Plus the worked nahirna composition as the canonical example, and the towns "shows-the-wall" case as the honest-gap pattern.
- **Where:** one MEMORY.md note (combine grammar + pointer to `COMBINE.json`/skeletons) **and** a `/award-re:learn` entry so it enters the plugin's grammar/registry.
- **When:** memory note the moment nahirna assembles clean (Stage 3); `/learn` entry once the lint exists (Stage 5) so the recorded grammar includes the rhythm rules, not just the section list.

## 6. PIPELINE REWORK — kept LATER

Stage 7 stays **fenced**, per owner. `award-re:build` rewired to consume `skeleton → COMBINE.json → composition validator → rhythm-lint` instead of free-improvising.
**Trigger to start it:** when at least one real project (nahirna) has been assembled from the library and corrected in **≤1 round**, and the rhythm-lint passes it — i.e., the manual combine loop is proven to produce award-grade output. Until that proof exists, automating the pipeline would just automate an unproven loop.

## 7. WHAT WE END WITH + THE ONE ACCEPTANCE TEST

**End state:** the owner points at a lane or names a project type → the right S/M/L skeleton fires → bricks assemble (agent-driven, via the recorded combine grammar) into an award-grade site → rhythm-lint passes it → he corrects it in **one round**. The graph is verified (0 dangling refs, build-enforced), the gallery + skeletons make coverage honest, and the combine method lives in `/learn` so it survives without re-explanation.

**The one acceptance test that proves the pain is gone:**
> Owner names a project type and hands a brief. The agent emits a composition from the library alone (no hand-holding) that (a) resolves every required skeleton slot to a real brick with **zero un-justified red holes**, (b) passes `storyboard-lint.mjs` with no anti-combo / double-pin / missing-closer violations, and (c) the owner accepts after **at most one correction round.** If it still takes more than one round, the combine layer failed and we're back to prose.

## 8. MY HONEST RECOMMENDATION — THE EXACT NEXT STEP THIS SESSION

**Do Stage 0 + Stage 1 + the start of Stage 2, in this order, this session:**

1. **(15 min)** Copy the plan to `~/Downloads/award-re-plugin/library/PLAN.md`, stamp Stages 0+1 DONE with the verified bands.
2. **(~1 day, the real work) Write `scripts/combine-graph.mjs`** — fix the ~18 dangling combine refs (start with the `circular-UI-language` casing bug and the mechanic-atom aliases), emit `library/COMBINE.json`, wire it into `library-verify`. **Verify: `node scripts/combine-graph.mjs` exits 0 with 0 dangling.** This is cheap, it's a precondition the downstream stages silently assume, and it makes every later composition reproducible instead of a hand-built one-off.
3. **Then immediately begin the cta → floorplan → facts harvest (Stage 2)**, pulling floorplan/facts from `apps/nahirna/components/sections/{04-Floorplan,07-Facts}` and the towns prototypes **through the 5-artifact CONTRACT** — so the very next session opens with the nahirna composition (Stage 3) able to go fully green.

Rationale for fronting the linter over jumping straight to harvest: it's one day, it's load-bearing for everything after, and harvesting into a referentially-broken graph just multiplies the breakage. But it is explicitly **not** allowed to expand into the 108-technique registry backlog (that's a separate, fenced track) — the only graph work this session is making the *existing* combine metadata consistent and visible.