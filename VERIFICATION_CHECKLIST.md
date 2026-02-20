# Supabase Deployment Verification Checklist

## ✅ Step 1: Functions Deployed
- [ ] Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/functions
- [ ] Verify you see these 5 functions:
  - `health`
  - `generate-plan`
  - `generate-document`
  - `send-email`
  - `verify-payment`

## ✅ Step 2: Secrets Configured
- [ ] Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/settings/functions
- [ ] Click **"Secrets"** tab
- [ ] Verify these secrets are set:
  - [ ] `ANTHROPIC_API_KEY` = `sk-ant-api03-...`
  - [ ] `CLAUDE_MODEL` = `claude-sonnet-4-20250514`
  - [ ] `PAYSTACK_SECRET_KEY` = `sk_test_...` or `sk_live_...`
  - [ ] `PAYSTACK_PUBLIC_KEY` = `pk_test_...` or `pk_live_...`
  - [ ] `RESEND_API_KEY` = `re_...` (optional, for email)

## ✅ Step 3: Timeouts Set (CRITICAL!)
- [ ] Go to: https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/functions
- [ ] For each function, click it → **Settings** → **Timeout**:
  - [ ] `generate-document`: **300 seconds** (5 minutes) ⚠️ **MOST IMPORTANT!**
  - [ ] `generate-plan`: **60 seconds**
  - [ ] `send-email`: **30 seconds**
  - [ ] `verify-payment`: **30 seconds**
  - [ ] `health`: **10 seconds**

## ✅ Step 4: Test Health Endpoint
Run this in your terminal:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eWdwcW5ia294ZmR3dHZzdWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDM2NzEsImV4cCI6MjA4NzExOTY3MX0.NwAVoCoegtF_RCU2kMmBkNU9bmjMTBeqeanh4utapQk" \
  https://nxygpqnbkoxfdwtvsufw.supabase.co/functions/v1/health
```

**Expected response:** `{"status":"ok"}`

If you get an error, check:
- Function is deployed
- Secrets are set
- Timeout is set

## ✅ Step 5: Frontend Configuration
- [x] Frontend is already configured for Supabase (`BACKEND_TYPE: 'supabase'`)
- [x] Supabase URL is set: `https://nxygpqnbkoxfdwtvsufw.supabase.co/functions/v1`
- [x] Anon key is configured

## ✅ Step 6: Deploy Frontend to Vercel
After all Supabase functions are working:

```bash
git add -A
git commit -m "Ready for production - Supabase backend configured"
git push
```

Vercel will auto-deploy. Your frontend at `https://bizos.adparlay.com` will use Supabase functions.

## 🧪 Step 7: Full Test
1. Go to: https://bizos.adparlay.com
2. Fill out the form
3. Complete payment
4. Watch the generation process
5. Verify documents are generated (should take ~5-10 minutes for all 24 documents)

## 🐛 Troubleshooting

### "Function not found" or 404
- Check function name matches exactly (case-sensitive)
- Verify function is deployed in Dashboard

### "Timeout" errors
- **Most common issue!** Make sure `generate-document` timeout is **300 seconds**
- Check Dashboard → Functions → generate-document → Settings → Timeout

### "Missing environment variable" or API errors
- Check Secrets are set correctly
- Verify secret names match exactly (case-sensitive)
- Check API keys are valid

### CORS errors
- Supabase Edge Functions handle CORS automatically
- If you see CORS errors, check the function code has proper CORS headers

## 📝 Quick Reference URLs

- **Functions Dashboard:** https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/functions
- **Secrets:** https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/settings/functions
- **Health Test:** `https://nxygpqnbkoxfdwtvsufw.supabase.co/functions/v1/health`
- **Frontend:** https://bizos.adparlay.com

