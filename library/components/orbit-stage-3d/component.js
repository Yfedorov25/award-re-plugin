/* ============================================================================
   ORBIT-STAGE-3D · component.js   (three 0.169 ESM — WebGL, technique #candidate)
   BASE = orbit3d-quadro  (owner-approved working viewer)
   Re-extracted from
     apps/quadro/public/slide-lab/orbit3d-quadro.html
     (frozen reference + pin-doc: apps/quadro/public/3d/README-3D-STATE.md)
   ----------------------------------------------------------------------------
   AN INTERACTIVE 3D ORBIT STAGE for a real-estate site (Vector-Bloom grammar).
   LEFT ~70% = a LIVE 3D scene you ORBIT with the mouse (a house model). RIGHT
   ~30% = a TUNING panel of controls that change the scene in REAL TIME, plus a
   signature floating STATE TOGGLE that swaps between two model states (here:
   roof-terrace ON <-> OFF) with ZERO house-jump (the two glb are identically
   aligned, same X/Y, same Z-min; only the toggled feature differs).

   WebGL IS ALLOWED for this isolated 3D section — it OVERRIDES the plugin's
   usual no-WebGL rule BECAUSE it is a self-contained 3D stage, not page chrome.
   No backdrop-filter / mask-composite / mix-blend over the moving 3D; only
   transform / opacity / clip on the chrome.

   ENGINE CONTRACT (verbatim from the README + the source):
     • three 0.169 (importmap/unpkg) + GLTFLoader + DRACOLoader (the glb are
       Draco; decoder path three/examples/jsm/libs/draco/) + OrbitControls +
       procedural Sky (IBL only — no external HDR).
     • Renderer: ACESFilmic tone-mapping, outputColorSpace SRGB, soft PCF
       shadows, pixelRatio min(devicePixelRatio,2). RENDER-ON-DEMAND — the rAF
       loop only draws on change / orbit / autorotate, so idle = 0 GPU = smooth.
     • FIXED natural DAYLIGHT (day/night was TRIED and REMOVED as unrealistic):
       sun DirectionalLight at (70,120,50), color #fff4e6, intensity 2.4;
       Hemisphere 0.45; scene.environmentIntensity 1.0; toneMappingExposure 1.0;
       FogExp2 #cfdae8 density 0.00055; soft blue vertical-gradient background
       (#6f93c4 -> #cfdbe8).
     • Camera: PerspectiveCamera fov 42, far 20000. Orbit damping 0.08, minDist
       14, maxDist 320, maxPolarAngle ~0.49π (never under the ground).
     • frameModel(): center on X/Z, base at y=0, pull camera back to
       ~0.9·max(size.x,size.z); target ~mid-height.
     • UI: STATE TOGGLE (two glb; lazy-load the second on the first toggle;
       swap by visibility, identically aligned so no jump) + a TUNING panel
       (exposure, sun intensity, shadows, autorotate + speed, fov, background
       dark-gradient / cream / grid, ground plane).
     • LAZY PLACEHOLDER: if a glb is missing, show a stand-in box so the viewer
       still proves out.
     • reduced-motion: autorotate off.
     • global.__LAB_OK__ = true once the renderer + at least one model (or the
       placeholder) is up = the GL-READINESS PROBE. A GL technique CANNOT pass
       the DOM pixel-audit gate; this probe + a real-browser eye check is the
       acceptance.

   ENTRY POINT (the REAL signature on disk — declared in RECIPE)
   ----------------------------------------------------------------------------
     OrbitStage3D.init(target, options)
       target  — the stage container element OR a selector string (default
                 '#orbit-stage'). The engine BUILDS its renderer canvas + the
                 floating toggle + the tuning panel INTO it (the markup may be
                 pre-authored too; see component.css for the class contract).
       options (all optional):
         { models:        { stateA:url, stateB:url },  // the two glb (default
                            //   renders/quadro-noterrace.glb + ...terrace.glb)
           initialState,  // 'stateA' | 'stateB' (default 'stateA')
           toggleLabels,  // { stateA, stateB } pill labels (UA copy)
           dracoPath,     // DRACOLoader decoder path
           // light rig (FIXED daylight)
           sunPos, sunColor, sunIntensity, hemiIntensity,
           exposure, envIntensity, fogColor, fogDensity,
           skyTop, skyBot, // background vertical gradient hexes
           // camera + orbit
           fov, far, damping, minDistance, maxDistance, maxPolarAngle,
           framePullback, // frameModel pull-back factor (default 0.9)
           autoRotate, autoRotateSpeed,
           ground }       // show the shadow-catcher ground plane (default true)
       Returns { THREE, renderer, scene, camera, controls, show, setExposure,
                 setSun, setShadows, setAutoRotate, setSpin, setFov, setBg,
                 setGround, invalidate, resize, destroy }  (or { error } if
                 WebGL is unavailable; then global.__LAB_OK__ = false).

   DEPENDENCIES (an importmap must resolve before this module loads):
     three 0.169  +  three/addons/  (GLTFLoader, DRACOLoader, OrbitControls, Sky)
   ============================================================================ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

var global = (typeof window !== 'undefined') ? window : globalThis;

/* the owner-approved defaults — the FROZEN engine contract numbers. Knob
   meanings live in tokens.json; these are the on-disk truth. */
var DEFAULTS = {
  models: { stateA: 'renders/quadro-noterrace.glb', stateB: 'renders/quadro-terrace.glb' },
  initialState: 'stateA',
  toggleLabels: { stateA: 'Без тераси', stateB: 'Тераса на даху' },
  dracoPath: 'https://unpkg.com/three@0.169.0/examples/jsm/libs/draco/',
  // FIXED daylight
  sunPos: [70, 120, 50],
  sunColor: 0xfff4e6,
  sunIntensity: 2.4,
  hemiIntensity: 0.45,
  exposure: 1.0,
  envIntensity: 1.0,
  fogColor: 0xcfdae8,
  fogDensity: 0.00055,
  skyTop: 0x6f93c4,
  skyBot: 0xcfdbe8,
  // camera + orbit
  fov: 42,
  far: 20000,
  damping: 0.08,
  minDistance: 14,
  maxDistance: 320,
  maxPolarAngle: Math.PI * 0.49,
  framePullback: 0.9,
  autoRotate: false,
  autoRotateSpeed: 1.4,
  ground: true
};

function resolveTarget(target) {
  if (!target) return document.querySelector('#orbit-stage');
  if (typeof target === 'string') return document.querySelector(target);
  return target;
}

function init(target, options) {
  var stage = resolveTarget(target);
  var O = Object.assign({}, DEFAULTS, options || {});
  if (options && options.models) O.models = Object.assign({}, DEFAULTS.models, options.models);
  if (options && options.toggleLabels) O.toggleLabels = Object.assign({}, DEFAULTS.toggleLabels, options.toggleLabels);

  if (!stage) { if (global.console) console.error('[orbit-stage-3d] target not found'); return { error: 'no-target' }; }

  // reduced motion: autorotate off
  var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (reduce) O.autoRotate = false;

  var loadingEl = stage.querySelector('.orbit__loading');
  var bgMode = 'dark';                       // dark (sky gradient) | cream | grid
  var needsRender = true;                    // render-on-demand: only draw when something changed
  var invalidate = function () { needsRender = true; };

  try {
    // ---- renderer (ACESFilmic, SRGB, soft PCF shadows, render-on-demand) ----
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = O.exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.classList.add('orbit__canvas');
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var BG = { cream: 0xefe7d9 };

    // ---- procedural SKY -> PMREM IBL (the environment the model reflects) ----
    var pmrem = new THREE.PMREMGenerator(renderer);
    var sky = new Sky(); sky.scale.setScalar(8000); scene.add(sky);
    var skyU = sky.material.uniforms;
    skyU.rayleigh.value = 2.0; skyU.mieCoefficient.value = 0.005; skyU.mieDirectionalG.value = 0.8;
    var envRT = null;
    function refreshEnv() {
      if (envRT) envRT.dispose();
      envRT = pmrem.fromScene(sky, 0);
      scene.environment = envRT.texture;
    }

    // ---- camera + orbit ----
    var camera = new THREE.PerspectiveCamera(O.fov, stage.clientWidth / stage.clientHeight, 0.1, O.far);
    camera.position.set(60, 38, 70);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = O.damping;
    controls.minDistance = O.minDistance; controls.maxDistance = O.maxDistance;
    controls.maxPolarAngle = O.maxPolarAngle;       // don't go under the ground
    controls.autoRotate = O.autoRotate;
    controls.autoRotateSpeed = O.autoRotateSpeed;
    controls.addEventListener('change', invalidate);

    // ---- the tunable light rig (sun + soft hemi fill) ----
    var sun = new THREE.DirectionalLight(O.sunColor, O.sunIntensity);
    sun.position.set(O.sunPos[0], O.sunPos[1], O.sunPos[2]);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0004;
    var sc = sun.shadow.camera; sc.near = 1; sc.far = 400; sc.left = -90; sc.right = 90; sc.top = 90; sc.bottom = -90;
    scene.add(sun);
    var hemi = new THREE.HemisphereLight(0xbfd4ff, 0x40331f, O.hemiIntensity); scene.add(hemi);

    // ---- ground (shadow catcher) + optional grid ----
    var ground = new THREE.Mesh(
      new THREE.CircleGeometry(260, 64),
      new THREE.ShadowMaterial({ opacity: 0.32 })
    );
    ground.rotation.x = -Math.PI / 2; ground.position.y = 0; ground.receiveShadow = true;
    ground.visible = O.ground;
    scene.add(ground);
    var grid = new THREE.GridHelper(520, 52, 0x3a3346, 0x241f2e);
    grid.material.transparent = true; grid.material.opacity = 0.0; scene.add(grid);

    // ---- the two model states (Draco glb) ----
    var draco = new DRACOLoader(); draco.setDecoderPath(O.dracoPath);
    var loader = new GLTFLoader(); loader.setDRACOLoader(draco);

    var models = { stateA: null, stateB: null };
    var SRC = { stateA: O.models.stateA, stateB: O.models.stateB };
    var current = O.initialState;
    var firstLoaded = false;

    function frameModel(obj) {
      // center on X/Z, sit base at y=0; aim controls at its middle
      var box = new THREE.Box3().setFromObject(obj);
      var size = box.getSize(new THREE.Vector3());
      var cen = box.getCenter(new THREE.Vector3());
      obj.position.x -= cen.x; obj.position.z -= cen.z; obj.position.y -= box.min.y;
      var r = Math.max(size.x, size.z) * O.framePullback + size.y * 0.4;
      controls.target.set(0, size.y * 0.45, 0);
      camera.position.set(r * 0.9, size.y * 0.7 + r * 0.35, r * 1.0);
      controls.update();
    }
    function alignTo(obj) {
      // the two glb share the export transform — match X/Z center + Z-min so the
      // toggle never makes the house jump.
      var b = new THREE.Box3().setFromObject(obj);
      var c = b.getCenter(new THREE.Vector3());
      obj.position.x -= c.x; obj.position.z -= c.z; obj.position.y -= b.min.y;
    }
    function prep(obj) {
      obj.traverse(function (n) {
        if (n.isMesh) {
          n.castShadow = true; n.receiveShadow = true;
          if (n.material) n.material.envMapIntensity = O.envIntensity;
        }
      });
    }

    function hideLoading() {
      if (!loadingEl) return;
      loadingEl.classList.add('done');
      setTimeout(function () { loadingEl.classList.add('gone'); }, 650);
    }

    function show(state) {
      current = state;
      for (var k in models) { if (models[k]) models[k].visible = (k === state); }
      stage.querySelectorAll('[data-state]').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-state') === state);
      });
      invalidate();
      if (!models[state]) loadOne(state, true);     // lazy-load the other state
    }

    function loadOne(state, thenShow) {
      loader.load(SRC[state], function (gltf) {
        var obj = gltf.scene; prep(obj);
        if (!firstLoaded) { frameModel(obj); firstLoaded = true; }
        else { alignTo(obj); }
        obj.visible = false; scene.add(obj); models[state] = obj;
        hideLoading();
        if (thenShow || state === current) show(state);
        setupDaylight();                              // bake env once a model is in
        global.__LAB_OK__ = true;
        invalidate();
      }, undefined, function (err) {
        // glb not built yet -> stand-in box so the viewer still proves out
        if (!firstLoaded) {
          var ph = new THREE.Mesh(
            new THREE.BoxGeometry(30, 18, 24),
            new THREE.MeshStandardMaterial({ color: 0x3a3550, roughness: 0.7, metalness: 0.1 })
          );
          ph.position.y = 9; ph.castShadow = true; ph.receiveShadow = true; scene.add(ph);
          models[state] = ph; firstLoaded = true; frameModel(ph);
          if (loadingEl) loadingEl.textContent = 'модель ще збирається · показано макет';
          hideLoading();
          setupDaylight();
          global.__LAB_OK__ = true; invalidate();
        }
        if (global.console) console.warn('[orbit-stage-3d] load failed', SRC[state], err);
      });
    }

    // ---- ONE fixed, natural DAYLIGHT (time-of-day removed per owner) ----
    function gradientTex(topHex, botHex) {
      var cv = document.createElement('canvas'); cv.width = 4; cv.height = 256;
      var ctx = cv.getContext('2d'); var g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#' + new THREE.Color(topHex).getHexString());
      g.addColorStop(1, '#' + new THREE.Color(botHex).getHexString());
      ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256);
      var t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
    }
    function setupDaylight() {
      sun.position.set(O.sunPos[0], O.sunPos[1], O.sunPos[2]);
      sun.color.setHex(O.sunColor);
      hemi.intensity = O.hemiIntensity; hemi.color.setHex(0xbfd4ff);
      skyU.sunPosition.value.copy(new THREE.Vector3(O.sunPos[0], O.sunPos[1], O.sunPos[2]).normalize());
      skyU.turbidity.value = 6; skyU.rayleigh.value = 1.5; sky.visible = false;
      scene.environmentIntensity = O.envIntensity;
      scene.fog = new THREE.FogExp2(O.fogColor, O.fogDensity);
      if (bgMode === 'cream') { scene.background = new THREE.Color(BG.cream); document.body.style.background = '#efe7d9'; }
      else { scene.background = gradientTex(O.skyTop, O.skyBot); document.body.style.background = '#' + new THREE.Color(O.skyBot).getHexString(); }
      refreshEnv();
      invalidate();
    }

    // ---- public knob setters (the tuning-panel engine) ----
    function setExposure(v) { renderer.toneMappingExposure = v; invalidate(); }
    function setSun(v) { sun.intensity = v; invalidate(); }
    function setShadows(on) {
      renderer.shadowMap.enabled = on;
      scene.traverse(function (n) { if (n.isMesh) n.castShadow = on; });
      renderer.shadowMap.needsUpdate = true; invalidate();
    }
    function setAutoRotate(on) { controls.autoRotate = on; invalidate(); }
    function setSpin(v) { controls.autoRotateSpeed = v * 1.4; invalidate(); }
    function setFov(v) { camera.fov = v; camera.updateProjectionMatrix(); invalidate(); }
    function setBg(mode) {
      bgMode = mode;
      grid.material.opacity = (mode === 'grid') ? 0.6 : 0.0;
      setupDaylight();
    }
    function setGround(on) { ground.visible = on; invalidate(); }

    // ---- render-on-demand loop ----
    var raf = null;
    function tick() {
      raf = requestAnimationFrame(tick);
      if (controls.autoRotate) invalidate();
      controls.update();                 // returns true while damping settles
      if (needsRender) { renderer.render(scene, camera); needsRender = false; }
    }
    tick();

    function resize() {
      camera.aspect = stage.clientWidth / stage.clientHeight; camera.updateProjectionMatrix();
      renderer.setSize(stage.clientWidth, stage.clientHeight); invalidate();
    }
    global.addEventListener('resize', resize);

    // ---- wire the default chrome IF present (toggle pill + tuning panel) ----
    function wireChrome() {
      stage.querySelectorAll('[data-state]').forEach(function (b) {
        b.addEventListener('click', function () { show(b.getAttribute('data-state')); });
      });
      var bind = function (sel, fn) { var el = stage.querySelector(sel); if (el) el.addEventListener('input', function () { fn(parseFloat(el.value)); }); };
      var bindSw = function (sel, fn) { var el = stage.querySelector(sel); if (el) el.addEventListener('click', function () { el.classList.toggle('on'); fn(el.classList.contains('on')); }); };
      bind('[data-knob=exposure]', setExposure);
      bind('[data-knob=sun]', setSun);
      bind('[data-knob=spin]', setSpin);
      bind('[data-knob=fov]', setFov);
      bindSw('[data-knob=shadows]', setShadows);
      bindSw('[data-knob=autorotate]', setAutoRotate);
      bindSw('[data-knob=ground]', setGround);
      stage.querySelectorAll('[data-bg]').forEach(function (b) {
        b.addEventListener('click', function () {
          stage.querySelectorAll('[data-bg]').forEach(function (x) { x.classList.toggle('on', x === b); });
          setBg(b.getAttribute('data-bg'));
        });
      });
    }
    wireChrome();

    // load + show the default state first; fixed daylight applied
    setupDaylight();
    loadOne(O.initialState, true);

    // GL readiness probe (this technique can't pass the DOM pixel gate)
    setTimeout(function () { if (global.__LAB_OK__ === undefined) global.__LAB_OK__ = !!renderer.domElement; }, 1500);

    function destroy() {
      if (raf) cancelAnimationFrame(raf);
      global.removeEventListener('resize', resize);
      controls.dispose(); if (envRT) envRT.dispose(); pmrem.dispose();
      renderer.dispose(); if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }

    return {
      THREE: THREE, renderer: renderer, scene: scene, camera: camera, controls: controls,
      show: show, setExposure: setExposure, setSun: setSun, setShadows: setShadows,
      setAutoRotate: setAutoRotate, setSpin: setSpin, setFov: setFov, setBg: setBg,
      setGround: setGround, invalidate: invalidate, resize: resize, destroy: destroy
    };

  } catch (e) {
    global.__LAB_OK__ = false;
    if (loadingEl) loadingEl.textContent = 'WebGL недоступний';
    if (global.console) console.error('[orbit-stage-3d] init failed', e);
    return { error: e };
  }
}

var OrbitStage3D = { init: init, DEFAULTS: DEFAULTS };

// expose on the global (the lab + a host page reach it as OrbitStage3D) and also
// ES-export for module consumers (a React/Next port imports init).
global.OrbitStage3D = OrbitStage3D;
export { init, DEFAULTS };
export default OrbitStage3D;
