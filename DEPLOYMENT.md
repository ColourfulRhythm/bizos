# Deploy BizOS Next.js App on Vercel

**Why pushes weren’t showing:** Vercel was deploying the repo root and serving the old `index.html`, not the Next.js app in `bizos-next`.

**Fix:** Point Vercel at the Next.js app so it becomes the main frontend.

## Steps

1. Open your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the BizOS project
3. Go to **Settings** → **General**
4. Find **Root Directory**
5. Set it to **`bizos-next`**
6. Click **Save**
7. Go to **Deployments** and **Redeploy** the latest deployment (or push a new commit)

## Environment Variables

Ensure these are set in the project’s Vercel environment variables:

- `ANTHROPIC_API_KEY` – Claude API key
- `PAYSTACK_SECRET_KEY` – Paystack secret key
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` – Paystack public key (optional override)
- `RESEND_API_KEY` – For email delivery (optional)

## What This Does

- Next.js app in `bizos-next` becomes the main site (chat, payment, document generation)
- API routes run as Next.js API routes at `/api/*`
- Changes to `bizos-next` will now be reflected after deploy
