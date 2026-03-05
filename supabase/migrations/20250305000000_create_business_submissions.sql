-- Store business data collected during chat
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

-- RLS: service_role bypasses; anon can insert (if needed from client)
ALTER TABLE public.business_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow inserts" ON public.business_submissions
  FOR INSERT WITH CHECK (true);
