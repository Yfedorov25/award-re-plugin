---
description: Кристалізує задачу з чату у control/tasks/T-NNNN.md (єдине джерело правди) — заголовок, проєкт, web/mobile, demo-gate
argument-hint: "<вільний опис задачі>"
---

# award-re — Task (кристалізація задачі)

Підкоряйся `${AWARD_RE_PLUGIN_ROOT}/CLAUDE.md`, розділ **J (CONTROL)**. Ця команда
перетворює вільний опис юзера на структуровану задачу у `control/` — крос-проєктному
єдиному джерелі правди (НЕ `.award-re` окремого сайту).

## 0. Перевір, що control/ існує
Bash: `test -d control && echo OK || echo "NO_CONTROL"`.
- `NO_CONTROL` → скажи юзеру, що систему control ще не зібрано, і зупинись (не вигадуй структуру).
- OK → читай `control/projects.yaml` (список проєктів) і `control/schema/task.md` (формат).

## 1. Кристалізуй задачу з аргументу/контексту
З вільного опису юзера витягни (питай ТІЛЬКИ якщо справді неоднозначно):
- **title** — короткий заголовок-акт, дієслово першим, БЕЗ крапки в кінці, Fedoriv-голос,
  антислоп (нуль em-dash, нуль кліше). Напр.: «Підключити GA4 до towns».
- **project** — авто-match до `projects.yaml.id` за іменем/контекстом (smarts/quadro/nahirna/towns/…).
  Якщо задача крос-проєктна — `project: ""`.
- **platform** — `web` або `mobile`. За замовчуванням `web`, якщо не сказано «мобільний/застосунок».
- **stage** — `backlog`, якщо не почато; `in-progress`, якщо вже в роботі.
  ⚠️ `platform: mobile` СТАРТУЄ `backlog` (закон J4), навіть якщо здається почато.
- **demo_gate** — `true` за замовчуванням (закон J3: done лише після демо з девелопером);
  `false` лише для суто внутрішніх/підготовчих задач без демо.
- **source** — `chat` (Slack/Telegram — фаза 2).

## 2. Знайди наступний вільний ID
Bash: `ls control/tasks/ | grep -oE 'T-[0-9]+' | sort | tail -1` → інкремент (T-0007 → T-0008).
Перший — T-0001. Формат: `T-` + 4 цифри.

## 3. Створи файл
Запиши `control/tasks/T-NNNN.md` строго за `control/schema/task.md`:

```markdown
---
id: T-NNNN
title: <заголовок>
project: <id|"">
platform: web|mobile
stage: backlog|in-progress
demo_gate: true|false
created: <сьогодні YYYY-MM-DD з Bash `date +%F`>
source: chat
---

## Контекст
<1-3 речення: навіщо ця задача>

## Критерії готовності
- [ ] <з опису юзера; конкретні, перевірні>

## Лог
- <дата> created (chat)
```

## 4. Звіт одним рядком
Повідом юзера: `T-NNNN · <title> · <project|крос> · <platform> · <stage>`.
Не переказуй увесь файл. Якщо demo_gate=true — нагадай одним рядком, що закриється
лише після його demo-confirm (закон J3).

## Бани
- НЕ створюй задачу «в голові» без файлу (порушує J5).
- НЕ став `stage: done` цією командою НІКОЛИ (done — лише через demo-confirm, J3).
- НЕ вигадуй проєкт, якого нема в projects.yaml — `""` якщо не підходить жоден.
- Заголовок без крапки, без em-dash, без кліше (E15 + антислоп).

---

## РЕЖИМ INBOX (аргумент `inbox` або «розгреби inbox [<сесія>]»)
Telegram-бот складає сирі задачі (голос/текст) у БД-чергу `inbox` (Vercel fs read-only,
тож бот не пише файли). Бот ПИТАЄ юзера кнопками, в яку **сесію** направити задачу
(smarts-mobile / nahirna / quadro / control / any). Цей режим розгрібає ЧЕРГУ СВОЄЇ СЕСІЇ.

Потрібен `CONTROL_BOT_SECRET` (Vercel env проєкту control). Читай `/tmp/bot-secret.txt`,
якщо є; інакше попроси юзера (значення маскується на `vercel env pull`).

**СЕСІЯ-МІТКА:** бери мітку, закріплену через `/award-re:session <мітка>` цього чату
(towns / web3 / control / …). Кнопки бота = СЕСІЇ; ти розгрібаєш ЛИШЕ свою мітку (+`any`).
Якщо мітку ще НЕ закріплено — СПИТАЙ юзера, не вгадуй (towns і web3 в одній папці).

1. **Витягни СВОЮ чергу:** `curl -s -X POST .../api/bot/admin -d '{"action":"inbox","secret":"<S>","session":"<моя-мітка>"}'`
   (base = https://control-rose.vercel.app). Повертає рядки з `session = <мітка>` АБО `any`.
   Поле `inbox[]`: `{id, raw, project, platform, chat_id, session}`. БЕЗ `session` у запиті —
   вся черга (для огляду/control). Рядки з `session=""` ще не направлені — НЕ чіпай їх.
2. **Для КОЖНОГО рядка — СПЕРШУ оціни ясність:**
   - **Якщо задача НЕОДНОЗНАЧНА** (бракує даних, незрозумілий обʼєкт/прототип/ціль) —
     НЕ вигадуй. Кристалізуй у файл зі `stage: backlog` + познач у Контексті що неясно,
     ТА надішли питання юзеру в Telegram:
     `curl ... -d '{"action":"clarify","secret":"<S>","id":<inbox.id>,"chat_id":"<chat_id>","raw":"<raw>","question":"<твоє питання>"}'`
     → боту прийде «🟡 Потрібне уточнення». НЕ виконуй і НЕ шли notifyDone. Чекай відповіді.
   - **Якщо задача ЯСНА** — далі a-d:
   a. Кристалізуй у `control/tasks/T-NNNN.md` (title, project, platform, demo_gate). Вільний ID.
   b. Resolve у черзі: `curl ... -d '{"action":"resolve","secret":"<S>","id":<inbox.id>,"task":"T-NNNN"}'`.
   c. **ВИКОНАЙ задачу** (код/правки відповідного проєкту).
   d. ТІЛЬКИ коли РЕАЛЬНО зроблено й перевірено:
      `curl ... -d '{"action":"notifyDone","secret":"<S>","id":<inbox.id>,"chat_id":"<chat_id>","task":"T-NNNN","title":"<title>","project":"<id>"}'`
      → боту «✅ Готово».
3. **Бот каже лише «отримав, у черзі» — НЕ «прийнято».** Прийняття = твоє рішення в сесії:
   або notifyDone (зроблено), або clarify (питання). НІКОЛИ не шли notifyDone наперед
   (закон B-серії: звіт ≠ зроблено).
4. Кілька задач — по черзі; план, виконання, короткий звіт.
