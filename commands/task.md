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

## РЕЖИМ INBOX (аргумент `inbox` або «розгреби inbox»)
Telegram-бот складає сирі задачі (голос/текст) у БД-чергу `inbox` (Vercel fs read-only,
тож бот не пише файли). Цей режим розгрібає чергу в сесії.

Потрібен `CONTROL_BOT_SECRET` (Vercel env проєкту control). Витягни його разово:
`cd apps/control && ../quadro/node_modules/.bin/vercel env pull /tmp/c.env --environment production --scope yehor-s-projects3` — АЛЕ значення маскуються; натомість читай `/tmp/bot-secret.txt`, якщо є, або попроси юзера.

1. **Витягни чергу:** `curl -s -X POST .../api/bot/admin -d '{"action":"inbox","secret":"<S>"}'`
   (base = https://control-rose.vercel.app). Поле `inbox[]`: `{id, raw, project, platform, chat_id}`.
2. **Для КОЖНОГО рядка:**
   a. Кристалізуй у `control/tasks/T-NNNN.md` (кроки 1-3 вище: title, project=рядок.project
      або перематч, platform, demo_gate). Наступний вільний ID.
   b. Познач у черзі: `curl ... -d '{"action":"resolve","secret":"<S>","id":<inbox.id>,"task":"T-NNNN"}'`.
   c. **ВИКОНАЙ задачу** (це і є робота — код/правки відповідного проєкту).
   d. Коли задача РЕАЛЬНО зроблена й перевірена → сповісти:
      `curl ... -d '{"action":"notifyDone","secret":"<S>","id":<inbox.id>,"chat_id":"<chat_id>","task":"T-NNNN","title":"<title>","project":"<id>"}'`
      → боту в Telegram прийде «✅ Готово».
3. **Не сповіщай наперед.** notifyDone — ТІЛЬКИ після фактичного виконання + верифікації
   (закон B-серії: «працює в браузері» від агента ≠ зроблено).
4. Кілька задач — оброби по черзі; склади план, виконуй, звітуй коротко.
