/*
  calibration/injectors.mjs — runtime-інжектори багів для калібрації харнеса (Етап B S45).
  Кожен інжектор: після load обгортає window.render ПРИЙНЯТОГО wellness і переписує РІВНО
  одну властивість = рівно один канонічний баг (вердикт ради Q3: інжектори, не stored-копії,
  бо база ще мінятиметься — jog-фото → kling-відео — і копії розсинхронізуються).

  primary = вимір що МУСИТЬ зловити. expectedSecondary = виміри яким ДОЗВОЛЕНО впасти
  (S48: structure-parity дозволений там де інжекція ЛАМАЄ event-скелет механіки — чесний каскад)
  (чесний каскад: напр. зламаний канал v1 обнуляє його event-вікно → timing теж падає).
  Матриця calibrate: primary ∈ failed ∧ failed ⊆ primary ∪ expectedSecondary.
*/
export const INJECTORS = [
  {
    // Баг №2 (канон): crossfade замість wipe знизу-вгору. Імітує зламаний wellness.html:140.
    name: 'INJ-01-crossfade', primary: 'motion-direction', expectedSecondary: ['channel-identity', 'timing', 'parallelism', 'surface-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,v1=document.querySelector('.fb.v1');
      window.render=function(p){o(p);v1.style.clipPath='inset(0 0 0 0)';v1.style.opacity=C((p-0.50)/0.12);};window.render(0);})()`,
  },
  {
    // Баг: wipe у зворотний бік (шов їде ВНИЗ). Імітує інверсію wellness.html:140.
    name: 'INJ-02-wrong-direction', primary: 'motion-direction', expectedSecondary: ['timing', 'parallelism', 'surface-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,v1=document.querySelector('.fb.v1');
      window.render=function(p){o(p);v1.style.clipPath='inset(0 0 '+((1-C((p-0.50)/0.12))*100)+'% 0)';};window.render(0);})()`,
  },
  {
    // Баг №3 (канон): ТЕМП — card досягає pin на 0.22 замість 0.38. Δ/напрям ідентичні,
    // сітка Етапу A сліпа. Імітує зламаний wellness.html:130.
    name: 'INJ-03-tempo', primary: 'timing', expectedSecondary: ['surface-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,L=(a,b,t)=>a+(b-a)*t,card=document.getElementById('card');
      window.render=function(p){o(p);let T;if(p<0.16)T=100;else if(p<0.22)T=L(100,38,C((p-0.16)/0.06));
        else if(p<0.52)T=38;else if(p<0.66)T=L(38,-34,(p-0.52)/0.14);else T=L(-34,-118,C((p-0.66)/0.26));
        card.style.transform='translateY('+T+'dvh)';};window.render(0);})()`,
  },
  {
    // Баг №8 (канон): картка налазить на медіа — pin 8dvh замість 38. Імітує wellness.html:130-131.
    name: 'INJ-04-card-overlap', primary: 'composition-overlap', expectedSecondary: ['timing', 'plateau', 'surface-parity', 'structure-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,L=(a,b,t)=>a+(b-a)*t,card=document.getElementById('card');
      window.render=function(p){o(p);let T;if(p<0.16)T=100;else if(p<0.38)T=L(100,8,C((p-0.16)/0.22));
        else if(p<0.52)T=8;else if(p<0.66)T=L(8,-34,(p-0.52)/0.14);else T=L(-34,-118,C((p-0.66)/0.26));
        card.style.transform='translateY('+T+'dvh)';};window.render(0);})()`,
  },
  {
    // Баг №4 (канон): full-bleed замість олив+картинка-в-полях. Імітує wellness.html:37.
    name: 'INJ-05-full-bleed', primary: 'composition-overlap', expectedSecondary: ['surface-parity'],
    js: `(()=>{const pic=document.querySelector('#handoff .pic');pic.style.top='0';pic.style.height='100%';})()`,
  },
  {
    // Баг №5 (канон): clip-reveal замість цілої картинки. ТА САМА траєкторія visible-top,
    // канал clip замість translate — visible-top Етапу A сліпий. Імітує wellness.html:145.
    name: 'INJ-06-clip-reveal', primary: 'channel-identity', expectedSecondary: ['timing', 'ordering', 'surface-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,h=document.getElementById('handoff');
      window.render=function(p){o(p);const x=C((p-0.66)/0.26);h.style.transform='translateY(0)';
        h.style.clipPath='inset('+((1-x)*100)+'% 0 0 0)';};window.render(0);})()`,
  },
  {
    // Баг №6 (канон): зайвий 2-й слайсер. Незадекларований шар v2 = census FAIL.
    name: 'INJ-07-extra-slicer', primary: 'census', expectedSecondary: ['surface-parity', 'structure-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,fm=document.querySelector('.fullmedia');
      const v2=document.createElement('div');v2.className='fb v2';
      v2.style.cssText='position:absolute;inset:0;background:#274a3a;clip-path:inset(100% 0 0 0)';
      fm.appendChild(v2);
      window.render=function(p){o(p);v2.style.clipPath='inset('+((1-C((p-0.58)/0.10))*100)+'% 0 0 0)';};window.render(0);})()`,
  },
  {
    // Баг №7 (канон): послідовно замість паралельно — v1 більше не перекриває P2-вікно.
    name: 'INJ-08-sequential', primary: 'parallelism', expectedSecondary: ['timing', 'surface-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,v1=document.querySelector('.fb.v1');
      window.render=function(p){o(p);v1.style.clipPath='inset('+((1-C((p-0.53)/0.12))*100)+'% 0 0 0)';};window.render(0);})()`,
  },
  {
    // Баг №1 root-cause (канон №8): фон стартує ЗАРАНО — 0.60 замість 0.66 = ТОЧНА історична
    // магнітуда. Головний тест системи. Імітує wellness.html:144.
    name: 'INJ-09a-early-start-THIN', primary: 'ordering', expectedSecondary: ['timing', 'surface-parity', 'structure-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,h=document.getElementById('handoff');
      window.render=function(p){o(p);h.style.transform='translateY('+((1-C((p-0.60)/0.32))*100)+'%)';};window.render(0);})()`,
  },
  {
    // Той самий баг у грубій магнітуді 0.50 (анти-«карикатурна калібрація», Contrarian).
    name: 'INJ-09b-early-start-COARSE', primary: 'ordering', expectedSecondary: ['timing', 'surface-parity', 'structure-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,h=document.getElementById('handoff');
      window.render=function(p){o(p);h.style.transform='translateY('+((1-C((p-0.50)/0.42))*100)+'%)';};window.render(0);})()`,
  },
  {
    // Баг: текст ПІНИТСЯ (застиг) замість уходити вгору-out. Імітує wellness.html:132-133.
    name: 'INJ-10-text-freeze', primary: 'typography-reveal', expectedSecondary: ['timing', 'ordering', 'surface-parity', 'structure-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,L=(a,b,t)=>a+(b-a)*t,card=document.getElementById('card');
      window.render=function(p){o(p);let T;if(p<0.16)T=100;else if(p<0.38)T=L(100,38,C((p-0.16)/0.22));
        else T=38;card.style.transform='translateY('+T+'dvh)';};window.render(0);})()`,
  },
  {
    // Баг «ітерація 0»: проста locked-to-scroll без pin-фаз (лінійна картка).
    name: 'INJ-11-locked-to-scroll', primary: 'plateau', expectedSecondary: ['timing', 'composition-overlap', 'surface-parity', 'structure-parity'],
    js: `(()=>{const o=window.render,L=(a,b,t)=>a+(b-a)*t,card=document.getElementById('card');
      window.render=function(p){o(p);card.style.transform='translateY('+L(100,-118,p)+'dvh)';};window.render(0);})()`,
  },
  {
    // НЕГАТИВНИЙ КОНТРОЛЬ: зсув 0.005 < TOL 0.02 — доброякісна варіація, ВСІ виміри мусять PASS
    // (анти-надчутливість: детектор-що-валить-усе не пройде калібрацію).
    name: 'NEG-13-benign', primary: null, expectedSecondary: ['surface-parity'],
    js: `(()=>{const o=window.render,C=v=>v<0?0:v>1?1:v,h=document.getElementById('handoff');
      window.render=function(p){o(p);h.style.transform='translateY('+((1-C((p-0.655)/0.265))*100)+'%)';};window.render(0);})()`,
  },
];
