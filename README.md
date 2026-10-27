# Esther

**A personal AI workspace for thinking, learning, writing, and building.**

Esther is an early-stage personal assistant project. The first milestone is a polished chat workspace connected to a real AI model, with a secure server-side API layer.

## Current status

- [x] Repository and initial app scaffold
- [x] Responsive chat workspace interface
- [x] Server-side chat endpoint
- [ ] Connect a private Gemini API key
- [ ] Run and test locally in a browser-based development environment
- [ ] Save conversations
- [ ] Add opt-in persistent memory
- [ ] Add project workspace and integrations

## Tech stack

- React + Vite for the browser interface
- Express for the server-side chat endpoint
- Gemini API for model responses
- Environment variables for private credentials

## Run in a development environment

You'll need Node.js 18+ and npm.

1. Copy `.env.example` to a new file named `.env`.
2. Add your Gemini API key to `GEMINI_API_KEY` in `.env`.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.
5. Open the local URL shown by Vite. The server runs on port 3001 and the Vite development server proxies `/api` requests to it.

You can create a Gemini API key through Google AI Studio. Review the provider's current usage limits and terms before relying on the free tier.

## Security notes

- Never commit `.env` or publish API keys.
- The browser calls Esther's own `/api/chat` endpoint; the private provider key is only read by the server.
- Do not deploy the server with a real key until the host's environment-variable settings are configured.

## Project structure

```
Esther/
├── index.html
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── server/
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── vite.config.js
```

## Build philosophy

Build in small, testable steps. Keep the interface independent of the AI provider, protect user data, and make it possible to understand and maintain the code rather than treating generated code as a black box.
