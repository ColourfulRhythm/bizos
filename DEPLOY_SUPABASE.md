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

## Step 4: Set Function Timeouts (Important!)

In Supabase Dashboard → Edge Functions → Settings, set:

- **generate-document**: 300 seconds (for long document generation)
- **generate-plan**: 60 seconds (quick planning)
- **send-email**: 30 seconds
- **verify-payment**: 30 seconds
- **health**: 10 seconds

Or deploy with timeout flags:

```bash
supabase functions deploy generate-document --no-verify-jwt --timeout 300
supabase functions deploy generate-plan --no-verify-jwt --timeout 60
supabase functions deploy send-email --no-verify-jwt --timeout 30
supabase functions deploy verify-payment --no-verify-jwt --timeout 30
supabase functions deploy health --no-verify-jwt --timeout 10
```

## Step 5: Deploy Functions

Once logged in and linked, deploy all functions:

```bash
npm run supabase:deploy
```

Or deploy individually with timeouts:

```bash
supabase functions deploy health --no-verify-jwt --timeout 10
supabase functions deploy generate-plan --no-verify-jwt --timeout 60
supabase functions deploy generate-document --no-verify-jwt --timeout 300
supabase functions deploy send-email --no-verify-jwt --timeout 30
supabase functions deploy verify-payment --no-verify-jwt --timeout 30
```

## Step 6: Verify Deployment

Test the health endpoint:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eWdwcW5ia294ZmR3dHZzdWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDM2NzEsImV4cCI6MjA4NzExOTY3MX0.NwAVoCoegtF_RCU2kMmBkNU9bmjMTBeqeanh4utapQk" \
  https://nxygpqnbkoxfdwtvsufw.supabase.co/functions/v1/health
```

Should return: `{"status":"ok","message":"BizOS Backend is running on Supabase Edge Functions",...}`

## Troubleshooting

### Config Error Fixed ✅
The `config.toml` error has been fixed. The `max_duration` is now set per function via CLI flags or Dashboard settings.

### If login fails:
- Make sure you have a Supabase account
- Try: `supabase login --token YOUR_ACCESS_TOKEN`
- Get token from: https://supabase.com/dashboard/account/tokens

### If link fails:
- Make sure project ref is correct: `nxygpqnbkoxfdwtvsufw`
- Check you have access to the project
- The config.toml error should be fixed now

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

# Deploy with timeouts
supabase functions deploy generate-document --no-verify-jwt --timeout 300
supabase functions deploy generate-plan --no-verify-jwt --timeout 60
supabase functions deploy send-email --no-verify-jwt --timeout 30
supabase functions deploy verify-payment --no-verify-jwt --timeout 30
supabase functions deploy health --no-verify-jwt --timeout 10

# Test locally (optional)
supabase functions serve
```
