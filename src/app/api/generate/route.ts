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

    let fileContent = "";
    if (uploadedFileContent) {
      fileContent = `\n\nADDITIONAL BUSINESS INFORMATION FROM UPLOADED FILE:\n${uploadedFileContent}`;
    }

    const prompt = `You are a business systems consultant. Based on the following business profile, generate a complete business operating system document plan.

BUSINESS PROFILE:
- Name: ${businessData.name}
- Industry: ${businessData.industry}
- Description: ${businessData.description}
- Location: ${businessData.city}, ${businessData.country}
- How they get clients: ${businessData.salesChannel}
- How they deliver: ${businessData.delivery}
- Payment model: ${businessData.paymentModel}
- Business size: ${businessData.bizSize}
- Typical customer: ${businessData.customer}
- Existing/needed docs: ${businessData.existingDocs || "None specified"}
- Products/services: ${businessData.products || "Not specified"}
- Brand tone: ${businessData.brandTone}${fileContent}

Generate a structured document plan as JSON with this EXACT format:
{
  "folders": [
    {
      "name": "Company Profile",
      "docs": [
        {
          "filename": "Company_Profile",
          "title": "Company Profile",
          "type": "company_profile",
          "sections": [
            {"heading": "About Us", "content": "Full paragraph content here..."},
            {"heading": "Our Services", "content": "Full paragraph content here..."}
          ]
        }
      ]
    }
  ]
}

Create 7 folders with 2-4 documents each:
1. Company Profile (company overview doc, services overview)
2. Client Onboarding (step-by-step onboarding flow, client checklist)
3. Document Templates (relevant templates: agreements, letters, receipts — tailor to this specific business)
4. Sales Kit (sales script for their specific offer, objection handler, pipeline tracker)
5. Marketing Kit (brand messaging guide, social media playbook, email templates)
6. Operations & SOPs (main SOP document, team responsibilities, quality standards)
7. Finance & Accounting (financial management SOP, budget template, expense tracking system, invoice/receipt templates, financial reporting guide — tailored to their payment model: ${businessData.paymentModel})

IMPORTANT:
- Make ALL content completely specific to THIS business — use their actual business name, industry, services, customer type
- Write full paragraph content for each section (not placeholders)
- Sections should have 150-300 words of real, usable content
- Use ${businessData.brandTone} tone throughout
- Reference their specific products/services: ${businessData.products || businessData.description}
- The payment model is: ${businessData.paymentModel}

Return ONLY valid JSON, no markdown, no explanation.`;

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
        max_tokens: 20000,
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
    const plan = JSON.parse(clean);

    return NextResponse.json({ success: true, plan }, cors);
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error: "Generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, ...cors }
    );
  }
}
