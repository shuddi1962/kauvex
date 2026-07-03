"use client";

import { useEffect, useState } from "react";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ hours = 26 }: { hours?: number }) {
  const [target] = useState(() => Date.now() + hours * 3600 * 1000);
  const [t, setT] = useState(() => getRemaining(target));

  useEffect(() => {
    const i = setInterval(() => setT(getRemaining(target)), 1000);
    return () => clearInterval(i);
  }, [target]);

  const cells = [
    { v: t.d, l: "Days" },
    { v: t.h, l: "Hrs" },
    { v: t.m, l: "Min" },
    { v: t.s, l: "Sec" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {cells.map((c, i) => (
        <div key={c.l} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center bg-navy text-orange rounded-lg w-12 h-12 justify-center border border-orange/20">
            <span className="font-mono font-bold text-lg leading-none">{String(c.v).padStart(2, "0")}</span>
            <span className="text-[8px] text-white/50 uppercase tracking-wider">{c.l}</span>
          </div>
          {i < cells.length - 1 && <span className="text-text-4 font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  );
}