# Supabase Migration Guide

## Why Supabase?

- ✅ **300-second timeout** (vs Vercel's 60s) - No more timeout errors
- ✅ **Better rate limit handling** - Sequential processing built-in
- ✅ **No cold starts** - Faster response times
- ✅ **Better error handling** - More detailed logs
- ✅ **Free tier available** - 500K invocations/month

## Setup Steps

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

Or with Homebrew:
```bash
brew install supabase/tap/supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Or create a new project:
```bash
supabase projects create bizos
```

### 4. Set Environment Variables

In Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-20250514
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
RESEND_API_KEY=re_...
```

### 5. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy generate-plan
supabase functions deploy generate-document
supabase functions deploy send-email
supabase functions deploy verify-payment
supabase functions deploy health
```

### 6. Get Your Supabase URL

After deployment, your functions will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/
```

Example:
- `https://abcdefghijklmnop.supabase.co/functions/v1/generate-plan`
- `https://abcdefghijklmnop.supabase.co/functions/v1/generate-document`
- `https://abcdefghijklmnop.supabase.co/functions/v1/send-email`
- `https://abcdefghijklmnop.supabase.co/functions/v1/verify-payment`
- `https://abcdefghijklmnop.supabase.co/functions/v1/health`

### 7. Update Frontend

Update `index.html` (and `BizOS_MVP.html`) to use Supabase URLs:

```javascript
const CONFIG = {
  // Replace with your Supabase project URL
  BACKEND_URL: 'https://YOUR_PROJECT_REF.supabase.co/functions/v1',
  
  // Or keep auto-detection for local dev
  BACKEND_URL: (() => {
    const isLocal = window.location.hostname === 'localhost';
    return isLocal 
      ? 'http://localhost:3001'  // Local dev
      : 'https://YOUR_PROJECT_REF.supabase.co/functions/v1';  // Supabase
  })(),
  
  PAYSTACK_PUBLIC_KEY: 'pk_test_...',
  PRICE_KOBO: 500000,
  PRICE_DISPLAY: '₦5,000'
};
```

Update API calls to include Supabase auth header:

```javascript
async function apiCall(endpoint, body) {
  const url = `${CONFIG.BACKEND_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}` // Get from Supabase dashboard
    },
    body: JSON.stringify(body)
  });
  
  // ... rest of function
}
```

### 8. Get Supabase Anon Key

1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy the `anon` public key
4. Add to frontend CONFIG:

```javascript
const CONFIG = {
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  // ... rest
};
```

## Testing

### Test Health Endpoint

```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/health
```

### Test Generate Plan

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-plan \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "businessData": {
      "name": "Test Business",
      "industry": "Technology",
      "description": "Test"
    }
  }'
```

## Local Development

### Run Functions Locally

```bash
supabase functions serve
```

Functions will be available at:
- `http://localhost:54321/functions/v1/generate-plan`
- `http://localhost:54321/functions/v1/generate-document`
- etc.

### Update Frontend for Local Dev

```javascript
const CONFIG = {
  BACKEND_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:54321/functions/v1'
    : 'https://YOUR_PROJECT_REF.supabase.co/functions/v1',
  // ...
};
```

## Migration Checklist

- [ ] Install Supabase CLI
- [ ] Create/link Supabase project
- [ ] Set environment variables in Supabase dashboard
- [ ] Deploy all Edge Functions
- [ ] Get Supabase project URL and anon key
- [ ] Update frontend CONFIG with Supabase URLs
- [ ] Update API calls to include Authorization header
- [ ] Test all endpoints
- [ ] Update Paystack webhook URL (if needed)
- [ ] Deploy updated frontend to Vercel
- [ ] Test end-to-end flow

## Benefits After Migration

1. **No More Timeouts**: 300s timeout vs 60s
2. **Better Performance**: No cold starts
3. **Sequential Processing**: Built-in rate limit handling
4. **Better Logs**: Detailed function logs in Supabase dashboard
5. **Scalability**: Handles more concurrent requests

## Rollback Plan

If you need to rollback to Vercel:
1. Keep Vercel functions in `/api` folder
2. Update frontend CONFIG to point back to Vercel
3. Redeploy frontend

Both can coexist - just change the BACKEND_URL in frontend.

