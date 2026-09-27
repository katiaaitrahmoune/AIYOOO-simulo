import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";

export function ClosingCta() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <Reveal>
        <div className="sunset-bg relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-ink/40"
          />
          <h2 className="font-display text-3xl font-bold text-balance text-paper sm:text-4xl">
            See your enterprise run tomorrow, today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-paper/90">
            Spin up a twin with your own numbers in under 15 minutes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/simulator" className="btn-primary">
              Build your twin
            </Link>
            <Link to="/contact" className="btn-ghost">
              Talk to sales
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
