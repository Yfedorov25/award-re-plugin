/* ============================================================
   PHOTO-PILL-FORM · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   B6 CTA-форма (T-411 + A-07) + T-M21 tap-pills поверх full-bleed
   фото. Живі факти /investment (live-archive 2026-07-06):
   investment-contact — фото-фон (landingHarmonyBackground) +
   «Receive a personalized selection» + форма (md-6 offset-6):
   групи pills = ЧЕКБОКСИ (multi-select у групі!) з label-кнопками:
     Investment goal: Rental income / Asset resale
     Budget: Up to 50 000 000 / 50–150 / 150+
   + контакти + сабміт. ⚠️ Стани сабміту живим НЕ ЗНЯТІ (діра
   дозйомки №4) → тихі ворота за A-07-каноном (скромний done,
   чесний invalid-shake), НЕ вигадувати барокко.

   РОЗМІТКА:
     <section data-ppf>
       <div data-ppf-bg>…фото…</div>
       <form data-ppf-form>
         групи: [data-ppf-group] з чекбокс+label парами (жива схема)
         [data-ppf-name] [data-ppf-phone]
         <button data-ppf-send> + [data-ppf-done hidden]

   PhotoPillForm.create(root, opts?) → { values(), gate, destroy }
     opts: { onSend(values) }
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }

  function create(root, options) {
    root = toEl(root);
    options = options || {};
    if (!root) return { error: 'no root' };
    var form = root.querySelector('[data-ppf-form]');
    var name = root.querySelector('[data-ppf-name]');
    var phone = root.querySelector('[data-ppf-phone]');
    var done = root.querySelector('[data-ppf-done]');
    if (!form) return { error: 'потрібна [data-ppf-form]' };

    var gate = { toggles: 0, sends: 0, invalid: 0 };

    form.addEventListener('change', function (ev) {
      if (ev.target && ev.target.type === 'checkbox') gate.toggles++;
    });

    function values() {
      var v = { goals: [], budgets: [] };
      form.querySelectorAll('input[type="checkbox"]:checked').forEach(function (c) {
        (c.name.indexOf('goal') >= 0 ? v.goals : v.budgets).push(c.value);
      });
      v.name = name ? name.value.trim() : '';
      v.phone = phone ? phone.value.trim() : '';
      return v;
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = values();
      var ok = v.name.length >= 2 && /[\d+][\d\s()-]{6,}/.test(v.phone);
      if (!ok) {
        gate.invalid++;
        form.classList.add('ppf-shake');
        global.setTimeout(function () { form.classList.remove('ppf-shake'); }, 500);
        return;
      }
      gate.sends++;
      if (done) done.removeAttribute('hidden');   /* тихі ворота A-07 */
      form.classList.add('ppf-sent');
      if (options.onSend) options.onSend(v);
    });

    return {
      values: values, gate: gate,
      destroy: function () { form.classList.remove('ppf-sent', 'ppf-shake'); }
    };
  }

  global.PhotoPillForm = { create: create };
}(window));
