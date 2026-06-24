---
id: manifesto-flip-draw
name: "Theme-flip manifesto with self-drawing hairlines"
level: 2
kind: combo
status: official
section_job: "the manifesto/statement beat where the page changes temperature"
page_beat: bridge
meaning:
  what: "A statement assembles word-by-word as the section flips theme (dark<->light); self-drawing hairlines stroke in and reveal copy + depth ride the same scroll."
  when: "A manifesto/bridge beat that should change the page's temperature and deliver one composed statement."
  lands: "The page turns a page — a tonal shift plus a sentence that reads as authored intent."
  not_when: "Conversion gates, dense spec sections, anywhere two pin-owners collide."
source:
  grammar: "Vide Infra / AIR manifesto — theme-flip + line-draw"
  recording: null
  registry_ref: []
theme: { skin: flip, book_end: false }
ease: air
webgl: false
pin: { owner: puzzle-text, count: 1, length: "+=110%" }
owns_pin: true
uses:
  - { atom: puzzle-text,    params: { trigger: scrub, pin: true } }
  - { atom: theme-flip,     params: { rides: pin-progress } }
  - { atom: reveal,         params: { trigger: per-line } }
  - { atom: parallax-depth, params: { rides: pin-progress } }
combines_with: [hero-puzzle-monument, story-stepper-render-focus]
anti_combos: [cards-swipe]
gated_by: [R_pin_budget, R_anti_combos, R_theme_flow, R_perf_limits, R_timing_layers]
files: [RECIPE.md, combo-lab.html]
acceptance:
  - "exactly ONE pin (puzzle-text owns it)"
  - "theme flip is a single temperature change tied to one progress"
  - "hairlines self-draw via stroke-dashoffset; no layout animation"
verify: "combo-lab.html#__LAB_OK__"
---

# manifesto-flip-draw — theme-flip manifesto with self-drawing hairlines

> **Level-2 SECTION recipe.** A proven stack of 5 primitives that build one
> award-grade *manifesto / material / brand* section — **without ever taking the pin.**
> The dark→light theme flip *is* the section transition; copy and hairline accents
> reveal on top of it; everything drifts on parallax. One breath.

---

## Goal

Show the brand / material / thesis of the project as a quiet, confident statement.
The section must feel like a deliberate exhale between louder pinned moments — so it
**spends zero pin budget**. The drama comes entirely from a page-wide theme flip on
entry, plus copy and line accents that assemble themselves as you scroll past.

Use this when the brief wants a *manifesto*, *about / philosophy*, *material story*,
or any "here's what we believe" beat that should read expensive but calm.

---

## The stack (ordered, with params)

Read top-to-bottom = the order they fire as the section enters the viewport.

1. **theme-flip** — *the section transition, zero pin.*
   `IntersectionObserver`, threshold at the section's top boundary (root-margin
   `-45% 0px -55% 0px` so it trips when the section crosses mid-screen).
   Toggles a root/body class `is-light` → CSS custom-props crossfade
   (`--bg`, `--ink`, `--hair`) over `600ms cubic-bezier(.22,1,.36,1)`.
   Dark→light on enter, light→dark on `isIntersecting:false` scroll-up (reversible).

2. **reveal (staggered group)** — copy assembles beneath the flip.
   Group base `30ms`, per-member `180ms`. Members in DOM/reading order:
   `heading → sub → figure(s)`. `y: 16px → 0`, `opacity: 0 → 1`,
   ease `power3.out`, `start:'top 80%'`, in-view (not scrub) so short copy still lands.

3. **puzzle-text** — on the **headline only**, to carry length without pin.
   `trigger:'scrub'`, words slide from seeded offset to resting box in **reading order**,
   single ease `puzzleAir = .22,1,.36,1`. `scrub:0.6`, `start:'top 78%'`, `end:'top 30%'`.
   This is what lets the section be *tall* (lots of scroll distance) yet never pin —
   the scroll distance is absorbed by the word assembly, not a `pin:true`.

4. **self-draw hairline accents** — thin lines trace themselves in parallel.
   The no-WebGL translation of animated WebGL lines: inline `<svg>` strokes,
   `getTotalLength()` → set `stroke-dasharray` + `stroke-dashoffset = len`, animate
   offset → `0`. `scrub:0.8` on the same trigger as the headline, `start:'top 75%'`,
   `end:'top 35%'`. `stroke:var(--hair)` so the lines also ride the theme flip. `1px`/`1.5px`.

5. **parallax-depth** — continuous, under everything.
   `scrub:true`, small `yPercent` drift per layer (heading `-4`, sub `-2`, figure `-8`)
   so the block breathes as it passes. Transform-only, no layout, no `backdrop-filter`.

---

## How it reads on scroll

As the section crosses the threshold the **whole page flips dark-to-light** — that flip
is the only "transition" the section needs. In the same beat the **headline words slide
back into their resting positions** in reading order, the **sub + figures stagger in
beneath**, and **thin accent lines trace themselves** alongside. Underneath it all the
block **drifts on parallax**. It feels like a single inhale-exhale. Scroll back up and
it reverses: page flips dark again, words re-spread, lines un-draw. Because nothing
pins, the reader never feels "stuck" — the pin stays reserved for the hero and the one
climax section.

---

## Level-1 components it uses (from `library/components/`)

- **`puzzle-text`** — headline assembly (step 3). Use scrub mode, reading-order stagger.
- *(primitives below are score-level utilities, not standalone component folders)*:
  - **theme-flip** — IntersectionObserver + CSS custom-prop crossfade (step 1).
  - **reveal (staggered group)** — the site-wide reveal utility (step 2).
  - **self-draw (svgLength → dashoffset)** — hairline tracer (step 4).
  - **parallax-depth** — the site-wide scrub-parallax utility (step 5).

> If `theme-flip` / `reveal` / `self-draw` / `parallax-depth` don't yet exist as their
> own component folders, lift their constants from the project's **motion score** —
> they are score primitives, and this combo just sequences them.

---

## Pin-budget note

**This section spends 0 pins. That is the whole point.**
Pin budget on an award site is scarce — reserve it for the **hero** and **one climax**.
A manifesto that pins reads as "another stuck section" and dilutes the climax. Here the
*flip* substitutes for a pinned transition and *puzzle-text scrub* absorbs the scroll
length, so you get the weight of a pinned beat with none of the cost. If you find
yourself reaching for `pin:true` to "make it feel important", stop — lengthen the
section and lean harder on the headline scrub instead.

---

## How to build (outline)

1. **Markup.** Section with `data-section="manifesto"`. Inside: `h2.manifesto-head`
   (will be word-split by puzzle-text), `p.manifesto-sub`, one or two `figure`s, and
   an inline `<svg>` of 1–2 hairline `<path>`s positioned as accents. Theme colors come
   from CSS custom props on `:root` / `body`.
2. **Theme-flip (step 1).** Wire one `IntersectionObserver` with the mid-screen
   root-margin; toggle `is-light`. Define `--bg/--ink/--hair` for both themes and a
   `transition` on those props. Verify the flip reverses on scroll-up.
3. **Reveal group (step 2).** Apply the staggered reveal utility to
   `head → sub → figures`, base 30ms / member 180ms, in-view, `power3.out`.
4. **Headline puzzle-text (step 3).** Initialize puzzle-text on `.manifesto-head` in
   `scrub` mode, reading-order stagger, `scrub:0.6`, `start/end` as above. This sets the
   section's scroll length — make the section tall enough that the assembly finishes
   comfortably before exit.
5. **Hairline self-draw (step 4).** For each accent path: measure `getTotalLength()`,
   prime dash, scrub offset → 0 on the same trigger. Stroke = `var(--hair)`.
6. **Parallax (step 5).** Add `scrub:true` `yPercent` drift to head/sub/figure layers.
   Transform-only.
7. **Verify by scrolling (no screenshots).** Down: flip → words home → copy in → lines
   draw → gentle drift. Up: everything reverses. Confirm **no `pin:true` anywhere** in
   the section and no `backdrop-filter`/`mix-blend` over the parallax layers.
