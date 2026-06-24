# library/ CONTRACT — the field spec for every technique row

> One page. This is the schema every `RECIPE.md` front-matter, every variant
> delta, every shared-util stub, and every rule `gates:` block must satisfy.
> `scripts/library-verify.mjs` enforces it. `scripts/library-index.mjs` reads it
> to emit `INDEX.json` / `INDEX.md` / `COVERAGE.md`.
>
> **ZERO code rewrite.** The 6 primitives have FIVE different init signatures on
> disk. We do NOT unify them. Each RECIPE declares its REAL signature in
> `entry.call`. A uniform `mount(root,opts)` is a future convergence target for
> NEW primitives only — never a retrofit.

---

## 1. The five zones

```
library/
  INDEX.json / INDEX.md / COVERAGE.md   ← GENERATED (do not hand-edit)
  CONTRACT.md                           ← this file
  tokens/_tokens.css + _tokens.json     ← global --aw-* surface
  components/<id>/   RECIPE.md component.js component.css lab.html tokens.json [variants/<vid>/]
  combos/<id>/       RECIPE.md combo-lab.html
  shared/<id>/       UTIL.md util.js util.css     (kind:shared-util — cited-but-not-yet-atomic)
  rules/R_*.md       prose + gates: front-matter
```

Laws: `id` = folder name = INDEX key = registry IMPLEMENTED-BY target (one join
key everywhere). components = atomic moves. combos = stacks (cite ids, never
inline code). shared = not-yet-promoted utils. rules = machine-checkable gates.

A technique is **in the DB** only when its folder has `RECIPE.md` +
`component.js` + `lab.html` + `tokens.json`, a green `verify`, and an INDEX row.

---

## 2. RECIPE front-matter — required fields (fixed order)

```yaml
---
id: cards-swipe                  # REQUIRED. kebab; == folder name == join key
name: "Pinned cinematic deck-swipe"   # REQUIRED. human title
level: 1                         # REQUIRED. 1=component | 2=combo | u=shared-util
kind: component                  # REQUIRED. component | combo | shared-util
status: official                 # REQUIRED. seed|wip|candidate|official|deprecated
                                 #           official REQUIRES green verify
entry:                           # REQUIRED on components. the REAL call signature
  call: "CardsSwipe.init(opts)"  #   the truth on disk — they differ across the 6
  module: iife                   #   iife | esm  (how lab/agent loads it)
  returns: "{ goTo, refresh, kill, index }"
meaning:                         # REQUIRED. when/lands must be non-empty for official
  what: "one-sentence mechanic (HOW it moves)"
  when: "the section situation + content-shape that triggers reaching for it"
  lands: "the emotional/perceptual payoff (the puant)"
  not_when: "the anti-pattern guard"
source:                          # REQUIRED. provenance = reproducibility anchor
  grammar: "originating site / section"
  recording: "rec.mov | null"
  registry_ref: ["T-###"]        # link INTO the 163-brain (or [])
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase + guarded Lenis"
webgl: false
motion_props: [transform, opacity, clip-path]   # ONLY animatable props (perf contract)
trigger: "one pinned scroll-scrub timeline (scrub:1), reversible"
timing_layer: [B-entrance, A-ambient]   # STACKING-GRAMMAR A/B/C layers it fills
owns_pin: true                   # combo pin-budget math
page_beat: [show, material]      # combos optional: hero|proof|material|lifestyle-climax|conversion|bridge
combines_with: [puzzle-text, focus-render-switch]
anti_combos: [second-pin]        # → rules/R_anti_combos
gated_by: [R_pin_budget, R_anti_combos, R_perf_limits, R_timing_layers]   # REQUIRED
variants: [default, cinematic, editorial]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:                      # REQUIRED. each string maps to a __LAB_OK__ probe
  - "render dissolves via 2-img crossfade, never video.currentTime"
verify: "lab.html#__LAB_OK__"    # REQUIRED on DOM components
---
```

**Required-non-empty (verify fails otherwise):** `id`, `name`, `level`, `kind`,
`status`, `meaning.when`, `meaning.lands`, `source`, `gated_by`, `acceptance`.
On components also `entry.call`. Everything else is additive.

Combo header swaps in: `section_job`, `page_beat`, `theme:{skin,book_end}`,
`ease`, `pin:{owner,count,length}`, and an ORDERED `uses:` list whose FIRST entry
must be the `owns_pin` owner, each entry `{atom, params}`.

---

## 3. Variant deltas (variant-as-delta — base UNTOUCHED)

```
components/<id>/variants/<vid>/
  variant.recipe.md   ← extends:<id> + variant:<vid> + changed meaning.lands/source + overrides:
  params.json         ← the knob diff ONLY (PREFERRED — data, zero code)
  variant.lab.html    ← calls the BASE via entry.call merged with params; real renders
  variant.js          ← ONLY if a NEW DOM layer/phase is needed; MUST import/reference base
```

Rules: every `variant.recipe.md` MUST carry `extends:` AND (`params.json` OR a
base-importing `variant.js`). A `variants/*` dir that contains a forked copy of
`component.js` = HARD FAIL. Variants are NOT separate INDEX rows — they live in
the parent's `variants:` column. If a "variant" can't be expressed as
params-over-base or a base-importing patch, it is a NEW technique with its own
`components/<new-id>/`.

---

## 4. Rule gates

```yaml
---
id: R_pin_budget
kind: rule
gates: [owns_pin, pin, trigger]   # which RECIPE fields this rule constrains
severity: hard                    # hard | soft
---
```

---

## 5. The 5-artifact reproduction guarantee

A technique reaches `status:official` only when ALL exist + verify is green:
1. parameterized `component.js` (real `entry.call`, no magic numbers inline)
2. `tokens.json` (the knob contract: name/type/default/range/unit/meaning)
3. runnable `lab.html` that sets `window.__LAB_OK__ = true` after acceptance fires
4. `acceptance[]` front-matter (each string maps to a lab probe)
5. green `scripts/library-verify.mjs`

WebGL rows (`webgl:true`) get `status:candidate` until a GL-capable headless
context exists; verify SKIPS their headless step.
