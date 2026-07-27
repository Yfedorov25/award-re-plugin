---
name: award-re:discovery
description: Phase 0 strategy BEFORE design — research competitors (for senses only), deep Fedoriv-style interview, positioning, brand platform, copy drafts. Produces brief.md + brand.md.
argument-hint: "[research | interview | positioning | brand | copy]"
---

# award-re — Discovery / Strategy (Phase 0)

<context> #$ARGUMENTS </context>

## Plugin paths & rules
Substitute `${AWARD_RE_PLUGIN_ROOT}` from context. Read & obey `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md`. Before every AskUserQuestion, end the message with an empty spacer line.

## Pre-read (BLOCKING)
Read these and follow them as the method:
- `${AWARD_RE_PLUGIN_ROOT}/skills/discovery-strategy/SKILL.md` (the full Phase-0 method)
- `${AWARD_RE_PLUGIN_ROOT}/skills/research-engine/SKILL.md` (how to research under the hood)
- `${AWARD_RE_PLUGIN_ROOT}/skills/copywriting/SKILL.md` (Fedoriv voice + antislop)
- `${AWARD_RE_PLUGIN_ROOT}/skills/client-assets/SKILL.md` (what to ask the client for)
If `.award-re/config.yaml` is missing, tell the user to run `/award-re:award` first.

## Argument routing
`research` / `interview` / `positioning` / `brand` / `copy` → jump to that step. Else run the full sequence.

## Sequence (per discovery-strategy SKILL)
1. **Research** (research-engine): competitors (3-7), their pricing/messaging/weak spots, audience signals, pains — via WebSearch+WebFetch (always), browse/Chrome for deep competitor probes, Apify/scrape for mass review-mining, Higgsfield for visual refs. CLAUDE.md §0: competitors → SENSES ONLY, never visual. Cite every source, invent nothing.
2. **Interview** — deep Fedoriv-style conversation (the 7 question blocks in the skill). Open questions, dig "why", record the client's VERBATIM phrasing (it becomes copy). Guided: AskUserQuestion batches of ≤4. Autopilot: ask the critical ones, infer the rest from research, flag assumptions.
3. **Positioning** — 4 dimensions (audience / category / difference / Big Idea) + map each pain to a future section.
4. **Brand platform** — essence, promise, tone, archetype, 2-4 signature words, emotional arc.
5. **Copy drafts** — Fedoriv voice, MULTIPLE hero variants, run every line through antislop. Length free.
6. **Client-assets pass** — surface the asset checklist; mark have/awaiting/won't-have.

## Output (write to disk)
- `.award-re/brief.md` — research facts (cited) + interview quotes + audience + pains + competitors.
- `.award-re/brand.md` — positioning + platform + tone + signature words + Big Idea + hero copy variants.
- Update `.award-re/config.yaml`: fill `brand:` (accent/base/deep if decided), set `resume: { phase: discovery-done }`.

## Handoff
When done, recommend `/award-re:build` (it consumes brief.md + brand.md). In Guided mode, confirm each deliverable with the user before writing.
