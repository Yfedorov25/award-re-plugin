# CHOREO — amenities-forest (ретроактивна виписка S46-c)

> ⚠️ ЧЕСНА ПОЗНАЧКА: атом ПРИЙНЯТО оком Єгора (S44-S45) ДО появи протоколу ATOM-PROTOCOL.
> Покадровий розбір робився в сесії побудови (кадри/борди тієї сесії), закон руху зафіксовано
> в SPEC.md цього атома — він і є розбором. Цей файл = протокол-маркер + витяг закону.
> ПРИ ПЕРЕБУДОВІ цього атома: зробити ПОВНИЙ full-res розбір за ATOM-PROTOCOL Етап 1
> (12fps+, поверхні, числа подій з профайлера) і ПЕРЕписати цей файл ним.

## Закон руху (зі SPEC.md, прийнятого оком)
## СУТЬ (одне речення)
ОДНА велика cream-panel картка у фікс-слоті (y≈35%→88% viewport); всередині framed-фото + caps-caption
lower-left + circle-стрілки ‹ → lower-right; ТАП стрілки гортає дискретний індекс 3 слайдів ПО КОЛУ
(wrap-around); перехід між слайдами = плавний opacity-crossfade фото+підпису; горизонтальний drag теж гортає.

## МЕХАНІКИ
- **M1 fixed card slot**: `.section{padding-top:35dvh}` + card centered; card w 89.6% (349px@390), aspect 0.777

## Live-джерело
reference/: forest-live.mp4 forest-live.timeline.json 
timeline: reference/*.timeline.json (вікна руху machine-виміряні S46-c ретроактивно)
