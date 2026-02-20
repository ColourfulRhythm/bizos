// Supabase Edge Function: Send Email with ZIP
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, businessName, zipBase64, paymentReference } = await req.json();

    if (!email || !zipBase64) {
      return new Response(
        JSON.stringify({ error: "Email and ZIP file are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey || resendApiKey.includes("YOUR_RESEND")) {
      console.warn("Resend API key not configured, skipping email");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email service not configured, but ZIP is available for download",
          skipped: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const zipFileName = `${businessName.replace(/[^a-z0-9]/gi, "_")}_Business_System.zip`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BizOS <noreply@bizos.adparlay.com>",
        to: email,
        subject: `Your ${businessName} Business Operating System is Ready`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0A0A0A; color: #C8963E; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background: #F5F0E8; }
              .button { display: inline-block; background: #0A0A0A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #7A7468; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>BizOS</h1>
              </div>
              <div class="content">
                <h2>Your Business Operating System is Ready!</h2>
                <p>Hi there,</p>
                <p>Your complete business operating system for <strong>${businessName}</strong> has been generated and is attached to this email.</p>
                <p>The ZIP file contains all your professional documents, organized in folders and ready to use.</p>
                <p><strong>What's included:</strong></p>
                <ul>
                  <li>Company Profile</li>
                  <li>Client Onboarding Flows</li>
                  <li>Document Templates</li>
                  <li>Sales Kit</li>
                  <li>Marketing Kit</li>
                  <li>Operations & SOPs</li>
                  <li>Finance & Accounting</li>
                </ul>
                <p>If you have any questions, please contact support with your payment reference: <code>${paymentReference || "N/A"}</code></p>
                <p>Best regards,<br>The BizOS Team</p>
              </div>
              <div class="footer">
                <p>This email was sent because you generated a business operating system on BizOS.</p>
                <p>© 2026 BizOS · Powered by Claude AI</p>
              </div>
            </div>
          </body>
          </html>
        `,
        attachments: [{
          filename: zipFileName,
          content: zipBase64,
        }],
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Resend API error: ${errorData.message || emailResponse.statusText}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData.id);

    return new Response(
      JSON.stringify({ success: true, messageId: emailData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Email could not be sent, but your ZIP is available for download",
        message: error.message,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

