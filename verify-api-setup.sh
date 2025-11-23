#!/bin/bash
# Verify API key configuration for both Chrome extension and Electron app

echo "🔍 Verifying API Key Setup..."
echo ""
echo "================================"
echo "📦 Chrome Extension"
echo "================================"

if [ -d "chrome_extension" ]; then
    echo "✅ Chrome extension folder exists"
    
    if [ -f "chrome_extension/manifest.json" ]; then
        echo "✅ manifest.json found"
    else
        echo "❌ manifest.json NOT found"
    fi
    
    echo ""
    echo "📝 Chrome Extension Configuration:"
    echo "   API keys are stored in Chrome's local storage"
    echo "   NOT in any files (so they can't be committed!)"
    echo ""
    echo "   To configure:"
    echo "   1. Load extension in Chrome (chrome://extensions/)"
    echo "   2. Right-click extension icon → Options"
    echo "   3. Enter API key: AIzaSy...lEm7w"
    echo "   4. Click Save Settings"
    echo ""
else
    echo "❌ chrome_extension folder NOT found"
fi

echo "================================"
echo "🖥️  Electron Browser App"
echo "================================"

if [ -d "browser" ]; then
    echo "✅ Browser folder exists"
    
    if [ -f "browser/.env" ]; then
        echo "✅ .env file exists"
        
        # Check for API keys (without showing them)
        if grep -q "GEMINI_API_KEY=AIza" browser/.env; then
            echo "✅ GEMINI_API_KEY configured"
        else
            echo "⚠️  GEMINI_API_KEY missing or not configured"
        fi
        
        if grep -q "FISH_AUDIO_API_KEY=" browser/.env; then
            echo "✅ FISH_AUDIO_API_KEY configured"
        else
            echo "⚠️  FISH_AUDIO_API_KEY missing or not configured"
        fi
    else
        echo "❌ .env file NOT found"
        echo ""
        echo "   To create it:"
        echo "   cd browser"
        echo "   bash setup-env.sh"
    fi
    
    if [ -f "browser/package.json" ]; then
        echo "✅ package.json found"
    else
        echo "❌ package.json NOT found"
    fi
else
    echo "❌ browser folder NOT found"
fi

echo ""
echo "================================"
echo "🔒 Git Safety Check"
echo "================================"

if [ -f ".gitignore" ]; then
    echo "✅ .gitignore exists"
    
    if grep -q "\.env" .gitignore; then
        echo "✅ .env is in .gitignore (safe!)"
    else
        echo "⚠️  .env NOT in .gitignore (UNSAFE!)"
        echo "   Add it now:"
        echo "   echo '.env' >> .gitignore"
    fi
else
    echo "❌ .gitignore NOT found (UNSAFE!)"
fi

# Check if .env would be committed
if git check-ignore browser/.env > /dev/null 2>&1; then
    echo "✅ browser/.env is ignored by git (safe!)"
else
    echo "⚠️  browser/.env might be committed (check .gitignore)"
fi

# Check if any .env files are staged
if git diff --cached --name-only 2>/dev/null | grep -q "\.env"; then
    echo "🚨 WARNING: .env file is staged for commit!"
    echo "   Run: git reset browser/.env"
else
    echo "✅ No .env files staged for commit"
fi

echo ""
echo "================================"
echo "📊 Summary"
echo "================================"

echo ""
echo "Next steps:"
echo ""
echo "For Chrome Extension:"
echo "  1. Open Chrome → chrome://extensions/"
echo "  2. Load unpacked → Select 'chrome_extension' folder"
echo "  3. Right-click icon → Options"
echo "  4. Enter Gemini API key and Save"
echo ""
echo "For Electron Browser:"
if [ -f "browser/.env" ]; then
    echo "  ✅ Already configured!"
    echo "  Run: cd browser && npm run dev"
else
    echo "  1. cd browser"
    echo "  2. bash setup-env.sh"
    echo "  3. npm install"
    echo "  4. npm run dev"
fi

echo ""
echo "✅ Setup verification complete!"

