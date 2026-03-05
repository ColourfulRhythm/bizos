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
    const { businessData, folder, uploadedFileContent } = req.body;
    if (!businessData || !folder) {
      return res.status(400).json({ error: 'Business data and folder are required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_ANTHROPIC')) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    console.log(`=== GENERATING CONTENT: ${folder.name} (${folder.docs.length} docs) ===`);

    const docList = folder.docs.map(d => `- "${d.title}" (filename: ${d.filename})`).join('\n');
    
    let fileContext = '';
    if (uploadedFileContent) {
      fileContext = `\n\nADDITIONAL BUSINESS CONTEXT FROM UPLOADED FILE:\n${uploadedFileContent.substring(0, 2000)}`;
    }

    const prompt = `You are a business systems consultant creating professional documents for ${businessData.name}, a ${businessData.industry} business.

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

Generate FULL CONTENT for these documents in the "${folder.name}" folder:
${docList}

Return JSON format:
{"docs":[{"filename":"exact_filename","title":"Document Title","sections":[{"heading":"Section Heading","content":"Full paragraph content here..."}]}]}

REQUIREMENTS:
- Each document should have 3-5 sections
- Each section should have 150-250 words of real, actionable content
- Use ${businessData.brandTone || 'Professional'} tone throughout
- Reference ${businessData.name} by name
- Make content specific to ${businessData.industry}
- Include specific details relevant to their products/services
- Write as if this is a real business document they can use immediately

Return ONLY valid JSON, no markdown, no explanation.`;

    const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: model,
      max_tokens: 8000, // Increased for multiple documents with full content
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: 60000 // Increased timeout
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
    
    console.log(`Parsed content, docs count: ${content.docs?.length || 0}`);
    
    // Validate content - ensure no empty documents
    const validatedDocs = (content.docs || []).map(doc => {
      // Ensure doc has required fields
      if (!doc.filename || !doc.title) {
        console.warn(`Document missing filename/title:`, doc);
        return null;
      }
      
      // Ensure doc has sections with content
      if (!doc.sections || !Array.isArray(doc.sections) || doc.sections.length === 0) {
        console.warn(`Document ${doc.filename} has no sections`);
        // Create a default section
        doc.sections = [{
          heading: doc.title,
          content: `This document is being prepared for ${businessData.name}. Content will be generated based on your business profile.`
        }];
      }
      
      // Validate each section has content
      doc.sections = doc.sections.map(section => {
        if (!section.heading) section.heading = 'Overview';
        if (!section.content || section.content.trim().length < 50) {
          // Minimum 50 characters per section
          section.content = section.content || `This section contains information relevant to ${businessData.name} in the ${businessData.industry} industry.`;
        }
        return section;
      });
      
      return doc;
    }).filter(doc => doc !== null); // Remove null entries
    
    if (validatedDocs.length === 0) {
      throw new Error(`No valid documents generated for ${folder.name}`);
    }
    
    const minSections = validatedDocs.length > 0 ? Math.min(...validatedDocs.map(d => d.sections.length)) : 0;
    const totalSections = validatedDocs.reduce((sum, d) => sum + (d.sections?.length || 0), 0);
    const avgContentLength = validatedDocs.reduce((sum, d) => {
      const docLength = d.sections?.reduce((s, sec) => s + (sec.content?.length || 0), 0) || 0;
      return sum + docLength;
    }, 0) / validatedDocs.length;
    
    console.log(`Content validated for ${folder.name}: ${validatedDocs.length} docs, ${totalSections} total sections, avg ${Math.round(avgContentLength)} chars per doc`);

    res.json({ success: true, folderName: folder.name, docs: validatedDocs });

  } catch (error) {
    console.error(`Content generation error for ${req.body?.folder?.name}:`, error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate folder content',
      folderName: req.body?.folder?.name || 'Unknown',
      message: error.response?.data?.error?.message || error.message
    });
  }
};

