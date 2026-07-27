# ATOM: air-plan-popover (B9) — план сеттлиться з -28° + попавер юніта з міні-планом + драбинка

> Закон = T-407+T-104. Джерело: `AIR-REF--visual-search-drill.mp4` + `floor-plan-select.mp4`
> (live: план прибуває повернутим/тьмяним → рівний; попавер з міні-планом; драбинка 2-18).
> BUILD: CD batch-4, 3 варіанти (ATELIER/TECHNIC/GALLERY). ✅~ блоково С33-5.
> Розкадровка: `CD-RUN-air-batch-4/reference-frames/b9-plan-*`.

## СУТЬ
На вхід/свап-поверху план сеттлиться ОДНИМ жестом rotate(-28°)+scale(.92)+brightness(.7)→identity
(transform/filter/opacity, 1.1s E); hover юніта → попавер з РЕАЛЬНИМ міні-планом (виділений юніт
stroke-draw) + ціна/площа; клік → pin (✛→×, 1 pinned max); драбинка 2-18 свапить поверх під вуаллю.

## ІНВАРІАНТИ
Сеттл transform-only (нуль layout); попавер завжди з міні-планом; 1 pinned max; свап ТІЛЬКИ під
вуаллю; тач=tap-попавер/tap2-pin. Стиль плану, палітра — фасад.

## ГЕЙТИ (С33-5, 6/6): settle transform-only · settle-completes · hover→попавер+міні · 1-pinned-max · swap-під-вуаллю · 0 err.
## §КАЛІБРУВАТИ: вуаль@swap ~93% (не 100%) — подовжити hold +60ms; план щільніший (ближче до live-дренажу) при полірі.

## ФАЙЛИ
`build.html` = ATELIER (робочий канон за ОКОМ — НЕ піксель-parity; фінал = вердикт Єгора). `variant-technic.html` · `variant-gallery.html` = банк.
