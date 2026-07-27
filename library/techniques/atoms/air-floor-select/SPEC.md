# ATOM: air-floor-select (B8) — hover-плити вежі + закріплена картка + клік-lock

> Закон = T-115. Джерело: `AIR-REF--building-floor-drill.mp4` (live /visual-search: 3 вежі,
> лейбли B1/B2/B3, SELECT FLOOR, hover запалює поверхи). BUILD: CD batch-4, 3 варіанти (DUNE/NORD/ONYX).
> ✅~ блоково С33-5. Розкадровка: `CD-RUN-air-batch-4/reference-frames/b8-select-*`.

## СУТЬ
Hover вежі → її поверхові плити проявляються знизу-вгору (stagger 12ms/плита, opacity 0→.18);
hover плити → підсвітка .42 + ЗАКРІПЛЕНА картка (per-tower anchor, НЕ за курсором) з даними поверху;
клік alive-плити → lock (accent .52 + ✛→× у картці); мертві плити (units=0) інертні.

## ІНВАРІАНТИ
Card anchor фіксований на вежу (Δ0px при зміні плити — контент свапиться, бокс стоїть); dead-плити
= нуль хендлерів; sweep = лише останній .hot; нуль-CLS; тач = tap1 показати/tap2 select.
Кількість веж/поверхів, палітра — фасад.

## ГЕЙТИ (С33-5, 6/6): anchor Δ0px per-tower · dead pe:none · sweep=1 hot · click→lock+sel · 0-CLS · 0 err.

## ФАЙЛИ
`build.html` = ONYX (робочий канон за ОКОМ на хорео-борді — НЕ піксель-parity; фінал = вердикт Єгора). `variant-dune.html` · `variant-nord.html` = фасад-банк.
