# ATOM: air-preloader-split (B5) — конвой-wordmark + роз'їзд панелей «одним диханням»

> Закон = T-524 дослівно з live CSS aircenter.space (плівки прелоадера нема — Desktop-air.mp4
> стартує після нього). Движок-прародич: `award-re-plugin/library/components/preloader-logo-convoy/`.
> BUILD: CD batch-3 (UUID b637·95f2, НЕ git) + 2 мої фікси. ✅~ блоковий вердикт Єгора С33-4
> («ці білди фіксуємо») — пер-атомного ока не було.

## СУТЬ
Оверлей: літери wordmark їдуть конвоєм (офсети 76.6/51/25.5/0 · E(.25,.74,.22,.99)) у розведений
рядок + чесний лінійний прогрес-бар 2px; на готовності оверлей розчиняється ВЕСЬ (opacity→0)
СИНХРОННО з в'їздом сторінки ([data-top] −100%→0 · [data-bottom] +100%→0 · [data-text] 20px→0) —
2s, ОДИН bezier(.7,0,.3,1) на всі рухи.

## ІНВАРІАНТИ
Драйвер = прогрес завантаження (НЕ скрол); min-show 1500ms; сторінка запаркована ДО першого
кадру (нуль CLS); mid-exit сторінку ВИДНО КРІЗЬ напівпрозору вуаль (глуха завіса = бан);
оверлей знімається з DOM повністю; reduced-motion = оверлей не монтується взагалі.

## ГЕЙТИ (ганялись С33-3, 8/8)
parked+overlay до paint · convoy-ratio ідентичні по літерах · бар==p лінійно · one-breath mid-exit
(op∈(0,1) І хедер уже їде) · done-clean (DOM без оверлея, transform=none) · replay ×2 без
дублювання · reduced=нуль оверлея · 0 errors. Верифікатор-патерн: scratchpad С33 gates-s34.mjs.

## 🔴 УРОКИ
1. CD пропустив replay-кнопку з промпта → додано вручну (ghost bottom-right).
2. 🐛 stale safety-таймер (2300ms) першого ритуалу вбивав phase повторного → clearTimeout у
   run()/finish(). Закон: one-shot safety-таймери завжди зберігати id і чистити.

## ФАЙЛИ
`build.html` = cd-b3/air-b3-preloader-split.html (KORA-фасад, після 2 фіксів).
