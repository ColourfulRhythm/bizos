const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, businessName, zipBase64, paymentReference } = req.body;
    
    if (!email || !zipBase64) {
      return res.status(400).json({ error: 'Email and ZIP file are required' });
    }

    // Use Resend API (free tier: 100 emails/day)
    // Get API key from: https://resend.com/api-keys
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey || resendApiKey.includes('YOUR_RESEND')) {
      console.warn('Resend API key not configured, skipping email');
      return res.json({ 
        success: true, 
        message: 'Email service not configured, but ZIP is available for download',
        skipped: true 
      });
    }

    const zipFileName = `${businessName.replace(/[^a-z0-9]/gi, '_')}_Business_System.zip`;

    // Send email via Resend (accepts base64 attachments)
    const emailResponse = await axios.post('https://api.resend.com/emails', {
      from: 'BizOS <noreply@bizos.adparlay.com>',
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
              <p>If you have any questions, please contact support with your payment reference: <code>${paymentReference || 'N/A'}</code></p>
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
        content: zipBase64
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Email sent successfully:', emailResponse.data.id);
    res.json({ success: true, messageId: emailResponse.data.id });

  } catch (error) {
    console.error('Email sending error:', error.response?.data || error.message);
    // Don't fail the request if email fails - ZIP is still available for download
    res.json({ 
      success: false, 
      error: 'Email could not be sent, but your ZIP is available for download',
      message: error.response?.data?.message || error.message
    });
  }
};

