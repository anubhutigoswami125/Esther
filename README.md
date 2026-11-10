# Esther

**A private personal knowledge workspace for collecting, organizing, and prioritizing what matters.**

Esther is being built as a calm, structured alternative to scattered notes, saved posts, browser tabs, and endless AI chat histories.

## v0.1 — Knowledge library

The first milestone focuses on reliable capture and organization:

- Capture text, notes, links, ideas, study material, opportunities, courses, conferences, and research references.
- Categorize items across Academics, Research, Projects, Career, Conferences, Skills, and Personal.
- Assign an item type, status, and a manually assessed priority.
- Record estimated time commitment and financial cost.
- Search the library and filter by collection.
- Edit notes and metadata, save items, archive them, or delete them.
- Persist entries in browser local storage.

### Important v0.1 limitation

Data currently stays in the browser and device where it was entered. It is not yet synchronized across devices and there is no server-side account or backup. Do not treat this version as the only copy of important documents or research notes. Export, sync, and backup are planned before broader use.

## Roadmap

| Version | Focus |
|---|---|
| v0.1 | Capture inbox, categorized library, notes, search, manual priorities |
| v0.2 | AI-assisted extraction, summaries, suggested categories and tags |
| v0.3 | Knowledge graph and visual mind maps |
| v0.4 | Opportunity evaluation with evidence, time, cost, and fit |
| v0.5 | Weekly review, adaptive priorities, and knowledge quizzes |
| v1.0 | Secure accounts, persistent database, file uploads, integrations, and export |

## Tech stack

- React + Vite
- Express API
- Gemini integration scaffold for future AI features
- Browser local storage for v0.1 entries

## Run locally

You'll need Node.js 18+ and npm.

1. Copy `.env.example` to `.env`.
2. Add your Gemini API key to `GEMINI_API_KEY` only if you are testing the AI endpoint.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL shown by Vite.

## Privacy and security

- Never commit `.env` or publish API keys.
- The v0.1 library uses browser local storage; anyone with access to the same browser profile may be able to access its contents.
- Do not upload sensitive personal or confidential research information until secure authentication, server-side storage, and backup controls are implemented.
- AI-assisted processing must clearly distinguish extracted source facts from model-generated interpretations.

## Product principle

**Collect first. Make sense of it next.**

Esther should reduce decision fatigue, not create another stream of tasks. Recommendations should explain their reasoning, disclose uncertainty, and never confuse saved information with verified knowledge.
