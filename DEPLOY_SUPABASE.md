# Deploy Supabase Functions - Step by Step

## Step 1: Login to Supabase

Run this in your terminal (it will open a browser for authentication):

```bash
supabase login
```

This will:
1. Open your browser
2. Ask you to authorize the CLI
3. Save your access token locally

## Step 2: Link Your Project

After logging in, link your project:

```bash
supabase link --project-ref nxygpqnbkoxfdwtvsufw
```

This connects your local code to your Supabase project.

## Step 3: Set Environment Variables

**Important:** Set these in Supabase Dashboard before deploying!

1. Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/settings/functions
2. Click **"Secrets"** tab
3. Add these secrets:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-20250514
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
RESEND_API_KEY=re_...
```

## Step 4: Deploy Functions

Once logged in and linked, deploy all functions:

```bash
npm run supabase:deploy
```

Or deploy individually:

```bash
npm run supabase:deploy:health
npm run supabase:deploy:plan
npm run supabase:deploy:doc
npm run supabase:deploy:email
npm run supabase:deploy:payment
```

## Step 5: Verify Deployment

Test the health endpoint:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eWdwcW5ia294ZmR3dHZzdWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDM2NzEsImV4cCI6MjA4NzExOTY3MX0.NwAVoCoegtF_RCU2kMmBkNU9bmjMTBeqeanh4utapQk" \
  https://nxygpqnbkoxfdwtvsufw.supabase.co/functions/v1/health
```

Should return: `{"status":"ok","message":"BizOS Backend is running on Supabase Edge Functions",...}`

## Troubleshooting

### If login fails:
- Make sure you have a Supabase account
- Try: `supabase login --token YOUR_ACCESS_TOKEN`
- Get token from: https://supabase.com/dashboard/account/tokens

### If link fails:
- Make sure project ref is correct: `nxygpqnbkoxfdwtvsufw`
- Check you have access to the project

### If deploy fails:
- Make sure all secrets are set in Dashboard
- Check function code for syntax errors
- Run with `--debug` flag: `supabase functions deploy health --debug`

## Quick Command Reference

```bash
# Login
supabase login

# Link project
supabase link --project-ref nxygpqnbkoxfdwtvsufw

# Deploy all
npm run supabase:deploy

# Deploy one
supabase functions deploy generate-plan

# Test locally (optional)
supabase functions serve
```

