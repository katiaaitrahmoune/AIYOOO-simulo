import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ChatWidget } from "@/components/site/ChatWidget";
import { Contact } from "@/components/site/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Simulo — talk to the digital twin team" },
      {
        name: "description",
        content:
          "Reach Simulo in San Francisco: sales and support email, phone, business hours, and a contact form answered within one business day.",
      },
      { property: "og:title", content: "Contact Simulo" },
      {
        property: "og:description",
        content: "Tell us about your operation and we'll show you what your digital twin looks like.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-ink">
      <Nav />
      <main className="pt-24">
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
