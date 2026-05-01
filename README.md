# EA Toolkit

An AI-assisted toolkit for executive assistants — currently a Vite + React scaffold with a Word-document parser wired in via [mammoth.js](https://github.com/mwilliamson/mammoth.js).

**Status:** in active development. Not currently deployed.

## Why I built this

A lot of the executive-assistant workflow is reading and reformatting documents — meeting notes, briefs, contact sheets — to make them useful in a hurry. I wanted to start a tool that takes that drudgery out of the way: ingest a `.docx`, surface the structure, and let an AI step help draft the next thing (a summary, an email, a task list).

This repo is the foundation for that idea — the ingest path is in place, the React shell renders, and the AI layer is the next piece.

## What's in this repo

- `src/EA_Toolkit.jsx` — the main React component (the toolkit's UI and logic)
- `src/main.jsx` — the React entry point
- `index.html` — the Vite dev shell
- `vite.config.js`, `package.json` — build configuration
- `.github/workflows/` — a GitHub Actions workflow scaffolded for Pages deployment (not yet successfully running)

## Tech

- Vite 6
- React 18
- mammoth.js — `.docx` → HTML/text extraction

## How to run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

---

*Part of my AI Operations portfolio — github.com/lisaesterhuizen0-wq*
