import { useEffect, useRef, useState } from 'react';

// "Tap again to confirm" helper: arm() turns it on, it switches itself off after a few seconds.
export default function useArm(ms = 3500) {
  const [armed, setArmed] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  function arm() {
    setArmed(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setArmed(false), ms);
  }
  function reset() {
    clearTimeout(timer.current);
    setArmed(false);
  }
  return [armed, arm, reset];
}
