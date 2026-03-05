# Store Business Data in Supabase

Business data is now saved to Supabase when users complete the chat and reach the plan selection step.

## 1. Create the table

In [Supabase SQL Editor](https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/sql/new), run:

```sql
CREATE TABLE IF NOT EXISTS public.business_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT,
  industry TEXT,
  description TEXT,
  country TEXT,
  city TEXT,
  opportunity TEXT,
  team TEXT,
  competitors TEXT,
  target_market TEXT,
  timeline TEXT,
  marketing TEXT,
  financials TEXT,
  funding TEXT,
  email TEXT,
  products TEXT,
  raw_data JSONB
);

ALTER TABLE public.business_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow inserts" ON public.business_submissions
  FOR INSERT WITH CHECK (true);
```

Or from CLI: `supabase db push` (if linked).

## 2. Add env vars

In **Vercel** (or `.env.local` for dev):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nxygpqnbkoxfdwtvsufw.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase → Settings → API → `service_role` |

**Project URL** (not functions URL): `https://nxygpqnbkoxfdwtvsufw.supabase.co`  
Get the service role key: [Supabase API Settings](https://supabase.com/dashboard/project/nxygpqnbkoxfdwtvsufw/settings/api)

## 3. When it saves

Data is written when the user reaches the plan selection screen (chat has collected name, industry, description, etc.).

## 4. View stored data

Supabase Dashboard → Table Editor → `business_submissions`
