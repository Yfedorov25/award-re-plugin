# Timing layers — як стак читається як один рух

When you stack techniques in one section, every move runs on a *clock*. The art is making 3-5 simultaneous tweens read as ONE assembling gesture, not a pile-up. These rules govern how the clocks combine.

## Clocks & ownership

- **THREE-CLOCK CEILING.** A section runs at most THREE simultaneous timing drivers before it reads as chaos (Springs Wellness / Place model): (1) **TIME-driven loop** — autoplay video or animated-gradient bg on its own rAF; (2) **SCROLL-driven scrub** — the pin primitive + parallax + frame-scrub bound to one progress; (3) **POINTER-driven spring** — custom cursor / `mouseAnimation` lerp. Each clock owns DIFFERENT elements. **Never put two clocks on the same element.**

## One ease for the whole site

- **ONE EASE FIXES THE SITE.** Default `air = cubic-bezier(.25,.74,.22,.99)` (Springs 107×; dominant in ERA / AIR / Ever). Pick it ONCE in the motion-score and reuse everywhere.
- Use slow `cubic-bezier(.55,0,.1,1)` ONLY for big morphs — preloader liquid-fill, watercolor crossfade.
- Use `easeOutQuad (.25,.46,.45,.94)` instead of `air` for restrained / Silver-Pinewood-class brands.
- Scrub primitives use `ease:'none'` on the track (must follow the scrollbar 1:1) and put the `air` ease INSIDE the mapped sub-window, not on the track.

## Duration ladder

- **DURATION LADDER** (so stacked moves read as ONE gesture, not a pile): `.4s` micro (hover, dot-toggle) · `.8s` luxury reveal/hover · `1.6s` block · `2.4s` slower/contemplative · `2.8s` title.
- **Stagger:** `60ms` per word/line (title `splitLines`) + `180ms` per group (reveal).
- In scrub mode these durations become timeline POSITION offsets, not wall-clock seconds.

## Stagger = the soul

- **STAGGER IS THE SOUL.** It is what makes 4-5 simultaneous tweens read as one assembling gesture instead of a cheap explode. `puzzle-image` staggers per-tile from center (you recognize the picture before it finishes); `slide-out-img-text` deals cards at `i*0.05`. Cards fired on the SAME keyframe = cheap. **Every stacked move must be staggered, never synchronous.**

## Sequencing within a pass

- **SEQUENCE-WITHIN-A-PASS.** When several scrub moves share one pin, give each a non-overlapping sub-window so they read as a phrase. Example (`slide-out`): cards `0→0.6`, headline-out `0.35→0.60`, headline-in `0.50→0.85`, dot `0.82→1.0`.
- Overlap ONLY where you WANT a cross-dissolve. `media-step-switch` proves the opposite trap — dim old copy BEFORE the seam, clarify new AFTER, never both over the moving wave (two texts fighting = muddy).

## Load vs scroll

- **LOAD = SEQUENCE, SCROLL = PARALLEL** (Springs hero). On entrance, fire micro-beats in order: decode-gate → `1000ms` luxury HOLD → title → sub `+180ms`. On scroll, fire everything in parallel on the shared progress.
- The empty `1000ms` hold before the first line is the restraint that reads as expensive — keep it.
