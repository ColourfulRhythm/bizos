# BizOS Next.js

Next.js + shadcn + framer-motion version of BizOS with the MessageDock menu.

## Run

```bash
cd bizos-next
npm install
npm run dev
```

Open http://localhost:3000

## Structure

- **MessageDock** — `src/components/ui/message-dock.tsx` — Bottom nav with Home, Pricing, Breakdown, Info, Contact (hover for description, click to navigate)
- **Pages** — `/` (home), `/pricing`, `/breakdown`, `/info`, `/contact`
- **shadcn** — `components.json` configured; add components with `npx shadcn@latest add button`

## Full chat + payment flow

For the full conversational flow with chat API, Paystack payment, and document generation, use the Vite app in `/app` which connects to the backend.
