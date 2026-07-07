# ANTI-ISC — реєстр «щоб такого більше не було»

> Міслер-патерн (LifeOS TestingDoctrine): «Anti-criteria are first-class» —
> кожен провал стає ПОСТІЙНИМ гейтом, який ніколи не знімається.
> Правило: новий провал → рядок сюди + машинний гейт того ж дня.
> Жоден гейт із цього списку НЕ видаляється без вердикту Єгора.

| # | Провал (дата) | Корінь | Гейт-назавжди | Де живе |
|---|---|---|---|---|
| 1 | 40% питань НМТ не покриті (історія) | побудова без Topic Map | pipeline: Topic Map ПЕРЕД рівнями | ~/.claude/CLAUDE.md |
| 2 | COVERAGE брехав 92≠99 (2026-07-05) | frontmatter #коментарі | stripComment у lib-frontmatter | scripts/lib-frontmatter.mjs |
| 3 | «мало плавності» (запис 15.39) | нативний скрол проти живого lerp 0.1 | гейт `lenis` у зборках | combos/*/combo-lab.html |
| 4 | стрибки сторінки (запис 16.50) | пізні декоди/GSAP-мірянки | гейт `docHeight` стабільна за прохід | combos/*/combo-lab.html |
| 5 | шрифт мерехтить на свапі (18.35) | спліт-спани на подієвих свапах | гейт `noSwapSpans` + заборона в BUILD-PROTOCOL §2.5 | home-air гейт |
| 6 | стрибки над стрічками (18.36) | data-lenis-prevent на desktop | гейт `lenisOwnsWheel` (нуль prevent на desktop) | home-air гейт |
| 7 | verify впав ПІСЛЯ коміту (88bdb9c) | порядок порушено вручну | **git pre-commit: verify GREEN + warnings ≤ базлайн — коміт фізично неможливий** | .git/hooks/pre-commit |
| 8 | лінк зі старим IP ×2 (2026-07-06) | IP плаває між підмережами | mDNS-ім'я `*.local` у лінках (IP не потрібен) + linkcheck | scripts/linkcheck.sh |
| 9 | сервер мертвий після зміни мережі | python-сервер не переживає перескок | linkcheck САМОЛІКУЄ (nohup-перепідняття) + SessionStart-хук ганяє його щосесії | KAI/.claude/settings.json |
| 10 | синтетичний клік «не клікає» (лаба unit) | без cancelable:true preventDefault німий | правило в BUILD-PROTOCOL §3 + лаби використовують cancelable | BUILD-PROTOCOL |
| 11 | фонт-своп рахувався як CLS механіки | buffered-спостерігач з t=0 | вікно стабільності ПІСЛЯ fonts.ready і БЕЗ buffered | лаби (unit-card+) |
| 12 | повторний select POI гасив маршрут | select = toggle у движку | гейти вибирають ІНШИЙ POI; задокументовано | locmap air-dark лаба |
| 13 | docHeight-гейт пропущено у 2 зборках (Opus, спринт-7, 2026-07-07) | раціоналізація «сторінка проста → нема що рости» | **набір гейтів зборки = точна копія еталона home-air, БЕЗ винятків «бо просто»** (docHeight безумовний) | BUILD-PROTOCOL §3.2 + combos/*/combo-lab.html |
| 14 | news-картки → 404 + меню #anchor-заглушки (запис Єгора, 2026-07-07) | зборка з href на неіснуючі шляхи (живі /news/slug) і #-якорі без реального таргета | **гейт мертвих-лінків: жоден href у зборці не веде на 404 — або /combos/<page>-air (існує), або #секція-що-є-в-DOM, або self; grep у verify** | scripts/library-verify.mjs + combos/*/combo-lab.html |

## Кандидати в наступні гейти (побудувати при нагоді)
- **SuccessClaimGate-аналог**: Stop-хук, що ганяє `linkcheck` + `git status --short` і показує розбіжності з тим, що я стверджую (закомічено? сервер живий?).
- **Freshness-гейт live-archive**: SessionStart попереджає, якщо архіву >14 дн. (жива версія v=... могла змінитись) — вік уже друкується linkcheck-ом.
- **Пін-бюджет рантайм-гейт**: проба зборки рахує position:sticky у в'юпорті одночасно (≤1 на біт).
- **tool-failures.jsonl-аналог**: pre-commit дописує результат verify у scripts/verify-log.jsonl (тренд warnings).
