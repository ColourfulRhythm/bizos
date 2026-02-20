# Quick Start: Supabase Migration

## 🚀 5-Minute Setup

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
# OR
brew install supabase/tap/supabase
```

### Step 2: Login
```bash
npm run supabase:login
```

### Step 3: Create/Link Project
```bash
# Create new project
supabase projects create bizos

# OR link existing
npm run supabase:link
```

### Step 4: Set Secrets (Environment Variables)

Go to: **Supabase Dashboard → Project Settings → Edge Functions → Secrets**

Add these:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-20250514
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
RESEND_API_KEY=re_...
```

### Step 5: Deploy Functions
```bash
npm run supabase:deploy
```

### Step 6: Get Your URLs

After deployment, note your:
- **Project URL**: `https://YOUR_PROJECT_REF.supabase.co`
- **Anon Key**: Dashboard → Settings → API → `anon` public key

### Step 7: Update Frontend

Edit `index.html` (line ~981):

```javascript
const CONFIG = {
  BACKEND_TYPE: 'supabase',  // ✅ Changed from 'vercel'
  SUPABASE_URL: 'https://YOUR_PROJECT_REF.supabase.co/functions/v1',  // ✅ Your project URL
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // ✅ Your anon key
  // ... rest stays the same
};
```

### Step 8: Test

```bash
# Test health endpoint
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/health
```

Should return: `{"status":"ok","message":"BizOS Backend is running on Supabase Edge Functions",...}`

### Step 9: Deploy Frontend

```bash
npm run vercel:prod
```

## ✅ Done!

Your app now uses Supabase with:
- ✅ **300-second timeout** (no more timeouts!)
- ✅ **Better performance** (no cold starts)
- ✅ **Sequential processing** (no rate limit issues)

## 🔄 Switch Back to Vercel

Just change one line in `index.html`:
```javascript
BACKEND_TYPE: 'vercel',  // Change back to 'vercel'
```

Both backends can coexist - just toggle the type!

