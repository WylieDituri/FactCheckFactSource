# 🚀 Quick Setup - START HERE!

## The "No API Key Found" Error - SOLVED!

Chrome extensions **don't use `.env` files**! Here's what to do:

## ✅ 3-Step Setup

### Step 1: Load Extension
1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" ON (top right)
4. Click "Load unpacked"
5. Select this folder: `/Users/patrickwang/Workspace/MadHacks/chrome_extension`

### Step 2: Get Free API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. **Copy the key** (keep it handy!)

### Step 3: Enter API Key in Extension
1. Find the extension icon in Chrome (puzzle piece icon)
2. **Right-click it** → Select "**Options**"
3. Paste your API key in the "Google Gemini API Key" field
4. Click "**Save Settings**"

## ✨ Test It!

1. Go to any webpage (like Wikipedia)
2. Highlight some text
3. Press `Cmd+Shift+F` (Mac) or `Ctrl+Shift+F` (Windows)
4. See the magic! ✨

## 🐛 Still Having Issues?

### Error: "Manifest file is missing"
- Make sure you selected `/chrome_extension/` folder
- NOT the `/chrome_extension/src/` subfolder!

### Error: "No API key found"
- Open extension Options (right-click icon → Options)
- Make sure you clicked "Save Settings"
- Try refreshing the webpage

### API Key Not Working?
- Verify your key at: https://makersuite.google.com/app/apikey
- Check for extra spaces when pasting
- Make sure the key hasn't been deleted

## 📚 More Help

- **Detailed Setup**: See [API_SETUP.md](./API_SETUP.md)
- **Full Documentation**: See [README.md](./README.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Still stuck?** The issue is NOT with `.env` files - Chrome extensions store keys in Chrome's local storage through the Options page! Follow Step 3 above carefully.

