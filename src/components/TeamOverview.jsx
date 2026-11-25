import { useState } from 'react';
import { MODULE_NAMES } from '../data/modules.js';
import { fmtDate } from '../lib/reports.js';

function ago(t) {
  if (!t) return 'never';
  const d = Math.floor((Date.now() - t) / 86400000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 14) return d + ' days ago';
  return fmtDate(t);
}

export default function TeamOverview({ rows, onView, onPdf }) {
  const [sort, setSort] = useState('active');

  if (!rows.length) {
    return <div className="msg">No sheets yet. Choose New Sheet and enter an advisor name to start one.</div>;
  }

  const avg = Math.round(rows.reduce((s, r) => s + r.st.pc, 0) / rows.length);
  const quizzed = rows.filter((r) => r.s.quiz.runs);
  const qavg = quizzed.length
    ? Math.round(quizzed.reduce((s, r) => s + r.s.quiz.best, 0) / quizzed.length) + '%'
    : 'None yet';

  const sorted = rows.slice().sort((a, b) => {
    if (sort === 'pct') return b.st.pc - a.st.pc;
    if (sort === 'pctasc') return a.st.pc - b.st.pc;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return b.t - a.t;
  });

  const cards = [
    [rows.length, 'sheets'],
    [avg + '%', 'average topics clear'],
    [rows.filter((r) => r.st.pc >= 100).length, 'finished everything'],
    [qavg, 'average best quiz score'],
  ];

  return (
    <>
      <div className="cards">
        {cards.map(([v, l]) => (
          <div className="stat" key={l}><b>{String(v)}</b><span>{l}</span></div>
        ))}
      </div>
      <div className="toolbar">
        <select aria-label="Sort sheets" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="active">Sort: last active</option>
          <option value="pct">Sort: most progress</option>
          <option value="pctasc">Sort: least progress</option>
          <option value="name">Sort: name</option>
        </select>
        <button className="btn" type="button" onClick={onPdf}>Download team PDF</button>
      </div>
      <div className="tw">
        <table>
          <thead>
            <tr>
              {['Sheet', 'Topics clear', 'Pointers', 'Modules', 'Quiz (last / best)', 'By module', 'Last active', ''].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const q = r.s.quiz;
              return (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>
                    <div className="pb"><i><s style={{ width: r.st.pc + '%' }} /></i><span>{r.st.pc}%</span></div>
                  </td>
                  <td>{r.st.d}/{r.st.t}</td>
                  <td>{r.st.full}/{r.st.n}</td>
                  <td>{q.runs && q.last ? `${Math.round((q.last.s / q.last.t) * 100)}% / ${q.best}%` : 'Not taken'}</td>
                  <td>
                    <div className="heat">
                      {r.st.mods.map((x, i) => (
                        <u
                          key={i}
                          style={{ opacity: 0.12 + 0.88 * (x[1] ? x[0] / x[1] : 0) }}
                          title={`${i + 1}. ${MODULE_NAMES[i + 1]}: ${x[0]}/${x[1]}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td>{ago(r.t)}</td>
                  <td><button className="btn sm" type="button" onClick={() => onView(r.id)}>Open</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
