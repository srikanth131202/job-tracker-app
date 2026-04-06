#!/bin/bash

# Smart Job Tracker - Development Setup Script
# This script helps setup the project for local development

set -e

echo "🚀 Smart Job Application Tracker - Setup Script"
echo "=============================================="
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

echo ""
echo "✅ Dependencies installed successfully"
echo ""

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your credentials:"
    echo "   - MONGODB_URI"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo "   - OPENAI_API_KEY"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend/.env..."
    cat > frontend/.env << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Smart Job Tracker
EOF
    echo "✅ frontend/.env created"
fi

echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update backend/.env with your credentials"
echo "2. Start MongoDB (if running locally):"
echo "   - Windows: net start MongoDB"
echo "   - Docker: docker run -d -p 27017:27017 --name mongodb mongo:6.0-alpine"
echo "3. Run: npm run dev"
echo ""
echo "🌐 Once started:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:5000"
echo ""
echo "📚 For more info, see README.md and DEPLOYMENT.md"
