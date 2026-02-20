// Supabase Edge Function: Health Check
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  return new Response(
    JSON.stringify({
      status: "ok",
      message: "BizOS Backend is running on Supabase Edge Functions",
      timestamp: new Date().toISOString(),
      platform: "supabase",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

