# split-word-headline — двоплатформний прийом (springs intro/hero title)

> Батч A · модуль #2/17. Формат A (стандарт, затверджений на еталоні
> [[rotated-matrix-collage]]): `component.js` (dual wrapper) + `engine.js`
> (доведений core) + `.css` + `stage.html` + `demo.html` (iframe-фрейми) +
> `meta.json{differs}` + цей README.

## Що це

Заголовок springs розбитий на слова; кожне **слово підіймається з-під власного
overflow:hidden clip** (yPercent 120→0) + проявляється, хвилею зі стагером. Це
типографічний hero-примітив: не per-char blur, не whole-line mask — саме
незалежний підйом кожного СЛОВА.

## 🔴 Чим mobile відрізняється й чому

Механіка reveal — **одна**. Обидві платформи ганяють **той самий pure `set(p)`**,
що вже є в движку. Відрізняється **джерело `p`**:

| аспект | телефон | десктоп |
|---|---|---|
| тригер | **auto-play на mount** (за часом) | **scroll-scrub** (за скролом) |
| функція | `autoReveal()` | `scrollReveal()` |
| драйвер | той самий `set(p)` | той самий `set(p)` |
| реверс | ні (грає раз) | так (скрубиться ↕) |

**Чому різний:** на телефоні заголовок має проявитись **сам на завантаженні** —
там нема простору «скрубити» коротку секцію скролом. На десктопі каскад слів
прив'язаний до скролу входу в секцію (реверсивний). Це відповідає живому springs.

## Походження коду (не з нуля)

- **core** ← `library/components/split-word-headline/component.js` → скопійовано в
  `engine.js` без змін (доведений: transform+opacity only, GPU, gate-clean).
- **dual-обгортка** (`component.js`) створює движок у `trigger:'progress'` (щоб МИ
  володіли драйвером), тоді desktop→`scrollReveal`, mobile→`autoReveal`. Обгортка
  не чіпає механіку — лише вибирає джерело `p`.

## API

```html
<script src="engine.js"></script>
<script src="component.js"></script>
```
```js
SplitWordHeadlineDual.init('#hero h1', {
  platform: 'auto',   // 'auto' | 'desktop' | 'mobile'
  stagger: 0.09,      // хвиля між словами
  playMs: 1400        // mobile-only: тривалість auto-play каскаду
});
```
`platform:'auto'` читає `matchMedia('(min-width:1024px)')`. Розмітка: елемент із
заголовком (`data-swh`), рядки через `\n`/`<br>`.

## Закон

transform translateY (yPercent) + opacity на word-спанах + per-word clip only.
Без layout-анімації, mix-blend, backdrop, WebGL. reduced-motion → усі слова видно
без руху на **обох** платформах.

## Демо

`demo.html` — телефон 390×844 (auto-reveal на монтуванні, кнопка «↻ програти знову»)
+ десктоп 1440 (scroll-reveal, скрубиться скролом). Кожен фрейм сам обрав гілку.
```
python3 -m http.server 8879   # → /demo.html
```
