---
id: photo-pill-form
name: "B6 CTA-форма на фото з tap-pills (T-411 + A-07 + T-M21)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "PhotoPillForm.create(root, opts?)  // root: [data-ppf-bg] + [data-ppf-form] з групами [data-ppf-group] (чекбокс+label.pill пари) + [data-ppf-name]/[data-ppf-phone] + [data-ppf-send] + [data-ppf-done]. opts: { onSend(values) }"
  module: iife
  returns: "{ values(), gate, destroy }"
meaning:
  what: "Фінальна конверсійна форма AIR (жива investment-contact): full-bleed фото + гігантський заголовок ліворуч + картка-форма праворуч. Pills — ЖИВА схема: чекбокси з label-кнопками (multi-select у групі: можна rent+resale, два бюджети), active = інверсія 0.2s (T-M21 tap-pills). Сабміт: чесний invalid-shake (ім'я ≥2 + телефон), success = тихий рядок за A-07 (живі стани не зафіксовані — діра дозйомки №4, не вигадуємо)."
  when: "B6 сайтовий фінал (/investment і головна), будь-який RE-сайт з підбіркою під бюджет."
  lands: "Форма не допитує — вона дає натиснути дві-три пігулки і лишити телефон. Пігулки клацають чорним, як вибір у голові, а відповідь тиха: «підбірка готується»."
  not_when: "Довгі анкети (це не B6). Немає фото-фону — це вже інша композиція (conversion-quiet-gate)."
source:
  grammar: "жива /investment: investment-contact (чекбокс-pills groups, ajaxForm) — схема дослівно; T-M21 (tap-pills поверх фото)"
  recording: "MOBILE-air.mp4 t95–116 (форма з pills наживо; перемикання чипів/сабміт НЕ зняті — діра №4)"
  registry_ref: ["T-411", "T-M21"]
stack: "vanilla, нуль залежностей (pills = чекбокс+CSS; shake = keyframes)"
webgl: false
motion_props: [background-color, color, transform, opacity]
trigger: "тап pills / сабміт (подієво)"
timing_layer: [B-swap]
owns_pin: false
page_beat: [conversion]
combines_with: [theme-tween, text-blur-reveal, budget-pills-bridge]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "pills = чекбокси (multi-select у групі — жива схема), active = інверсія 0.2s"
  - "values() віддає goals/budgets/name/phone"
  - "invalid сабміт → shake + лічильник, done схований; валідний → тихий done (A-07) + onSend"
  - "нуль CLS; errors 0; destroy() чистить"
---

# photo-pill-form — дві пігулки і телефон

Третій юніт Спринту-6. B6 закриває матрицю §12–13.
