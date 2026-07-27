---
description: Learning loop — ingest a failure (same-day F-entry), a user bug recording, or a reference-site video teardown into the plugin's grammar/registry/constitution
---

# award-re — Learn (петля навчання)

Підкоряйся `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md`. Режим обери з аргументу/контексту:

## 1. failure — провал у журнал ТОГО Ж ДНЯ (закони A11/H1)
1. Допиши в `.award-re/FAILURES-LOG.md` проєкту: `## F-NN · Назва` → Що сталось →
   Чому (корінь) → Правило (імператив).
2. Перевір повторюваність: grep класу провалу по FAILURES-LOG усіх відомих проєктів.
   2+ повтори → запропонуй юзеру патч КОНСТИТУЦІЇ плагіна (новий закон) і, за згодою,
   внеси в `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md` + CHANGELOG.

## 2. video-bug — запис екрану юзера з багом (закони I1/I2)
1. `bash ${AWARD_RE_PLUGIN_ROOT}/scripts/frames.sh "<.mov>" /tmp/bug-<name> 1.2`
2. Переглянь листи → діагноз з привʼязкою час/секція → план фіксу → після фіксу
   verify.mjs + прод-чек → запис у FAILURES-LOG, якщо корінь повчальний.
ЗАБОРОНЕНО: відповідати юзеру власними серіями скріншотів (B1).

## 3. video-teardown — еталонний сайт із запису юзера (закони I3/I4)
1. Спавни агента `teardown-anatomist` з шляхами до .mov (його контракт — у agents/).
2. Прийми від нього D_<SITE>_video.md + дельти _GRAMMAR/_REGISTRY_TID; перевір,
   що дельти НЕ суперечать конституції (суперечать → обговорити з юзером, можливо
   це розширення моделі).
3. CHANGELOG-запис «ingestion #N» + commit + push (плагін-репо).

## 4. promote — виграшний прототип/запис → офіційний рядок БАЗИ ТЕХНІК (один прохід)
Вхід: схвалений юзером прототип (виграшний `prototypes/*.html` з `/award-re:section`
або variants-prototyping) АБО еталонний запис `.mov`, що юзер благословив; + бажаний
`id`/`name`. Один атомарний прохід — прототип усередину, перевірений+проіндексований+
звʼязаний-з-мозком+гейт-пройдений рядок назовні, досяжний уже наступного білда секції.

0. **DEDUP** — читай `library/INDEX.json` ПЕРШИМ. Збіг id → це ВАРІАНТ (`variants/<vid>/`), не нова техніка. Без мовчазних дублікатів. Запис → `scripts/frames.sh` для фаз.
1. **CLASSIFY висоту** — один РУХ → component/variant; СТЕК рухів на одному прогресі → combo; цитований-але-не-атомарний util → `shared/`.
2. **EXTRACT** — підніми магічні числа в `tokens.json`, ЗБЕРЕЖИ реальну сигнатуру (declare в `entry.call`; НЕ переписуй на mount()), розділи js/css. Варіант наявного движка → ЛИШЕ `params.json` + `variant.recipe.md` + `variant.lab.html` (без копії движка; форк `component.js` у `variants/*` = заборонено). Combo → `combos/<id>/RECIPE.md` + `combo-lab.html`, що імпортує атоми relative-path.
3. **RECIPE** — повний front-matter за `library/CONTRACT.md`: `meaning.what/when/lands/not_when` (питай юзера про when/lands, якщо не виводяться — БЕЗ них в official не пускаємо), `source.recording` + `registry_ref`, `motion_props`, `combines_with` через матрицю стаковності, `acceptance[]` зі спостережених поведінок, `entry.call`. status:seed.
4. **LAB** — `lab.html`/`variant.lab.html`/`combo-lab.html` на реальних ассетах + проба `window.__LAB_OK__`, що мапить кожен рядок `acceptance`.
5. **VERIFY** — `node scripts/library-verify.mjs` на новій теці headless; крути до GREEN (це і є гейт 100%-відтворення). Red → лишається candidate/wip, звіт чому, НЕ промоутимо. Green → status:official.
6. **REGISTER** (атомарно) — `node scripts/library-index.mjs` (новий рядок INDEX або варіант у parent + INDEX.json + COVERAGE); допиши `IMPLEMENTED-BY` у `_REGISTRY_TID.md` (append-only) для кожного реалізованого T-ID.
7. **RULES** — якщо техніка вносить нову колізію, допиши в `R_anti_combos` / `combines_with` партнерів.
8. **RECORD** — CHANGELOG «library ingestion #N: <id>/<variant>» + commit + push. Вивід юзеру: новий рядок INDEX + verify-green звіт + «section-builder тепер може імпортувати <id>».
