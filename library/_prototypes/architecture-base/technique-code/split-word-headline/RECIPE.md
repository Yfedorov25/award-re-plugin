---
id: split-word-headline
name: "Split-word headline (a headline split into per-word clip rows; each WORD rises from under its own overflow:hidden clip + fades, staggered in a wave; plays once on enter or scrubs via set(p))"
level: 2
kind: component
status: candidate
entry:
  call: "SplitWordHeadline.create(target, opts)  // target = an element holding a headline (e.g. <h1 data-swh>). The atom splits it into per-word clip rows. Use \\n or <br> for lines. opts: { stagger, from:{yPercent,opacity}, ease, trigger:'enter'|'progress', start, dur, manageLenis }."
  module: iife
  returns: "{ words, trigger, lenis, set(p), play(), destroy }"
meaning:
  what: "A PER-WORD split headline reveal. The atom takes an element holding a headline, splits it into per-word spans (each WORD wrapped in its own overflow:hidden clip row), and reveals the words with a wave stagger: each word RISES from under its own clip (yPercent 120 -> 0) + fades in. The words arrive one by one, with weight. set(p) is a PURE scrub of the cascade; play() runs the one-shot wave on enter."
  when: "Hero titles (and any display headline) where you want the WORDS to arrive one by one with weight: a slow, deliberate typographic reveal that reads expensive and intentional. The repeating signature for a hero line, an editorial section opener, or a manifesto statement. Each word getting its own clip gives a printed-spread, letterpress-being-set feel; the wave stagger carries the eye left-to-right through the phrase."
  lands: "A serif headline sits over a render. As the hero settles (or as you scroll it in), the words don't just fade. Each one rises up from beneath its own invisible edge, one after the next in a soft wave, and locks into place. It reads like type being set by hand: deliberate, weighted, unhurried. The phrase assembles itself word by word."
  not_when: "A whole-line mask reveal (use mask-up-title). A per-character blur/fade (use blur-reveal-stagger-title). An SVG stroke that draws itself (use stroke-draw-title). Body copy or long paragraphs (per-word clipping is for short display lines, not running text). When the headline must not move at all (drop the atom or rely on its reduced-motion branch)."
source:
  grammar: "Award-RE hero grammar: the display headline arrives word-by-word from under per-word clips (independent per-WORD travel), the premium alternative to a single line-mask. Sibling of mask-up-title / blur-reveal-stagger-title / stroke-draw-title, the only one that travels per WORD."
  recording: "apps/quadro/.award-re/teardowns/ (hero-title family; per-word split-rise as the weighted variant of the line-mask reveal)"
  registry_ref: ["hero-title-split-word-rise"]
stack: "vanilla + GSAP 3.12.5 + ScrollTrigger (+ guarded Lenis 1.1.13)"
webgl: false
motion_props: [transform, opacity]
trigger: "play-once on enter (default) OR scroll-scrub via set(p) (trigger:'progress')"
timing_layer: [B-reveal]
owns_pin: false
owns_scroll: false
page_beat: [hero, editorial, manifesto, section-opener]
combines_with: [scroll-zoom-image-pair, hero-video-render-rotator, script-overline-display-pair, mask-up-title]
anti_combos: [mask-up-title, blur-reveal-stagger-title, stroke-draw-title, pin]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "the atom splits the headline in `target` into per-word spans: each WORD wrapped in a .swh-clip (overflow hidden) holding a .swh-word inner span (the transform target); whitespace preserved between words"
  - "on reveal each word RISES from under its own clip (translateY from.yPercent% -> 0%, default 120 -> 0) + fades (opacity from.opacity -> 1), staggered by `stagger` seconds in a left-to-right wave (trigger:'enter')"
  - "trigger:'progress' drives set(p 0..1): each word owns an overlapping slice of p and cascades across the scrub; set(p) is PURE and reversible (same p -> same frame)"
  - "multi-line: explicit <br> or \\n in the markup starts a new .swh-line clip ROW so each line clips independently (no bleed between lines)"
  - "transform translateY (word) + opacity (word) + overflow clip (per-word) only; NO layout-prop animation (no margin/top/width/height); NO mix-blend / NO backdrop; NO WebGL; will-change cleared after the one-shot; owns_pin false"
  - "reduced-motion or <=560px -> all words shown (no travel); GSAP required; ScrollTrigger required for enter/progress; set(p) works standalone; window.__LAB_OK__ on init"
  - "asset-substitution gate: a real UA serif headline over OUR QUADRO render (renders/day-34.webp), sparse copy, zero em/en-dash"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Watch the headline over the QUADRO render: it is split into per-word clip rows; on enter the words rise from under their own clips one by one in a wave (translateY 120%->0% + fade), and a multi-line headline clips per line. Verify per-word overflow:hidden (each word masked under its own box), the stagger wave, the reduced-motion branch (all words shown), and fps. Distinct from mask-up-title (one line-mask) and blur-reveal-stagger-title (per-char blur): this travels per WORD."
note: |
  Hero-title family. The per-WORD split-rise: the weighted, deliberate alternative to a
  whole-line mask. CONFIRMED DISTINCT: mask-up-title masks the whole line behind one clip;
  blur-reveal-stagger-title fades+unblurs per CHARACTER; stroke-draw-title draws an SVG outline.
  Only this atom gives each WORD its own overflow:hidden clip and its own travel, so the phrase
  assembles word by word in a wave. transform translateY + opacity on the inner spans = GPU-cheap;
  per-word overflow:hidden does the masking (no layout-prop motion). owns_pin false (it lives
  inside a hero/section, never pins). Two modes share one pure core: play() (one-shot wave on
  enter) and set(p) (a scrubbed cascade). Proven on QUADRO renders/day-34.webp: 2-word serif line
  rises word-by-word, a multi-line headline clips per row, set(p) pure/reversible, zero console
  errors. Serif stand-in = Playfair Display (Canela / PP-Editorial class). Pair with
  scroll-zoom-image-pair or hero-video-render-rotator as the hero spine.
---

# split-word-headline: a headline that arrives word by word from under per-word clips

A display headline split into per-word clip rows: each WORD sits in its own overflow:hidden box
and RISES from under it (translateY 120% → 0%) + fades, staggered in a left-to-right wave. The
phrase assembles itself word by word. Plays once on enter (`trigger:'enter'`) or scrubs across a
scroll via `set(p)` (`trigger:'progress'`). The only hero-title sibling that travels per WORD:
not per line (mask-up-title), not per character (blur-reveal-stagger-title), not by stroke
(stroke-draw-title).

## Markup + call
```html
<h1 class="hero-title" data-swh>Дім дихає</h1>
<!-- multi-line: <br> or a literal newline starts a new clip row -->
<h1 class="hero-title" data-swh>Тиша<br>має адресу</h1>
```
```js
// one-shot wave on enter (hero default)
SplitWordHeadline.create('[data-swh]', { stagger: 0.08, ease: 'air', trigger: 'enter' });

// or a scrubbed cascade driven by scroll
const swh = SplitWordHeadline.create('#hero-line', { trigger: 'progress' });
// swh.set(0.5) -> half the words risen (pure, reversible)
```

## Proven (the lab)
A 2-word UA serif headline ("Дім дихає") over OUR QUADRO render `renders/day-34.webp`, plus a
multi-line headline to prove per-line clipping. Measured live: each word starts at
translateY(120%)/opacity 0 inside its own overflow:hidden clip and rises to translateY(0%)/opacity 1
in a staggered wave; lines clip independently. `set(p)` is pure and reversible. Reduced-motion /
≤560px shows all words with no travel. `window.__LAB_OK__` true once wired + the render painted.
Serif stand-in = Playfair Display (Canela / PP-Editorial class).
