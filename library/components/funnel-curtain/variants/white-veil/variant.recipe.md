---
extends: funnel-curtain
variant: white-veil
name: "funnel-curtain / біла між-сторінкова штора (T-M22)"
status: candidate            # official ТІЛЬКИ після вердикту власника
source:
  grammar: "D_AIR_mobile_video раунд 1: міжсторінковий перехід = одна БІЛА штора знизу↑ ~0.5с без wordmark; механіка 1-в-1 = flash-режим бази (rise → swap під покриттям → вихід угору)"
  recording: "MOBILE-air.mp4.MP4 (переходи між сторінками, ~0.5с)"
  registry_ref: ["T-M22"]
meaning:
  lands: "Сторінка міняється одним білим подихом: штора виринає знизу за пів секунди, під нею тихо свапається світ, і вона йде вгору. Жодного бренд-ритуалу — це буденний шов, на контрасті з чорною фунел-шторою."
overrides:
  bg: "#f4f2ee (біла)"
  tempo: "flashMs 1000 → 0.5с підйом + 0.5с вихід (T-M22 ~0.5с)"
  wordmark: "відсутній (flash-режим не малює літер)"
when_pick_this: "Будь-який між-сторінковий перехід ПОЗА фунелом (меню-навігація, крихти, back). Фунел бере чорну T-M29-штору бази."
files: [variant.recipe.md, params.json, variant.lab.html]
verify: "variant.lab.html#__LAB_OK__"
---

# funnel-curtain / white-veil — буденний білий шов

> **variant-as-delta. База НЕЗАЙМАНА** — це виклик
> `FunnelCurtain.create({ bg:'#f4f2ee', flashMs:1000 }).play(swap,'flash')`.
> Вся дельта — параметри.
