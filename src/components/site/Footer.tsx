import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-lg font-bold tracking-[0.18em]">SIMULO</p>
          <p className="mt-3 text-sm text-lavender">
            Enterprise digital twins, built from your live data.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.2em] text-paper uppercase">
              Product
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-lavender">
              <li>
                <a className="hover:text-paper" href="/#product">
                  Overview
                </a>
              </li>
              <li>
                <a className="hover:text-paper" href="/#pricing">
                  Pricing
                </a>
              </li>
              <li>
                <Link className="hover:text-paper" to="/simulator">
                  Build a twin
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.2em] text-paper uppercase">
              Company
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-lavender">
              <li>
                <a className="hover:text-paper" href="/#customers">
                  Customers
                </a>
              </li>
              <li>
                <Link className="hover:text-paper" to="/contact">
                  Contact
                </Link>
              </li>
              <li>
                <a className="hover:text-paper" href="/#faq">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.2em] text-paper uppercase">
              Reach us
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-lavender">
              <li>
                <a className="hover:text-paper" href="mailto:hello@simulo.ai">
                  hello@simulo.ai
                </a>
              </li>
              <li>
                <a className="hover:text-paper" href="tel:+15550123456">
                  +1 (555) 012-3456
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
        <p className="text-xs text-lavender">
          © {new Date().getFullYear()} Simulo. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          {[
            { Icon: Linkedin, label: "Simulo on LinkedIn" },
            { Icon: Twitter, label: "Simulo on X" },
            { Icon: Github, label: "Simulo on GitHub" },
          ].map(({ Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border text-lavender transition-colors hover:border-amber hover:text-paper"
            >
              <Icon className="size-4" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
