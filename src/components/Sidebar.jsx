export default function Sidebar({ st, quizCount, hasSheet, onQuiz }) {
  const pc = st.pc;
  const hint = !hasSheet
    ? 'Create a sheet to begin'
    : quizCount
      ? `${Math.min(quizCount, 10)} questions from your completed topics`
      : 'Tick topics to unlock the quiz';

  return (
    <aside className="side" aria-label="Overall progress">
      <div className="lab">Progress</div>
      <svg viewBox="0 0 42 42" role="img" aria-label="Percentage of topics clear">
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#3B4A62" strokeWidth="5" />
        <circle
          cx="21" cy="21" r="15.9155" fill="none" stroke="#E18025" strokeWidth="5"
          strokeDasharray={`${pc} 100`} transform="rotate(-90 21 21)"
          style={{ transition: 'stroke-dasharray .3s' }}
        />
        <text x="21" y="23.4" textAnchor="middle" fontSize="8" fontWeight="300" fill="#fff" fontFamily="Lato,system-ui,sans-serif">
          {pc}%
        </text>
      </svg>
      <div className="stx">
        <b>{pc}% of topics clear</b>
        <span id="psub">
          {st.d} of {st.t} pointers ticked. {st.full} of {st.n} modules fully clear.
        </span>
        <div className="leg">
          <span><i style={{ background: '#E18025' }} />{pc}% clear</span>
          <span><i style={{ background: '#3B4A62' }} />{100 - pc}% to learn</span>
        </div>
      </div>
      <div>
        <button className="btn pri" type="button" disabled={!quizCount} onClick={onQuiz}>
          {quizCount ? 'Take quiz' : 'Quiz locked'}
        </button>
        <span id="qhint">{hint}</span>
      </div>
    </aside>
  );
}
