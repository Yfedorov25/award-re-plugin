# Ledger v5 (у цій же папці: thresholds.ledger.json)

Третій staged-файл: `thresholds.ledger.json` v5 — фіксує sha порогів v5
(20 нових zt-значень zone-track/structure-parity; кожне число з src-виведенням
у `award-re-springs/scripts/thresholds.frozen.json`; ретро-калібрація на архівних
провалах ivy зелена, деталі в calibration-report.json).

Єгоре: перед копіюванням у hooks/ встав свій підпис у поле `signedBy`
(зараз там «ЧЕКАЄ ПІДПИСУ Єгора»). Копіюється тим самим блоком команд з APPLY-S48.md
(додай `cp hooks-staging/thresholds.ledger.json hooks/thresholds.ledger.json`).

До підпису link-ip-gate триматиме compare-URL закритим (thresholdsSha mismatch) —
це безпечний стан: побудова атомів однаково заборонена до зеленої ретро-калібрації.
