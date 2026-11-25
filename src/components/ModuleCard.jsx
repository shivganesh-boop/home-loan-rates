import { keyOf } from '../lib/curriculum.js';

export default function ModuleCard({ mod, sheet, editable, counts, quizCount, onTick, onQuiz }) {
  const keys = keyOf[mod.m];
  let idx = 0;

  return (
    <section className="mod" id={`m${mod.m}`}>
      <h2>
        <span className="n">{mod.m}</span>
        <span className="t">{mod.title}</span>
        <span className="cnt">{counts[0]}/{counts[1]}</span>
        {editable && quizCount > 0 && (
          <button className="btn sm mq" type="button" onClick={() => onQuiz(mod.m)}>
            Quiz ({quizCount})
          </button>
        )}
      </h2>
      {mod.intro && <p>{mod.intro}</p>}
      {mod.groups.map((g, gi) => (
        <div key={gi}>
          {g.heading && <h3>{g.heading}</h3>}
          <ul>
            {g.items.map((txt) => {
              const k = keys[idx++];
              const on = !!sheet.checked[k];
              return (
                <li key={k} className={on ? 'done' : undefined}>
                  <label>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={!editable}
                      onChange={(e) => onTick(k, e.target.checked)}
                    />
                    {txt}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {mod.note && <div className="q">{mod.note}</div>}
    </section>
  );
}
