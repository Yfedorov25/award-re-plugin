---
id: orbit-stage-3d
name: "Interactive 3D orbit stage (model + tuning panel)"
level: 1
kind: component
status: candidate
entry:
  call: "OrbitStage3D.init(target, options)  // target = the stage container el or selector (default '#orbit-stage'); the engine builds the WebGL renderer canvas into .orbit__stage and wires every [data-state] / [data-knob] / [data-bg] in the panel. options all optional: { models:{stateA,stateB}, initialState, toggleLabels, dracoPath, sunPos, sunColor, sunIntensity, hemiIntensity, exposure, envIntensity, fogColor, fogDensity, skyTop, skyBot, fov, far, damping, minDistance, maxDistance, maxPolarAngle, framePullback, autoRotate, autoRotateSpeed, ground }"
  module: esm
  returns: "{ THREE, renderer, scene, camera, controls, show, setExposure, setSun, setShadows, setAutoRotate, setSpin, setFov, setBg, setGround, invalidate, resize, destroy }  (or { error } if WebGL is unavailable; then __LAB_OK__ = false)"
meaning:
  what: "AN INTERACTIVE 3D ORBIT STAGE. LEFT ~70% is a LIVE 3D scene you ORBIT with the mouse (a Draco-glb house model on its full yard); RIGHT ~30% is a TUNING panel of controls that change the scene in REAL TIME (Світло: exposure + sun + shadows; Камера: autorotate + speed + fov; Сцена: background dark-gradient/cream/grid + ground plane); plus a signature floating STATE TOGGLE that swaps between two model states (here: roof-terrace ON vs OFF) with ZERO house-jump (the two glb are identically aligned, same X/Y, same Z-min; only the toggled feature differs; the second state lazy-loads on the first toggle). three 0.169 + GLTFLoader + DRACOLoader + OrbitControls + procedural Sky (IBL only). ACESFilmic, SRGB, soft PCF shadows. RENDER-ON-DEMAND (only draws on change/orbit/autorotate -> idle = 0 GPU = smooth). FIXED natural daylight (day/night was tried and removed as unrealistic). A lazy placeholder box stands in if a glb is missing. WebGL is ALLOWED for this isolated 3D section — it OVERRIDES the plugin's usual no-WebGL rule BECAUSE it is a self-contained 3D stage, not page chrome."
  when: "A RE site has a real 3D model of the building AND a real configurable option the buyer wants to explore from every side — a roof terrace on/off, a facade material/colour variant, a layout state — that renders alone cannot let them spin and flip live. The one place WebGL is worth its weight: when the value IS the interactivity (orbit + a true toggle), not a still frame."
  lands: "I can see the house from every side and flip the option live. The buyer drags to walk around their future home, watches the light/shadows, then flips the roof terrace on and off in place with no jump — it reads as a confident, configurator-grade moment, the proof that the option is real, not a promise."
  not_when: "No 3D model available, or no real toggle-able option to explore (per the council, then use renders — stacked-pairs / focus-render-switch / media-step-switch — never a 3D stage for its own sake). Page chrome / hero / a scroll-driven beat (the no-WebGL rule still holds everywhere else). A section that must be pinned to the scroll. Never reach for video.currentTime scrubbing."
source:
  grammar: "QUADRO slide-lab — orbit3d-quadro: a Vector-Bloom interactive 3D block (live orbit stage + real-time tuning panel + a two-state glb toggle), the owner-approved working viewer; frozen engine contract in apps/quadro/public/3d/README-3D-STATE.md"
  recording: "apps/quadro/public/slide-lab/orbit3d-quadro.html"
  registry_ref: []
stack: "three 0.169 (importmap/unpkg) + GLTFLoader + DRACOLoader + OrbitControls + procedural Sky (IBL only)"
webgl: true
motion_props: [transform, opacity, clip]
trigger: "mouse-driven OrbitControls (damped) + optional auto-rotate; a render-on-demand rAF loop draws only on change/orbit/autorotate (NOT scroll-driven, NOT pinned)"
timing_layer: [A-ambient]
owns_pin: false
page_beat: [proof, material]
combines_with: [reveal, scroll-indicator]
anti_combos: [second-pin]
gated_by: [R_anti_combos, R_perf_limits, R_timing_layers]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "GL-READINESS PROBE (NOT the DOM pixel-audit gate): window.__LAB_OK__ becomes TRUE once the WebGLRenderer is up AND at least one model (or the lazy placeholder box) is in the scene; it is set FALSE if WebGL init throws — the lab never fake-passes when GL is down"
  - "MUST be eye-checked in a REAL browser — headless WebGL (swiftshader) is slow + unreliable with this model, so library-verify SKIPS this lab (webgl:true -> status:candidate); the headless gate is intentionally not the proof here"
  - "LEFT ~70% live orbit stage (mouse-drag orbit, wheel zoom, damped) + RIGHT ~30% tuning panel whose [data-knob]/[data-bg] controls change the scene in real time; a floating [data-state] STATE TOGGLE swaps two identically-aligned glb with ZERO house-jump (second state lazy-loads on first toggle)"
  - "engine contract held 1:1: three 0.169 + GLTFLoader + DRACOLoader + OrbitControls + procedural Sky IBL; ACESFilmic + SRGB + soft PCF shadows; pixelRatio min(dpr,2); RENDER-ON-DEMAND (idle = 0 GPU); FIXED daylight (sun (70,120,50) #fff4e6 i2.4, hemi 0.45, env 1.0, exposure 1.0, FogExp2 #cfdae8 0.00055, blue gradient bg)"
  - "camera fov 42 far 20000; orbit damping 0.08, minDist 14 maxDist 320, maxPolarAngle ~0.49 pi; frameModel centers X/Z, base y=0, pulls back ~0.9*max(size.x,size.z)"
  - "WebGL allowed ONLY for this isolated 3D stage (overrides the no-WebGL rule); NO backdrop-filter / mask-composite / mix-blend over the moving 3D canvas; transform/opacity/clip only on chrome; reduced-motion -> autorotate off; no video.currentTime"
  - "lazy placeholder: a stand-in box renders if a glb is missing so the viewer still proves out and __LAB_OK__ still flips true"
verify: "lab.html#__LAB_OK__  (GL-readiness probe + a real-browser eye check; headless GL step SKIPPED by library-verify for webgl:true candidates)"
---

# orbit-stage-3d — interactive 3D orbit stage (model + tuning panel)

> **BASE = orbit3d-quadro** (owner-approved working viewer). A Vector-Bloom-style
> **interactive 3D block** for a real-estate site. **LEFT ~70%** is a **live 3D
> scene you ORBIT with the mouse** (a Draco-glb house on its full yard). **RIGHT
> ~30%** is a **TUNING panel** of controls that change the scene in **real time**,
> plus a **signature floating STATE TOGGLE** that swaps between two model states
> (here: **roof-terrace ON vs OFF**) with **zero house-jump**.
> Source: `apps/quadro/public/slide-lab/orbit3d-quadro.html`.
> Frozen engine contract + tuned params: `apps/quadro/public/3d/README-3D-STATE.md`.

## The plugin's FIRST WebGL technique — why the no-WebGL rule is overridden here
The plugin's grammar is **no-WebGL** everywhere — page chrome, scroll beats,
heroes, transitions. **This technique is the one deliberate exception.** WebGL is
allowed **only for this isolated 3D section** **because it is a self-contained 3D
stage, not page chrome**: it does not drive scroll, it does not sit under a pin,
it does not composite over a moving surface. The value here **is** the
interactivity — orbit the house, flip a real option live — which a still render
cannot give. Outside this stage the no-WebGL rule still holds.

This is why it is recorded as **`status: candidate`, `webgl: true`**: a GL
technique **cannot pass the DOM pixel-audit gate** the other components use.
Acceptance is a **GL-readiness probe** (`window.__LAB_OK__`) **plus a real-browser
eye check** — see the gate note below.

## The move (what the eye sees)
1. **Orbit** — drag to walk around the house; wheel to zoom. Damped (0.08), capped
   below the horizon so you never go under the ground. A render-on-demand loop
   means it only draws while you move it — idle is **0 GPU**, perfectly smooth.
2. **Tune** — the right panel changes the scene live: **Світло** (exposure, sun
   intensity, shadows), **Камера** (auto-rotate + speed, field of view), **Сцена**
   (background dark-gradient / cream / grid, ground plane).
3. **Flip the option** — the signature floating pill toggles **Без тераси <->
   Тераса на даху**. The two glb are **identically aligned** (same X/Y, same
   Z-min; only the roof differs), so the house **never jumps** — only the feature
   appears/disappears. The second state **lazy-loads on the first toggle**.
4. **Fixed daylight** — one clean midday sun + Sky IBL + a soft blue gradient
   backdrop. (Day/night was **tried and removed** — it never read realistic.)

## The gate this technique uses — GL-readiness probe, NOT the pixel gate
Headless WebGL (swiftshader) is **slow and unreliable** with this multi-MB model,
so the usual `library-verify` headless `__LAB_OK__` pixel-audit **is intentionally
SKIPPED** for `webgl:true` candidates (the verify script does this automatically:
`if (e.webgl) skip('webgl:true — headless GL probe skipped (status candidate)')`).
Instead:
- `component.js` sets `window.__LAB_OK__ = true` **only** once the
  `WebGLRenderer` is up **and** at least one model (or the lazy placeholder box)
  is in the scene; it sets it `false` if WebGL init throws. The lab **never
  fake-passes** when GL is down.
- The real acceptance is a **human eye-check in a REAL browser** (Chrome/Safari):
  the house orbits smoothly, every knob moves the scene, and the terrace toggle
  flips with no jump.

## ASSET DOCTRINE (a hard-won lesson — record it with the technique)
The models start as a **heavy architect FBX with MISSING textures**. The pipeline
that produces the two clean, aligned, web-weight glb:
1. **Blender → cull.** Remove neighbours, interior furniture, stray geometry, and
   the far backdrop. Keep ONLY the subject house + its site.
2. **Keep the FULL yard on the ground** (paving, driveway/parking, fence,
   plantings, the round feature). It grounds the house and reads as "the plot".
3. **Do NOT add an overlapping ground plane** in Blender — it z-fights the FBX
   ground and **flickers**. (The viewer adds its own thin `ShadowMaterial`
   shadow-catcher at `y=0`, below the model — that is fine; a second *opaque*
   ground co-planar with the FBX ground is the flicker trap.)
4. **Assign PBR materials BY NAME** — `glass`, `anthracite`, `wood`, `stone`,
   `metal`, `concrete`, `grass` — because the original photo-textures are gone.
   Match the facade palette; the interior/props reuse the same materials (i2i
   palette discipline).
5. **Draco level 7 export.** Both state-glb **identically aligned**: same X/Y,
   same **Z-min**; the **only** difference is the toggled feature (the roof
   terrace deck/railing/planters/penthouse + furniture props), so the in-viewer
   toggle never makes the house jump.
6. **Furniture / detail = low-poly props** reusing the assigned materials (no new
   texture maps). For the terrace state: deck, railing, structural planters,
   penthouse + lounge / dining / sunbeds / pergola / umbrella / potted planters /
   bar / firepit / lanterns.
7. **Target ~3-6 MB each** (the QUADRO pair is 4.4 MB noterrace / 5.1 MB terrace).
   Watch the download budget; the second state lazy-loads so the first paint is
   one glb only.

## Hard rules
- **WebGL allowed ONLY here** (the isolated 3D stage). The no-WebGL rule still
  holds for all page chrome / scroll beats / heroes / transitions.
- **`owns_pin: false`** — this is **not** scroll-driven and **not** pinned. It is
  an A-ambient interactive stage. Do not put it under another section's pin.
- **No `backdrop-filter` / mask-composite / mix-blend over the moving 3D canvas.**
  `transform` / `opacity` / `clip` only on the chrome. (The one scoped exception
  is the floating toggle pill's own translucent blur plate — small, off the
  moving-surface footprint, kept 1:1 with the source.)
- **Render-on-demand** — never run an unconditional draw loop. Draw only on
  change / orbit / autorotate, so idle is 0 GPU.
- **FIXED daylight only** — do not reintroduce a day/night cycle (it read fake).
- **Identically-aligned glb** — both states share the export transform (same X/Y,
  same Z-min) so the toggle never jumps. The second lazy-loads on first toggle.
- **No `video.currentTime`.** `prefers-reduced-motion` → autorotate off.
- Ukrainian Fedoriv copy, zero em-dashes in visible copy.

## DOM structure (the class contract)
```
#orbit-stage.orbit-stage-3d        grid 1fr / 320px (LEFT ~70% stage · RIGHT ~30% panel)
  ├ .orbit__stage                  the live 3D stage (engine appends canvas.orbit__canvas)
  │  ├ .orbit__brand               kicker + Fraunces serif title (italic-bronze keyword)
  │  ├ .orbit__toggle              the signature floating STATE TOGGLE (two [data-state] btns)
  │  ├ .orbit__hint                "тягніть, щоб обертати · колесо = зум"
  │  └ .orbit__loading             "Завантаження моделі…" (fades on first load)
  └ .orbit__panel                  the TUNING panel
     ├ Дах:    .orbit__seg  [data-state]  (state toggle, synced with the pill)
     ├ Світло: [data-knob=exposure] range · [data-knob=sun] range · [data-knob=shadows] switch
     ├ Камера: [data-knob=autorotate] switch · [data-knob=spin] range · [data-knob=fov] range
     └ Сцена:  [data-bg] seg (dark/cream/grid) · [data-knob=ground] switch
```
`OrbitStage3D.init('#orbit-stage', opts)` builds the renderer into `.orbit__stage`
and wires every `[data-state]` / `[data-knob]` / `[data-bg]` it finds, so the
panel markup is the contract and the engine is data-driven.

## Entry point (the truth on disk)
- `OrbitStage3D.init(target, options)` — resolves the stage container (el or
  selector, default `#orbit-stage`), creates the renderer / scene / camera /
  orbit / light rig / ground, loads `options.models.stateA` first (lazy-loads
  `stateB` on the first toggle), applies the fixed daylight, and wires the
  chrome. Returns the control surface (`show`, `setExposure`, `setSun`,
  `setShadows`, `setAutoRotate`, `setSpin`, `setFov`, `setBg`, `setGround`,
  `invalidate`, `resize`, `destroy`) plus the raw `THREE` / `renderer` / `scene`
  / `camera` / `controls` for a host port. Returns `{ error }` if WebGL is
  unavailable (and sets `window.__LAB_OK__ = false`). It is an **ES module**
  (`module: esm`) — an importmap must resolve `three` + `three/addons/` before
  it loads; a React/Next port `import { init } from './component.js'`.

## Gotchas
- **Do not skip the importmap.** `component.js` is an ES module that imports
  `three` and `three/addons/...`; without the importmap the lab will not boot.
- **Keep the two glb identically aligned** at export time — if their X/Z centre
  or Z-min differ, the toggle will jump. The viewer's `alignTo()` re-centres on
  load as a safety net, but the export should already match.
- **One overlapping ground = flicker.** Keep the FBX yard; let the viewer add its
  own thin shadow-catcher below the model. Never stack a second opaque ground.
- **Do not eye-check in headless** — headless WebGL is slow/unreliable here. The
  `__LAB_OK__` probe is GL-readiness only; the real proof is a human in a real
  browser.

## Variants
- **none yet.** A facade-material toggle or a layout-state toggle would be a
  params-over-base variant (different `models` + `toggleLabels`); record one when
  a real second site uses it.

## Files
- `lab.html` — self-contained runnable demo: importmap three, full stage + tuning
  panel markup, calls `init('#orbit-stage', {models})`, loads the two glb via the
  `renders` symlink, reports the `__LAB_OK__` GL-readiness probe.
- `component.js` / `component.css` — the canonical drop-in engine + skin.
- `tokens.json` — the knob contract (sun, exposure, fov, fog, camera, draco path,
  the two model states, etc).
- `renders` symlink → `apps/quadro/public/proto` (holds `quadro-noterrace.glb` +
  `quadro-terrace.glb`).
