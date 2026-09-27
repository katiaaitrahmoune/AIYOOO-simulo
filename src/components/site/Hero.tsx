import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function Hero() {
  const [y, setY] = useState(0);

  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="sunset-bg relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-20 text-center">
      {/* Parallax skyline scene */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-[46%] size-[46vmax] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px]"
          style={{
            transform: `translate(-50%, calc(-50% + ${y * 0.18}px))`,
            background: "radial-gradient(circle, #F2A25C 0%, #FF9E5E 45%, rgba(255,111,97,0) 70%)",
            opacity: 0.85,
          }}
        />
        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[42vh] w-full"
          style={{ transform: `translateY(${y * -0.06}px)` }}
        >
          <g fill="#2A1750" opacity="0.85">
            <rect x="40" y="180" width="70" height="240" rx="6" />
            <rect x="130" y="240" width="54" height="180" rx="6" />
            <rect x="200" y="140" width="86" height="280" rx="8" />
            <rect x="305" y="220" width="60" height="200" rx="6" />
            <rect x="385" y="100" width="74" height="320" rx="8" />
            <rect x="480" y="200" width="96" height="220" rx="8" />
            <rect x="600" y="60" width="64" height="360" rx="8" />
            <rect x="686" y="170" width="110" height="250" rx="10" />
            <rect x="820" y="120" width="70" height="300" rx="8" />
            <rect x="910" y="220" width="90" height="200" rx="8" />
            <rect x="1020" y="150" width="66" height="270" rx="8" />
            <rect x="1105" y="230" width="104" height="190" rx="8" />
            <rect x="1230" y="170" width="72" height="250" rx="8" />
            <rect x="1320" y="240" width="90" height="180" rx="8" />
          </g>
          <g fill="#FF9E5E" opacity="0.5">
            {Array.from({ length: 90 }).map((_, i) => (
              <rect
                key={i}
                x={50 + ((i * 137) % 1340)}
                y={200 + ((i * 53) % 180)}
                width="4"
                height="6"
                rx="1"
              />
            ))}
          </g>
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-paper/25 bg-ink/25 px-4 py-1.5 text-xs font-medium tracking-wide text-paper backdrop-blur">
        <span className="pulse-dot size-2 rounded-full bg-amber" aria-hidden="true" />
        Live enterprise digital twins
      </p>

      <h1
        className="font-display text-[clamp(3rem,16vw,11rem)] leading-none font-bold tracking-[0.06em] text-paper"
        style={{ transform: `translateY(${y * -0.12}px)` }}
      >
        SIMULO
      </h1>

      <p className="mt-6 max-w-2xl text-balance text-base text-paper/90 sm:text-lg">
        Build a living digital twin of your enterprise from your own operational data — then
        simulate any decision before you make it.
      </p>

      <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
        <a href="#product" className="btn-ghost">
          See how it works
        </a>
        <Link to="/simulator" className="btn-primary">
          Book a demo
        </Link>
      </div>
    </section>
  );
}
