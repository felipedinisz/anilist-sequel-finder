#!/bin/bash
set -e

echo "🔨 Building AniList Sequel Finder..."

# Build Frontend
echo "📦 Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Verify frontend build exists
if [ ! -f "frontend/dist/index.html" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Build complete! Frontend ready at frontend/dist/"
