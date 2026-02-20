// Supabase Edge Function: Generate Document Plan
// Deno runtime with 300s timeout support
// max_duration: 60 (set in Supabase Dashboard or via CLI flag)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { businessData } = await req.json();

    if (!businessData) {
      return new Response(
        JSON.stringify({ error: "Business data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey || apiKey.includes("YOUR_ANTHROPIC")) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("=== GENERATE PLAN API CALLED ===");

    const prompt = `You are a business systems consultant. Generate a document structure for this business.

BUSINESS: ${businessData.name}
INDUSTRY: ${businessData.industry}
DESCRIPTION: ${businessData.description}
PAYMENT MODEL: ${businessData.paymentModel || "Not specified"}
PRODUCTS/SERVICES: ${businessData.products || businessData.description}

Return a JSON object with folder names and document titles/filenames. NO content — just the structure.

Format:
{"folders":[{"name":"Folder Name","docs":[{"filename":"File_Name","title":"Document Title"}]}]}

Create exactly 7 strategic folders with comprehensive business transformation documents:
1. Company Profile & Strategic Foundation — 3-4 docs (company overview with vision/mission/values, strategic positioning document, competitive analysis framework, brand identity guide)
2. Client Onboarding & Experience — 3-4 docs (complete onboarding system, client journey map, welcome package template, client success framework, retention strategy)
3. Document Templates & Legal Framework — 4-5 docs (service agreements, proposals with pricing strategy, client communication templates, receipts/invoices, terms & conditions, NDAs if needed)
4. Sales & Revenue System — 4-5 docs (complete sales methodology, discovery call framework, objection handling playbook, proposal template, closing sequences, pipeline management system)
5. Marketing & Growth Engine — 4-5 docs (brand messaging framework, content strategy playbook, social media system, email marketing sequences, referral program, growth frameworks)
6. Operations & Scalability — 4-5 docs (complete SOP library, workflow automation guide, quality control system, team structure & responsibilities, scalability roadmap, vendor management)
7. Finance & Business Intelligence — 4-5 docs (financial management system, budgeting & forecasting framework, expense tracking & categorization, pricing strategy guide, financial reporting dashboard, cash flow management)

Make document titles specific to ${businessData.industry}. Use filenames with underscores, no spaces.
Return ONLY valid JSON, no markdown, no explanation.`;

    const model = Deno.env.get("CLAUDE_MODEL") || "claude-sonnet-4-20250514";
    console.log("Calling Claude for plan with model:", model);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const plan = JSON.parse(clean);

    console.log("Plan generated:", plan.folders?.length, "folders");
    const totalDocs = plan.folders?.reduce((sum: number, f: any) => sum + (f.docs?.length || 0), 0) || 0;
    console.log("Total documents planned:", totalDocs);

    return new Response(
      JSON.stringify({ success: true, plan, totalDocs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Plan generation error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate document plan",
        message: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

