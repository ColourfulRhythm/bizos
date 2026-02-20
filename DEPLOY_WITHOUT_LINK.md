# Deploy Supabase Functions Without Linking

You can deploy Edge Functions **without linking** the project (which requires database access).

## Option 1: Deploy Directly (Recommended)

Deploy functions directly using your project ref:

```bash
# Deploy each function with project ref
# NOTE: Timeouts must be set in Supabase Dashboard (see below)

supabase functions deploy generate-document \
  --project-ref nxygpqnbkoxfdwtvsufw \
  --no-verify-jwt

supabase functions deploy generate-plan \
  --project-ref nxygpqnbkoxfdwtvsufw \
  --no-verify-jwt

supabase functions deploy send-email \
  --project-ref nxygpqnbkoxfdwtvsufw \
  --no-verify-jwt

supabase functions deploy verify-payment \
  --project-ref nxygpqnbkoxfdwtvsufw \
  --no-verify-jwt

supabase functions deploy health \
  --project-ref nxygpqnbkoxfdwtvsufw \
  --no-verify-jwt
```

## Option 2: Get Database Password (If You Want to Link)

If you want to link the project, get your database password:

1. Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/settings/database
2. Look for **"Database password"** section
3. Click **"Reset database password"** if you don't know it
4. Copy the password
5. Run: `supabase link --project-ref nxygpqnbkoxfdwtvsufw`
6. Enter the password when prompted

## Option 3: Use Access Token (No Password Needed)

Set your access token as an environment variable:

```bash
# Get your access token from:
# https://supabase.com/dashboard/account/tokens

export SUPABASE_ACCESS_TOKEN=your_access_token_here

# Then deploy directly
supabase functions deploy generate-document \
  --project-ref nxygpqnbkoxfdwtvsufw \
  --no-verify-jwt
```

## Quick Deploy Script

Create a file `deploy-supabase.sh`:

```bash
#!/bin/bash

PROJECT_REF="nxygpqnbkoxfdwtvsufw"

echo "Deploying Supabase functions..."

supabase functions deploy health \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

supabase functions deploy generate-plan \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

supabase functions deploy generate-document \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

supabase functions deploy send-email \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

supabase functions deploy verify-payment \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

echo "✅ All functions deployed!"
```

Make it executable and run:
```bash
chmod +x deploy-supabase.sh
./deploy-supabase.sh
```

## Important: Set Secrets and Timeouts!

### 1. Set Secrets First

Before deploying, make sure you've set all secrets in Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/settings/functions
2. Click **"Secrets"** tab
3. Add:
   - `ANTHROPIC_API_KEY`
   - `CLAUDE_MODEL=claude-sonnet-4-20250514`
   - `PAYSTACK_SECRET_KEY`
   - `PAYSTACK_PUBLIC_KEY`
   - `RESEND_API_KEY`

### 2. Set Timeouts After Deployment

**The CLI doesn't support `--timeout` flag.** You must set timeouts in the Dashboard:

1. Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/functions
2. Click each function → **Settings** → **Timeout**
3. Set these values:
   - **generate-document**: `300` seconds (5 minutes) - **CRITICAL!**
   - **generate-plan**: `60` seconds
   - **send-email**: `30` seconds
   - **verify-payment**: `30` seconds
   - **health**: `10` seconds

## Test After Deployment

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eWdwcW5ia294ZmR3dHZzdWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDM2NzEsImV4cCI6MjA4NzExOTY3MX0.NwAVoCoegtF_RCU2kMmBkNU9bmjMTBeqeanh4utapQk" \
  https://nxygpqnbkoxfdwtvsufw.supabase.co/functions/v1/health
```

