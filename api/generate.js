const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { businessData, uploadedFileContent } = req.body;

    if (!businessData) {
      return res.status(400).json({ error: 'Business data is required' });
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_ANTHROPIC')) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    // Build prompt
    let fileContent = '';
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
- Existing/needed docs: ${businessData.existingDocs || 'None specified'}
- Products/services: ${businessData.products || 'Not specified'}
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

    // Call Anthropic API
    const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: model,
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    });

    // Parse response
    const text = response.data.content[0].text;
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const plan = JSON.parse(clean);

    res.json({ success: true, plan });

  } catch (error) {
    console.error('Generation error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Generation failed', 
      message: error.response?.data?.error?.message || error.message 
    });
  }
};

