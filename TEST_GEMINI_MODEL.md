# 🧪 Test Which Gemini Model Actually Works

## Critical Question
You said the browser is working 100%. Let's verify which model it's actually using!

## Test 1: Browser App (Current State)

```bash
cd /Users/patrickwang/Workspace/MadHacks/browser

# Restart to pick up the fixed .env
npm run dev
```

**Then in the browser:**
1. Go to any website
2. Highlight some text  
3. Press `Cmd+Shift+F`
4. **Does it work?** Yes / No
5. Open DevTools (View → Toggle Developer Tools)
6. Look in Console - what model does it say it used?

## Test 2: Check API Directly

Run this in your terminal to test which models work with your API key:

```bash
cd /Users/patrickwang/Workspace/MadHacks

# Test gemini-pro
echo "Testing gemini-pro..."
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDjVr31b-rlEtYarFHhSqY9pcOZhrlEm7w" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}' \
  | grep -E '"candidates"|"error"' | head -5

echo ""
echo "Testing gemini-1.5-flash..."
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDjVr31b-rlEtYarFHhSqY9pcOZhrlEm7w" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}' \
  | grep -E '"candidates"|"error"' | head -5

echo ""
echo "Testing gemini-1.5-pro..."
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=AIzaSyDjVr31b-rlEtYarFHhSqY9pcOZhrlEm7w" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}' \
  | grep -E '"candidates"|"error"' | head -5
```

**Look for:**
- ✅ If you see `"candidates"` - that model WORKS!
- ❌ If you see `"error"` - that model doesn't work

## Test 3: List Available Models

```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDjVr31b-rlEtYarFHhSqY9pcOZhrlEm7w" \
  | grep '"name"' | head -20
```

This shows ALL available models for your API key.

## Possible Issue

I suspect your API key might be a **newer/restricted** key that only has access to newer Gemini models like:
- `gemini-1.5-flash`
- `gemini-1.5-pro`  
- `gemini-1.5-flash-001`
- `gemini-1.5-pro-001`

But NOT the older:
- `gemini-pro` (older model)
- `gemini-1.0-pro`

## What to Do Next

After running the tests above, tell me:
1. Which model test showed `"candidates"`?
2. What models are listed in Test 3?
3. Does the browser fact-check currently work?

Then I'll update BOTH the browser and Chrome extension to use the correct model!

---

**The key is finding which model YOUR specific API key has access to!** 🔑

