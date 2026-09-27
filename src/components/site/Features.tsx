import { Reveal } from "./Reveal";

function MissionArt() {
  return (
    <svg viewBox="0 0 420 320" className="w-full" role="img" aria-label="Data streams forming a twin">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2A25C" />
          <stop offset="100%" stopColor="#C9678A" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="160" r="96" fill="none" stroke="url(#g1)" strokeWidth="2" />
      <circle cx="210" cy="160" r="62" fill="none" stroke="#D9CCF3" strokeWidth="1" opacity="0.5" />
      <circle cx="210" cy="160" r="26" fill="url(#g1)" opacity="0.9" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <g key={a}>
            <line
              x1={210 + Math.cos(r) * 30}
              y1={160 + Math.sin(r) * 30}
              x2={210 + Math.cos(r) * 94}
              y2={160 + Math.sin(r) * 94}
              stroke="#FF9E5E"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <circle cx={210 + Math.cos(r) * 96} cy={160 + Math.sin(r) * 96} r="7" fill="#FF6F61" />
          </g>
        );
      })}
    </svg>
  );
}

function AdvantageArt() {
  return (
    <svg viewBox="0 0 420 320" className="w-full" role="img" aria-label="Scenario branches chart">
      <rect x="40" y="40" width="340" height="240" rx="18" fill="rgba(245,241,255,0.05)" />
      <polyline
        points="70,240 130,200 190,215 250,150 310,120 350,80"
        fill="none"
        stroke="#FF9E5E"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <polyline
        points="190,215 250,205 310,220 350,235"
        fill="none"
        stroke="#D9CCF3"
        strokeWidth="2"
        strokeDasharray="6 6"
      />
      {[
        [70, 240],
        [130, 200],
        [190, 215],
        [250, 150],
        [310, 120],
        [350, 80],
      ].map(([x, yy]) => (
        <circle key={`${x}`} cx={x} cy={yy} r="5" fill="#FF6F61" />
      ))}
    </svg>
  );
}

const panels = [
  {
    eyebrow: "Our mission",
    title: "Your enterprise, mirrored in real time",
    body: "Simulo ingests your ERP, CRM and operational feeds and continuously reconciles them into a single living model. No static dashboards — a twin that moves when your business moves.",
    bullets: ["Connects in days, not quarters", "Reconciled every few seconds", "Audit-ready lineage"],
    art: <MissionArt />,
  },
  {
    eyebrow: "The advantage",
    title: "Test the decision before you live with it",
    body: "Ask what happens if lead times shrink, a supplier drops out, or demand spikes 30%. Simulo runs the scenario across your real constraints and answers in plain English.",
    bullets: ["Scenario modelling on live data", "Plain-English impact summaries", "Share results with one link"],
    art: <AdvantageArt />,
  },
];

export function Features() {
  return (
    <section id="product" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="flex flex-col gap-24">
        {panels.map((p, i) => (
          <Reveal key={p.title}>
            <div
              className={`grid items-center gap-10 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <p className="font-display text-xs font-semibold tracking-[0.25em] text-amber uppercase">
                  {p.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-bold text-balance sm:text-4xl">{p.title}</h2>
                <p className="mt-4 text-base leading-relaxed text-lavender">{p.body}</p>
                <ul className="mt-6 flex flex-col gap-3">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-paper/90">
                      <span
                        className="mt-1.5 size-2 shrink-0 rounded-full bg-coral"
                        aria-hidden="true"
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="soft-card float-slow p-6">{p.art}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
