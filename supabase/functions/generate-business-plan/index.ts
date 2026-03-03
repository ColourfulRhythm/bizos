// Supabase Edge Function: Generate One-Page Business Plan
// Deno runtime with 300s timeout support

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://bizos.adparlay.com",
  "https://www.bizos.adparlay.com",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8080",
  ...(Deno.env.get("ALLOWED_ORIGINS")?.split(",").map((o) => o.trim()) || []),
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowOrigin =
    ALLOWED_ORIGINS.includes(origin) ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ? origin
      : "https://bizos.adparlay.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

async function verifyPayment(reference: string): Promise<boolean> {
  const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secretKey || secretKey.includes("YOUR_PAYSTACK")) return false;
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!(data.status && data.data?.status === "success");
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { businessData, uploadedFileContent } = await req.json();

    if (!businessData) {
      return new Response(
        JSON.stringify({ error: "Business data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentRef = businessData.paymentReference;
    if (!paymentRef || typeof paymentRef !== "string") {
      return new Response(
        JSON.stringify({ error: "Payment reference is required. Please complete payment first." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!(await verifyPayment(paymentRef))) {
      return new Response(
        JSON.stringify({ error: "Payment could not be verified. Please complete payment first." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey || apiKey.includes("YOUR_ANTHROPIC")) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`=== GENERATING BUSINESS PLAN FOR: ${businessData.name} ===`);

    let fileContext = "";
    if (uploadedFileContent) {
      fileContext = `\n\nADDITIONAL BUSINESS CONTEXT FROM UPLOADED FILE:\n${uploadedFileContent.substring(0, 2000)}`;
    }

    const prompt = `You are a business consultant creating a comprehensive, investor-ready one-page business plan for ${businessData.name}, a ${businessData.industry} business.

BUSINESS CONTEXT:
- Company Name: ${businessData.name}
- Industry: ${businessData.industry}
- Description: ${businessData.description}
- Location: ${businessData.city || ""}, ${businessData.country || "Nigeria"}${fileContext}

BUSINESS PLAN DETAILS:
- Problem/Opportunity: ${businessData.opportunity || "Not specified"}
- Team: ${businessData.team || "Not specified"}
- Competitors: ${businessData.competitors || "Not specified"}
- Target Market: ${businessData.targetMarket || "Not specified"}
- Implementation Timeline: ${businessData.timeline || "Not specified"}
- Marketing Channels: ${businessData.marketing || "Not specified"}
- Financial Summary: ${businessData.financials || "Not specified"}
- Funding Required: ${businessData.funding || "Not specified"}

Create a comprehensive ONE-PAGE business plan with the following 9 sections. Each section should be detailed, strategic, and actionable:

1. **THE BUSINESS OPPORTUNITY** (Full width at top)
   - Describe the problem you're solving
   - Pain points for users/customers
   - Market gap or opportunity
   - Why this is the right time

2. **COMPANY DESCRIPTION**
   - What your company does
   - Core value proposition
   - What challenges it solves
   - Unique selling points
   - Mission and vision

3. **TEAM**
   - Who is involved (founders, key team members)
   - Why they're the right people to build this business
   - Relevant experience and expertise
   - Roles and responsibilities
   - Advisory board (if applicable)

4. **INDUSTRY ANALYSIS**
   - Key competitors and competitive landscape
   - Market size and trends
   - Key success factors in your industry
   - Barriers to entry
   - Industry challenges and opportunities

5. **TARGET MARKET**
   - Target audience and customer segments
   - Buyer personas (detailed profiles)
   - Ideal customers
   - Market size and addressable market
   - Customer acquisition strategy

6. **IMPLEMENTATION TIMELINE**
   - How you'll roll out the business
   - Phases involved (Phase 1, 2, 3, etc.)
   - Key milestones and deliverables
   - Timeline with dates/quarters
   - Resource requirements per phase

7. **MARKETING PLAN**
   - Channels and platforms to reach your audience
   - Marketing strategies and tactics
   - Content strategy
   - Customer acquisition channels
   - Conversion strategies
   - Budget allocation

8. **FINANCIAL SUMMARY**
   - Cost structure (fixed and variable costs)
   - Revenue streams
   - Pricing strategy
   - Sales goals and projections
   - Break-even analysis
   - Key financial metrics

9. **FUNDING REQUIRED**
   - How much funding you need from investors
   - Where the funding will go (use of funds)
   - Funding timeline
   - Expected returns for investors
   - Exit strategy (if applicable)

Return the content as a structured JSON object with sections. Each section should be comprehensive, professional, and tailored specifically to ${businessData.name} and the ${businessData.industry} industry.

Format:
{
  "sections": [
    {
      "title": "The Business Opportunity",
      "content": "Full detailed content here..."
    },
    {
      "title": "Company Description",
      "content": "Full detailed content here..."
    }
  ]
}

Return ONLY valid JSON, no markdown, no explanation. Make it investor-ready, professional, and comprehensive. Use specific numbers, timelines, and actionable insights where appropriate.`;

    const model = Deno.env.get("CLAUDE_MODEL") || "claude-sonnet-4-20250514";
    console.log("Calling Claude for business plan with model:", model);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 6000,
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
    const planData = JSON.parse(clean);

    console.log("Business plan generated:", planData.sections?.length, "sections");

    return new Response(
      JSON.stringify({
        success: true,
        plan: planData,
        sections: planData.sections || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Business plan generation error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate business plan",
        message: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
