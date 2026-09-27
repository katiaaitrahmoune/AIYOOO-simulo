import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type Msg = { from: "bot" | "user"; text: string };

const canned: { match: RegExp; reply: string }[] = [
  { match: /price|pricing|cost|plan/i, reply: "Plans start at $1,200/month (Starter) and scale to custom Enterprise deployments. The pricing section has the full breakdown." },
  { match: /demo|trial|start/i, reply: "You can build a sample twin right now — hit “Book a demo” and the setup takes about two minutes." },
  { match: /data|secure|security|privacy/i, reply: "Simulo is read-only by default, supports regional data residency, and Enterprise plans can run inside your own VPC." },
  { match: /integrat|erp|sap|oracle/i, reply: "We connect to SAP, Oracle, NetSuite, Dynamics and most warehouse systems, plus anything with a REST or SQL endpoint." },
  { match: /time|long|implement/i, reply: "Typical time to a live twin is two to three weeks, starting with a single ERP feed." },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Hi! I'm the Simulo assistant. Ask me about pricing, integrations or security." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs, typing, open]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    const reply =
      canned.find((c) => c.match.test(text))?.reply ??
      "Good question — a specialist can answer that properly. Drop us a line at hello@simulo.ai and we'll reply within one business day.";
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text: reply }]);
    }, 900);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close the Simulo assistant" : "Open the Simulo assistant"}
        aria-expanded={open}
        aria-controls="simulo-chat"
        className="btn-primary fixed right-4 bottom-4 z-40 size-14 !p-0 sm:right-6 sm:bottom-6"
      >
        {open ? (
          <X className="size-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="size-6" aria-hidden="true" />
        )}
      </button>

      <div
        id="simulo-chat"
        role="dialog"
        aria-label="Simulo assistant"
        aria-hidden={!open}
        className={`glass fixed right-3 bottom-22 z-40 flex w-[min(92vw,22rem)] flex-col overflow-hidden rounded-3xl transition-all duration-300 sm:right-6 ${
          open ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="pulse-dot size-2 rounded-full bg-amber" aria-hidden="true" />
          <p className="font-display text-sm font-semibold">Simulo assistant</p>
        </div>

        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.from === "user"
                  ? "self-end bg-paper text-ink"
                  : "self-start bg-violet-deep text-paper"
              }`}
            >
              {m.text}
            </div>
          ))}
          {typing && (
            <div className="self-start rounded-2xl bg-violet-deep px-3.5 py-3">
              <span className="flex gap-1" aria-label="Assistant is typing">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="pulse-dot size-1.5 rounded-full bg-lavender"
                    style={{ animationDelay: `${d * 0.2}s` }}
                  />
                ))}
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
          <label htmlFor="chat-input" className="sr-only">
            Message the Simulo assistant
          </label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            className="field-input py-2 text-sm"
            tabIndex={open ? 0 : -1}
          />
          <button
            type="submit"
            aria-label="Send message"
            tabIndex={open ? 0 : -1}
            className="btn-primary size-10 shrink-0 !p-0"
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </>
  );
}
