#!/bin/bash

# Cloudflare Deployment Script for Shared Service
# This script deploys the shared service as a Cloudflare Worker

set -e

echo "🚀 Starting Shared Service deployment to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login to Cloudflare if not already logged in
echo "🔐 Checking Cloudflare login..."
wrangler whoami || wrangler login

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy the worker
echo "🚀 Deploying Shared Service Worker..."
wrangler deploy

echo ""
echo "🎉 Shared Service deployed successfully!"
echo "📡 Endpoint: https://virtual-trading-shared.yourdomain.workers.dev"
echo ""
echo "📋 Available endpoints:"
echo "   • /health - Health check"
echo "   • /currencies - Currency information"
echo "   • /regions - Region configurations"
echo "   • /i18n/languages - Supported languages"
echo "   • /i18n/translate - Translation service"
echo "   • /convert - Currency conversion"
echo ""
echo "🔧 Next steps:"
echo "   1. Configure environment variables in Cloudflare dashboard"
echo "   2. Set up KV namespace for caching"
echo "   3. Configure R2 bucket for currency cache"
echo "   4. Update other services to use the shared service API"
