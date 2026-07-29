#!/bin/bash
# KMS Phase 1 - Quick Start Script

echo "🚀 KMS Phase 1 Quick Start"
echo "========================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your MongoDB URI and NextAuth secrets"
    echo ""
    echo "Required environment variables:"
    echo "  MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/kms"
    echo "  NEXTAUTH_URL=http://localhost:3000"
    echo "  NEXTAUTH_SECRET=your-secret-key-here"
    echo ""
    exit 0
fi

echo "🎯 Environment is configured"
echo ""

# Start development server
echo "🚀 Starting development server..."
echo "   Open http://localhost:3000 in your browser"
echo ""
echo "   Press Ctrl+C to stop"
echo ""

npm run dev
