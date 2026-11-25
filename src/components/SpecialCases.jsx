import { useState } from 'react';
import { MODULES, MODULE_NAMES } from '../data/modules.js';
import { caseKey } from '../lib/curriculum.js';
import { fmtDate } from '../lib/reports.js';
import useArm from '../lib/useArm.js';

function CaseForm({ init, label, onSave, onCancel }) {
  const [title, setTitle] = useState(init?.title || '');
  const [mod, setMod] = useState(String(init?.mod || 0));
  const [details, setDetails] = useState(init?.details || '');
  const [err, setErr] = useState('');

  function save() {
    const t = title.trim();
    if (!t) { setErr('Add a title first.'); return; }
    setErr('');
    onSave({ title: t, mod: +mod || 0, details: details.trim() });
    if (!init) { setTitle(''); setMod('0'); setDetails(''); }
  }

  return (
    <div className="fcard">
      <label>Title</label>
      <input
        maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Customer is an NRI and the co-applicant is a resident"
      />
      <label>Related module (optional)</label>
      <select value={mod} onChange={(e) => setMod(e.target.value)}>
        <option value="0">None</option>
        {MODULES.map((m) => (
          <option key={m.m} value={String(m.m)}>{m.m}. {m.title}</option>
        ))}
      </select>
      <label>What to do</label>
      <textarea
        maxLength={3000} value={details} onChange={(e) => setDetails(e.target.value)}
        placeholder="Describe the situation and how to handle it"
      />
      <div className="row">
        <button className="btn pri" type="button" onClick={save}>{label}</button>
        {onCancel && <button className="btn" type="button" onClick={onCancel}>Cancel</button>}
        <span className="err">{err}</span>
      </div>
    </div>
  );
}

function CaseItem({ c, checked, editable, onTick, onEdit, onDelete }) {
  const [armed, arm] = useArm();
  return (
    <li className={'cs' + (checked ? ' done' : '')}>
      <label>
        <input type="checkbox" checked={checked} disabled={!editable} onChange={(e) => onTick(caseKey(c.id), e.target.checked)} />
        <div className="body">
          <div className="ttl">{c.title || 'Untitled'}</div>
          <div className="meta">
            {c.mod > 0 && MODULE_NAMES[c.mod] && <span className="chip">Module {c.mod}: {MODULE_NAMES[c.mod]}</span>}
            {c.createdAt > 0 && <span>Added {fmtDate(c.createdAt)}</span>}
          </div>
          {c.details && <p>{c.details}</p>}
        </div>
      </label>
      <div className="row" style={{ marginLeft: 30 }}>
        <button className="btn sm" type="button" onClick={onEdit}>Edit</button>
        <button
          className="btn sm danger" type="button"
          onClick={() => (armed ? onDelete() : arm())}
        >
          {armed ? 'Tap again to delete' : 'Delete'}
        </button>
      </div>
    </li>
  );
}

export default function SpecialCases({ cases, sheet, editable, counts, onTick, onAdd, onUpdate, onDelete }) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);

  const q = query.trim().toLowerCase();
  const items = cases.filter((c) => !q || (c.title + ' ' + c.details).toLowerCase().includes(q));

  return (
    <section className="mod" id="m18">
      <h2>
        <span className="n">18</span>
        <span className="t">Special Cases</span>
        <span className="cnt">{counts[0]}/{counts[1]}</span>
      </h2>
      <p>Unusual situations and how to handle them. Tick each one once you understand it.</p>
      {editing === null && <CaseForm label="Add special case" onSave={onAdd} />}
      <input
        id="scSearch" type="search" placeholder="Search special cases" aria-label="Search special cases"
        value={query} onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {items.map((c) =>
          editing === c.id ? (
            <li key={c.id}>
              <CaseForm
                init={c} label="Save changes"
                onSave={(v) => { onUpdate(c.id, v); setEditing(null); }}
                onCancel={() => setEditing(null)}
              />
            </li>
          ) : (
            <CaseItem
              key={c.id} c={c} checked={!!sheet.checked[caseKey(c.id)]} editable={editable}
              onTick={onTick} onEdit={() => setEditing(c.id)} onDelete={() => onDelete(c.id)}
            />
          )
        )}
      </ul>
      {!items.length && (
        <div className="msg">
          {cases.length ? 'No special cases match your search.' : 'No special cases yet. Add the first one above.'}
        </div>
      )}
    </section>
  );
}
