import { Reveal } from "./Reveal";

const quotes = [
  {
    quote:
      "We modelled a supplier switch in an afternoon. The twin flagged a downstream bottleneck our planners had missed for two years.",
    name: "Dana Reyes",
    role: "VP Operations, Northbay Manufacturing",
  },
  {
    quote:
      "Simulo replaced six spreadsheets and a monthly steering meeting. Now the question is answered before the meeting.",
    name: "Marcus Aalto",
    role: "COO, Verdant Logistics",
  },
  {
    quote:
      "Our finance team trusts it because every number traces back to the ERP. That was the whole battle.",
    name: "Priya Nandan",
    role: "CFO, Helix Retail Group",
  },
];

const logos = ["NORTHBAY", "VERDANT", "HELIX", "ATLAS CO", "MERIDIAN", "KOVA"];

export function Testimonials() {
  return (
    <section id="customers" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <p className="font-display text-xs font-semibold tracking-[0.25em] text-amber uppercase">
          Customers
        </p>
        <h2 className="mt-4 text-3xl font-bold text-balance sm:text-4xl">
          Trusted where downtime is measured in millions
        </h2>
      </Reveal>

      <Reveal delay={100}>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {logos.map((l) => (
            <li
              key={l}
              className="soft-card flex items-center justify-center px-2 py-5 font-display text-xs font-bold tracking-[0.18em] text-lavender"
            >
              {l}
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {quotes.map((q, i) => (
          <Reveal key={q.name} delay={i * 120}>
            <figure className="soft-card soft-card-hover flex h-full flex-col p-7">
              <span aria-hidden="true" className="font-display text-4xl leading-none text-amber">
                &ldquo;
              </span>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-paper/90">
                {q.quote}
              </blockquote>
              <figcaption className="mt-6">
                <p className="font-display text-sm font-semibold">{q.name}</p>
                <p className="text-xs text-lavender">{q.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
