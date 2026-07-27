/* ============================================================
   SPEC-COMPARE-LIB (трек springs, S2) — спільна логіка звірки дерев
   ------------------------------------------------------------
   Витягнуто зі spec-verify.mjs, щоб ГЕЙТ КАРКАСА (skeleton-verify)
   звіряв тим САМИМ кодом, що й гейт спеки проти живого:
   matchTrees (сигнатура = перетин множин класів + позиційний fallback),
   compareNode (box + styles + img), summarize (число гейта).
   ============================================================ */

export const ANIMATION_SENSITIVE = new Set(['opacity', 'transform']);

export function collectClasses(node, set) {
  for (const c of (node.cls || '').split(/\s+/)) if (c) set.add(c);
  for (const k of node.children || []) collectClasses(k, set);
  return set;
}

export function makeSig(archiveTree, liveTree) {
  const a = collectClasses(archiveTree, new Set());
  const b = collectClasses(liveTree, new Set());
  const common = new Set([...a].filter((c) => b.has(c)));
  return (n) => {
    const cls = (n.cls || '').split(/\s+/).filter((c) => c && common.has(c)).slice(0, 3).join(' ');
    return `${n.tag}|${cls}|${(n.text || '').slice(0, 24)}`;
  };
}

export function matchTrees(a, b, path, out, sig) {
  out.pairs.push({ path, a, b });
  const ak = a.children || [], bk = b.children || [];
  const usedB = new Set();
  ak.forEach((ac, i) => {
    let j = -1;
    if (bk[i] && !usedB.has(i) && sig(bk[i]) === sig(ac)) j = i;
    else j = bk.findIndex((bc, k) => !usedB.has(k) && sig(bc) === sig(ac));
    if (j === -1) j = bk.findIndex((bc, k) => !usedB.has(k) && bc.tag === ac.tag && sig(bc).split('|')[1] === sig(ac).split('|')[1]);
    /* позиційний fallback: той самий індекс + той самий тег — ловить
       вузли, де рантайм перемикає видимі класи (is-invisible--js) */
    if (j === -1 && bk[i] && !usedB.has(i) && bk[i].tag === ac.tag) j = i;
    if (j === -1) { out.onlyArchive.push(`${path}>${sig(ac)}`); return; }
    usedB.add(j);
    matchTrees(ac, bk[j], `${path}>${ac.tag}${i ? `[${i}]` : ''}`, out, sig);
  });
  bk.forEach((bc, k) => { if (!usedB.has(k)) out.onlyLive.push(`${path}>${sig(bc)}`); });
}

const PX = /^-?\d+(\.\d+)?px$/;

export function compareNode(pair, deltas) {
  const { path, a, b } = pair;
  const label = `${path} ${a.text ? `"${a.text.slice(0, 30)}"` : (a.cls || '').split(' ')[0]}`;
  for (const m of ['x', 'y', 'w', 'h']) {
    deltas.push({ path: label, metric: `box.${m}`, archive: a.box[m], live: b.box[m],
      delta: Math.round((a.box[m] - b.box[m]) * 10) / 10, kind: 'num' });
  }
  const keys = new Set([...Object.keys(a.styles), ...Object.keys(b.styles)]);
  for (const k of keys) {
    const av = a.styles[k], bv = b.styles[k];
    if (av === bv) { deltas.push({ path: label, metric: k, archive: av, live: bv, delta: 0, kind: 'num' }); continue; }
    if (PX.test(av || '') && PX.test(bv || '')) {
      deltas.push({ path: label, metric: k, archive: av, live: bv,
        delta: Math.round((parseFloat(av) - parseFloat(bv)) * 10) / 10, kind: 'num',
        anim: ANIMATION_SENSITIVE.has(k) || undefined });
    } else {
      deltas.push({ path: label, metric: k, archive: av, live: bv, delta: null, kind: 'str',
        anim: ANIMATION_SENSITIVE.has(k) || undefined });
    }
  }
  if (a.img && b.img) {
    deltas.push({ path: label, metric: 'img.src', archive: a.img.src, live: b.img.src,
      delta: a.img.src === b.img.src ? 0 : null, kind: a.img.src === b.img.src ? 'num' : 'str' });
    deltas.push({ path: label, metric: 'img.naturalW', archive: a.img.naturalW, live: b.img.naturalW,
      delta: a.img.naturalW - b.img.naturalW, kind: 'num' });
  }
}

export function summarize(deltas) {
  const s = { exact: 0, within1px: 0, diverged: 0, strMismatch: 0, animSensitiveDiverged: 0 };
  for (const d of deltas) {
    if (d.kind === 'str' && d.delta === null) {
      s.strMismatch++; if (d.anim) s.animSensitiveDiverged++; continue;
    }
    const ad = Math.abs(d.delta || 0);
    if (ad <= 0.1) s.exact++;
    else if (ad <= 1) s.within1px++;
    else { s.diverged++; if (d.anim) s.animSensitiveDiverged++; }
  }
  s.total = deltas.length;
  s.okPct = s.total ? Math.round(((s.exact + s.within1px) / s.total) * 1000) / 10 : 0;
  return s;
}
