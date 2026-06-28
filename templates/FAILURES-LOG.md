# FAILURES-LOG — журнал провалів проєкту (append-only, того ж дня)
> Закон H1/A11 конституції. Формат запису: ## F-NN · Назва → **Що сталось** →
> **Чому** (корінь, не симптом) → **Правило** (імператив, який унеможливлює повтор).
> 2+ повтори одного класу = кандидат у закон конституції плагіна (через /award-re:learn).

## F-08 · drag-карусель ламається, коли курсор виходить за viewport
**Що сталось** — horizontal-spec-carousel (Brick 8): стрілки ок, але при drag (натиснув + повів убік і відпустив ПОЗА каруселлю) трек застрягав мід-драгом, spec-row знизу зникав і не повертався; ще й дрібний/нульовий рух (клік) перемикав картку.
**Чому** (корінь) — pointermove/pointerup слухались на самому `.hsc-viewport`, тож drag, що завершувався поза елементом, не отримував подію кінця → `drag` лишався активним, transition='none', spec не перемальовувався. Плюс поріг 40px + відсутність прапорця `moved` → випадковий мікрорух трактувався як свайп. Плюс `paintSpec` завжди блимав opacity 0→1, тож перерваний rAF міг лишити рядок на 0.
**Правило** — для будь-якого drag-прийому: move/up/cancel слухати на **window** (не на елементі), що drag почав; кінець завжди має settle (snap до стану) і перемалювати залежні шари; крок лише якщо `moved && |dx| >= max(40px, ~18% кроку)`; чистий клік (no move) НЕ діє; crossfade-блимання робити лише при реальній зміні + safety-timeout повернення opacity=1.

## F-09 · SVG-маркер стрибнув у кут (CSS transform затер SVG translate)
**Що сталось** — line-art-location-map (Brick 9): target-marker ⊙ мав стояти в центрі мапи (`<g transform="translate(760 470)">`), але опинявся у верхньому-лівому куті (0,0).
**Чому** (корінь) — JS анімував scale через `element.style.transform = 'scale(...)'` на ТОМУ Ж `<g>`, що ніс позиційний SVG-атрибут `transform="translate(...)"`. CSS-inline transform ПОВНІСТЮ перекриває presentation-атрибут `transform` → translate зник, група впала в 0,0.
**Правило** — НІКОЛИ не анімувати CSS-transform на SVG-елементі, що позиціонується SVG-атрибутом `transform`. Розділяти: ЗОВНІШНІЙ `<g transform="translate">` = позиція (не чіпати), ВНУТРІШНІЙ `<g data-*>` = лише анімований scale/opacity. (Для HTML — те саме: не змішувати позиційний і анімаційний transform на одному вузлі.)

## F-10 · клік по Close не спрацьовував (header перекривав по z-index)
**Що сталось** — menu-tracked-stagger (gapsy Brick 4): overlay відкривається, але клік по «Close»-pill не закривав — playwright показав «header Menu button intercepts pointer events».
**Чому** (корінь) — Close-pill мав z-index calc(overlay+1)≈81, а хедер сторінки з тригером «Menu» = z 90. Вони обидва у правому-верхньому куті → хедер (вищий z) з'їдав кліки по Close, хоч візуально Close зверху.
**Правило** — будь-який overlay-control (Close/тригер) мусить ЯВНО переважати z-index хедера/персистентного UI, що ділить ту саму зону. Не покладатися на «calc(base+1)» — задавати свідомо великий (напр. 200) і перевіряти РЕАЛЬНИМ кліком (не лише isOpen()-станом), бо overlap-перехоплення не видно у програмному set-state.

## F-11 · per-char reveal «стрибав» (random dx/dy + rotation) замість плавної хвилі
**Що сталось** — scramble-settle-text (bydorr): текст вилазив нестабільно — літери на краю ТЕЛЕПОРТУВАЛИСЬ вертикально й крутились, замість плавної хвилі як на референсі (юзер помітив по запису).
**Чому** (корінь) — модель давала кожній літері random translate(±chaos dx, ±chaos dy) + rotate(±). Випадковий ВЕРТИКАЛЬНИЙ зсув + поворот = око читає як «стрибок/поява», а не «всідання». Референс bydorr насправді = BASELINE-LOCKED горизонтальний smear (extra letter-spacing + легкий зсув ВПРАВО + легке зменшення + fade), БЕЗ Y, БЕЗ rotation.
**Правило** — для per-char/scroll reveal, що має читатись ПЛАВНО: тримати літеру на BASELINE (нуль translateY, нуль rotation); анімувати лише opacity + letter-spacing + горизонтальний x + scale (≤1). Випадковість — лише в МАГНІТУДІ (seeded scalar), НІКОЛИ в напрямку руху по вертикалі. Перевіряти числом: maxVerticalMove==0 на всіх p. Коли є референс — звіряти модель проти його кадрів (тут: 4-агентний fidelity-workflow → collapse-tracking переміг scatter/rise/blur).

## F-12 · «весь текст сірим» — opacity-floor + широке вікно показали всю фразу разом
**Що сталось** — той самий scramble-settle: після фіксу руху текст усе одно «не той формат» — ВЕСЬ текст видно сірим і чорніє по рядку. На референсі НЕ видно всієї фрази: тільки solid-голова + вузький край, а попереду — ПОРОЖНЬО (білий екран).
**Чому** (корінь) — (1) opacity мала FLOOR 0.10 для всіх літер, тож навіть ті, чиє вікно ще не почалось, світились сірим; (2) charWin=0.16 був широкий → багато літер у польоті одночасно → читалось як ціла фраза що проявляється. Я аналізував ревріл із СЕРЕДИНИ, а не з t=0 — і пропустив що на старті екран ПОРОЖНІЙ.
**Правило** — typewriter/per-char reveal: літера ПОПЕРЕДУ свого вікна = opacity 0 (НЕВИДИМА), нуль floor — фраза НІКОЛИ не показується вся разом. Вікно ВУЗЬКЕ (charWin малий) щоб у польоті було ~3-5 літер = тонкий фронт. opacity рости швидше за просторовий колапс (sqrt(lp)) щоб голова була solid поки край ще блідий. ЗАВЖДИ розкадровувати референс із t=0 (а не з середини) — стартовий стан визначає формат. Перевіряти: hiddenAt0==true.

## F-13 · SVG-мапа: slice-crop розсинхронив %-DOM-пінси + emoji-іконки не рендеряться
**Що сталось** — river-tinted-poi-map: pre-render SVG-art мапи з `preserveAspectRatio="xMidYMid slice"` кропився під розмір стейджа, а POI-пінси/диск позиціоновані `%` від стейджа → не збігалися з артом (пінси «з'їхали» за кадр). Плюс іконки-emoji в пінсах не показувались (headless без emoji-шрифту).
**Чому** (корінь) — `slice` масштабує+кропить viewBox незалежно від %-координат DOM-оверлею; різні системи координат. Emoji залежать від наявності emoji-шрифту в середовищі рендера.
**Правило** — коли поверх inline-SVG-мапи лежать DOM-елементи, позиціоновані `%`: SVG має бути `preserveAspectRatio="none"` (арт заповнює стейдж 1-в-1, координати збігаються). Іконки в UI — ТІЛЬКИ font-independent (inline SVG / unicode-марки ◆❀♪✦), НІКОЛИ emoji (можуть не відрендеритись). Перевіряти скрін із РЕАЛЬНИМ позиціюванням (scroll stage top=0), не з дефолтного скролу.

## F-14 · мапа вийшла «джуніор» — рідкий ескіз замість щільної картографії
**Що сталось** — river-tinted-poi-map (Brick 3): рушій правильний, але АРТ мапи був рідкий (2-3 дороги, 1 примітивна «трубка»-ріка, 4 овальні блоби, грубі гліфи, товстий fill-диск). Юзер: «зовсім не так, слабенько, джуніор, не повторили їх рівень». Оригінал = ЩІЛЬНА реальна картографія (десятки вулиць, багатовигинна ріка з підписами набережних, деталізовані landmark-силуети, тонкий outline-диск).
**Чому** (корінь) — я зробив СХЕМАТИЧНИЙ placeholder-арт і прийняв його за готове. Двигун ≠ композиція: технічно працює (draw/ladder/hover GREEN), але візуальна щільність/деталізація не відтворили рівень еталона. Перевіряв «чи рендериться», а не «чи це 1-в-1 з їх рівнем».
**Правило** — для будь-якого hand-authored арту (мапа/ілюстрація/гліфи): щільність і деталізація = ЧАСТИНА відтворення 1-в-1, не «потім поліш». Звіряти фінальний скрін З ОРИГІНАЛОМ ПОПІКСЕЛЬНО по кожному шару (скільки вулиць? ріка скільки вигинів? гліфи впізнавані?), не лише «чи є елемент». Якщо арту багато — фан-аут workflow (агент на шар), не малювати рідкий placeholder. Ріки/природні форми НЕ самоперетинаються (агент намалював петлю — виправити).

## F-15 — numbered-floorplate-select: hover '+' flew to the SVG top-left corner
**Symptom:** hovering an apartment, the number vanished and an orange '+' jumped to the plan's top-left corner (user video 13.13.48).
**Root cause:** `.nfp-pill { transform: scale(1.1) }` on hover. The pill `<g>` already has an inline `transform="translate(cx cy)"` (set by JS to the centroid). A CSS `transform` on an element OVERRIDES its SVG `transform` ATTRIBUTE entirely → the `<g>` lost its translate and rendered at the SVG origin (0,0); the '+' (opacity 0→1 on hover) appeared there. `transform-box:fill-box` on a `<g>` did not save it.
**Fix:** never put a CSS `transform` on a `<g>` that carries an inline `translate` attribute. Move the hover-grow onto the inner `.nfp-pill__bg` `<circle>` (its own `transform-box:fill-box; transform-origin:center`), leave the `<g>` translate untouched; number↔'+' swap by opacity only (both centred in the same translated `<g>`).
**Lesson:** CSS `transform` beats the SVG `transform=` attribute — they don't compose. Animate a child, or write the full transform (translate+scale) via CSS/GSAP, never half in attr + half in CSS.
