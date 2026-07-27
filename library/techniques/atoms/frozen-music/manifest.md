# ORGANISM MANIFEST: frozen-music (M6, springs /design continuation)

> **Організм = МАНІФЕСТ compose(atomID, шов, scroll-timeline), НЕ html-моноліт** ([[atom-first-not-monolith]]).
> `variants/frozen-music-a.html` — це ПРИЙНЯТА збірка (моноліт-донор, з якого витягнуто атоми).
> Цей файл описує, з ЯКИХ атомів + швів вона складається, щоб суперсистема могла ПЕРЕСКЛАСТИ її
> за ID, а не перебудовувати з нуля. Джерело правди структури: `KAI/M6-SECTION-MAP.md` (13 блоків).

## СКЛАД (13 блоків = атоми + прості flow-цеглини)

| # | блок | атом / примітив | роль у STACKING-GRAMMAR |
|---|------|-----------------|--------------------------|
| 1 | green-glass caption | flow-caption (Ambient parallax bg + Entrance fade) | flow, не pin |
| 2 | рендер вежі світанок | flow-fullbleed (backdrop під наступним overlap) | Ambient |
| 3 | Tabanlioglu картка | **`card-overlap-reveal`** ⭐ | pin-band #1 (Entrance + curtain-mask) |
| 4 | темне листя + concept | flow-fullbleed + fade-dissolve тексту на місці | Ambient + Entrance |
| 5 | дерево в атріумі | **`pinned-caption-crossfade`** ⭐ | pin-band #2 (Ambient crossfade + held-caption) |
| 6 | Frozen Music заголовок | flow-cream (serif під sticky-хедер) | flow |
| 7 | ARISTOCRATIC QUARTET | **`hotspot-tap-overlay`** ⭐ | Interaction (overlay поза scroll) |
| 8 | Glass/metal/stone/wood | flow-cream serif | flow |
| 9 | спіральний об'єкт | flow + parallax-drift ~1.08× (БЕЗ обертання) | Ambient |
| 10 | High-clarity glass | flow-cream sans | flow |
| 11 | Rich Interior Life | **`scrub-carousel-2slide`** ⭐ | pin-band #3 (Interaction як scrub) |
| 12 | Art Gallery of Your Life | flow-dark колаж 2 фото внахлест | flow |
| 13 | Wellness caption | flow-dark caption | flow |

⭐ = витягнутий атом (4-гейт ALL PASS, S43). Решта = прості flow/parallax-цеглини (Ambient+Entrance),
вже покриті базою (fade-coupling, parallax-drift, clip-reveal).

## STACKING-GRAMMAR аналіз (правила library/rules/STACKING-GRAMMAR.md)

**PIN-BUDGET:** M6 має 3 pin-band'и (блоки 3, 5, 11) на 13 блоків ≈ 23% — у межах «max ~half».
Чергування дотримано: pin(3) → flow(4) → pin(5) → flow(6-10) → pin(11) → flow(12-13). НЕ два
суміжні піни (§3). Кожен пін ЗАРОБЛЯЄ scroll-cost payload'ом (card+mask-reveal / crossfade+held /
2-slide-scrub). ✓

**A/B/C-шари на pin-band:**
- pin #1 (card-overlap): B-Entrance (card наїзд + curtain) + A-Ambient (backdrop settle).
- pin #2 (pinned-caption): A-Ambient (bg crossfade) + B-Entrance (held-caption in) + pin-release-tail.
- pin #3 (scrub-carousel): C-Interaction-as-scrub (2 слайди crossfade) + A-Ambient (ken-burns).
- hotspot (блок 7) = C-Interaction ЧИСТА (user-tap), інжектиться поверх flow-фото — НЕ pin.
  Правило §1 footnote 3 «одна Interaction на секцію» дотримано: hotspot і scrub-carousel у РІЗНИХ
  блоках (7 vs 11), не в одному → нема gesture-колізії.

**THEME-FLOW (temperature wave):** dark-green(1-2) → cream(3) → dark(4-5) → cream(6-11) →
dark-green(12-13). Хедер інвертує колір на межах (cream↔ink) — це `air-theme-flip`-закон
(chrome = секція під хедер-лінією). Wellness-green закриває на «green nature beat» перед Flats. ✓

**PERF:** усі рухи = transform+opacity (гейти підтвердили matY/matScale/opacity). Нуль
left/top/width анімацій. backdrop-filter лише на frosted-маркерах hotspot (не в рухомому strip —
урок [[ios-perf-mobile-scroll]]). ✓

## SCROLL-TIMELINE (як атоми лягають на скрол; springs-темп 2fps)

У моноліті-донорі це ОДИН `render(p)` з централізованим SEG/OFF/HOLD (frozen-music-a.html L159-176).
При ПЕРЕСКЛАДАННІ з атомів кожен pin-band володіє власним локальним hold (як окремі build.html),
а організм-обгортка мапить глобальний scroll на локальні hold-и послідовно:

```
p 0.00–0.08  block1 flow-caption (fade-in @0.35s)
p 0.08–0.20  block2 backdrop входить (flow)
p 0.20–0.34  ┌ pin #1 card-overlap-reveal (hold 0..1): backdrop-settle→card-наїзд→curtain-mask
p 0.34–0.42  block4 ivy flow + concept fade-dissolve
p 0.42–0.50  ┌ pin #2 pinned-caption-crossfade (hold 0..1): caption-in→crossfade ivy→tree→release-clip
p 0.50–0.65  block6 Frozen Music cream (flow) → block7 фото+hotspots (Interaction поверх)
p 0.65–0.75  block8-10 glass/spiral(parallax 1.08×)/clarity (flow)
p 0.75–0.90  ┌ pin #3 scrub-carousel-2slide (hold 0..1): slideA→scrub-crossfade→slideB
p 0.90–1.00  block12 Art Gallery колаж + block13 Wellness (flow-dark) → шов у Flats
```

## 5 ШВІВ M6 (під-організми — рівень якого в springs був 0)
Каталогізовані окремо: `../../../rules/seams-m6.md` (→ STACKING-GRAMMAR §seams).
1. **glass→tower** — hard cut, flow (обидва рухаються разом)
2. **tower→card** — OVERLAP (backdrop пін/settle, card наїжджає) = ВНУТРІШНІЙ шов `card-overlap-reveal`
3. **ivy→tree** — CROSSFADE під held-caption = ВНУТРІШНІЙ шов `pinned-caption-crossfade`
4. **cream-run** — суцільний document-flow (Frozen Music→hotspot→glass→spiral→clarity→RIL); hotspot-оверлеї fade поверх
5. **RIL-pin→gallery** — pin-release scroll-push (card RIL виходить угору) → hard cut cream→dark-green

## СТАТУС
- 4 атоми: 4-гейт ALL PASS (S43). INDEX-звірка → extends: reveal-sequence / editorial-act-crossfade /
  slider-cycle; hotspot = NEW.
- composition-check ALL PASS (стекуються без pin/z/timeline-конфлікту).
- Моноліт-донор `variants/frozen-music-a.html` = ПРИЙНЯТО Єгором (S42, «давай приймати А»).
- 🔴 против LIVE піксельно/по-відео НЕ звірено — темп/фасад судить око Єгора на борді.
