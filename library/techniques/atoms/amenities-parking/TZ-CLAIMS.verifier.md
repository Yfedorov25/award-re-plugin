# TZ-CLAIMS — НЕЗАЛЕЖНИЙ ВЕРИФІКАТОР (amenities-parking, S50)

> Верифікатор-сесія: agent-task-s50-parking. КАРАНТИН дотримано: CHOREO.md / SPEC.md /
> STAGE1-NOTES.md автора НЕ читались до запису цієї таблиці. Всі числа — ВЛАСНІ виміри
> (ffmpeg 12fps 585×1266, row-profile xcorr, edge-NCC template match, masked-luma track;
> скрипти: /private/tmp/claude-501/tz-verifier-parking/). sha відео/зон звірені з zonetrack:
> videoSha 57b10e0b… ✓, zonesSha b003bed… ✓.
>
> Позначення: "page" = зсув сторінкового потоку, виміряний по краю cream-панелі
> (panel-top-edge детектор) та/або xcorr panel-зони; "px" — у кадрі 585×1266.
> Паузи руки (page=0): f0-102, f106-126, f148-166, f190-201, f229-238, f252-265,
> f288-295, f306-316, f330-336, f347-358.

## CLAIMS

```claims
mechanic-class: OTHER (пінований full-bleed фото-hero зі SCALE-скрабом 3.4→1.0 по скролу + звичайний сторінковий потік поверх/після; zoom-hero відсутній у закритому реєстрі — найближчий сусід parallax-hero, але закон руху = масштаб, не паралакс-трансляція; zonetrack теж дає OTHER)
zones-source: reference/parking-live.zonetrack.json (sha звірені; зони reference/zones.json)

| зона  | вікно (zonetrack)   | вердикт           | src (верифікатор:число)                                                                                     |
|-------|---------------------|-------------------|--------------------------------------------------------------------------------------------------------------|
| plate | f102-f106           | TRAVELS:up        | template-NCC: y1006→991 (15px up, ncc≥0.97); photoTop лише +2px — напис НЕ жорстко з фото; band-xcorr +15px @1.00 |
| plate | f126-f138           | EXITS             | template-NCC y991(f126)→~854(f138), верх rect y982 перетнуто ~f129-134; темп ~1.10x page (96px vs page 87px f128-137); textDiff 87→51 (фейд стартував) |
| plate | f167-f191           | FADES TRAVELS:up  | об'єкт-семантика (напис вище rect з ~f134): y772(f167)→615(f189) = 157px при page 144px (1.09x); textDiff 34.9→1.9 (зник до f189); band-xcorr самого rect +82px @1.00 (cream+параграф) |
| plate | f201-f208           | TRAVELS:up        | band-xcorr +87px @0.98 = page +87px (у смузі низ параграфа, напису нема — diff 1.8 = шум)                      |
| plate | f206-f211           | TRAVELS:up        | band-xcorr +78px @0.99 (minConf 0.47 = blur-кадр); наскрізний потік: низ параграфа виходить, заголовок i1 входить знизу (y1077@f209, ncc 0.95, ink одразу 163) — не in-place підміна |
| plate | f212-f229           | TRAVELS:up        | band-xcorr +229px @1.00 = page +228px                                                                          |
| plate | f243-f252           | ENTERS            | dark-front Location-тизера в потоці: image-top y~890@f250 (перетин смуги y982-1076 всередині вікна); band-xcorr +206px = page +209px |
| plate | f265-f278           | TRAVELS:up        | band-xcorr +215px @1.00 = page +213px (контент = тизер-картинка)                                               |
| plate | f295-f300           | TRAVELS:up        | band-xcorr +133px @1.00 = page +132px                                                                          |
| plate | f324-f358           | EXITS             | brightPx(L>170) у смузі 872(f324)→0(f335); travel +456px = page (футер сідає, пауза f347-358)                  |
| plate | f339-f347           | TRAVELS:up        | band-xcorr +224px @1.00 = page +225px                                                                          |
| photo | f126-f147           | MEDIA             | zoom-scrub на місці: scale(→f190) 3.40-3.55(f110) → 3.25(f130) → 2.65(f150) (edge-NCC); phTop +30px vs page +178px (0.17x) — трансляції нема, контент міняється |
| photo | f166-f189           | MEDIA             | scale 2.65(f150)→~1.9-2.5(f170)→1.00(f185, ncc 0.492@s=1.0); phFull +50px vs page +178px (0.28x); зум заморожений у паузу f148-165 (m=0 покадрово) |
| photo | f201-f229           | TRAVELS:up        | phTop +357px / phFull +361px vs page +369px (0.97-0.98); з f203 покадрово ІДЕНТИЧНО panel-тексту — page-locked |
| photo | f238-f252           | TRAVELS:up        | phFull +356px = page +356px (1.00); верх фото виходить за край                                                 |
| photo | f265-f287           | TRAVELS:up        | фото вже вийшло (~f251-253); контент rect (спекс+тизер) travel: page +385px; xcorr rect +507 @0.97 (зміш. контент) |
| photo | f295-f306           | TRAVELS:up        | xcorr +254px @0.99 vs page +260px; i3 y304→120                                                                 |
| photo | f316-f329           | TRAVELS:up        | xcorr +400px @0.99 = page +399px; dark-front тизера 837→436                                                    |
| photo | f336-f343           | TRAVELS:up        | xcorr +215px @0.98 = page +216px                                                                               |
| panel | f16-f172            | COVERED-BY        | dir top (пролог-reveal): front terraces 630(f16)→203(f88) відступає вгору при пінованому фото (+8px f16-88, page-profile 0) |
| panel | f126-f147           | ENTERS            | cream-edge y1080(f128)→921(f147); перетин низу зони (y950) на f142 — в'їзд знизу разом зі скролом              |
| panel | f166-f191           | TRAVELS:up        | cream-edge 919(f166)→761(f190) = 158px = page (1.00); у паузу f148-165 edge 919 const                          |
| panel | f201-f229           | TRAVELS:up        | para1 y806(f203)→483(f229); zone-xcorr +369px @1.00; STANDS у паузу f229-238 (y483 const)                      |
| panel | f238-f252           | TRAVELS:up        | zone-xcorr +356px @1.00; офсети i1/i2/i3 до параграфа 331/451/571px константні                                 |
| panel | f266-f288           | TRAVELS:up        | старий контент ВИХОДИТЬ вгору з темпом сторінки: i3 y698(f262)→304(f290) = 394px при page 385px; тизер-front теж page-locked (1099→1023) — потік, не накриття |
| panel | f295-f306           | TRAVELS:up        | zone-xcorr +263px @1.00; front 1099→837 = 262px = page 260px                                                   |
| panel | f316-f324           | TRAVELS:up        | zone-xcorr +245px @0.98; front 837→436 при page +399 (по f329)                                                 |
| panel | f342-f358           | EXITS             | brightPx(L>170) у rect 2093(f342)→0(f348); вихід вгору з потоком                                               |
```

## КОНКУРЕНТНІ ГІПОТЕЗИ

```hypotheses
перехід: фото темний кут (f110) → світлий широкий вид (f190)
  H1 (обрана): ОДИН рендер, zoom-out кроп ~3.4-3.55x → 1.0, скраблений скролом
  H2 (вбита):  заміна/кросфейд двох різних рендерів
  H3 (вбита):  пан-трансляція того ж масштабу
  число-вбивця H2: edge-NCC кропа f110 у f190 має ГЕОМЕТРИЧНИЙ пік 0.437@scale3.55 /
                   0.431@scale3.40 (поза (123,3) photo-зони) — заміна дала б плаский низ
                   на всіх шкалах; шкала монотонно спадає 3.25(f130)→2.65(f150)→1.00(f185,
                   ncc 0.492) = безперервна прогресія одного виду;
  число-вбивця H3: ncc@scale1.00 для f110→f190 = 0.051 (проти 0.437);
  скраб-доказ: у паузи руки f148-165 зум ЗАМОРОЖЕНИЙ (phFull m=0 покадрово, кадри
                   ідентичні) — прив'язка до скролу, не таймер.

перехід: доля напису «Park-like Parking» (f100-f200)
  H1 (обрана): після релізу (~f127) TRAVELS вгору ~1.10x темпу сторінки зі
               scroll-scrub FADE; невидимий до f189 (y≈615, ще у в'юпорті)
  H2 (вбита):  часовий fade ~0.6с по завершенню зума
  H3 (вбита):  без фейду — чистий вихід за верхній край
  число-вбивця H2: textDiff ЗАМОРОЖЕНИЙ 37.0→36.7 (Δ0.3 = шум) усі 19 кадрів паузи
                   f148-166 (1.58с > 0.6с — часовий fade завершився б у паузі);
                   спад ТІЛЬКИ при скролі: 0.249 у.о./px (f128-147) та 0.229 у.о./px
                   (f167-189) — лінійно у домені px-скролу;
  число-вбивця H3: txt-люма падає 198→136 НАЗУСТРІЧ bg 111→134 (справжня прозорість,
                   не висвітлення фону); зник на y≈615 — до верхнього краю ще 545px;
  темп: сумарно f128-189 напис 349px (964→615) при page 318px (edge 1080→762) = 1.097x.

перехід: поява пунктів спекс-листа (Designed interior / Two levels / 176 parking spaces)
  H1 (обрана): жорсткий page-locked блок у потоці, нуль entry-анімацій
  H2 (вбита):  stagger fade-in / slide-in пунктів
  число-вбивця H2: офсети пунктів до параграфа 330-331 / 449-451 / 571 px КОНСТАНТНІ
                   з ПЕРШОГО кадру детекції (i1 f209, i2 f219, i3 f227); ink-diff одразу
                   163-175 без ramp (163 = blur швидкого скролу); NCC 1.00 з першого
                   чистого кадру.

перехід: вхід Location-тизера (панель «накрита»?)
  H1 (обрана): звичайний потік — контент панелі виходить вгору з темпом сторінки,
               тизер їде слідом
  H2 (вбита):  pin+cover (панель стоїть, тизер наїжджає зверху по ній)
  число-вбивця H2: i3 y698(f262)→304(f290)→120(f302) = 394px при page 385px
                   (панель НЕ стоїть); dark-front тизера теж page-locked:
                   1099→837 = 262px при page 260px (f290-306).
```

## ЧЕК-ЛИСТ ПОКРИТТЯ
- [x] 100% вікон руху timeline.json покриті: f127-147 ✓, f167-189 ✓, f202-229 ✓,
      f239-252 ✓, f266-287 ✓, f296-306 ✓, f317-328 ✓ (рядки photo/panel/plate вище)
- [x] всі вікна zonetrack (windows + ink-event/merged вердикти) мають рядок
- [x] кожен вердикт має src=власне число верифікатора
- [x] mechanic-class: OTHER → борд Єгору (збігається з fail-closed класом zonetrack)
- [x] для кожного переходу ≥2 гіпотези + число-вбивця
