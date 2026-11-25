import { useEffect, useRef, useState } from 'react';

// Small modal with one text field. dlg: { title, label, init, ph, max, ok, check(v) -> error, done(v) }
export default function PromptDialog({ dlg, onClose }) {
  const [value, setValue] = useState(dlg.init || '');
  const [err, setErr] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  function go() {
    const v = value.trim();
    const e = dlg.check ? dlg.check(v) : v ? '' : 'Enter a value first.';
    if (e) { setErr(e); ref.current?.focus(); return; }
    onClose();
    dlg.done(v);
  }

  return (
    <div className="ov" role="dialog" aria-modal="true" aria-labelledby="nst" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="qcard" style={{ maxWidth: 420 }}>
        <p className="qq" id="nst">{dlg.title}</p>
        <label className="nsl">{dlg.label}</label>
        <input
          ref={ref} className="nsin" maxLength={dlg.max || 60} value={value} placeholder={dlg.ph || ''}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
        />
        <div className="err">{err}</div>
        <div className="row">
          <button className="btn pri" type="button" onClick={go}>{dlg.ok || 'Save'}</button>
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
