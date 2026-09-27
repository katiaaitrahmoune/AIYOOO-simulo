import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Features } from "@/components/site/Features";
import { Pricing } from "@/components/site/Pricing";
import { Testimonials } from "@/components/site/Testimonials";
import { Faq } from "@/components/site/Faq";
import { ClosingCta } from "@/components/site/ClosingCta";
import { Footer } from "@/components/site/Footer";
import { ChatWidget } from "@/components/site/ChatWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulo — Enterprise digital twins from your live data" },
      {
        name: "description",
        content:
          "Simulo builds a living digital twin of your enterprise from your ERP and operational data, so you can simulate any decision before you make it.",
      },
      { property: "og:title", content: "Simulo — Enterprise digital twins" },
      {
        property: "og:description",
        content:
          "Simulate supply, cost and demand decisions against a live twin of your enterprise.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-ink">
      <Nav />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
