const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  console.log('=== GENERATE PLAN API CALLED ===');

  try {
    const { businessData } = req.body;
    if (!businessData) return res.status(400).json({ error: 'Business data is required' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_ANTHROPIC')) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    const prompt = `You are a business systems consultant. Generate a document structure for this business.

BUSINESS: ${businessData.name}
INDUSTRY: ${businessData.industry}
DESCRIPTION: ${businessData.description}
PAYMENT MODEL: ${businessData.paymentModel || 'Not specified'}
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

    const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
    console.log('Calling Claude for plan with model:', model);

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: 25000
    });

    const text = response.data.content[0].text;
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const plan = JSON.parse(clean);
    
    console.log('Plan generated:', plan.folders?.length, 'folders');
    const totalDocs = plan.folders?.reduce((sum, f) => sum + (f.docs?.length || 0), 0) || 0;
    console.log('Total documents planned:', totalDocs);

    res.json({ success: true, plan, totalDocs });

  } catch (error) {
    console.error('Plan generation error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate document plan',
      message: error.response?.data?.error?.message || error.message
    });
  }
};

