import { useEffect, useRef, useState } from 'react';
import { MODULE_NAMES } from '../data/modules.js';
import { ptext, shuffle } from '../lib/curriculum.js';

// Shuffle the answer order; the correct answer is always option index 0 in the bank.
export const prep = (q) => ({ q, order: shuffle(q.o.map((_, i) => i)) });

// run: { items, m, retry }. onResult(score, total) is called once when a non-retry quiz finishes.
export default function QuizModal({ run, onClose, onRestart, onResult }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [miss, setMiss] = useState([]);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const firstOpt = useRef(null);
  const nextBtn = useRef(null);

  const total = run.items.length;
  const it = run.items[i];

  useEffect(() => { if (!done && picked === null) firstOpt.current?.focus(); }, [i, done, picked]);
  useEffect(() => { if (picked !== null) nextBtn.current?.focus(); }, [picked]);

  function choose(oi) {
    if (picked !== null) return;
    setPicked(oi);
    if (oi === 0) setScore((s) => s + 1);
    else setMiss((m) => [...m, it]);
  }

  function next() {
    if (i + 1 < total) {
      setI(i + 1);
      setPicked(null);
    } else {
      setDone(true);
      if (!run.retry) onResult(score, total);
    }
  }

  let body;
  if (done) {
    const pc = Math.round((score / total) * 100);
    const seen = {};
    const revise = miss.filter((x) => {
      const key = x.q.m + ':' + x.q.p;
      if (seen[key]) return false;
      seen[key] = 1;
      return true;
    });
    body = (
      <>
        <div className="res">
          <div className="big">{score}/{total}</div>
          <p>
            {pc}%.{' '}
            {pc >= 80 ? 'Strong grasp of these topics.' : pc >= 50 ? 'Good start. Revise the points below and try again.' : 'Revisit these topics, then try again.'}
          </p>
        </div>
        {revise.length > 0 && (
          <div className="rev">
            <b>Revise these:</b>
            <ul>
              {revise.map((x) => (
                <li key={x.q.m + ':' + x.q.p}>Module {x.q.m}: {ptext[x.q.m][x.q.p]}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="row">
          {miss.length > 0 && (
            <button className="btn" type="button" onClick={() => onRestart(run.m, miss.map((x) => prep(x.q)), true)}>
              Retry missed
            </button>
          )}
          <button className="btn pri" type="button" onClick={() => onRestart(run.m)}>New quiz</button>
          <button className="btn" type="button" onClick={onClose}>Close</button>
        </div>
      </>
    );
  } else {
    const q = it.q;
    const right = picked === 0;
    body = (
      <>
        <div className="qtop">
          <span>Question {i + 1} of {total}</span>
          <button className="btn sm" type="button" onClick={onClose}>Close</button>
        </div>
        <div className="qbar"><i style={{ width: (i / total) * 100 + '%' }} /></div>
        <div className="qmod">Module {q.m}: {MODULE_NAMES[q.m]}</div>
        <p className="qq" id="qq">{q.q}</p>
        <div>
          {it.order.map((oi, k) => {
            let cls = 'opt';
            if (picked !== null && oi === 0) cls += ' ok';
            if (picked !== null && picked === oi && oi !== 0) cls += ' bad';
            return (
              <button
                key={oi} ref={k === 0 ? firstOpt : undefined} className={cls} type="button"
                disabled={picked !== null} onClick={() => choose(oi)}
              >
                {String.fromCharCode(65 + k)}.{'  '}{q.o[oi]}
              </button>
            );
          })}
        </div>
        <div className="fb">
          {picked !== null && (
            <>
              <b>{right ? 'Correct. ' : 'Not quite. '}</b>
              {q.e || (right ? '' : 'The right answer is highlighted.')}
            </>
          )}
        </div>
        <div className="row">
          {picked !== null && (
            <button ref={nextBtn} className="btn pri" type="button" onClick={next}>
              {i + 1 < total ? 'Next' : 'See result'}
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="ov" role="dialog" aria-modal="true" aria-labelledby="qq">
      <div className="qcard">{body}</div>
    </div>
  );
}
