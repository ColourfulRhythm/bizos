# How to Get Your Supabase Anon Key

## Quick Steps

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `nxygpqnbkoxfdwtvsufw`

2. **Navigate to API Settings**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **API** in the settings menu

3. **Copy the Anon Key**
   - Look for **"Project API keys"** section
   - Find the **`anon` public** key
   - Click the **copy icon** or select and copy

4. **Add to Frontend**
   - Open `index.html`
   - Find line ~988: `SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY'`
   - Replace `YOUR_SUPABASE_ANON_KEY` with your copied key
   - Save the file

## Example

Your anon key will look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eWdxcG5ia294ZmR3dHZzdWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg...
```

## Security Note

The `anon` key is safe to use in frontend code - it's designed for client-side use. It has limited permissions and is restricted by Row Level Security (RLS) policies.

## After Adding the Key

1. Save `index.html`
2. Copy to `BizOS_MVP.html`: `cp index.html BizOS_MVP.html`
3. Deploy: `npm run vercel:prod`
4. Test your endpoints!

