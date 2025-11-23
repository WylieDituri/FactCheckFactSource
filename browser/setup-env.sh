#!/bin/bash
# Setup script to create .env file for Electron browser app

echo "🔑 Setting up .env file for Electron Browser..."
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    echo "Do you want to overwrite it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Existing .env kept."
        exit 0
    fi
fi

# Create .env file
cat > .env << 'EOF'
# Google Gemini API Key
GEMINI_API_KEY=AIzaSyDjVr31b-rlEtYarFHhSqY9pcOZhrlEm7w

# Fish Audio API Key
FISH_AUDIO_API_KEY=53291a1bef4d440fbfa983a76fd10e99

# Preferred AI Model (gemini or openai)
PREFERRED_MODEL=gemini

# Environment
NODE_ENV=development

# Optional: Debug mode
DEBUG=false
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📋 Your configuration:"
echo "  GEMINI_API_KEY: AIzaSy...lEm7w"
echo "  FISH_AUDIO_API_KEY: 53291a...10e99"
echo "  PREFERRED_MODEL: gemini"
echo ""
echo "🚀 You can now run:"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "🔒 Security: .env is in .gitignore and won't be committed to Git"

