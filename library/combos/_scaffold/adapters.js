/* adapters.js — the THIN per-atom FACT registry for section-variant authoring.
   ----------------------------------------------------------------------------
   Stores ONLY facts about an atom's contract, NEVER its orchestration (that lives
   hand-authored in each variant's combo-lab.html — CONTRACT law). Per atom id:
     ownsPin : true  -> this atom creates+owns its own pinned ScrollTrigger (engine).
                        The harness must NOT create a section pin for such a variant.
     real    : false -> a no-op stub (library/shared/<id> __stub:true). Recorded by the
                        probe but does NOT gate (placeholder until --promote'd).
     load    : the relative <script src> list the lab must include (canon deps first).
     bind    : OPTIONAL convenience for common MANUAL atoms only — may ONLY call the
               atom's own set/play against a progress scalar. Anything touching copy,
               media, layout, or a second atom is FORBIDDEN here (belongs in the lab).
   IIFE global: window.COMBO_ADAPTERS. Keep rows to ~one line; this is facts, not choreography. */
(function (global) {
  'use strict';
  var C = '../../components/';
  global.COMBO_ADAPTERS = {
    // ---- ENGINE atoms (own their pin; harness creates no section pin) ----
    'depth-stack':            { ownsPin: true,  real: true, load: [C + 'depth-stack/component.js'] },
    'focus-render-switch':    { ownsPin: true,  real: true, load: [C + 'focus-render-switch/component.js'] },

    // ---- MANUAL atoms (PURE set(t)/play; driven by the harness pin) ----
    'daynight-engine':        { ownsPin: false, real: true, load: [C + 'daynight-engine/component.js'] },
    'daynight-center-seam':   { ownsPin: false, real: true, load: [C + 'daynight-engine/component.js', C + 'daynight-center-seam/component.js'], bind: function (i, p) { i && i.set && i.set(p); } },
    'daynight-portal-reveal': { ownsPin: false, real: true, load: [C + 'daynight-engine/component.js', C + 'daynight-portal-reveal/component.js'], bind: function (i, p) { i && i.set && i.set(p); } },
    'daynight-masked-windows':{ ownsPin: false, real: true, load: [C + 'daynight-engine/component.js', C + 'daynight-masked-windows/component.js'], bind: function (i, p) { i && i.set && i.set(p); } },
    'mask-up-title':          { ownsPin: false, real: true, load: [C + 'mask-up-title/component.js'] },        // play() once on a threshold (author guards)
    'masked-heritage-split':  { ownsPin: false, real: true, load: [C + 'masked-heritage-split/component.js'] }, // needs bespoke .mhs-* markup (author builds)
    'oval-mask':              { ownsPin: false, real: true, load: [C + 'oval-mask/component.js'] },
    'hero-video-render-rotator': { ownsPin: false, real: true, load: [C + 'hero-video-render-rotator/component.js'] },

    // ---- CONFIG-DOM-BUILDER (no target arg; builds its own DOM; sticky-CSS pin) ----
    'slicer-reveal':          { ownsPin: false, real: true, load: [C + 'slicer-reveal/component.js'], sticky: true },

    // ---- shared no-op STUBS (recorded, never gate; promote to real atoms later) ----
    'parallax-depth':         { ownsPin: false, real: false, load: ['../../shared/parallax-depth/util.js'] },
    'reveal':                 { ownsPin: false, real: false, load: ['../../shared/reveal/util.js'] },
    'splitLines':             { ownsPin: false, real: false, load: ['../../shared/splitLines/util.js'] },
    'scroll-indicator':       { ownsPin: false, real: false, load: ['../../shared/scroll-indicator/util.js'] }
  };
})(typeof window !== 'undefined' ? window : this);
