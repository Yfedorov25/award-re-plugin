# Council brief: how to reach <3% pixel-diff on EVERY frame of a springs.estate section replica

## Goal (user, hard)
Replicate springs.estate 1-в-1: **every scroll frame ≤ 2-3% pixel-diff vs live**, starting with the
Nature→Place section, then every section. Currently 20-30% = "a completely different site — we haven't
replicated even one atom or composition." User wants: decomposition method, research to run, hooks/gates/
rules to add, so the agent stops working blind.

## Current measured state (Nature→Place, 8 checkpoints vs frozen live baselines)
epanel 13.7% · s3b(terrace) 34% · terr 47% · s5b(sunset) 31% · s6shady 35% · s6rec 37% · morph 39% · place 22%.
(Down from 45-83% after fixing header/gradient/geometry this session — but nowhere near 3%.)

## Root causes found (diagnostic, this session)
1. **WRONG/MISSING ASSETS.** Live nature slider uses `nature-slider-md-1/2/3@xxxl.webp` (full-res, on
   https://springs.estate). We only have `md-1` locally + tiny 40px `xs-1/2/3`. We render substitute photos
   (nature-caption, nature-video) → the picture ITSELF differs, not just layout. Pixel-diff can't go <20%
   when the photo is wrong.
2. **GEOMETRY GUESSED, not measured per-element.** Card left/top/width/height, caption pos, font-size were
   eyeballed. Only when I measured live bbox per element (card left 12.5% top 11.5% w37.4 h65; glow top-left
   not bottom) did diffs drop 20-60pts. Never did this systematically.
3. **NO per-element pixel gate.** Existing gates (so3-gate luma/pin, smoothness sawtooth, video-parity
   collision) are all BLIND to per-frame pixel geometry. G18 checks ONE intro frame. Nothing forced
   frame-by-frame ≤X% until the user demanded it.
4. **Phase/timing offsets** make some checkpoints compare our mid-state to live's settled state.
5. **Ribbon/morph shape** hand-authored SVG ≠ live's actual glass ribbon (organic, we approximate).

## Assets/tools available
- Live site https://springs.estate reachable; real full-res webp URLs known from animation-map JSONs.
- `scripts/visual-parity.mjs` (canvas diff vs baseline PNG, ?s= phase jump). `video-parity.mjs` (collision).
- ffmpeg (dense frame extraction). Playwright. asset-cache (107 webp, mostly tiny xs).
- Hooks fire on Stop: G18 SuccessClaim, G21 Progress, G22 VideoParity, G-LINK. All in award-re-plugin/hooks.

## THE QUESTION for the council
Design the SYSTEM (not a one-off fix) to reach ≤3% on every frame, every section:
1. **Decomposition**: how to break "replicate a section" into atomic, independently-verifiable units?
2. **Research to run first**: what must be gathered before building (assets? measurements? DOM?) to not
   work blind?
3. **Hooks/gates/rules**: what NEW automated gate forces per-frame ≤3% and blocks "done" otherwise?
   What rule prevents the wrong-asset and guessed-geometry traps from recurring?
4. **Order of operations**: asset-fidelity vs geometry vs timing — what sequence actually converges to 3%?
5. Is pixel-diff even the right metric everywhere, or does it need masking/structural components?
