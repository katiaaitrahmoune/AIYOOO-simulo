import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { TwinProfile } from "@/lib/twin";

type Msg = { from: "bot" | "user"; text: string };

export function AskTheTwin({ profile }: { profile: TwinProfile }) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text: `I'm the ${profile.company} twin, synced with ${profile.erp}. Ask me a what-if — for example "what if we cut lead time 20%?"`,
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [msgs, typing]);

  const answer = async (q: string) => {
    try {
      const res = await fetch("https://aiyooo-simulo.onrender.com/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      return data.answer as string;
    } catch (err) {
      console.error("Twin API error:", err);
      return "Sorry, I couldn't reach the twin right now. Please try again.";
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    const reply = await answer(text);
    setTyping(false);
    setMsgs((m) => [...m, { from: "bot", text: reply }]);
  };

  return (
    <div className="soft-card flex flex-col p-5 sm:p-6">
      <div className="flex max-h-[26rem] min-h-72 flex-col gap-3 overflow-y-auto pr-1" aria-live="polite">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.from === "user" ? "self-end bg-paper text-ink" : "self-start bg-violet-deep text-paper"
            }`}
          >
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="self-start rounded-2xl bg-violet-deep px-4 py-3.5">
            <span className="flex gap-1" aria-label="Twin is thinking">
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

      <form onSubmit={send} className="mt-4 flex items-center gap-2">
        <label htmlFor="twin-input" className="sr-only">
          Ask the twin a what-if question
        </label>
        <input
          id="twin-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What if we cut lead time 20%?"
          className="field-input"
        />
        <button type="submit" aria-label="Send question" className="btn-primary size-11 shrink-0 !p-0">
          <Send className="size-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
