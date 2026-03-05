# BizOS Conversational App

React + TypeScript + Tailwind app with GLSL hills background and conversational onboarding.

## Setup

```bash
cd app
npm install
```

## Run locally

1. Start the backend (from project root):
   ```bash
   npm run start
   ```
2. Start the React app:
   ```bash
   cd app && npm run dev
   ```
3. Open http://localhost:5173

## Environment

- `VITE_API_BASE` — API base URL (default: `http://localhost:3001` locally, `window.location.origin` in prod)
- `VITE_PAYSTACK_PUBLIC_KEY` — Paystack public key (optional, falls back to hardcoded live key)

## Components

- **GLSL Hills** — `src/components/ui/glsl-hills.tsx` — Animated 3D hills background (Three.js)
- **App** — Main conversational flow: chat → plan selection → payment → generation → download

## shadcn / components/ui

The default path for UI components is `src/components/ui/`. This matches shadcn conventions. To add more shadcn components:

```bash
npx shadcn@latest add button
```
