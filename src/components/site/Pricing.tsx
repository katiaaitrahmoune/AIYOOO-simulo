import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Reveal } from "./Reveal";

const tiers = [
  {
    name: "Starter",
    price: "$1,200",
    cadence: "/month",
    blurb: "For a single site or business unit finding its first twin.",
    features: ["1 connected system", "Up to 10 scenarios / month", "Live simulation dashboard", "Email support"],
    cta: "Start a pilot",
    featured: false,
  },
  {
    name: "Growth",
    price: "$4,800",
    cadence: "/month",
    blurb: "For multi-site operations running continuous what-if planning.",
    features: [
      "Up to 5 connected systems",
      "Unlimited scenarios",
      "Ask the Twin assistant",
      "Shared scenario workspaces",
      "Priority support, 4h response",
    ],
    cta: "Book a demo",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "For global groups with governance, residency and SSO requirements.",
    features: [
      "Unlimited systems & users",
      "Private deployment or VPC",
      "SSO, SCIM, audit logs",
      "Custom model calibration",
      "Named solution architect",
    ],
    cta: "Talk to sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <p className="font-display text-xs font-semibold tracking-[0.25em] text-amber uppercase">
          Pricing
        </p>
        <h2 className="mt-4 text-3xl font-bold text-balance sm:text-4xl">
          Priced by the decisions it de-risks
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lavender">
          Every plan includes onboarding, data reconciliation and the live twin dashboard.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 120}>
            <div
              className={`soft-card soft-card-hover relative flex h-full flex-col p-7 ${
                t.featured ? "border-amber/60 shadow-[0_24px_60px_-28px_rgba(255,111,97,0.8)]" : ""
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-sun to-coral px-3 py-1 text-[11px] font-semibold text-ink">
                  Most chosen
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{t.name}</h3>
              <p className="mt-2 text-sm text-lavender">{t.blurb}</p>
              <p className="mt-6 font-display text-4xl font-bold">
                {t.price}
                <span className="text-base font-normal text-lavender">{t.cadence}</span>
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-paper/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={t.name === "Enterprise" ? "/contact" : "/simulator"}
                className={`mt-8 ${t.featured ? "btn-primary" : "btn-ghost"} w-full`}
              >
                {t.cta}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
