# Step-by-Step Supabase Deployment

## Step 1: Login to Supabase

Run this command in your terminal:

```bash
supabase login
```

This will open your browser to authenticate. After logging in, you'll get an access token.

## Step 2: Deploy Functions

After logging in, run:

```bash
./deploy-supabase.sh
```

Or deploy individually:

```bash
supabase functions deploy health --project-ref nxygpqnbkoxfdwtvsufw --no-verify-jwt
supabase functions deploy generate-plan --project-ref nxygpqnbkoxfdwtvsufw --no-verify-jwt
supabase functions deploy generate-document --project-ref nxygpqnbkoxfdwtvsufw --no-verify-jwt
supabase functions deploy send-email --project-ref nxygpqnbkoxfdwtvsufw --no-verify-jwt
supabase functions deploy verify-payment --project-ref nxygpqnbkoxfdwtvsufw --no-verify-jwt
```

## Step 3: Find Your Functions in Dashboard

**IMPORTANT:** Edge Functions are NOT in the database schema. They're in a separate section:

1. Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/functions
   - **NOT** `/settings/database` (that's for database functions)
   - **NOT** `/sql` (that's for SQL queries)
   - **YES** `/functions` (this is where Edge Functions are)

2. You should see:
   - `health`
   - `generate-plan`
   - `generate-document`
   - `send-email`
   - `verify-payment`

## Step 4: Set Secrets

1. Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/settings/functions
2. Click **"Secrets"** tab
3. Add these secrets:
   - `ANTHROPIC_API_KEY` = `sk-ant-api03-...`
   - `CLAUDE_MODEL` = `claude-sonnet-4-20250514`
   - `PAYSTACK_SECRET_KEY` = `sk_test_...`
   - `PAYSTACK_PUBLIC_KEY` = `pk_test_...`
   - `RESEND_API_KEY` = `re_...` (optional)

## Step 5: Set Timeouts

1. Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/functions
2. Click each function → **Settings** → **Timeout**
3. Set:
   - **generate-document**: `300` seconds (5 minutes) - **CRITICAL!**
   - **generate-plan**: `60` seconds
   - **send-email**: `30` seconds
   - **verify-payment**: `30` seconds
   - **health**: `10` seconds

## Step 6: Test

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eWdwcW5ia294ZmR3dHZzdWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDM2NzEsImV4cCI6MjA4NzExOTY3MX0.NwAVoCoegtF_RCU2kMmBkNU9bmjMTBeqeanh4utapQk" \
  https://nxygpqnbkoxfdwtvsufw.supabase.co/functions/v1/health
```

Should return: `{"status":"ok"}`

## Troubleshooting

### "No functions found in schema 'public'"
- **You're looking in the wrong place!** 
- Edge Functions are NOT database functions
- Go to: `/functions` (not `/sql` or `/settings/database`)

### "Access token not provided"
- Run: `supabase login`
- This will authenticate you and store the token

### Functions not showing up
- Make sure you deployed them: `./deploy-supabase.sh`
- Check the correct project: `nxygpqnbkoxfdwtvsufw`
- Refresh the dashboard page

