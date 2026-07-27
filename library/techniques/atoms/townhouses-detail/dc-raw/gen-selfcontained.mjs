#!/usr/bin/env node
/* gen-selfcontained.mjs — конвертує SpringsPhone.dc.html (DC/React) у 3 self-contained variants/
   townhouses-{a,b,c}.html + townhouses-all.html (борд). DCLogic setup/update → IIFE (vanilla, як у SpringsPhone
   логіка вже майже vanilla — лише React.createRef прибираємо, ref→querySelector, {{variant}}→літерал). */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'variants');
mkdirSync(OUT, { recursive: true });

// ── розмітка phone (з SpringsPhone.dc.html <x-dc>, ref прибрано, variant=літерал через JS-атрибут) ──
const PHONE = (variant) => `
<div class="phone" data-phone data-variant="${variant}" style="position:relative;width:390px;height:844px;overflow:hidden;background:#151f1a;font-family:var(--spr-sans);-webkit-font-smoothing:antialiased;margin:0 auto;">
  <div data-scroller style="position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;">

    <div data-sec data-theme="photo" data-hero style="position:relative;height:540px;overflow:hidden;background:#d8ccb4;">
      <img data-parallax src="assets/hero-flats-full.jpg" alt="Flats — limitless vision" style="position:absolute;left:0;top:0;width:100%;height:auto;transform:translate3d(0,0,0);will-change:transform;">
      <div style="position:absolute;left:0;right:0;top:0;height:140px;background:linear-gradient(180deg,rgba(20,24,20,.42),rgba(20,24,20,0));z-index:5;pointer-events:none;"></div>
    </div>

    <div data-sec data-theme="cream" style="background:#EEE3CE;color:#1D3B2A;padding:78px 26px 84px;">
      <p data-reveal style="font-family:var(--spr-sans);font-weight:400;font-size:19px;line-height:1.5;letter-spacing:-.2px;color:#1D3B2A;margin:0;max-width:33ch;text-wrap:pretty;">Our view flats transform the city into an element of your interior design; not a mere landscape but a panorama of seven historical parks, a river shifting shades, and the capital's iconic landmarks in full view. It's the coziness of a country house with the expanse of the megapolises.</p>
      <div data-specs style="margin-top:46px;">
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#1D3B2A;padding:20px 2px;border-top:1px solid rgba(29,59,42,.2);">138 view flats</div>
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#1D3B2A;padding:20px 2px;border-top:1px solid rgba(29,59,42,.2);">62-347 m<sup style="font-size:.58em;line-height:0;position:relative;top:-.55em;">2</sup> area</div>
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#1D3B2A;padding:20px 2px;border-top:1px solid rgba(29,59,42,.2);">Unique transformable glazing</div>
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#1D3B2A;padding:20px 2px;border-top:1px solid rgba(29,59,42,.2);border-bottom:1px solid rgba(29,59,42,.2);">Designer finishings</div>
      </div>
    </div>

    <div data-sec data-theme="photo" data-hero style="position:relative;height:844px;overflow:hidden;background:#241c14;">
      <img data-parallax src="assets/hero-townhouses.webp" alt="" style="position:absolute;left:0;top:-2%;width:100%;height:114%;object-fit:cover;object-position:50% 60%;transform:translate3d(0,0,0);will-change:transform;">
      <div style="position:absolute;left:0;right:0;top:0;height:140px;background:linear-gradient(180deg,rgba(20,16,10,.45),rgba(20,16,10,0));z-index:5;pointer-events:none;"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:46%;background:linear-gradient(0deg,rgba(15,10,6,.5),rgba(15,10,6,0));z-index:5;pointer-events:none;"></div>
      <div data-hero-txt style="position:absolute;left:26px;right:24px;bottom:112px;z-index:8;text-align:right;">
        <div data-hairline style="width:54px;height:1px;background:#EFE6D2;margin:0 0 20px auto;display:none;"></div>
        <h2 style="font-family:var(--spr-serif);font-weight:400;font-size:60px;line-height:.96;letter-spacing:-1px;color:#f4ecd9;margin:0;">Townhouses</h2>
        <div data-kicker style="font-family:var(--spr-sans);font-weight:500;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#eaddc4;margin-top:16px;">Garden of fulfilled expectations</div>
      </div>
    </div>

    <div data-sec data-theme="dark" style="background:#1C3026;color:#EAE3D1;padding:78px 26px 84px;">
      <p data-reveal style="font-family:var(--spr-sans);font-weight:400;font-size:19px;line-height:1.5;letter-spacing:-.2px;color:#EAE3D1;margin:0;max-width:33ch;text-wrap:pretty;">Our boutique townhouses embody intimate coziness. The day's worries fade away like shadows of butterfly wings, when you step onto the sunlit ground-floor patio. Here, you can stroll in light shoes, feel the gentle breeze, and close your eyes as the sun warmly kisses your face.</p>
      <div data-specs style="margin-top:46px;">
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#EFE6D2;padding:20px 2px;border-top:1px solid rgba(239,230,210,.22);">5 townhouses</div>
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#EFE6D2;padding:20px 2px;border-top:1px solid rgba(239,230,210,.22);">174-378 m<sup style="font-size:.58em;line-height:0;position:relative;top:-.55em;">2</sup> area</div>
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#EFE6D2;padding:20px 2px;border-top:1px solid rgba(239,230,210,.22);">Ceiling heights up to 4 meters</div>
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#EFE6D2;padding:20px 2px;border-top:1px solid rgba(239,230,210,.22);">Private patio</div>
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#EFE6D2;padding:20px 2px;border-top:1px solid rgba(239,230,210,.22);border-bottom:1px solid rgba(239,230,210,.22);">Designer finishings</div>
      </div>
    </div>

    <div data-sec data-theme="photo" data-hero style="position:relative;height:844px;overflow:hidden;background:#3a2f22;">
      <img data-parallax src="assets/hero-penthouses.webp" alt="" style="position:absolute;left:0;top:-2%;width:100%;height:114%;object-fit:cover;object-position:50% 62%;transform:translate3d(0,0,0);will-change:transform;">
      <div style="position:absolute;left:0;right:0;top:0;height:140px;background:linear-gradient(180deg,rgba(30,24,16,.4),rgba(30,24,16,0));z-index:5;pointer-events:none;"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:44%;background:linear-gradient(0deg,rgba(24,18,10,.5),rgba(24,18,10,0));z-index:5;pointer-events:none;"></div>
      <div data-hero-txt style="position:absolute;left:26px;right:24px;bottom:104px;z-index:8;text-align:left;">
        <div data-hairline style="width:54px;height:1px;background:#EFE6D2;margin:0 0 20px 0;display:none;"></div>
        <h2 style="font-family:var(--spr-serif);font-weight:400;font-size:60px;line-height:.96;letter-spacing:-1px;color:#f4ecd9;margin:0;">Penthouses</h2>
        <div data-kicker style="font-family:var(--spr-sans);font-weight:500;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#eaddc4;margin-top:16px;">Glowing perspectives</div>
      </div>
    </div>

    <div data-sec data-theme="cream" style="background:#EEE3CE;color:#1D3B2A;padding:78px 26px 84px;">
      <p data-reveal style="font-family:var(--spr-sans);font-weight:400;font-size:19px;line-height:1.5;letter-spacing:-.2px;color:#1D3B2A;margin:0 0 22px;max-width:33ch;text-wrap:pretty;">When you live in this penthouse, you feel like you own a piece of the sky. Here, sublime feelings transform into higher possibilities. Declare love, dare to skyrocket your career, or devise a million-dollar idea. Here, you can do it with ease.</p>
      <p data-reveal style="font-family:var(--spr-sans);font-weight:400;font-size:19px;line-height:1.5;letter-spacing:-.2px;color:#1D3B2A;margin:0;max-width:33ch;text-wrap:pretty;">At Springs, you can dream, plan boldly, and enjoy life — here and now.</p>
      <div data-specs style="margin-top:46px;">
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#1D3B2A;padding:20px 2px;border-top:1px solid rgba(29,59,42,.2);">7 penthouses</div>
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#1D3B2A;padding:20px 2px;border-top:1px solid rgba(29,59,42,.2);">Ceiling heights up to 4 meters</div>
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#1D3B2A;padding:20px 2px;border-top:1px solid rgba(29,59,42,.2);">Luxurious terraces</div>
        <div data-reveal style="font-family:var(--spr-serif);font-weight:400;font-size:31px;line-height:1.05;letter-spacing:-.4px;color:#1D3B2A;padding:20px 2px;border-top:1px solid rgba(29,59,42,.2);border-bottom:1px solid rgba(29,59,42,.2);">Designer finishings</div>
      </div>
    </div>

    <div data-sec data-theme="teal" style="position:relative;background:#0E3A34;overflow:hidden;">
      <div style="position:relative;height:438px;overflow:hidden;">
        <img src="assets/hero-amenities.webp" alt="Amenities — beauty at your fingertips" style="position:absolute;left:0;top:-24px;width:100%;height:auto;display:block;">
        <div style="position:absolute;left:26px;right:24px;top:70px;z-index:6;">
          <div style="font-family:var(--spr-sans);font-weight:500;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#a9c3ba;text-align:right;">Beauty at your fingertips</div>
          <h2 style="font-family:var(--spr-serif);font-weight:400;font-size:52px;line-height:1;letter-spacing:-1px;color:#EFE6D2;margin:12px 0 0;">Amenities</h2>
        </div>
        <a href="#" data-amenlink title="Amenities" style="position:absolute;right:44px;top:300px;width:64px;height:64px;border-radius:50%;border:1px solid rgba(239,230,210,.6);display:flex;align-items:center;justify-content:center;color:#EFE6D2;font-size:20px;cursor:pointer;transition:transform .5s var(--spr-ease);z-index:6;">→</a>
      </div>
    </div>

    <div data-sec data-theme="teal" style="background:#0E3A34;color:#EAE3D1;padding:2px 26px 44px;">
      <div style="display:flex;align-items:center;gap:12px;font-family:var(--spr-sans);font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#93a99c;">
        <span>Homepage</span><span style="opacity:.55;">/</span><span>Design</span>
      </div>
      <div style="height:1px;background:rgba(234,227,209,.16);margin:16px 0 24px;"></div>
      <button data-totop title="Back to top" style="display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;border:1px solid rgba(234,227,209,.5);background:transparent;color:#EAE3D1;font-size:18px;cursor:pointer;transition:background .35s var(--spr-ease),transform .5s var(--spr-ease);">↑</button>
      <div style="font-family:var(--spr-serif);font-weight:400;font-size:66px;line-height:1;letter-spacing:-1px;color:#EAE3D1;margin:44px 0 20px;">Springs</div>
      <div style="font-family:var(--spr-sans);font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:#7c9488;line-height:2;">Legal information<br>© 2026 Springs. All rights reserved.</div>
    </div>

  </div>
  <div data-header style="position:absolute;top:0;left:0;right:0;z-index:30;display:flex;justify-content:space-between;align-items:center;padding:18px 20px 12px;color:#EFE6D2;transition:color .8s var(--spr-ease);pointer-events:none;">
    <div style="font-family:var(--spr-serif);font-weight:400;font-size:23px;letter-spacing:.4px;line-height:1;">Springs</div>
    <div style="display:flex;gap:15px;align-items:center;">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20.2S3 15.3 3 9.1C3 6.3 5.1 4.4 7.6 4.4c1.8 0 3.3 1 4.4 2.6 1.1-1.6 2.6-2.6 4.4-2.6C18.9 4.4 21 6.3 21 9.1c0 6.2-9 11.1-9 11.1Z"/></svg>
      <svg width="22" height="12" viewBox="0 0 22 12" stroke="currentColor" stroke-width="1.4"><line x1="0" y1="2.5" x2="22" y2="2.5"/><line x1="0" y1="9.5" x2="22" y2="9.5"/></svg>
    </div>
  </div>
</div>`;

// ── IIFE-логіка (з DCLogic setup/update, vanilla; variant з data-attr) ──
const LOGIC = `
<script>
(function(){
  window.__PAGE_OK__=false;
  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var ph = document.querySelector('[data-phone]'); if(!ph) return;
  var scroller = ph.querySelector('[data-scroller]');
  var header = ph.querySelector('[data-header]');
  var variant = ph.getAttribute('data-variant') || 'a';
  var sections = [].slice.call(scroller.querySelectorAll('[data-sec]'));
  var heroes = [].slice.call(scroller.querySelectorAll('[data-hero]'));
  var reveals = [].slice.call(scroller.querySelectorAll('[data-reveal]'));
  reveals.forEach(function(el){
    if(rm){ el.style.transition='none'; el.style.opacity='1'; el.style.transform='none'; }
    else { el.style.transition='opacity .95s var(--spr-ease), transform 1.05s var(--spr-ease)'; el.style.opacity='0'; el.style.transform='translateY(24px)'; el.style.willChange='opacity, transform'; }
  });
  if(!rm){
    [].slice.call(scroller.querySelectorAll('[data-specs]')).forEach(function(g){
      var rows=[].slice.call(g.querySelectorAll('[data-reveal]'));
      var stag = variant==='b' ? 90 : 60;
      rows.forEach(function(r,i){ r.style.transitionDelay=(i*stag)+'ms'; });
    });
  }
  var hairlines=[].slice.call(scroller.querySelectorAll('[data-hairline]'));
  var kickers=[].slice.call(scroller.querySelectorAll('[data-kicker]'));
  if(variant==='c' && !rm){
    hairlines.forEach(function(h){ h.style.display='block'; h.style.transform='scaleX(0)'; h.style.transformOrigin='left center'; h.style.transition='transform 1s var(--spr-ease)'; });
    kickers.forEach(function(k){ k.style.letterSpacing='.30em'; k.style.transition='letter-spacing 1s var(--spr-ease)'; });
  } else { hairlines.forEach(function(h){ h.style.display='none'; }); }

  var p={ triggered:{}, lastCol:null, ticking:false };
  function update(){
    var st=scroller.scrollTop, vh=scroller.clientHeight, line=vh*0.62;
    if(!rm){ reveals.forEach(function(el){ if(el.offsetTop - st < line){ el.style.opacity='1'; el.style.transform='translateY(0)'; } }); }
    var depth = rm ? 0 : (variant==='b' ? 0.08 : (variant==='c' ? 0.05 : 0.04));
    heroes.forEach(function(h,idx){
      var img=h.querySelector('[data-parallax]'); if(!img) return;
      var hTop=h.offsetTop, hH=h.offsetHeight;
      var prog=Math.min(1,Math.max(0,(st+vh-hTop)/(hH+vh)));
      var ty=-depth*hH*prog, scale=1;
      if(!rm && variant==='b'){ var en=Math.min(1,Math.max(0,(st+vh-hTop)/vh)); scale=1.04-0.04*en; }
      img.style.transform='translate3d(0,'+ty.toFixed(2)+'px,0) scale('+scale.toFixed(4)+')';
      if(!rm && variant==='c' && !p.triggered[idx] && (h.offsetTop-st)<vh*0.82){
        p.triggered[idx]=1;
        var hl=h.querySelector('[data-hairline]'); if(hl) hl.style.transform='scaleX(1)';
        var k=h.querySelector('[data-kicker]'); if(k) k.style.letterSpacing='.16em';
      }
    });
    var y=st+24, theme='photo';
    for(var i=0;i<sections.length;i++){ var s=sections[i], t=s.offsetTop; if(t<=y && y<t+s.offsetHeight){ theme=s.getAttribute('data-theme'); break; } }
    var col = theme==='cream' ? '#1D3B2A' : '#EFE6D2';
    if(p.lastCol!==col){ p.lastCol=col; if(header) header.style.color=col; }
  }
  scroller.addEventListener('scroll',function(){ if(!p.ticking){ p.ticking=true; requestAnimationFrame(function(){ update(); p.ticking=false; }); } },{passive:true});
  update();
  var tt=scroller.querySelector('[data-totop]'); if(tt) tt.addEventListener('click',function(){ scroller.scrollTo({top:0,behavior:'smooth'}); });
  var al=scroller.querySelector('[data-amenlink]'); if(al) al.addEventListener('click',function(e){ e.preventDefault(); });
  window.__PAGE_OK__=true;
})();
</script>`;

const HEAD = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Springs Residences M8 — %V%</title>
<script>window.__PAGE_OK__=false;</script>
<link rel="stylesheet" href="tokens/_springs-tokens.css">
<style>*{box-sizing:border-box}html,body{margin:0;padding:0;background:#0d1712}a{color:#1D3B2A;text-decoration:none}a:hover{color:#0E3A34}[data-scroller]{scrollbar-width:none;-ms-overflow-style:none}[data-scroller]::-webkit-scrollbar{width:0;height:0;display:none}</style>
</head><body>`;

for (const v of ['a','b','c']) {
  const html = HEAD.replace('%V%', v.toUpperCase()) + PHONE(v) + LOGIC + '\n</body></html>';
  writeFileSync(join(OUT, `townhouses-${v}.html`), html);
  console.log(`townhouses-${v}.html written`);
}

// ── all.html борд (3 iframes) ──
const ALL = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Springs Residences M8 — A/B/C board</title>
<style>*{box-sizing:border-box}body{margin:0;background:#12100c;color:#e8dcc4;font-family:'Helvetica Neue',Arial,sans-serif;padding:26px}
.row{display:flex;gap:40px;justify-content:center;flex-wrap:wrap}
.col{display:flex;flex-direction:column;gap:10px;align-items:center}
.lbl{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#c9b48f}
.sub{font-size:11px;color:#8a836f;max-width:390px;text-align:center;line-height:1.5}
iframe{width:390px;height:844px;border:0;border-radius:20px;box-shadow:0 30px 60px -20px rgba(0,0,0,.6);background:#151f1a}
h1{font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 4px}.top{text-align:center;margin-bottom:26px}</style></head>
<body><div class="top"><h1>Springs Residences (M8) — Flats · Townhouses · Penthouses · Amenities</h1>
<div class="sub" style="margin:0 auto">3 варіанти scroll-хореографії · 390×844 · flow-only · проти live НЕ звірено піксельно — судить око</div></div>
<div class="row">
  <div class="col"><div class="lbl">A — Calm flow</div><div class="sub">Canon target. Parallax −4%, fade-coupling, hard-cut seams, theme-flip 0.8s.</div><iframe src="townhouses-a.html"></iframe></div>
  <div class="col"><div class="lbl">B — Deeper parallax</div><div class="sub">Hero −8% + scale-settle 1.04→1.0. Specs stagger 90ms.</div><iframe src="townhouses-b.html"></iframe></div>
  <div class="col"><div class="lbl">C — Designer take</div><div class="sub">Hairline draws in above hero title; kicker letter-spacing settles.</div><iframe src="townhouses-c.html"></iframe></div>
</div></body></html>`;
writeFileSync(join(OUT, 'townhouses-all.html'), ALL);
console.log('townhouses-all.html written');
