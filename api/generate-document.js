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
    const { businessData, document, folderName, uploadedFileContent } = req.body;
    if (!businessData || !document) {
      return res.status(400).json({ error: 'Business data and document are required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_ANTHROPIC')) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    console.log(`=== GENERATING DOCUMENT: ${document.title} in ${folderName} ===`);

    let fileContext = '';
    if (uploadedFileContent) {
      fileContext = `\n\nADDITIONAL BUSINESS CONTEXT FROM UPLOADED FILE:\n${uploadedFileContent.substring(0, 1500)}`;
    }

    const prompt = `You are a business systems consultant creating a professional document for ${businessData.name}, a ${businessData.industry} business.

BUSINESS CONTEXT:
- Name: ${businessData.name}
- Industry: ${businessData.industry}
- Description: ${businessData.description}
- Location: ${businessData.city || ''}, ${businessData.country || 'Nigeria'}
- Sales channel: ${businessData.salesChannel || 'Multiple'}
- Delivery method: ${businessData.delivery || 'Not specified'}
- Payment model: ${businessData.paymentModel || 'Not specified'}
- Business size: ${businessData.bizSize || 'Small team'}
- Target customer: ${businessData.customer || 'Not specified'}
- Products/services: ${businessData.products || businessData.description}
- Brand tone: ${businessData.brandTone || 'Professional'}${fileContext}

Generate FULL CONTENT for this document: "${document.title}" (filename: ${document.filename})

This document is part of the "${folderName}" folder.

Return JSON format with structured content:
{"filename":"${document.filename}","title":"${document.title}","sections":[{"heading":"Section Heading","content":"Full paragraph content here...","subsections":[],"needsTable":false}]}

REQUIREMENTS - CREATE TRANSFORMATIVE BUSINESS CONTENT:
- Create 4-7 comprehensive sections that provide strategic value
- Each section should have 200-400 words of deep, actionable, strategic content
- This is NOT a template - it's a complete business transformation system
- Include frameworks, methodologies, step-by-step processes, and strategic insights
- Use ${businessData.brandTone || 'Professional'} tone throughout but be authoritative and strategic
- Reference ${businessData.name} by name and their specific context
- Make content deeply specific to ${businessData.industry} with industry best practices
- Include specific details relevant to their products/services: ${businessData.products || businessData.description}
- Write as if you're a $10,000/month business consultant providing premium strategic guidance
- Include actionable frameworks, checklists, decision trees, and implementation guides
- Add strategic insights that will genuinely improve their business operations
- Focus on scalability, automation, efficiency, and growth
- Include "How to implement" sections, "Best practices", "Common pitfalls to avoid"
- Make it feel like a premium business transformation document, not a basic template

STRUCTURE REQUIREMENTS - PREMIUM BUSINESS DOCUMENT:
- Use proper heading hierarchy: main sections (H1), subsections (H2), sub-subsections (H3)
- Each section should include:
  * Strategic overview/context
  * Step-by-step implementation guide
  * Best practices and frameworks
  * Common mistakes to avoid
  * Success metrics/KPIs to track
  * Tools and resources needed
- For operational documents, include workflow diagrams in text form, decision trees, and process maps
- For financial documents, include editable tables with strategic categorization, forecasting columns, variance analysis
- For tracking documents, include tables with status tracking, priority levels, ownership, timelines
- For templates, include strategic frameworks embedded in the template (not just blank fields)
- Add subsections for: "Implementation Steps", "Key Metrics", "Automation Opportunities", "Scaling Considerations"
- Include "Strategic Notes" sections that provide business insights
- Add "Quick Reference" checklists where appropriate
- Make tables strategic - include columns for analysis, not just data entry

TABLE FORMAT (when needsTable is true):
Include strategic context: "This tracking system enables [business outcome]. Use the table below to [purpose]. Key columns: [Column1] for [reason], [Column2] for [reason]..."

Return ONLY valid JSON, no markdown, no explanation.`;

    const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: model,
      max_tokens: 6000, // Increased for comprehensive strategic content
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: 55000 // 55 seconds max for comprehensive content
    });

    const text = response.data.content[0].text;
    console.log(`Raw response length: ${text.length} characters`);
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let content;
    try {
      content = JSON.parse(clean);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      console.error('First 500 chars of response:', clean.substring(0, 500));
      throw new Error(`Failed to parse API response as JSON: ${parseErr.message}`);
    }
    
    // Validate document has proper structure
    if (!content.filename || !content.title) {
      throw new Error('Document missing filename or title');
    }
    
    if (!content.sections || !Array.isArray(content.sections) || content.sections.length === 0) {
      console.warn(`Document ${content.filename} has no sections, adding default`);
      content.sections = [{
        heading: content.title,
        content: `This document contains information relevant to ${businessData.name} in the ${businessData.industry} industry.`,
        subsections: [],
        needsTable: false
      }];
    }
    
    // Validate each section has content and structure
    content.sections = content.sections.map((section, idx) => {
      if (!section.heading) section.heading = idx === 0 ? 'Overview' : `Section ${idx + 1}`;
      if (!section.content || section.content.trim().length < 50) {
        section.content = section.content || 
          `This section contains information relevant to ${businessData.name} in the ${businessData.industry} industry.`;
      }
      // Ensure minimum length
      if (section.content.trim().length < 100) {
        section.content += ` This content is tailored specifically for ${businessData.name} and should be customized to your specific needs.`;
      }
      // Ensure subsections array exists
      if (!section.subsections) section.subsections = [];
      // Validate subsections
      if (section.subsections && Array.isArray(section.subsections)) {
        section.subsections = section.subsections.map(subsec => {
          if (!subsec.heading) subsec.heading = 'Subsection';
          if (!subsec.content) subsec.content = '';
          return subsec;
        });
      }
      // Ensure needsTable flag exists
      if (typeof section.needsTable === 'undefined') {
        section.needsTable = false;
      }
      return section;
    });
    
    const totalContentLength = content.sections.reduce((sum, s) => sum + (s.content?.length || 0), 0);
    console.log(`Document ${content.filename} generated: ${content.sections.length} sections, ${totalContentLength} total chars`);

    res.json({ success: true, doc: content });

  } catch (error) {
    const documentTitle = req.body?.document?.title || 'Unknown';
    console.error(`=== DOCUMENT GENERATION ERROR ===`);
    console.error(`Document: ${documentTitle}`);
    console.error(`Error type: ${error.constructor.name}`);
    console.error(`Error message: ${error.message}`);
    
    // Log Anthropic API errors in detail
    if (error.response) {
      console.error(`Anthropic API Status: ${error.response.status}`);
      console.error(`Anthropic API Data:`, JSON.stringify(error.response.data, null, 2));
    }
    
    // Log request details (without sensitive data)
    if (req.body?.document) {
      console.error(`Document filename: ${req.body.document.filename}`);
      console.error(`Folder: ${req.body.folderName || 'Unknown'}`);
    }
    
    // Provide more helpful error messages
    let userMessage = error.message;
    if (error.response?.status === 401) {
      userMessage = 'Anthropic API authentication failed. Please check API key configuration.';
    } else if (error.response?.status === 429) {
      userMessage = 'Rate limit exceeded. Please try again in a moment.';
    } else if (error.response?.status === 529 || error.message.includes('timeout')) {
      userMessage = 'Request timed out. The document is too complex. Retrying with simpler request...';
    } else if (error.message.includes('JSON')) {
      userMessage = 'Failed to parse AI response. Retrying...';
    }
    
    res.status(500).json({
      error: 'Failed to generate document',
      documentTitle: documentTitle,
      message: userMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

