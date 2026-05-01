# EA Toolkit

Small AI tools for executive assistants. Static frontend, Cloudflare Workers proxy, no build step.

**Live:** https://lisaesterhuizen0-wq.github.io/ea-toolkit/

## Status

| # | Tool | Status |
|---|------|--------|
| 01 | Meeting Brief Generator | **Live** |
| 02 | EOD Summary Generator | Coming soon |
| 03 | Email Triage Helper | Coming soon |
| 04 | Calendar Conflict Negotiator | Coming soon |

## Why

Most executive-assistant prep work is the same shape every time: take some context, distil signal, hand the exec something useful in 10 minutes. The four tools here each take a flavour of that work and give it a tight UI plus a well-tuned prompt.

## What's in this repo

```
index.html              # 4-tab toolkit page; only Tool 1 active
style.css               # design system (cream paper / jade / jasper)
app.js                  # vanilla JS — submit, fetch, Markdown render
prompts/
├── meeting-brief.md    # Tool 1's prompt template (canonical reference)
└── legacy/             # 5 prompts from the v1 React build, kept as a library
worker/
├── wrangler.toml       # Cloudflare Worker config
└── src/index.js        # the proxy — POST /generate → Anthropic API
```

The previous Vite + React build is preserved on the [`archive/v1-react`](https://github.com/lisaesterhuizen0-wq/ea-toolkit/tree/archive/v1-react) branch.

## How it works

```
[ Browser ]                   [ Cloudflare Worker ]              [ Anthropic API ]
   GitHub Pages                  ea-toolkit-proxy                  api.anthropic.com
        │                              │                                  │
        │  POST /generate { prompt }   │                                  │
        │ ───────────────────────────▶ │                                  │
        │                              │  POST /v1/messages               │
        │                              │  + ANTHROPIC_API_KEY (secret)    │
        │                              │ ───────────────────────────────▶ │
        │                              │                                  │
        │                              │  ◀───────────── { text, ... }    │
        │  ◀───────── { text }         │                                  │
        │                              │                                  │
        ▼                              ▼                                  ▼
  Renders Markdown              CORS-locked to Pages origin     Sees the prompt
  inline (no deps)              Holds the API key                Doesn't see the user
```

The Worker is the only place the Anthropic API key lives. It is set as a Wrangler secret (encrypted, not visible after upload), CORS-locked to a single origin, and stateless — no database, no logs of user input.

## Privacy

Inputs you paste are sent once to Anthropic to generate the brief, then dropped. The Worker keeps no logs of prompt content. The frontend stores nothing in `localStorage` or `sessionStorage`.

## Run your own copy

You'll need: a GitHub account, a Cloudflare account (free tier is fine), an Anthropic API key, and Node.js for `wrangler`.

**1. Fork and enable Pages**

Fork this repo, then in your fork: **Settings → Pages → Source: Deploy from a branch → `main` / `/`**. Your fork will serve at `https://<your-username>.github.io/ea-toolkit/`.

**2. Deploy the Worker**

```bash
cd worker
npm install -g wrangler   # one-time
wrangler login            # opens a browser
wrangler deploy           # prints your Worker URL
wrangler secret put ANTHROPIC_API_KEY   # paste your key when prompted
```

**3. Lock the Worker to your origin**

In `worker/src/index.js`, change `ALLOWED_ORIGIN` from `https://lisaesterhuizen0-wq.github.io` to your own Pages origin (e.g. `https://<your-username>.github.io`), then `wrangler deploy` again.

**4. Wire the frontend to your Worker**

In `app.js`, replace the placeholder `WORKER_URL` with the URL Wrangler printed (e.g. `https://ea-toolkit-proxy.<your-handle>.workers.dev`). Commit and push — GitHub Pages will rebuild in ~30 seconds.

**5. Get an Anthropic API key**

Sign up at [console.anthropic.com](https://console.anthropic.com). Add a small amount of credit to enable API calls. Brief generation costs roughly $0.01–0.03 per call on Sonnet 4.6 — well under a cent of cost for a typical brief.

## Stack

- HTML, CSS, vanilla JavaScript — no React, no Vite, no build step
- Cloudflare Workers for the API proxy (free tier handles ~100k requests/day)
- GitHub Pages for hosting (free)
- Anthropic Claude Sonnet 4.6 via `/v1/messages`

## Roadmap

Tools 2–4 reuse the same design system, Worker, and deploy pipeline. Each adds one more tab to the front page.

- **EOD Summary Generator** — paste a day of emails / Slack / calendar; get a tight end-of-day note for the exec
- **Email Triage Helper** — classify and draft replies for an inbox dump
- **Calendar Conflict Negotiator** — generate a tactful reschedule message given an attendee list and a constraint

## Built by

[Lisa Myburgh](https://github.com/lisaesterhuizen0-wq) — AI Operations specialist. Part of a personal portfolio aimed at international remote AI Operations roles.
