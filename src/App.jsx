import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MODULES } from './data/modules.js';
import { caseKey, newId, quizPool, shuffle, stats } from './lib/curriculum.js';
import { blankSheet, loadCases, loadDrive, loadSheets, saveCases, saveDrive, saveSheets } from './lib/storage.js';
import { downloadBlob, reportBlob, teamBlob } from './lib/reports.js';
import useArm from './lib/useArm.js';
import Sidebar from './components/Sidebar.jsx';
import ModuleCard from './components/ModuleCard.jsx';
import SpecialCases from './components/SpecialCases.jsx';
import TeamOverview from './components/TeamOverview.jsx';
import QuizModal, { prep } from './components/QuizModal.jsx';
import PromptDialog from './components/PromptDialog.jsx';

const DRIVE_RE = /^https:\/\/(drive|docs)\.google\.com\/\S+$/i;
const EMPTY = blankSheet();

export default function App() {
  const [state, setState] = useState(loadSheets); // { sheets: {id: sheet}, cur }
  const [cases, setCases] = useState(loadCases);
  const [drive, setDrive] = useState(loadDrive);
  const [tab, setTab] = useState('cur');
  const [dlg, setDlg] = useState(null);
  const [quiz, setQuiz] = useState(null); // { items, m, retry, key }
  const [status, setStatus] = useState('');
  const [delArmed, armDel, resetDel] = useArm();
  const loaded = useRef(false);

  // Persist to localStorage whenever data changes (skip the very first render).
  useEffect(() => {
    if (!loaded.current) return;
    setStatus(saveSheets(state) ? 'Saved on this device' : 'Could not save. Browser storage may be full or blocked.');
  }, [state]);
  useEffect(() => { if (loaded.current) saveCases(cases); }, [cases]);
  useEffect(() => { if (loaded.current) saveDrive(drive); }, [drive]);
  useEffect(() => {
    loaded.current = true;
    if (Object.keys(state.sheets).length) setStatus('Saved on this device');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep tabs in sync if the page is open in two tabs of the same browser.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'curriculum-sheets-v1') setState(loadSheets());
      if (e.key === 'curriculum-special-cases-v1') setCases(loadCases());
      if (e.key === 'curriculum-drive-link-v1') setDrive(loadDrive());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const sheet = (state.cur && state.sheets[state.cur]) || EMPTY;
  const editable = !!(state.cur && state.sheets[state.cur]);
  const st = useMemo(() => stats(sheet, cases), [sheet, cases]);
  const quizCount = editable ? quizPool(sheet).length : 0;
  const sheetIds = Object.keys(state.sheets);

  const updateSheet = useCallback((fn) => {
    setState((s) => {
      if (!s.cur || !s.sheets[s.cur]) return s;
      const next = fn(s.sheets[s.cur]);
      return { ...s, sheets: { ...s.sheets, [s.cur]: { ...next, t: Date.now() } } };
    });
  }, []);

  const tick = useCallback((k, on) => {
    updateSheet((sh) => {
      const checked = { ...sh.checked };
      if (on) checked[k] = 1; else delete checked[k];
      return { ...sh, checked };
    });
  }, [updateSheet]);

  // ----- Sheets -----
  function askName(title, init, done) {
    setDlg({
      title, label: 'Advisor name', init, ph: 'Your name',
      ok: title === 'New sheet' ? 'Create sheet' : 'Save',
      check: (v) => (v ? '' : 'Enter a name first.'),
      done,
    });
  }
  function createSheet(name) {
    const id = newId();
    setState((s) => ({ cur: id, sheets: { ...s.sheets, [id]: { ...blankSheet(name), t: Date.now() } } }));
    setTab('cur');
  }
  function renameSheet() {
    askName('Rename sheet', sheet.name, (v) => updateSheet((sh) => ({ ...sh, name: v })));
  }
  function deleteSheet() {
    if (!delArmed) { armDel(); return; }
    resetDel();
    setState((s) => {
      const sheets = { ...s.sheets };
      delete sheets[s.cur];
      return { sheets, cur: Object.keys(sheets)[0] || null };
    });
  }
  function openSheet(id) {
    setState((s) => ({ ...s, cur: id }));
    setTab('cur');
    window.scrollTo(0, 0);
  }

  // ----- Quiz -----
  function startQuiz(m, items, retry) {
    if (!editable) return;
    const list = items || shuffle(quizPool(sheet, m)).slice(0, 10).map(prep);
    if (!list.length) return;
    setQuiz({ items: list, m: m || 0, retry: !!retry, key: Date.now() });
  }
  function recordQuiz(score, total) {
    const pc = Math.round((score / total) * 100);
    updateSheet((sh) => ({
      ...sh,
      quiz: { runs: sh.quiz.runs + 1, last: { s: score, t: total, at: Date.now() }, best: Math.max(sh.quiz.best, pc) },
    }));
  }

  // ----- Special cases -----
  function addCase(v) {
    const now = Date.now();
    setCases((list) => [...list, { ...v, id: newId('c'), createdAt: now, updatedAt: now }]);
  }
  function updateCase(id, v) {
    setCases((list) => list.map((c) => (c.id === id ? { ...c, ...v, updatedAt: Date.now() } : c)));
  }
  function deleteCase(id) {
    setCases((list) => list.filter((c) => c.id !== id));
    // Drop the tick for that case from every sheet.
    setState((s) => {
      const sheets = {};
      Object.keys(s.sheets).forEach((sid) => {
        const checked = { ...s.sheets[sid].checked };
        delete checked[caseKey(id)];
        sheets[sid] = { ...s.sheets[sid], checked };
      });
      return { ...s, sheets };
    });
  }

  // ----- Drive link -----
  function editDrive() {
    setDlg({
      title: 'Drive link', label: 'Paste the Google Drive link. Leave it empty to remove it.',
      init: drive, ph: 'https://drive.google.com/', max: 400, ok: 'Save link',
      check: (v) => (!v || DRIVE_RE.test(v) ? '' : 'Use a link that starts with https://drive.google.com/ or https://docs.google.com/'),
      done: (v) => setDrive(v),
    });
  }

  // ----- PDFs -----
  function safeDownload(name, build) {
    try {
      downloadBlob(name, build());
      setStatus('PDF downloaded');
    } catch {
      setStatus('Could not build the PDF.');
    }
  }
  function downloadReport() {
    const nm = (sheet.name || 'advisor').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'advisor';
    safeDownload(`training-progress-${nm}.pdf`, () => reportBlob(sheet, cases));
  }
  const teamRows = useMemo(
    () => sheetIds.map((id) => {
      const s = state.sheets[id];
      return { id, s, st: stats(s, cases), name: s.name || 'Unnamed advisor', t: s.t };
    }),
    [state, cases] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Escape closes any open modal.
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return;
      setQuiz(null);
      setDlg(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function jump(e, m) {
    e.preventDefault();
    document.getElementById('m' + m)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const sortedSheets = sheetIds
    .map((id) => ({ id, name: state.sheets[id].name }))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const driveOk = DRIVE_RE.test(drive);

  return (
    <div className="app">
      <Sidebar st={st} quizCount={quizCount} hasSheet={editable} onQuiz={() => startQuiz(0)} />

      <main>
        <header className="top">
          <div>
            <h1>Home Loan Advisor <span className="hl">Training</span></h1>
            <p className="sub">The learning flow for new advisors, in order, from Communication to Glossary.</p>
            {editable && (
              <div className="shrow">
                <span className="lab">Sheet</span>
                <b>{sheet.name || 'Untitled sheet'}</b>
                <button className="lnk" type="button" onClick={renameSheet}>Rename</button>
                <button className="lnk danger" type="button" onClick={deleteSheet}>
                  {delArmed ? 'Tap again to delete' : 'Delete'}
                </button>
              </div>
            )}
          </div>
          <div className="tools">
            {driveOk && (
              <a className="btn vid" href={drive} target="_blank" rel="noopener noreferrer" title="Opens the training Drive folder in a new tab">
                <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 1h4l4 7h-4zM4 1L0 8l2 3.5L6 4.5zM2.6 11.5h8.4L9 8H4.6z" transform="scale(.92)" /></svg>
                Drive
              </a>
            )}
            <button className="btn" type="button" onClick={editDrive}>{driveOk ? 'Change Drive link' : 'Add Drive link'}</button>
            <select
              aria-label="Choose a sheet" value={state.cur || ''} disabled={!sortedSheets.length}
              onChange={(e) => e.target.value && openSheet(e.target.value)}
            >
              {!sortedSheets.length && <option value="">No sheets yet</option>}
              {sortedSheets.map((x) => <option key={x.id} value={x.id}>{x.name || 'Untitled sheet'}</option>)}
            </select>
            <button className="btn" type="button" onClick={() => askName('New sheet', '', createSheet)}>New Sheet</button>
            <button className="btn pri" type="button" disabled={!editable} onClick={downloadReport}>Download PDF</button>
            <span id="sync" role="status">{status}</span>
          </div>
        </header>

        {!editable && (
          <div className="note">
            <span>Choose New Sheet, enter your name, and start ticking topics.</span>
            <button className="btn sm" type="button" onClick={() => askName('New sheet', '', createSheet)}>New Sheet</button>
          </div>
        )}

        {sheetIds.length > 0 && (
          <div className="tabs" role="tablist">
            <button className="tab" role="tab" type="button" aria-selected={tab === 'cur'} onClick={() => setTab('cur')}>Curriculum</button>
            <button className="tab" role="tab" type="button" aria-selected={tab === 'team'} onClick={() => setTab('team')}>All sheets</button>
          </div>
        )}

        {tab === 'cur' ? (
          <section className="panel">
            <nav className="flow">
              {[...MODULES, { m: 18, short: 'Special cases' }].map((mod) => (
                <a key={mod.m} href={'#m' + mod.m} onClick={(e) => jump(e, mod.m)}>{mod.m} {mod.short}</a>
              ))}
            </nav>
            {MODULES.map((mod) => (
              <ModuleCard
                key={mod.m} mod={mod} sheet={sheet} editable={editable} counts={st.mods[mod.m - 1]}
                quizCount={editable ? quizPool(sheet, mod.m).length : 0}
                onTick={tick} onQuiz={startQuiz}
              />
            ))}
            <SpecialCases
              cases={cases} sheet={sheet} editable={editable} counts={st.mods[17]}
              onTick={tick} onAdd={addCase} onUpdate={updateCase} onDelete={deleteCase}
            />
          </section>
        ) : (
          <section className="panel">
            <h2 className="ph">All sheets</h2>
            <p className="hint">Every sheet saved in this browser. Use Open to switch to one.</p>
            <TeamOverview
              rows={teamRows} onView={openSheet}
              onPdf={() => safeDownload('team-overview.pdf', () => teamBlob(teamRows, cases))}
            />
          </section>
        )}
      </main>

      {quiz && (
        <QuizModal
          key={quiz.key} run={quiz}
          onClose={() => setQuiz(null)}
          onRestart={startQuiz}
          onResult={recordQuiz}
        />
      )}
      {dlg && <PromptDialog dlg={dlg} onClose={() => setDlg(null)} />}
    </div>
  );
}
