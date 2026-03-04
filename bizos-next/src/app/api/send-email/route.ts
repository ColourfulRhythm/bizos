import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const cors = { headers: { "Access-Control-Allow-Origin": "*" } };

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: cors.headers });
}

export async function POST(request: Request) {
  try {
    const { email, businessName, zipBase64, paymentReference } = await request.json();

    if (!email || !zipBase64) {
      return NextResponse.json(
        { error: "Email and ZIP file are required" },
        { status: 400, ...cors }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey.includes("YOUR_RESEND")) {
      return NextResponse.json(
        {
          success: true,
          message: "Email service not configured, but ZIP is available for download",
          skipped: true,
        },
        cors
      );
    }

    const zipFileName = `${(businessName || "Business").replace(/[^a-z0-9]/gi, "_")}_Business_System.zip`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BizOS <noreply@bizos.adparlay.com>",
        to: email,
        subject: `Your ${businessName || "BizOS"} Business Operating System is Ready`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Your Business Operating System is Ready!</h2>
              <p>Your complete business operating system has been generated and is attached.</p>
              <p>Payment reference: ${paymentReference || "N/A"}</p>
              <p>Best regards,<br>The BizOS Team</p>
            </div>
          </body>
          </html>
        `,
        attachments: [{ filename: zipFileName, content: zipBase64 }],
      }),
    });

    if (!emailResponse.ok) {
      const err = await emailResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: "Email could not be sent, but your ZIP is available for download",
          message: (err as { message?: string }).message,
        },
        cors
      );
    }

    const result = await emailResponse.json();
    return NextResponse.json({ success: true, messageId: result.id }, cors);
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Email could not be sent, but your ZIP is available for download",
      },
      cors
    );
  }
}
