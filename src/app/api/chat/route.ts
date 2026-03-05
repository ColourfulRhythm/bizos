import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes("YOUR_ANTHROPIC")) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const { messages, bizData = {} } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array required" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const systemPrompt = `You are BizOS, a friendly business consultant helping users structure and grow their business. Your goal is to collect enough information to generate professional business documents.

Greeting: Start with "Good day, Let's make your business profitable." Ask: "What's your business name?"

Then, through natural conversation, gather:
- Business name
- Industry / sector
- What the business does (description)
- Country/city
- Problem being solved (opportunity)
- Team (who's involved)
- Competitors
- Target market
- Timeline for implementation
- Marketing channels
- Financial summary
- Funding needs (if applicable)

Keep responses SHORT (1–3 sentences). Ask ONE question at a time. Be warm and convincing that you have what they need to grow significantly and structure their business.

When you need document uploads, say: "You can attach a .txt, .doc, .docx, or small .pdf (max 500KB) with any notes if helpful — otherwise just type your answer." Accept typed answers if they prefer.

When you have: name, industry, description, opportunity, team, competitors, target market, timeline, marketing, financials, funding (and optionally email, country, city) — say:

"Great, I have everything I need. Here are your 3 options:

1. **Business Plan Only** — ₦5,000 — One comprehensive one-page business plan
2. **Starter System** — ₦8,000 — 3 folders with 10 strategic documents
3. **Full Business System** — ₦25,000 — 7 folders with 24–30 documents

Which option would you like? (Reply 1, 2, or 3)"

Extract and update bizData from the conversation. Output JSON at the end of your final message when ready for plan selection: {"bizData": {...}, "readyForPlan": true}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: typeof m.content === "string" ? m.content : m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message || response.statusText);
    }

    const data = await response.json();
    const text = (data.content?.[0] as { text?: string })?.text || "";

    let bizDataOut = bizData;
    let readyForPlan = false;
    const jsonMatch = text.match(/\{\s*"bizData"\s*:\s*\{[\s\S]*?\}\s*,\s*"readyForPlan"\s*:\s*true\s*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        bizDataOut = { ...bizData, ...parsed.bizData };
        readyForPlan = true;

        // Store in Supabase when we have full business data
        const supabase = getSupabaseAdmin();
        if (supabase) {
          try {
            await supabase.from("business_submissions").insert({
              name: bizDataOut.name,
              industry: bizDataOut.industry,
              description: bizDataOut.description,
              country: bizDataOut.country,
              city: bizDataOut.city,
              opportunity: bizDataOut.opportunity,
              team: bizDataOut.team,
              competitors: bizDataOut.competitors,
              target_market: bizDataOut.targetMarket,
              timeline: bizDataOut.timeline,
              marketing: bizDataOut.marketing,
              financials: bizDataOut.financials,
              funding: bizDataOut.funding,
              email: bizDataOut.email,
              products: bizDataOut.products,
              raw_data: bizDataOut,
            });
          } catch (e) {
            console.warn("Supabase save failed:", e);
          }
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json(
      {
        text: text.replace(/\{[\s\S]*"bizData"[\s\S]*"readyForPlan"[\s\S]*\}/g, "").trim(),
        bizData: bizDataOut,
        readyForPlan,
      },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
