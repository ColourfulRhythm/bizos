#!/bin/bash

# Deploy Supabase Edge Functions
# No database linking required - deploys directly
# NOTE: Timeouts must be set in Supabase Dashboard after deployment

PROJECT_REF="nxygpqnbkoxfdwtvsufw"

echo "🚀 Deploying Supabase Edge Functions to project: $PROJECT_REF"
echo ""

# Health endpoint
echo "📦 Deploying health..."
supabase functions deploy health \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

# Generate plan
echo "📦 Deploying generate-plan..."
supabase functions deploy generate-plan \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

# Generate document (needs 300s timeout - set in Dashboard!)
echo "📦 Deploying generate-document..."
supabase functions deploy generate-document \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

# Send email
echo "📦 Deploying send-email..."
supabase functions deploy send-email \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

# Verify payment
echo "📦 Deploying verify-payment..."
supabase functions deploy verify-payment \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

echo ""
echo "✅ All functions deployed successfully!"
echo ""
echo "⚠️  IMPORTANT: Set timeouts in Supabase Dashboard:"
echo "   1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo "   2. Click each function → Settings → Set timeout:"
echo "      - generate-document: 300 seconds (5 minutes)"
echo "      - generate-plan: 60 seconds"
echo "      - send-email: 30 seconds"
echo "      - verify-payment: 30 seconds"
echo "      - health: 10 seconds"
echo ""
echo "Test with:"
echo "curl -H \"Authorization: Bearer YOUR_ANON_KEY\" \\"
echo "  https://nxygpqnbkoxfdwtvsufw.supabase.co/functions/v1/health"

