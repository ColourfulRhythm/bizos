#!/bin/bash

# Deploy Supabase Edge Functions
# No database linking required - deploys directly

PROJECT_REF="nxygpqnbkoxfdwtvsufw"

echo "🚀 Deploying Supabase Edge Functions to project: $PROJECT_REF"
echo ""

# Health endpoint (10s timeout)
echo "📦 Deploying health..."
supabase functions deploy health \
  --project-ref $PROJECT_REF \
  --no-verify-jwt \
  --timeout 10

# Generate plan (60s timeout)
echo "📦 Deploying generate-plan..."
supabase functions deploy generate-plan \
  --project-ref $PROJECT_REF \
  --no-verify-jwt \
  --timeout 60

# Generate document (300s timeout - important!)
echo "📦 Deploying generate-document (300s timeout)..."
supabase functions deploy generate-document \
  --project-ref $PROJECT_REF \
  --no-verify-jwt \
  --timeout 300

# Send email (30s timeout)
echo "📦 Deploying send-email..."
supabase functions deploy send-email \
  --project-ref $PROJECT_REF \
  --no-verify-jwt \
  --timeout 30

# Verify payment (30s timeout)
echo "📦 Deploying verify-payment..."
supabase functions deploy verify-payment \
  --project-ref $PROJECT_REF \
  --no-verify-jwt \
  --timeout 30

echo ""
echo "✅ All functions deployed successfully!"
echo ""
echo "Test with:"
echo "curl -H \"Authorization: Bearer YOUR_ANON_KEY\" \\"
echo "  https://nxygpqnbkoxfdwtvsufw.supabase.co/functions/v1/health"

