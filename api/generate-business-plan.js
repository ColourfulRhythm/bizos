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
    const { businessData, uploadedFileContent } = req.body;
    if (!businessData) {
      return res.status(400).json({ error: 'Business data is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_ANTHROPIC')) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    console.log(`=== GENERATING BUSINESS PLAN FOR: ${businessData.name} ===`);

    let fileContext = '';
    if (uploadedFileContent) {
      fileContext = `\n\nADDITIONAL BUSINESS CONTEXT FROM UPLOADED FILE:\n${uploadedFileContent.substring(0, 2000)}`;
    }

    const prompt = `You are a business consultant creating a comprehensive, investor-ready one-page business plan for ${businessData.name}, a ${businessData.industry} business.

BUSINESS CONTEXT:
- Company Name: ${businessData.name}
- Industry: ${businessData.industry}
- Description: ${businessData.description}
- Location: ${businessData.city || ''}, ${businessData.country || 'Nigeria'}
- Sales Channel: ${businessData.salesChannel || 'Multiple'}
- Delivery Method: ${businessData.delivery || 'Not specified'}
- Payment Model: ${businessData.paymentModel || 'Not specified'}
- Business Size: ${businessData.bizSize || 'Small team'}
- Target Customer: ${businessData.customer || 'Not specified'}
- Products/Services: ${businessData.products || businessData.description}
- Brand Tone: ${businessData.brandTone || 'Professional'}${fileContext}

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
    },
    ... (all 9 sections)
  ]
}

Make it investor-ready, professional, and comprehensive. Use specific numbers, timelines, and actionable insights where appropriate.`;

    const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
    console.log('Calling Claude for business plan with model:', model);

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: model,
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: 55000
    });

    const text = response.data.content[0].text;
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const planData = JSON.parse(clean);
    
    console.log('Business plan generated:', planData.sections?.length, 'sections');

    res.json({ 
      success: true, 
      plan: planData,
      sections: planData.sections || []
    });

  } catch (error) {
    console.error('Business plan generation error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate business plan',
      message: error.response?.data?.error?.message || error.message,
      details: error.response?.data
    });
  }
};

