# Cost Estimate for BizOS Document Generation

## Current Configuration
- **Model:** Claude Sonnet 4.6 (`claude-sonnet-4-20250514`)
- **Max Tokens:** 8,000 tokens per request
- **Documents:** 18-24 documents per generation

## Pricing (Sonnet 4.6)
- **Input:** $3.00 per million tokens
- **Output:** $15.00 per million tokens

## Cost Calculation for 24 Documents

### Token Usage Estimate:

**Input Tokens:**
- Business profile data: ~500 tokens
- Instructions & prompt: ~2,500 tokens
- **Total Input:** ~3,000 tokens

**Output Tokens:**
- 24 documents × ~3-4 sections each = ~72-96 sections
- Each section: 150-300 words = ~200 words average
- Total words: ~14,400-19,200 words
- Words to tokens: ~1.3 tokens per word
- **Total Output:** ~18,720-24,960 tokens

### ⚠️ Current Limitation:
Your `max_tokens` is set to **8,000**, but you need **~20,000 tokens** for 24 full documents.

### Cost Per Generation:

**With current 8,000 token limit:**
- Input: 3,000 tokens × $3/1M = **$0.009**
- Output: 8,000 tokens × $15/1M = **$0.12**
- **Total: ~$0.13 per generation**

**But:** This will be truncated/incomplete because 8,000 tokens isn't enough for 24 full documents.

**For full 24 documents (20,000 tokens):**
- Input: 3,000 tokens × $3/1M = **$0.009**
- Output: 20,000 tokens × $15/1M = **$0.30**
- **Total: ~$0.31 per generation**

## Recommendations

### Option 1: Increase max_tokens (Recommended)
Update `api/generate.js`:
```javascript
max_tokens: 20000, // Increased from 8000
```

**Cost:** ~$0.31 per generation

### Option 2: Generate in batches
Split into 2 API calls:
- First call: Generate plan (8,000 tokens)
- Second call: Generate full content (20,000 tokens)

**Cost:** ~$0.40 per generation (slightly more due to 2 API calls)

### Option 3: Reduce content per section
Reduce from 150-300 words to 100-200 words per section.

**Cost:** ~$0.20 per generation

## Monthly Cost Estimates

**At ₦5,000 per generation:**
- You charge: ₦5,000 (~$3.30)
- API cost: ~$0.31
- **Profit margin: ~90%**

**100 generations/month:**
- Revenue: ₦500,000 (~$330)
- API costs: ~$31
- **Net profit: ~$299**

## Action Required

1. **Add credits to Anthropic account** (minimum $5-10 to start)
2. **Increase max_tokens to 20,000** for full document generation
3. **Monitor usage** in Anthropic dashboard

