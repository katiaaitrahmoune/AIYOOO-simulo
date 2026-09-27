import { useEffect, useState } from "react";

export function LiveChart() {
  const [points, setPoints] = useState<number[]>(() =>
    Array.from({ length: 24 }, (_, i) => 55 + Math.sin(i / 2.2) * 9 + (i % 3)),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setPoints((p) => {
        const last = p[p.length - 1] ?? 60;
        const next = Math.min(95, Math.max(25, last + (Math.random() - 0.48) * 9));
        return [...p.slice(1), next];
      });
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  const w = 600;
  const h = 200;
  const max = Math.max(...points) + 6;
  const min = Math.min(...points) - 6;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const latest = points[points.length - 1] ?? 0;

  return (
    <div className="soft-card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-lavender">Throughput index (live)</p>
          <p className="font-display text-3xl font-bold transition-all duration-500">
            {latest.toFixed(1)}
          </p>
        </div>
        <p className="text-xs text-lavender">Updating every few seconds</p>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="mt-6 h-48 w-full"
        role="img"
        aria-label={`Live throughput index, currently ${latest.toFixed(1)}`}
      >
        <defs>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF9E5E" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF9E5E" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            y1={h * f}
            x2={w}
            y2={h * f}
            stroke="#D9CCF3"
            strokeWidth="0.5"
            opacity="0.2"
          />
        ))}
        <path d={area} fill="url(#fillGrad)" style={{ transition: "d 900ms ease" }} />
        <path
          d={line}
          fill="none"
          stroke="#FF9E5E"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ transition: "d 900ms ease" }}
        />
        {coords.length > 0 && (
          <circle
            cx={coords[coords.length - 1]![0]}
            cy={coords[coords.length - 1]![1]}
            r="3.5"
            fill="#FF6F61"
            style={{ transition: "cy 900ms ease" }}
          />
        )}
      </svg>
    </div>
  );
}
