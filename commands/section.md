---
description: Build/rebuild ONE site section through the enforced state machine (audit → copy-in-chat → prototypes-on-ports → user choice → integrate → verify → rollback-point → deploy → prod-check)
---

# award-re — Section (стейт-машина v1)

Підкоряйся `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md` (конституція). Прочитай перед стартом:
- `.award-re/motion-score.md` (константи + партитура дистанцій) — нема → спершу склади (skills/motion-score).
- `.award-re/FAILURES-LOG.md` проєкту (закон A11) — щоб не повторити.
- `${AWARD_RE_PLUGIN_ROOT}/skills/grammar/references/_GRAMMAR.md` + `_REGISTRY_TID.md` — стек шарів, не «прийом».

## СТЕЙТ-МАШИНА (кожна стадія = артефакт; гейт-хуки звіряють)
Створи/онови `.award-re/state/section-<key>.yaml` (key = коротке імʼя секції, латиницею,
збігається з іменем файла секції — напр. `units`, `hero`, `cta`). Формат:

```yaml
section: units
stage: data-read            # поточна стадія
data-read: 2026-06-13       # кожна пройдена стадія = дата/артефакт
design-intent: .award-re/design-intent.md#units
copy-variants: chat 2026-06-13   # повні секвенції В ЧАТІ (хук банить AskUserQuestion-копі)
prototypes: /tmp/proto-units (порт 4207, 3 варіанти)
user-choice: "П1+В2 — <одним рядком що обрано>"   # ← без цього Write у src/ ЗАБЛОКОВАНИЙ
integrate: <commit>
verify-dom: .award-re/state/verify-report.json    # scripts/verify.mjs; без свіжого деплой ЗАБЛОКОВАНИЙ
rollback-point: tag stable-pre-<wave>
deploy: <url>
prod-check: 2026-06-13      # DOM-факти на проді, всі пункти меню
log: «-» або F-NN
```

## СТАДІЇ
1. **data-read** — сирі дані клієнта (info.txt/brief) + чесність чисел (закони A1, F1-F3).
2. **design-intent** — блок секції у design-intent.md (Лінзи 1-5 + 4 тести). Хук блокує UI-write без нього.
3. **copy-variants** — 2-3 ПОВНІ секвенції в чаті (назва прийому + «чому працює»), бани з bans.yaml (закони E1-E14).
4. **prototypes** — 2-4 single-file HTML на локальному порту (`python3 -m http.server`), РІЗНІ СТЕКИ ШАРІВ (≥5 шарів для flagship, закон C1); реальні ассети або чесні кропи. Дай юзеру посилання. «Описати рух» замість показу — ЗАБОРОНЕНО.
5. **user-choice** — вибір юзера вільною відповіддю → запиши у state + motion-score (з датою і відхиленими варіантами, закон A7).
   **Autopilot-протокол:** прототипи СТВОРЮЮТЬСЯ завжди; якщо юзер делегував вибір
   (mode: Autopilot), обери сам за brand+перф+критеріями і запиши
   `user-choice: "autopilot: <варіант> — <чому>"` + покажи юзеру посилання на прототипи
   для пост-фактум перегляду. Гейт приймає обидва формати.
6. **integrate** — у системний словник проєкту (motion-score константи), спавном агента `section-builder` (контракт v2) для великих секцій.
7. **verify-dom** — `node ${AWARD_RE_PLUGIN_ROOT}/scripts/verify.mjs --url <preview> --routes <всі> --project <корінь>` + ручні DOM-факти специфіки секції (обидва шляхи даних окремо, закон B5; прев'ю-SPA-фолбек не вірити, закон B4).
8. **rollback-point** — git-тег + Vercel rollback-URL у ROLLBACK.md (закон A9) — для хвиль/редизайнів; для дрібних фіксів достатньо окремого коміту.
9. **deploy** — лише `npm run build`-шлях (закон H9); деплой-гейт перевірить verify-report.
10. **prod-check** — DOM-факти на проді: рендер контенту кожного пункту меню (НЕ http-статус, закон B3) + специфіка секції; потім повідом юзера і чекай його запис екрану (закон I1).
11. **log** — провал будь-якої стадії → FAILURES-LOG.md того ж дня (закон H1).

## Пер-секційний acceptance (перед stage: done)
- стек шарів ≥5/3 записаний рядком у motion-score; пін-бюджет не пробитий (C6);
- прийом не зʼявився втретє на сайті (C3); спосіб шва не повторений (C10);
- mobile не пінить (C7); нуль console.error; verify-report PASS по всіх маршрутах.
