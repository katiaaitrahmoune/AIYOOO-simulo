import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Factory, Store, Truck, Landmark, ArrowRight, ArrowLeft } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { defaultProfile, saveProfile, type TwinProfile } from "@/lib/twin";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Build your twin — Simulo simulator setup" },
      {
        name: "description",
        content:
          "Pick your industry case, add your enterprise details, and Simulo builds a live what-if digital twin of your operation in minutes.",
      },
      { property: "og:title", content: "Build your Simulo twin" },
      {
        property: "og:description",
        content: "A three-step setup that turns your enterprise data into a living simulation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Simulator,
});

const cases = [
  { name: "Manufacturing", Icon: Factory, desc: "Plant throughput, downtime and supplier constraints." },
  { name: "Retail & Distribution", Icon: Store, desc: "Assortment, replenishment and store-level demand." },
  { name: "Logistics", Icon: Truck, desc: "Fleet routing, lead times and network capacity." },
  { name: "Financial Services", Icon: Landmark, desc: "Portfolio exposure, servicing load and risk paths." },
];

const buildSteps = [
  "Connecting to your systems…",
  "Reconciling operational data…",
  "Calibrating against history…",
  "Building your twin…",
];

function Simulator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [form, setForm] = useState<Omit<TwinProfile, "industry">>({
    company: "",
    email: "",
    employees: "",
    revenue: "",
    erp: "",
    website: "",
    locations: "",
    costDriver: "",
    goal: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [buildIdx, setBuildIdx] = useState(0);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const canContinue = !!form.company.trim() && emailOk && !!form.employees.trim() && !!form.goal.trim();

  useEffect(() => {
    if (step !== 3) return;
    const id = window.setInterval(() => setBuildIdx((i) => i + 1), 900);
    const done = window.setTimeout(() => {
      saveProfile({ ...defaultProfile, ...form, industry: industry || "Manufacturing" });
      navigate({ to: "/dashboard" });
    }, 3800);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(done);
    };
  }, [step, form, industry, navigate]);

  return (
    <div className="min-h-screen bg-ink">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-24 sm:px-6">
        <ol className="mb-10 flex items-center justify-center gap-3" aria-label="Setup progress">
          {[1, 2, 3].map((s) => (
            <li key={s} className="flex items-center gap-3">
              <span
                aria-current={step === s ? "step" : undefined}
                className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  step >= s ? "bg-amber text-ink" : "border border-border text-lavender"
                }`}
              >
                {s}
              </span>
              {s < 3 && (
                <span
                  aria-hidden="true"
                  className={`h-px w-10 ${step > s ? "bg-amber" : "bg-border"}`}
                />
              )}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <section>
            <h1 className="text-center font-display text-3xl font-bold sm:text-4xl">
              Pick your industry case
            </h1>
            <p className="mt-3 text-center text-lavender">
              We&rsquo;ll preload the model with the constraints that matter most in your sector.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {cases.map(({ name, Icon, desc }) => {
                const active = industry === name;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setIndustry(name)}
                    className={`soft-card soft-card-hover p-6 text-left ${
                      active ? "border-amber bg-amber/10" : ""
                    }`}
                  >
                    <Icon className="size-6 text-amber" aria-hidden="true" />
                    <h2 className="mt-4 font-display text-lg font-semibold">{name}</h2>
                    <p className="mt-1 text-sm text-lavender">{desc}</p>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={!industry}
              onClick={() => setStep(2)}
              className="btn-primary mt-10 w-full"
            >
              Continue <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="text-center font-display text-3xl font-bold sm:text-4xl">
              Your enterprise details
            </h1>
            <p className="mt-3 text-center text-lavender">
              The twin calibrates itself against these before it runs a single scenario.
            </p>

            <form
              className="mt-10 flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (canContinue) setStep(3);
              }}
            >
              <Field
                id="s-company"
                label="Company name *"
                value={form.company}
                onChange={set("company")}
                onBlur={() => setTouched((t) => ({ ...t, company: true }))}
                error={touched['company'] && !form.company.trim() ? "Required" : undefined}
              />
              <Field
                id="s-email"
                label="Work email *"
                type="email"
                value={form.email}
                onChange={set("email")}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                error={touched['email'] && !emailOk ? "Enter a valid work email" : undefined}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="s-employees"
                  label="Employee count *"
                  value={form.employees}
                  onChange={set("employees")}
                  onBlur={() => setTouched((t) => ({ ...t, employees: true }))}
                  error={touched['employees'] && !form.employees.trim() ? "Required" : undefined}
                  placeholder="2,400"
                />
                <Field
                  id="s-revenue"
                  label="Annual revenue"
                  value={form.revenue}
                  onChange={set("revenue")}
                  placeholder="$640M"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="s-erp" className="mb-2 block text-sm font-medium">
                    ERP system
                  </label>
                  <select id="s-erp" value={form.erp} onChange={set("erp")} className="field-input">
                    <option value="">Select or skip</option>
                    {["SAP S/4HANA", "Oracle NetSuite", "Microsoft Dynamics 365", "Infor", "Odoo", "Other"].map(
                      (o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <Field
                  id="s-locations"
                  label="Number of locations"
                  value={form.locations}
                  onChange={set("locations")}
                  placeholder="7"
                />
              </div>
              <Field id="s-website" label="Website" value={form.website} onChange={set("website")} placeholder="company.com" />
              <Field
                id="s-cost"
                label="Biggest cost driver"
                value={form.costDriver}
                onChange={set("costDriver")}
                placeholder="Raw material logistics"
              />
              <Field
                id="s-goal"
                label="Primary goal *"
                value={form.goal}
                onChange={set("goal")}
                onBlur={() => setTouched((t) => ({ ...t, goal: true }))}
                error={touched['goal'] && !form.goal.trim() ? "Required" : undefined}
                placeholder="Cut unplanned downtime by a third"
              />

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost sm:w-auto">
                  <ArrowLeft className="size-4" aria-hidden="true" /> Back
                </button>
                <button type="submit" disabled={!canContinue} className="btn-primary flex-1">
                  Continue <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          </section>
        )}

        {step === 3 && (
          <section className="flex min-h-[50vh] flex-col items-center justify-center text-center" aria-live="polite">
            <div className="relative size-28">
              <span className="absolute inset-0 animate-ping rounded-full bg-amber/30" aria-hidden="true" />
              <span className="sunset-bg absolute inset-3 rounded-full" aria-hidden="true" />
            </div>
            <h1 className="mt-8 font-display text-2xl font-bold sm:text-3xl">
              {buildSteps[Math.min(buildIdx, buildSteps.length - 1)]}
            </h1>
            <p className="mt-3 text-lavender">
              Modelling {form.company || "your enterprise"} across {industry.toLowerCase()} constraints.
            </p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (() => void) | undefined;
  error?: string | undefined;
  type?: string | undefined;
  placeholder?: string | undefined;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className="field-input"
      />
      {error && (
        <p id={`${id}-err`} className="mt-2 text-xs text-coral">
          {error}
        </p>
      )}
    </div>
  );
}
