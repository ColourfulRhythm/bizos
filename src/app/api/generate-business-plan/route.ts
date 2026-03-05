import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const cors = { headers: { "Access-Control-Allow-Origin": "*" } };

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: cors.headers });
}

export async function POST(request: Request) {
  try {
    const { businessData, uploadedFileContent } = await request.json();
    if (!businessData) {
      return NextResponse.json({ error: "Business data is required" }, { status: 400, ...cors });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes("YOUR_ANTHROPIC")) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500, ...cors }
      );
    }

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
2. **COMPANY DESCRIPTION**
3. **TEAM**
4. **INDUSTRY ANALYSIS**
5. **TARGET MARKET**
6. **IMPLEMENTATION TIMELINE**
7. **MARKETING PLAN**
8. **FINANCIAL SUMMARY**
9. **FUNDING REQUIRED**

Return the content as a structured JSON object with sections. Format:
{"sections":[{"title":"The Business Opportunity","content":"Full detailed content here..."},...]}

Make it investor-ready, professional, and comprehensive. Use specific numbers, timelines, and actionable insights where appropriate.`;

    const model = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 6000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message || response.statusText);
    }

    const data = await response.json();
    const text = (data.content?.[0] as { text?: string })?.text || "";
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const planData = JSON.parse(clean);

    return NextResponse.json(
      { success: true, plan: planData, sections: planData.sections || [] },
      cors
    );
  } catch (error) {
    console.error("Business plan generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate business plan",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, ...cors }
    );
  }
}
