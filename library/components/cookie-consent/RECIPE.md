---
id: cookie-consent
name: "Cookie-пігулка (жива aircenter, дозйомка 2026-07-06)"
level: 1
kind: component
status: candidate            # official ТІЛЬКИ після вердикту власника
entry:
  call: "CookieConsent.create(root, opts?)  // root: [data-cc] з [data-cc-box] і [data-cc-accept]. opts: { storageKey, storage, htmlClass }"
  module: iife
  returns: "{ visible(), accept(), gate, destroy }"
meaning:
  what: "Жива cookie-пігулка aircenter.space: біла центрована пігулка fixed знизу (bottom 20 + safe-area, z-index 13, radius 5, shadow 80) «THIS WEBSITE USES COOKIES» + ACCEPT. Живий accept = container.remove() МИТТЄВО (нуль фейду) + згода у сховищі на 356 днів; повторний візит — банер не рендериться."
  when: "Кожна сторінка-зборка AIR (на живому сайті пігулка є всюди до згоди)."
  lands: "Службовий шар: не заважає композиції, знизу по центру, зникає назавжди одним тапом."
  not_when: "Повноекранні cookie-модалки з налаштуваннями (у AIR простий --simple варіант)."
source:
  grammar: "air-global.css .cookie-consent/--simple/__container (живі величини процитовані в tokens.json)"
  recording: "AIR-REF--cookie-banner.mp4 (~/Downloads, самостійна дозйомка headless 2026-07-06); recon-20260706/int-cookie-shown.png"
  registry_ref: ["x: службовий UI-атом — не входить у граматику прийомів"]
stack: "vanilla, нуль залежностей"
webgl: false
motion_props: []
trigger: "click ACCEPT"
timing_layer: [B-swap]
owns_pin: false
page_beat: [service]
combines_with: [air-menu-overlay]
anti_combos: []
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "банер у bottom-зоні, z-index 13, html має with-cookie-consent"
  - "ACCEPT → root ВИДАЛЕНИЙ з DOM миттєво (живий remove(), не opacity) + сховище '1' + html-клас знято"
  - "re-init зі згодою у сховищі → банер не рендериться (visible()=false)"
  - "нуль CLS; errors 0; destroy() чистить"
---

# cookie-consent — службова пігулка, знята живцем

Перший атом, породжений самостійною дозйомкою (headless-Хром по живому
сайту). Величини не «приблизно як на скріні», а процитовані з
air-global.css; поведінка ACCEPT — з мініфікованого CookieConsent
(remove() без анімації — чесно повторюємо, не «покращуємо» фейдом).
