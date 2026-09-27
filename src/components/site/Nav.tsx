import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Github, Linkedin, Twitter } from "lucide-react";

const links = [
  { label: "Product", href: "/#product" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Customers", href: "/#customers" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Main"
        className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 sm:px-6"
      >
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-[0.18em] text-paper"
          aria-label="Simulo home"
        >
          SIMULO
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-sm font-medium text-lavender transition-colors hover:text-paper"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/simulator" className="btn-primary px-5 py-2 text-sm">
            Book a demo
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="inline-flex size-10 items-center justify-center rounded-full border border-border text-paper transition-colors hover:bg-white/10 md:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className={`absolute inset-y-0 right-0 flex w-[min(86vw,20rem)] flex-col gap-8 bg-violet-deep p-6 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold tracking-[0.18em]">SIMULO</span>
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-base font-medium text-lavender transition-colors hover:bg-white/10 hover:text-paper"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <Link
            to="/simulator"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className="btn-primary w-full"
          >
            Book a demo
          </Link>

          <div className="mt-auto flex items-center gap-3">
            {[
              { Icon: Linkedin, label: "Simulo on LinkedIn" },
              { Icon: Twitter, label: "Simulo on X" },
              { Icon: Github, label: "Simulo on GitHub" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                tabIndex={open ? 0 : -1}
                className="inline-flex size-10 items-center justify-center rounded-full border border-border text-lavender transition-colors hover:text-paper"
              >
                <Icon className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
