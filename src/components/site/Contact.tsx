import { useState } from "react";
import { Clock, Github, Linkedin, Mail, MapPin, Phone, Twitter, CheckCircle2 } from "lucide-react";
import { Reveal } from "./Reveal";

type Errors = Partial<Record<"name" | "email" | "company" | "message", string>>;

function LocationArt() {
  return (
    <svg viewBox="0 0 400 240" className="w-full" role="img" aria-label="Abstract map of the Simulo HQ area">
      <rect width="400" height="240" rx="18" fill="rgba(42,23,80,0.6)" />
      {[40, 90, 140, 190].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#D9CCF3" strokeWidth="0.5" opacity="0.25" />
      ))}
      {[60, 140, 220, 300].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="240" stroke="#D9CCF3" strokeWidth="0.5" opacity="0.25" />
      ))}
      <path d="M20 200 L140 200 L140 90 L300 90 L300 30" fill="none" stroke="#FF9E5E" strokeWidth="3" strokeLinecap="round" />
      <circle cx="140" cy="90" r="26" fill="#FF6F61" opacity="0.18" />
      <circle cx="140" cy="90" r="9" fill="#FF6F61" />
      <text x="160" y="95" fill="#F5F1FF" fontSize="13" fontFamily="Inter, sans-serif">
        Simulo HQ
      </text>
    </svg>
  );
}

export function Contact() {
  const [values, setValues] = useState({ name: "", email: "", company: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = () => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid work email.";
    if (!values.company.trim()) next.company = "Company name is required.";
    if (values.message.trim().length < 10) next.message = "A little more detail helps us route you.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setSent(true);
  };

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <p className="font-display text-xs font-semibold tracking-[0.25em] text-amber uppercase">
          Contact
        </p>
        <h2 className="mt-4 text-3xl font-bold text-balance sm:text-4xl">Let&rsquo;s talk twins</h2>
        <p className="mx-auto mt-4 max-w-xl text-lavender">
          Tell us about your operation and we&rsquo;ll show you what your twin would look like.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="soft-card h-full p-7">
            {sent ? (
              <div
                role="status"
                className="flex h-full min-h-72 flex-col items-center justify-center text-center"
              >
                <CheckCircle2 className="size-12 text-amber" aria-hidden="true" />
                <h3 className="mt-4 font-display text-xl font-bold">Message received</h3>
                <p className="mt-2 max-w-xs text-sm text-lavender">
                  Thanks {values.name.split(" ")[0]} — we typically reply within 1 business day.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setValues({ name: "", email: "", company: "", message: "" });
                  }}
                  className="btn-ghost mt-6"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-5">
                <Field
                  id="c-name"
                  label="Full name"
                  value={values.name}
                  onChange={set("name")}
                  error={errors.name}
                  placeholder="Alex Moreau"
                />
                <Field
                  id="c-email"
                  label="Work email"
                  type="email"
                  value={values.email}
                  onChange={set("email")}
                  error={errors.email}
                  placeholder="alex@company.com"
                />
                <Field
                  id="c-company"
                  label="Company name"
                  value={values.company}
                  onChange={set("company")}
                  error={errors.company}
                  placeholder="Northbay Manufacturing"
                />
                <div>
                  <label htmlFor="c-message" className="mb-2 block text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="c-message"
                    rows={4}
                    value={values.message}
                    onChange={set("message")}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "c-message-err" : undefined}
                    placeholder="What would you like to simulate?"
                    className="field-input resize-y"
                  />
                  {errors.message && (
                    <p id="c-message-err" className="mt-2 text-xs text-coral">
                      {errors.message}
                    </p>
                  )}
                </div>
                <button type="submit" className="btn-primary w-full">
                  Send message
                </button>
              </form>
            )}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="soft-card flex h-full flex-col gap-6 p-7">
            <div>
              <h3 className="font-display text-xl font-bold">Simulo</h3>
              <p className="mt-1 text-sm text-lavender">
                Enterprise digital twins, built from your live data.
              </p>
            </div>

            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
                <span>148 Innovation Ave, San Francisco, CA 94107</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
                <span className="flex flex-col">
                  <a className="hover:text-amber" href="mailto:hello@simulo.ai">
                    hello@simulo.ai
                  </a>
                  <a className="text-lavender hover:text-amber" href="mailto:support@simulo.ai">
                    support@simulo.ai
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
                <a className="hover:text-amber" href="tel:+15550123456">
                  +1 (555) 012-3456
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
                <span>Mon–Fri, 9am–6pm PT · we typically reply within 1 business day</span>
              </li>
            </ul>

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
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border text-lavender transition-colors hover:border-amber hover:text-paper"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>

            <div className="mt-auto">
              <LocationArt />
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={160}>
        <p className="soft-card mt-6 px-6 py-4 text-center text-sm text-lavender">
          Prefer to chat? Use the assistant in the corner →
        </p>
      </Reveal>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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
