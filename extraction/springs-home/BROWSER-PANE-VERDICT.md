# S14 experiment — Browser pane vs Playwright (VERDICT)

Tested built-in Claude Code **Browser pane** (mcp__Claude_Browser__*) on the springs track.

## What was tested
1. Our skeleton `http://localhost:8873/?s=900` and `?intro=0&idt=12159` (desktop 1440x900).
2. Live `https://springs.estate` (loaded first try, no blocking permission card; WebGL 5 canvases render).
3. Scroll-drive of the live choreography.

## Findings
- **Renders our skeleton fully**: engine boots (`__ENGINE__()` reachable via javascript_tool → mode/s/introShown), all 111 imgs load, poses `?s=`/`?intro=&idt=` visible. Screenshot OK.
- **Renders the live site fully**, INCLUDING WebGL canvases (nature collage is the live composite). Intro auto-morph plays; phase differs run-to-run (pastka 49 confirmed live — the collage drifts, cards reshuffle).
- **CANNOT drive live choreography**: `computer scroll` (wheel) → live `scrollY` stays 0 (virtual-scroll/Lethargy consumes it, pastka 5). Repeated bursts did not pass the intro gate nor advance the odometer. No programmatic CDP `Input.synthesizeScrollGesture(gestureSourceType:'mouse')` exposed. Touch-scroll would flip live to touch-mode (kills choreography).
- **Screenshots are downscaled to 800x500**, NOT our 1440x900 parity resolution → cannot feed canvas-diff / SSIM / curve-compare.

## VERDICT — what Browser pane COVERS
- Visual overview & spot-checks of BOTH our poses and the live reference (side-by-side via two tabs).
- Debug of OUR render: engine state, DOM geometry, console, network — all via javascript_tool/read_page.
- Eyeballing the live intro-morph auto-drift phases (which card shows what) — a real aid for S14(a) card-crop debugging.

## What it does NOT cover (stays scripted + numeric)
- Live numeric extraction (live-shots via CDP mouse gestures, rAF transient recorders, timing-map) — needs programmatic CDP drive Browser pane doesn't give.
- Visual-parity canvas-diff / SSIM / curve-compare gates — need 1:1 resolution PNGs; Browser pane screenshots are downscaled.
- Frozen same-run intro baseline (pastka 49) — live auto-drift phase not controllable here.

**Bottom line:** Browser pane is a genuine ADD for qualitative visual review + our-side debug. It does NOT replace playwright: all track GATES remain scripted and numeric. Fallback to `npm i playwright && npx playwright install chromium` still required for extraction/gates. Do NOT substitute "looked with my eyes in the pane" for pixel-diff (law unchanged).
