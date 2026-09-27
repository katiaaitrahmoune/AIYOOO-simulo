# Simulo — Enterprise Digital Twin

Simulo builds a living digital twin of your enterprise from your ERP and operational data, so you can simulate any decision before you make it.

🔗 Live site: [simulataik.netlify.app](https://beamish-quokka-0b8f92.netlify.app/)

## Overview

Simulo ingests ERP/CRM and operational feeds and continuously reconciles them into a single living model. Users can run what-if scenarios (supplier delays, demand spikes, lead-time changes, etc.) and get plain-English impact summaries backed by real data.

### Key features

- **Live Simulation dashboard** — real-time metrics (Efficiency Score, Cost Variance, Scenarios Modeled) and a live throughput chart, with a running list of modelled scenarios.
- **Ask the Twin** — a conversational assistant that answers what-if questions in natural language, backed by the Simulo API (RAG + LLM pipeline).
- **Scenario modelling** — quantifies the impact of operational decisions on efficiency, cost, and delivery.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend framework | [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router) |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 + Radix UI |
| Package manager | [Bun](https://bun.sh) |
| Backend | Node.js / Express, deployed on Render |
| AI | Gemini (LLM) + RAG over ERP data |
| Hosting | Netlify (frontend) |

## Getting started

### Prerequisites

- [Bun](https://bun.sh) installed (`bun --version` to check)

### Install

```bash
bun install
```

### Run in development

```bash
bun run dev
```

The app will be available at the local URL printed in the terminal (usually `http://localhost:3000`).

### Build for production

```bash
bun run build
```

This runs a Nitro build (Cloudflare preset) and outputs to `.output/` (server bundle in `.output/server/`, static assets in `.output/public/`).

> **Note:** `bun run preview` currently fails — it expects the server bundle at `dist/server/server.js`, but the configured Nitro preset outputs to `.output/server/index.mjs` instead. This is a config mismatch, not a build failure; the production build itself is valid. Local preview is not required for the Netlify deployment pipeline.

### Lint / format

```bash
bun run lint
bun run format
```

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the deployed backend (e.g. `https://aiyooo-simulo.onrender.com`) |

Set this in a local `.env` file for development, and in Netlify's **Site settings → Environment variables** for production.

## Backend integration

The **Ask the Twin** feature calls:

```
POST https://aiyooo-simulo.onrender.com/api/simulate
Content-Type: application/json

{ "question": "What if Supplier X is delayed 2 weeks?" }
```

Response:

```json
{ "answer": "..." }
```

Implemented in `src/components/dashboard/AskTheTwin.tsx`.

**CORS:** the backend must allow the frontend's origin (`http://localhost:*` in dev, the Netlify domain in production). Currently configured to reflect and allow any origin (`origin: true` with `credentials: true`) for ease of testing — tighten this to a strict allowlist before going to production.

## Project structure

```
src/
├── components/     # UI components (dashboard cards, chat, etc.)
├── hooks/          # Custom React hooks
├── lib/            # API client, utilities, types
├── routes/         # TanStack Router file-based routes
├── router.tsx       # Router setup
├── server.ts        # SSR entry (Nitro server)
├── start.ts          # TanStack Start entry
└── styles.css
```

## Deployment

The frontend is deployed to Netlify. If the repo is connected to Netlify via Git, pushing to the main branch triggers an automatic rebuild — no manual `bun run build` is needed for deployment.

The backend is deployed separately on Render at `https://aiyooo-simulo.onrender.com`.

## License

Private — internal project.
