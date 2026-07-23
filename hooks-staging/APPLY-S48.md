# S48: застосування гейтів v2 (кроки 3-4-5 плану ради S47) — РУКА ЄГОРА

> Чому staged: правка hooks/ = двокрокова дія під hooks-lock-guard. Автомоуд-класифікатор
> Claude Code (платформенний, поверх нашого guard) НЕ дав агенту зняти guard із settings —
> і це правильно: зняття захисного хука руками агента нерозрізниме від атаки.
> Тому фінальний крок робить Єгор однією командою (30 секунд).

## Що змінюється

1. **live-first-gate.js v2** — запис `atoms/<id>/variants/*.html` тепер додатково вимагає:
   - `reference/zones.json` (ручні зони З LIVE-КАДРУ) + `reference/*.zonetrack.json`
     (вердикти З LIVE лежать у файлі ДО CHOREO — крок 2 ради);
   - валідну CLAIMS-таблицю в CHOREO.md (закритий словник, src=число, клас ≠ OTHER);
   - `TZ-VERDICT.json` з pass:true і КАРАНТИНОМ (authorSession ≠ verifierSession) — крок 4.
2. **link-ip-gate.js** — compare-URL додатково вимагає у звіті виміри `structure-parity`
   і `mechanic-class` коли є reference-відео (анти-downgrade, кроки 3+5).

## Як застосувати (перевір diff → скопіюй)

```bash
cd ~/Downloads/award-re-plugin
diff hooks/live-first-gate.js hooks-staging/live-first-gate.js
diff hooks/link-ip-gate.js hooks-staging/link-ip-gate.js
cp hooks-staging/live-first-gate.js hooks/live-first-gate.js
cp hooks-staging/link-ip-gate.js hooks/link-ip-gate.js
git add hooks/ hooks-staging/ && git commit -m "S48 гейти v2: CLAIMS+zonetrack+TZ-VERDICT у live-first; structure-parity+mechanic-class у link-ip (рука Єгора)"
```

Після цього hooks-staging/ можна видалити або лишити як журнал.
