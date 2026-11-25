// Everything is kept in this browser's localStorage.
// The sheets key matches the original page, so existing progress carries over.

const SHEETS_KEY = 'curriculum-sheets-v1';
const CASES_KEY = 'curriculum-special-cases-v1';
const DRIVE_KEY = 'curriculum-drive-link-v1';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function blankSheet(name = '') {
  return { name, checked: {}, t: 0, quiz: { runs: 0, best: 0, last: null } };
}

function normQuiz(q = {}) {
  return {
    runs: +q.runs || 0,
    best: +q.best || 0,
    last: q.last && q.last.t ? { s: +q.last.s || 0, t: +q.last.t || 0, at: +q.last.at || 0 } : null,
  };
}

export function normSheet(o = {}) {
  return {
    name: String(o.name || '').slice(0, 60),
    checked: o.checked && typeof o.checked === 'object' ? { ...o.checked } : {},
    t: +o.t || 0,
    quiz: normQuiz(o.quiz),
  };
}

export function loadSheets() {
  const o = read(SHEETS_KEY, null);
  const sheets = {};
  if (o && o.sheets) {
    Object.keys(o.sheets).forEach((id) => {
      if (o.sheets[id] && !o.sheets[id].del) sheets[id] = normSheet(o.sheets[id]);
    });
  }
  const cur = o && o.cur && sheets[o.cur] ? o.cur : Object.keys(sheets)[0] || null;
  return { sheets, cur };
}

export const saveSheets = (state) => write(SHEETS_KEY, state);

export function loadCases() {
  const list = read(CASES_KEY, []);
  return Array.isArray(list)
    ? list
        .filter((c) => c && c.id && c.title)
        .map((c) => ({
          id: String(c.id),
          title: String(c.title).slice(0, 120),
          mod: +c.mod || 0,
          details: String(c.details || '').slice(0, 3000),
          createdAt: +c.createdAt || 0,
          updatedAt: +c.updatedAt || 0,
        }))
    : [];
}

export const saveCases = (list) => write(CASES_KEY, list);

export const loadDrive = () => {
  const v = read(DRIVE_KEY, '');
  return typeof v === 'string' ? v : '';
};
export const saveDrive = (url) => write(DRIVE_KEY, url);
