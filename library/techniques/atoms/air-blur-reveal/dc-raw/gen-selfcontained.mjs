#!/usr/bin/env node
/* gen-selfcontained.mjs — конвертує VIK-Blur-Reveal-B1.dc.html (DC/React) у self-contained
   variants/b1-{1a,1b,1c}.html + b1-all.html (борд).
   DC-специфіка: <sc-for> розбиває caption на слова-span з {{ word }} bindings + DCLogic IO/replay.
   Конверт: caption split на слова у vanilla (той самий текст), IO blur-reveal + replay-on-tap +
   reduced-motion + hook window.__RV_GATE (сумісний з air-atom-gate blur-reveal-гілкою: клас .rv-w).
   Закон ВЕРБАТИМ: blur 10px, dur 1s, stagger 60ms, ease .25,.74,.22,.99, нуль CLS (тільки filter/opacity).
   Числа load-bearing — regen, не hand-edit .html. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'variants');
mkdirSync(OUT, { recursive: true });

const HEADING = 'Built to<br>outlast trend';
const CAPTION = 'VIK SHAPES GROUND, LIGHT AND WATER INTO LANDSCAPES THAT AGE INTO THEIR SETTING RATHER THAN AGAINST IT.';

// per-treatment layout: wordmark fs/top + caption top/left/width.
// 🔴 FIX (Yehor S40): лого VIK у ЛІВИЙ ВЕРХНІЙ КУТ (не по центру фото). top 88→44 — притиснуто до кута,
//    left 24. Раніше на top:88 воно висіло посеред скла (нема статус-бару), читалось як центр.
const SCREENS = {
  '1a': { wmFs:34, wmTop:44,  capTop:560, capLeft:30, capW:330, label:'Faithful · ink-scan exact' },
  '1b': { wmFs:26, wmTop:44,  capTop:500, capLeft:45, capW:300, label:'Restrained · compact mark' },
  '1c': { wmFs:46, wmTop:44,  capTop:632, capLeft:23, capW:344, label:'Statement · large mark' },
};

// caption → word-spans (rv-w клас для gate); armed-стан inline, delay per-word 60ms
function captionSpans(){
  const words = CAPTION.split(' ');
  return words.map((w,i)=>`<span class="rv-w" style="display:inline-block;margin-right:.26em;filter:blur(10px);opacity:0;transition:filter 1s cubic-bezier(.25,.74,.22,.99),opacity 1s cubic-bezier(.25,.74,.22,.99);transition-delay:${i*60}ms;will-change:filter,opacity;--rv-i:${i};">${w}</span>`).join('');
}

const PHONE = (t) => {
  const s = SCREENS[t];
  return `
      <div data-screen data-treatment="${t}" style="position:relative;width:390px;height:844px;background:#ffffff;overflow:hidden;">
        <img src="assets/tower.jpg" alt="Glass tower, blue sky" draggable="false" style="position:absolute;top:0;left:0;width:100%;height:312px;object-fit:cover;object-position:center top;display:block;">
        <div style="position:absolute;left:24px;top:${s.wmTop}px;font-size:${s.wmFs}px;font-weight:400;line-height:1;color:#0a0a0a;text-transform:uppercase;">VIK</div>
        <h2 style="position:absolute;left:21px;top:332px;margin:0;font-size:42px;font-weight:400;line-height:1.06;letter-spacing:-.84px;color:#0a0a0a;text-transform:uppercase;">${HEADING}</h2>
        <div class="reveal-text" data-cap style="position:absolute;top:${s.capTop}px;left:${s.capLeft}px;width:${s.capW}px;text-align:center;font-size:13px;font-weight:500;line-height:1.5;letter-spacing:0;color:#8d8d8d;text-transform:uppercase;">${captionSpans()}</div>
      </div>`;
};

// ── vanilla blur-reveal engine (порт DCLogic componentDidMount/replay, ВЕРБАТИМ закон) ──
const ENGINE = `
<script>
(function(){
  window.__RV_GATE = true;
  var EASE='cubic-bezier(.25,.74,.22,.99)';
  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function spans(cap){ return [].slice.call(cap.querySelectorAll('.rv-w')); }
  function reveal(cap){ spans(cap).forEach(function(s){ s.style.filter='none'; s.style.opacity='1'; }); }
  function arm(cap){ spans(cap).forEach(function(s){ s.style.transition='none'; s.style.filter='blur(10px)'; s.style.opacity='0'; }); }
  function replay(cap){
    if(rm) return;
    arm(cap);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      spans(cap).forEach(function(s,i){ s.style.transition='filter 1s '+EASE+', opacity 1s '+EASE; s.style.transitionDelay=(i*60)+'ms'; });
      reveal(cap);
    }); });
  }
  var caps=[].slice.call(document.querySelectorAll('[data-cap]'));
  caps.forEach(function(cap){
    var sp=spans(cap);
    sp.forEach(function(s,i){ s.style.transitionDelay=(i*60)+'ms'; });
    if(sp.length) sp[sp.length-1].style.marginRight='0px';
    if(rm){ sp.forEach(function(s){ s.style.transition='none'; s.style.filter='none'; s.style.opacity='1'; }); return; }
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ reveal(cap); io.unobserve(e.target); } });
    }, { threshold:0.25 });
    io.observe(cap);
  });
  // replay on tap of a screen
  document.addEventListener('click', function(e){ var sc=e.target.closest('[data-screen]'); if(sc){ var cap=sc.querySelector('[data-cap]'); if(cap) replay(cap); } });
})();
</script>`;

const HEAD = (title) => `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<script>window.__RV_GATE=false;</script>
<link rel="stylesheet" href="_air-tokens.css">
<style>
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#ffffff;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
  body{font-family:'Onest','Helvetica Neue',Helvetica,Arial,sans-serif;}
</style>
</head><body style="display:flex;align-items:flex-start;justify-content:center;">`;

for (const t of ['1a','1b','1c']) {
  const html = HEAD(`VIK B1 · ${t}`) + PHONE(t) + ENGINE + '\n</body></html>';
  writeFileSync(join(OUT, `b1-${t}.html`), html);
  console.log(`b1-${t}.html written`);
}

// ── board ──
const ALL = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>VIK B1 blur-reveal · A/B/C board</title>
<style>*{box-sizing:border-box}body{margin:0;background:#edeff0;color:#0a0a0a;font-family:'Onest','Helvetica Neue',Arial,sans-serif;padding:30px}
.row{display:flex;gap:52px;justify-content:center;flex-wrap:wrap}
.col{display:flex;flex-direction:column;gap:12px;align-items:center}
.chip{display:inline-flex;align-items:center;gap:10px}
.n{background:#0a0a0a;color:#fff;font-weight:600;font-size:12px;padding:5px 10px;border-radius:999px;}
.lbl{font-weight:600;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#575757}
.sub{font-size:11px;color:#8a8a90;max-width:390px;text-align:center;line-height:1.5}
iframe{width:390px;height:844px;border:0;border-radius:14px;box-shadow:0 34px 64px -22px rgba(10,10,10,.30),0 0 0 1px rgba(10,10,10,.05);background:#fff}
h1{font-weight:400;font-size:26px;margin:0 0 6px}.top{text-align:center;margin-bottom:28px}
.note{font-size:11px;color:#8a8a90;max-width:660px;margin:0 auto;line-height:1.55}</style></head>
<body><div class="top"><h1>VIK · blur-reveal (B1 atom, foreign facade)</h1>
<div class="note">Закон air-blur-reveal на ЧУЖОМУ фасаді (VIK, tower=higgsfield не aircenter). Caption заходить blur(10px) у 0, stagger 60ms, нуль CLS. 3 treatments wordmark + ритм, механіка однакова. Проти live НЕ звірено піксельно тут (див. DENSE-PARITY-REPORT). Тап по екрану = replay reveal.</div></div>
<div class="row">
  <div class="col"><div class="chip"><span class="n">1a</span><span class="lbl">Faithful · ink-scan exact</span></div><div class="sub">Wordmark 34px top88, caption top560. Числа з ink-scan живого.</div><iframe src="b1-1a.html"></iframe></div>
  <div class="col"><div class="chip"><span class="n">1b</span><span class="lbl">Restrained · compact</span></div><div class="sub">Wordmark 26px top70, caption вище (top500), тісніший ритм.</div><iframe src="b1-1b.html"></iframe></div>
  <div class="col"><div class="chip"><span class="n">1c</span><span class="lbl">Statement · large mark</span></div><div class="sub">Wordmark 46px top100, caption нижче (top632), просторіший ритм.</div><iframe src="b1-1c.html"></iframe></div>
</div></body></html>`;
writeFileSync(join(OUT, 'b1-all.html'), ALL);
console.log('b1-all.html written');
