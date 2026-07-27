# CLAIMS-ТАБЛИЦЯ (обов'язкова секція CHOREO.md, план ради S47 крок 1)

> Копіюй цей блок у CHOREO.md і заповнюй. Гейт (live-first-gate v2, TODO крок у verdict.md) не
> пропустить variants/*.html без валідної таблиці. Кожна клітинка = вердикт із ЗАКРИТОГО словника +
> src=трек:число. «Бачу на montage» = НЕ доказ. OTHER/UNMEASURABLE = автоматичний борд Єгору.

## CLAIMS

```claims
mechanic-class: <клас З reference/*.zonetrack.json (визначає LIVE, не автор): strip | stack+cover | pin+swap | parallax-hero | fade | swipe-strip | OTHER>
zones-source: reference/<name>.zonetrack.json (згенеруй: node scripts/zone-track.mjs --atom <id>; зони — ручні прямокутники З LIVE-КАДРУ у reference/zones.json)

| зона        | вікно (zonetrack)    | вердикт                  | src (zonetrack:число)                   |
|-------------|----------------------|--------------------------|-----------------------------------------|
| title       | f147-f150 (t12.3)    | SWAPS-CONTENT            | zonetrack: ink 19→0→11, drift 0% <eps3  |
| card        | f128-f169 (t10.7-14) | COVERED-BY:bottom        | zonetrack: bands 0.92, drift -1.9% <eps3 |
| card        | f177-f190            | TRAVELS:up 4.3%          | zonetrack: drift -4.3%, conf 0.8        |
```

## КОНКУРЕНТНІ ГІПОТЕЗИ (для кожного переходу з ≥2 елементами)

```hypotheses
перехід: card-1 → card-2
  H1 (обрана): stack+cover (нова накриває, стара стоїть)
  H2 (вбита):  continuous-strip (все їде разом)
  число-вбивця H2: title-zone centroid Δ1.8% за 7с (strip дав би монотонний хід через екран);
                   card-1 top Δ1.5% (strip дав би вихід за край)
```

## ЧЕК-ЛИСТ ПОКРИТТЯ
- [ ] 100% вікон руху з timeline.json мають рядок у таблиці
- [ ] кожен вердикт має src=трек:число
- [ ] mechanic-class із закритого реєстру (не OTHER) або борд Єгору
- [ ] для кожного переходу ≥2 гіпотези + число-вбивця
