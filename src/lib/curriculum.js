import { MODULES } from '../data/modules.js';
import { QUIZ_BANK } from '../data/quizBank.js';

// Same hash as the original page, so progress saved by the old version still lines up.
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'k' + (h >>> 0).toString(36);
}

// keyOf[m] = saved key for each pointer in module m (in order); ptext[m] = pointer text.
export const keyOf = {};
export const ptext = {};
const seen = {};
MODULES.forEach((mod) => {
  keyOf[mod.m] = [];
  ptext[mod.m] = [];
  mod.groups.forEach((g) =>
    g.items.forEach((txt) => {
      let k = hash(txt.trim());
      seen[k] = (seen[k] || 0) + 1;
      if (seen[k] > 1) k += '_' + seen[k];
      keyOf[mod.m].push(k);
      ptext[mod.m].push(txt);
    })
  );
});

export const MODULE_IDS = MODULES.map((mod) => mod.m);

export const caseKey = (id) => 'sc_' + id;

export function keysFor(m, cases) {
  return m === 18 ? cases.map((c) => caseKey(c.id)) : keyOf[m] || [];
}

export function textFor(m, i, cases) {
  return m === 18 ? (cases[i] && cases[i].title) || '' : ptext[m][i];
}

export function stats(sheet, cases) {
  const mods = [];
  let d = 0, t = 0, full = 0, n = 0;
  for (let m = 1; m <= 18; m++) {
    const ks = keysFor(m, cases);
    let c = 0;
    ks.forEach((k) => { if (sheet.checked[k]) c++; });
    mods.push([c, ks.length]);
    d += c;
    t += ks.length;
    if (ks.length) { n++; if (c === ks.length) full++; }
  }
  return { mods, d, t, full, n, pc: t ? Math.round((d / t) * 100) : 0 };
}

// Quiz questions unlocked by the ticked pointers (optionally for one module).
export function quizPool(sheet, m) {
  return QUIZ_BANK.filter(
    (q) => (!m || q.m === m) && keyOf[q.m] && sheet.checked[keyOf[q.m][q.p]]
  );
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function newId(prefix = 's') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
