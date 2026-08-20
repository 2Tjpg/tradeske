'use client';

import { useEffect, useState } from 'react';

const PHRASES = ['Zero Charts', 'Real-Time Speed', 'Pure Instinct'];

export function Typewriter() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = PHRASES[index] ?? '';

    if (!deleting && text === full) {
      const hold = window.setTimeout(() => setDeleting(true), 2000);
      return () => window.clearTimeout(hold);
    }

    if (deleting && text === '') {
      setDeleting(false);
      setIndex((current) => (current + 1) % PHRASES.length);
      return;
    }

    const tick = window.setTimeout(
      () => {
        setText(
          deleting
            ? full.slice(0, text.length - 1)
            : full.slice(0, text.length + 1)
        );
      },
      deleting ? 28 : 55
    );

    return () => window.clearTimeout(tick);
  }, [text, deleting, index]);

  return (
    <span className="text-emerald-400">
      {text}
      <span className="tradeske-caret ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.08em] bg-emerald-400 align-middle" />
    </span>
  );
}
