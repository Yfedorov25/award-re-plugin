# state/ — стейт-машина секцій (закон A1-A11)
Кожна секція: section-XX.yaml зі стадіями
data-read → design-intent → copy-variants → prototypes → user-choice →
integrate → verify-dom → rollback-point → deploy → prod-check → log
Стадія закривається ЛИШЕ артефактом (шлях/дата в yaml). Гейт-хуки звіряють.
