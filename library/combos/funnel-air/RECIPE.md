---
id: funnel-air
name: "ЗБОРКА ФУНЕЛА AIR (DoD-екзамен №2: дріл → план → unit + каталог + ♡)"
level: 3
kind: page-assembly
status: candidate            # екзамен: Єгор гортає поруч з /visual-search і /offices
section: funnel
mode: click
meaning:
  what: "Весь продажний фунел AIR одним SPA-потоком з готових атомів: дріл рівень 1 (плити, clickable=count>0) →ЧОРНИЙ flash→ живий план 2_18 →flash→ unit-сторінка (жива ціна, T-431 furnished, T-523 handoff міняє юніт на місці через flash) · паралельна гілка List: каталог 5 живих офісів →БІЛА штора T-M22→ unit · ♡ звідусіль складається у favourites-панель з бейджем. Закон штор: фунел-переходи чорні, буденні (list↔unit) білі."
  when: "Мілстоун-екзамен спринтів 3–4: два вікна поруч з /visual-search і /offices; розбіжність = фікс до збігу; атоми повертаються в доробку."
  lands: "Один потік руки: тапнув поверх — чорний подих — план; тапнув офіс — і ти вже на кресленні з цінами; сусідні плани кличуть далі без списку, а сердечка тихо збираються у шухляду з кнопкою на email."
source:
  grammar: "живі /visual-search + /visual-search/building/2/floor/18 + /offices + /office/AR-1-18 (всі в live-archive) + атоми спринтів 3–4"
  recording: "Desktop-air.mp4 t118–142 (дріл) + MOBILE-air-4.mp4 (list/♡/unit) → REF-и атомів"
  registry_ref: ["T-104", "T-115", "T-407", "T-428", "T-430", "T-431", "T-523", "T-530", "T-408", "T-409", "T-419", "T-M22", "T-M30", "T-M31", "T-M32"]
stack: "vanilla атоми бібліотеки + funnel-curtain ×2 інстанси (чорна/біла)"
webgl: false
uses:
  - { atom: funnel-curtain, job: "чорний flash (фунел) + біла T-M22 (буденні) — 2 інстанси, нуль пінів" }
  - { atom: building-floor-drill, job: "рівень 1" }
  - { atom: floor-plan-select, job: "рівень 2 (живий план 2_18)" }
  - { atom: office-unit-card, job: "unit з T-431/T-523 (mount по nr)" }
  - { atom: office-cards-list, job: "каталог-гілка (5 живих офісів)" }
  - { atom: favourites-panel, job: "♡-система з бейджем" }
pin:
  owner: none
  count: 0
page_beat: [conversion]
gated_by: [R_perf_limits, R_no_webgl]
acceptance:
  - "шлях дрілом: плита 2-18 → (чорний flash) план → юніт 158 → unit «Office №158» з живою ціною 432 935 800"
  - "T-523 handoff: клік similar міняє unit на місці (через flash)"
  - "List-гілка: каталог (5 карток) → клік → (БІЛА штора) unit; 🔒 глухий"
  - "♡ з каталогу → бейдж хедера → панель зі списком; Choose an office з панелі веде в каталог"
  - "моб: дріл = T-M32 заглушка, list-гілка повноцінна"
  - "errors 0; нуль пінів; ЕКЗАМЕН: два вікна поруч з /visual-search і /offices"
files: [combo-lab.html, RECIPE.md]
---

# funnel-air — фунел одним потоком руки

Другий посторінковий екзамен DoD. Всі цеглини — атоми спринтів 3–4
без жодної зміни; зборка лише маршрутизує їх шторами за законами.
