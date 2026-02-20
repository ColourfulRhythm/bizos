# Manual Deployment Instructions

## Option 1: Login in Your Terminal (Easiest)

1. **Open your terminal** (not in Cursor)
2. **Run:**
   ```bash
   cd /Users/mac/bizos
   supabase login
   ```
3. **Browser will open** - authenticate with Supabase
4. **Then deploy:**
   ```bash
   ./deploy-supabase.sh
   ```

## Option 2: Use Access Token

1. **Get your access token:**
   - Go to: https://supabase.com/dashboard/account/tokens
   - Click **"Generate new token"**
   - Copy the token

2. **Set it as environment variable:**
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_token_here
   ```

3. **Deploy:**
   ```bash
   ./deploy-supabase.sh
   ```

## Option 3: Deploy via Supabase Dashboard (No CLI needed!)

You can also deploy functions directly from the Dashboard:

1. **Go to:** https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/functions
2. **Click "Create a new function"**
3. **For each function:**
   - Name: `health` (or `generate-plan`, `generate-document`, etc.)
   - Copy the code from `supabase/functions/[function-name]/index.ts`
   - Paste into the editor
   - Click "Deploy"

But this is tedious for 5 functions, so CLI is better!

## After Deployment

1. **Set Secrets:**
   - Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/settings/functions
   - Click "Secrets" tab
   - Add: `ANTHROPIC_API_KEY`, `CLAUDE_MODEL`, `PAYSTACK_SECRET_KEY`, etc.

2. **Set Timeouts:**
   - Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/functions
   - Click each function → Settings → Timeout
   - Set `generate-document` to **300 seconds** (critical!)

3. **Test:**
   ```bash
   curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eWdwcW5ia294ZmR3dHZzdWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDM2NzEsImV4cCI6MjA4NzExOTY3MX0.NwAVoCoegtF_RCU2kMmBkNU9bmjMTBeqeanh4utapQk" \
     https://nxygpqnbkoxfdwtvsufw.supabase.co/functions/v1/health
   ```

