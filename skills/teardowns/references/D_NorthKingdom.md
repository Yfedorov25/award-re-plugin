# D_NorthKingdom — northkingdom.com (ГЛИБИННИЙ РОЗБІР, 10/10 за схемою v1) ✅
> СВІТОВИЙ ЕТАЛОН gaming/entertainment. Awwwards-студія з 2003. Член NoA family.
> Клієнти: Electronic Arts, Supercell, Riot Games (RiotX Arcane), 10 Chambers, Absolut. Розбір desktop 1280.
> НАШ СТЕК (друге підтвердження поспіль): Next + React + R3F + Lenis.

## 1. ТЕХ-СТЕК ★★★ (= наш цільовий, підтверджено вдруге)
- **Next + React + WebGL2 + Lenis, 1 canvas, 14 скриптів.** R3F підтверджено через **leva-токени** (hasLeva=true) — як 14islands. Друга R3F-студія поспіль = патерн стеку остаточний.
- **Home = .mp4 showreel** («North Kingdom 20 year showreel» з плеєром 00:00 / fullscreen / unmute). Як 14islands — home легкий (відео), важкий 3D в кейсах.

## 2. ДИЗАЙН-ТОКЕНИ (109 :root)
### 2.1 EASING-БІБЛІОТЕКА як токени (ТРЕТЄ підтвердження — індустрійний стандарт) ★
- --ease-out-quad: cubic-bezier(0.25,0.46,0.45,0.94)  ← знову наш дефолт
- --ease-out-cubic: cubic-bezier(0.215,0.61,0.355,1)
- --ease-out-quint: cubic-bezier(0.23,1,0.32,1)
- --ease-out-circ: cubic-bezier(0.075,0.82,0.165,1)  ← circ, дуже плавне гальмо (нова)
- --ease-in-out-quint: cubic-bezier(0.86,0,0.07,1)
- --ease-in-out-quart: cubic-bezier(0.77,0,0.175,1)
- --ease-in-out-expo: cubic-bezier(1,0,0,1)  ← екстремальний expo
- --ease-in-out-quad: cubic-bezier(0.455,0.03,0.515,0.955)
- --ease-in-quint: cubic-bezier(0.755,0.05,0.855,0.06)
- --ease-standard-decelerate: cubic-bezier(0,0,0,1)  ← Material decelerate
- --ease-standard-accelerate: cubic-bezier(0.3,0,1,1)  ← Material accelerate
→ ВИСНОВОК (3 R3F-студії поспіль): award-R3F-студії ЗАВЖДИ тримають Penner easing як CSS-токени. Це must для нашого motion-system.

### 2.2 Кольори — gaming-палітра з ALPHA-СИСТЕМОЮ ★
- База: --color-bg / --color-black: #050311 (синювато-чорний «ігровий космос»).
- **Шкала прозорості** (професійна система оверлеїв): --color-black-25 rgba(5,3,17,.25), -40, -50, -60 (.6), -80 (.8). + --color-dark-gray-70 rgba(44,43,52,.7).
- Інверсія тем: --color-fg #fff / --color-bg-inverted #fff / --color-fg-inverted #050311 (light/dark перемикання).
- Урок: тримати не лише суцільні кольори, а шкалу альфа того ж кольору (для оверлеїв/глибини) — це дає «глибокий» темний дизайн.

### 2.3 Типографіка — FK-родина (одна родина в усіх ролях)
| Роль | Font | Size | Weight | lh | ls |
|---|---|---|---|---|---|
| H1 | FKDisplay (narrow-dot) | 95.7px | 400 | 90.9px (0.95) | -1.9px |
| H2/H3 | FKGroteskNeue | 22px | 400 | 25.4px (1.15) | normal |
- Файли: FKGroteskNeue-Regular.woff2 + FKDisplaynarrowdotv1.woff (вузький display з крапкою — характерний gaming-почерк). Ймовірно + FKGroteskMono.
- H1 гігантський 95px, lh<кегль (щільний монументальний), від'ємний трекінг. Одна родина FK = цілісність бренду.

## 3. DOM-АРХІТЕКТУРА
- Next SSR DOM + R3F canvas + Lenis. leva в проді (тюнять 3D). Відео-плеєр на home.

## 4. ПОЕКРАННА РОЗКАДРОВКА (копірайт дослівно)
### S1 HERO: H1 «North Kingdom» (FKDisplay 95px). Маніфест: «North Kingdom is the creative agency for the world of gaming. We connect players and brands through unforgettable experiences and engaging platforms.»
### S2 SHOWREEL: «North Kingdom 20 year showreel» (відео-плеєр, fullscreen/unmute).
### S3 WORK: проєкти з категоріями: Norwegian Armed Forces Museum(400 Years Alive), Absolut(Endless Summer), EA(Highlighter), Supercell(Creators+Events Platform), Kotex(Period Planet), Riot Games(RiotX Arcane), 10 Chambers(Den of Wolves). «We've worked with clients big and small, all leaders in their industries».
### S4 ABOUT: «Creative & Innovation since 2003». «From concept to execution, we design products, services, and experiences that bring ideas to life. Our work helps brands build genuine relationships with people through creativity, design, and technology.»
### FOOTER: «A member of the NoA family», «Back to north».

## 5. ПЕРЕХОДИ / РУХ (виміряно)
- Домінанта 0.6s × 50 (контентні появи) + 0.2s × 22 + 0.3s × 17 (UI) + 0.1s × 5 (мікро).
- Складені переходи: «0.25s,0.25s,0.25s,0.35s» (оркестрація 4 властивостей з фінальним довшим) — характерний прийом точної хореографії.
- Easing з токен-бібліотеки (out-quad/out-circ дефолти).
- Емоція: 0.6s = впевнено-енергійно (gaming-драйв, але не хаос), темна палітра + showreel = «епічний світ ігор».

## 6-8. КОПІРАЙТ / ЕМОЦІЯ
- Big Idea: «creative agency for the world of gaming» (чітка ніша-фокус, не «ми все вміємо»). Onlyness через спеціалізацію на gaming.
- «connect players and brands through unforgettable experiences» — місток гравці↔бренди.
- Архетип Creator+Hero (gaming-енергія). Тон: впевнений, епічний, але теплий («genuine relationships»).
- Героїчний момент: 20-year showreel + темний космос-фон + гігантський FKDisplay 95px = «входиш у всесвіт ігор».

## 9. ВІДТВОРЮВАНІСТЬ ★★★ (наш стек)
- **Easing-токени:** 🟢 копіюємо повний набір `--ease-*` (3-тє підтвердження must-have).
- **Alpha-система кольорів:** 🟢 для кожного базового кольору — шкала rgba .25/.4/.5/.6/.8. Дає глибину темним дизайнам. ПЕРЕЙМАЄМО.
- **Home=showreel відео:** 🟢 mp4 hero + плеєр (fullscreen/mute controls). Стратегія легкості.
- **FK-родина (display+grotesk+mono одна сім'я):** 🟢 одна шрифт-родина в ролях = цілісність (аналог: вся родина одного гротеску з display-катом).
- **Next+R3F+Lenis+leva:** 🟡 наш стек.
- **Складена оркестрація переходів (різні властивості різний час):** 🟢 GSAP timeline.

## 10. ІНЖЕНЕРНИЙ HANDOFF
- Стек 1:1 = наш: Next+React+R3F+drei+Lenis+leva(dev)+GSAP.
- Токени: easing-бібліотека + alpha-шкала кольорів (база #050311-стиль + rgba-щабли) + FK-стиль display(95px clamp, lh .95, negative ls) + grotesk UI.
- Рух: 0.6s контент / 0.2-0.3s UI, out-quad/out-circ, складена оркестрація для героїчних моментів.
- Home: відео-showreel (легкість), 3D в кейсах.
- 🟡 наш базовий стек для gaming/entertainment/bold-брендів.

## [МОБІЛЬНИЙ] — за обмеженням зонда: SSR-DOM адаптивний, нав-меню присутнє. Точні мобільні px — реальний девайс.

## МЕТА-ВИСНОВОК (14islands + North Kingdom разом):
Дві award-R3F-студії поспіль = ОДНАКОВИЙ стек (Next+React+R3F+Lenis+leva) + ОБИДВІ тримають easing-бібліотеку як CSS-токени + ОБИДВІ home=відео (3D в кейсах). Це наш валідований цільовий стек і патерн. Не теорія — підтверджено двічі наживо.
