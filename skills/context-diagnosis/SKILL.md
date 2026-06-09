---
name: context-diagnosis
description: "Diagnose project type / tier / niche-profile and assemble the build brief from brief.md. First build phase. Use via the orchestrator."
disable-model-invocation: true
license: MIT
---

# Context Diagnosis

Перша фаза побудови: визнач тип/тір/нішу й збери ТЗ. Підкоряйся `../../CLAUDE.md`.

## References
- [A2_context_diagnosis](./references/A2_context_diagnosis.md) — тип сайту / тір / ніша-профіль (темп+регістр+палітра).
- [A3_brief_assembler](./references/A3_brief_assembler.md) — як зібрати суперТЗ.

## Суть
1. З `.award-re/brief.md` + `brand.md` + config → визнач: project_type (ЖК/вілла/existing), стратегію глибини (A inventory vs B atmosphere — [[PB_site_architecture]]), тон/регістр (з brand), нішу-профіль (RE).
2. Збери внутрішнє ТЗ для re-architecture: які болі→які секції, який масштаб (скільки сторінок), які конверсійні блоки.
3. Передай у re-architecture.

Нічого не вигадуй — усе з brief/brand. Брак даних → познач прогалину (client-assets), не плейсхолдер.
