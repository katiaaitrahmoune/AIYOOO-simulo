import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";

const faqs = [
  {
    q: "How long does it take to stand up a twin?",
    a: "Most teams are live in two to three weeks. We connect a read-only feed from your ERP first, reconcile a baseline, then layer in the rest of your systems.",
  },
  {
    q: "Does Simulo write back to our systems?",
    a: "Never by default. Simulo is read-only unless you explicitly enable a write-back integration, and every write is logged and reversible.",
  },
  {
    q: "Where does our data live?",
    a: "In our managed cloud by default, with regional residency options. Enterprise customers can run Simulo inside their own VPC or private cloud.",
  },
  {
    q: "How accurate are the simulations?",
    a: "Each twin is calibrated against your historical outcomes and reports a confidence band with every scenario, so you can see the uncertainty, not just the number.",
  },
  {
    q: "Can non-technical teams use it?",
    a: "Yes — Ask the Twin answers what-if questions in plain English and cites the specific metrics behind each answer.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <p className="font-display text-xs font-semibold tracking-[0.25em] text-amber uppercase">
          FAQ
        </p>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Questions we hear often</h2>
      </Reveal>

      <div className="mt-10 flex flex-col gap-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 80}>
              <div className="soft-card overflow-hidden">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display text-base font-semibold transition-colors hover:text-amber"
                  >
                    {f.q}
                    <ChevronDown
                      aria-hidden="true"
                      className={`size-5 shrink-0 text-amber transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-lavender">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
