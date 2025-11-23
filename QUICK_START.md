# 🚀 Quick Start Guide

## Your API Keys:
- **Gemini**: `AIzaSyDjVr31b-rlEtYarFHhSqY9pcOZhrlEm7w`
- **Fish Audio**: `53291a1bef4d440fbfa983a76fd10e99`

---

## ⚡ 3-Minute Setup

### 1️⃣ Chrome Extension (3 steps)

```bash
# Step 1: Load in Chrome
# Open chrome://extensions/ → Enable Developer mode → Load unpacked
# Select: /Users/patrickwang/Workspace/MadHacks/chrome_extension

# Step 2: Configure API key
# Right-click extension icon → Options
# Paste: AIzaSyDjVr31b-rlEtYarFHhSqY9pcOZhrlEm7w
# Click: Save Settings

# Step 3: Test it!
# Go to any webpage → Highlight text → Press Cmd+Shift+F
```

### 2️⃣ Electron Browser (3 commands)

```bash
cd /Users/patrickwang/Workspace/MadHacks/browser
bash setup-env.sh
npm run dev
```

---

## 🔒 Commit Safely

Your `.gitignore` already protects `.env` files! Just follow this workflow:

```bash
# Check what will be committed
git status

# If .env appears (it shouldn't), remove it:
git reset .env browser/.env

# Safe to commit everything else
git add .
git commit -m "Your commit message"
git push origin main
```

**✅ Your API keys are safe because:**
- Chrome extension stores keys in Chrome's storage (not files)
- Browser app stores keys in `.env` (which is in `.gitignore`)
- Neither can be committed to Git!

---

## 🧪 Verify Everything Works

```bash
bash verify-api-setup.sh
```

This checks:
- Chrome extension is set up correctly
- Browser .env file exists
- .gitignore is protecting your keys
- Nothing unsafe is staged for commit

---

## 📚 Detailed Guides

- Chrome Extension Setup: [`chrome_extension/START_HERE.md`](chrome_extension/START_HERE.md)
- API Configuration: [`chrome_extension/CONFIGURE_API_KEYS.md`](chrome_extension/CONFIGURE_API_KEYS.md)
- Commit Safety: [`COMMIT_SAFELY.md`](COMMIT_SAFELY.md)
- Full API Guide: [`API_KEYS_SETUP.md`](API_KEYS_SETUP.md)

---

## ❓ FAQ

### "My terminal export commands didn't work for Chrome extension?"
**Answer:** Correct! Terminal exports only work for Node.js/Electron apps. Chrome extensions use Chrome's Options page to configure keys.

### "Will my API keys be committed to Git?"
**Answer:** No! 
- Chrome extension: Keys stored in Chrome (not in files)
- Browser app: Keys in `.env` (which is in `.gitignore`)

### "Can I just put keys directly in the code?"
**Answer:** NO! Never hardcode API keys. Always use:
- Chrome extension → Chrome storage (via Options page)
- Electron app → `.env` file

### "How do I know my keys are safe?"
**Answer:** Run `git status` before committing. If you don't see `.env` listed, you're safe!

---

## 🎯 TL;DR

```bash
# Chrome Extension: Use Options page (right-click icon)
# Electron Browser: Run setup script
cd browser && bash setup-env.sh && npm run dev

# Before every commit: Check git status
git status  # Should NOT show .env files

# You're safe to commit! 🎉
```

