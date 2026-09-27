import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, LayoutDashboard, MessageSquare, Settings, TrendingDown, TrendingUp } from "lucide-react";
import { LiveChart } from "@/components/dashboard/LiveChart";
import { AskTheTwin } from "@/components/dashboard/AskTheTwin";
import { Reveal } from "@/components/site/Reveal";
import { defaultProfile, loadProfile, type TwinProfile } from "@/lib/twin";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Twin dashboard — live simulation | Simulo" },
      {
        name: "description",
        content:
          "Track efficiency, cost variance and modelled scenarios on a live Simulo digital twin, and ask what-if questions in plain English.",
      },
      { property: "og:title", content: "Simulo twin dashboard" },
      {
        property: "og:description",
        content: "Live KPIs, scenario impacts and an AI assistant scoped to your own operational data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const navItems = [
  { label: "Overview", Icon: LayoutDashboard },
  { label: "Live Simulation", Icon: Activity },
  { label: "Ask the Twin", Icon: MessageSquare },
  { label: "Settings", Icon: Settings },
];

const scenarios = [
  { title: "Cut lead time 20%", result: "Efficiency score climbs 6.4 points; buffer stock down 9%.", delta: "+6.4%", up: true },
  { title: "Consolidate two regional depots", result: "Saves $1.8M a year but adds 1.3 days to west-coast delivery.", delta: "-1.3 days", up: false },
  { title: "Shift 15% volume to supplier B", result: "Material cost falls 4.2% with no change in defect rate.", delta: "+4.2%", up: true },
  { title: "Demand spike of 30%", result: "Two sites saturate within 11 days without pre-positioning.", delta: "-8.7%", up: false },
];

function Dashboard() {
  const [profile, setProfile] = useState<TwinProfile>(defaultProfile);
  const [tab, setTab] = useState<"sim" | "chat">("sim");
  const [active, setActive] = useState("Live Simulation");

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  useEffect(() => {
    if (active === "Ask the Twin") setTab("chat");
    if (active === "Live Simulation" || active === "Overview") setTab("sim");
  }, [active]);

  const kpis = [
    { label: "Efficiency Score", value: "87.4" },
    { label: "Cost Variance", value: "-2.6%" },
    { label: "Scenarios Modeled", value: "148" },
  ];

  return (
    <div className="flex min-h-screen bg-ink">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-violet-deep/40 p-5 md:flex">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.18em]">
          SIMULO
        </Link>
        <nav aria-label="Dashboard" className="mt-10 flex flex-col gap-1">
          {navItems.map(({ label, Icon }) => (
            <button
              key={label}
              type="button"
              aria-current={active === label ? "page" : undefined}
              onClick={() => setActive(label)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active === label ? "bg-amber/15 text-amber" : "text-lavender hover:bg-white/5 hover:text-paper"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
        <Link to="/" className="btn-ghost mt-auto text-sm">
          Back to site
        </Link>
      </aside>

      <main className="flex-1 px-4 py-8 sm:px-8">
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              {profile.company} Digital Twin
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber/50 bg-amber/10 px-3 py-1 text-xs font-semibold text-amber">
              <span className="pulse-dot size-2 rounded-full bg-amber" aria-hidden="true" />
              LIVE
            </span>
          </div>
          <p className="mt-2 text-sm text-lavender">
            Synced with {profile.erp} · updated moments ago
          </p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {kpis.map((k, i) => (
            <Reveal key={k.label} delay={i * 100}>
              <div className="soft-card soft-card-hover p-6">
                <p className="font-display text-3xl font-bold">{k.value}</p>
                <p className="mt-1 text-sm text-lavender">{k.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div
          role="tablist"
          aria-label="Twin views"
          className="mt-8 inline-flex gap-1 rounded-full border border-border p-1"
        >
          {(
            [
              ["sim", "Live Simulation"],
              ["chat", "Ask the Twin"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                tab === id ? "bg-gradient-to-r from-sun to-coral text-ink" : "text-lavender hover:text-paper"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 max-w-4xl">
          {tab === "sim" ? (
            <>
              <LiveChart />
              <h2 className="mt-8 font-display text-lg font-semibold">Modelled scenarios</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {scenarios.map((s, i) => (
                  <Reveal as="li" key={s.title} delay={i * 110}>
                    <div className="soft-card soft-card-hover h-full p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-base font-semibold">{s.title}</h3>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            s.up ? "bg-emerald-400/15 text-emerald-300" : "bg-coral/15 text-coral"
                          }`}
                        >
                          {s.up ? (
                            <TrendingUp className="size-3" aria-hidden="true" />
                          ) : (
                            <TrendingDown className="size-3" aria-hidden="true" />
                          )}
                          {s.delta}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-lavender">{s.result}</p>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </>
          ) : (
            <AskTheTwin profile={profile} />
          )}
        </div>
      </main>
    </div>
  );
}
