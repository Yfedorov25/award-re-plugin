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
