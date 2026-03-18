import { useState, useEffect } from 'react';

export function SaveStatus({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      setFading(false);
      const fadeTimer = setTimeout(() => setFading(true), 2000);
      const hideTimer = setTimeout(() => setShow(false), 2800); // 2000 + 800 fade
      return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
    }
  }, [visible]);

  if (!show) return null;
  return (
    <span
      className={`fixed top-[16px] right-[16px] text-[12px] text-success font-mono z-40 transition-opacity ${
        fading ? 'opacity-0 duration-[800ms]' : 'opacity-70 duration-[200ms]'
      }`}
    >
      Saved
    </span>
  );
}
