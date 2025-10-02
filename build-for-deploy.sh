#!/bin/bash

# Build script for Cloudflare Pages deployment
# This ensures all necessary files are present in dist directory

echo "🚀 Building AstroLuna for Cloudflare Pages deployment..."

# Run the standard build
echo "📦 Running npm build..."
npm run build

# Copy deployment files to dist
echo "📋 Copying deployment files..."
cp index.html dist/
cp _redirects dist/
cp _headers dist/

# Verify files are present
echo "✅ Verifying deployment files..."
ls -la dist/ | grep -E "(index.html|_redirects|_headers|_worker.js)"

echo "🎉 Build complete! Ready for Cloudflare Pages deployment."
echo ""
echo "📁 Files in dist/:"
ls -la dist/

echo ""
echo "🌐 Deploy to Cloudflare Pages using the dist/ directory"