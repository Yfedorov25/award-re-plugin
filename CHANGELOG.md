# Changelog

## 0.2.0 — Art-direction gate (the Phoenix fix)
First live test (agro-phoenix.vercel.app) produced a "correct but cheap" site: right engine, ease, copy, no-WebGL — but composition 4/10 vs Vide Infra 9 (assets marooned in voids, no full-bleed, text separate from media, centered-column brochure, cream+orange). Postmortem + a full 6-site metric comparison (POSTMORTEM-phoenix.md, COMPARISON-vi-vs-phoenix.md) showed the gap is almost entirely **composition / art-direction**, which the plugin described but never *enforced*.

Added (adapted-and-RE-tuned from the design-engineer plugin's aesthetic layer):
- **skill `re-art-direction`** + references `_ANTISLOP_design.md` (design anti-slop catalog — names Phoenix's exact failures: cream+orange, centering, framed thumbnails, infra-fonts, display-without-cyrillic) and `_COMPOSITION_CRITIQUE.md` (4 lenses + 4 named tests + composition score).
- **design-grounding hook** (`hooks/design-grounding.js`, PreToolUse Write|Edit) — HARD-BLOCKS writing site `.css/.html/.tsx`… until `.award-re/design-intent.md` exists. Forces full-bleed/text-on-media/anti-slop intent per section before any code. Fail-open.
- **build.md** — new mandatory phase 3.5 ART-DIRECTION GATE (writes design-intent.md).
- **eval-brain** — separate COMPOSITION LENS (full-bleed count / text-on-media / pin / asymmetry / hard-bans), <6/10 = P0. (Phoenix passed 45/50 technical but failed composition — this lens catches it.)
- **PB_media** §11.0 — FULL-BLEED as the #1 rule (100vw/100vh default, no media-in-column-box).
- **CLAUDE.md** §5b — art-direction rule + design hard-bans.

## 0.1.0 — Initial
7 commands, 22 skills, 4 agents, 79 reference files. Strategy-first pipeline, motion-score, variants-prototyping, no-WebGL, Fedoriv copy, 50 award criteria. Knowledge distilled from live teardowns of ERA/AIR/Springs/Silver Pinewood/Ever + quadro/nahirna build lessons.
