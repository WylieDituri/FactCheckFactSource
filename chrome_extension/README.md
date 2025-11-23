# 🔍 Carmonic Verify - AI-Powered Fact-Checking Chrome Extension

A powerful Chrome extension that brings AI-powered fact-checking to any webpage. Highlight text, press a hotkey, and get instant verification using Google Gemini or OpenAI ChatGPT.

## ✨ Features

- **🎯 Keyboard Shortcut**: Press `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac) to fact-check highlighted text
- **🖱️ Context Menu**: Right-click selected text and choose "Fact Check Selection"
- **🤖 Dual AI Support**: Choose between Google Gemini and OpenAI ChatGPT
- **📊 Confidence Scoring**: Visual confidence score for each fact-check
- **📝 History Tracking**: Recent fact-checks saved for quick reference
- **⚡ Fast & Lightweight**: Built with Vite for optimal performance
- **🔒 Secure**: API keys stored securely in Chrome storage

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd chrome_extension
npm install
```

### 2. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `/Users/patrickwang/Workspace/MadHacks/chrome_extension` folder
   - ⚠️ **Important**: Select `chrome_extension`, NOT `chrome_extension/src`!

### 3. Configure API Keys (Required!)

**Chrome extensions don't use .env files!** Follow these steps:

1. **Get an API Key** (choose one or both):
   - **Gemini** (Recommended - Free): https://makersuite.google.com/app/apikey
   - **OpenAI** (Paid): https://platform.openai.com/api-keys

2. **Open Extension Options**:
   - Right-click the extension icon in Chrome toolbar
   - Select "Options"
   
   OR
   
   - Go to `chrome://extensions/`
   - Find "Carmonic Verify" → Click "Details" → "Extension options"

3. **Enter your API key(s)**:
   - Paste your Gemini API key in the first field
   - (Optional) Paste your OpenAI API key
   - Choose preferred model
   - Click "Save Settings"

📖 **Detailed instructions**: See [API_SETUP.md](./API_SETUP.md)

### 4. Start Using!

- Highlight text on any webpage
- Press `Cmd+Shift+F` (Mac) or `Ctrl+Shift+F` (Windows/Linux)
- Or right-click → "🔍 Fact Check Selection"

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

The built extension will be in the `dist/` folder.

### Create Distribution ZIP

```bash
npm run zip
```

This creates `carmonic-verify.zip` ready for Chrome Web Store upload.

## 📖 How to Use

### Method 1: Keyboard Shortcut (Recommended)
1. Navigate to any webpage
2. Highlight text you want to fact-check
3. Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)
4. View results in the modal

### Method 2: Context Menu
1. Highlight text on any webpage
2. Right-click
3. Select "🔍 Fact Check Selection"
4. View results in the modal

### Method 3: Extension Popup
1. Click the extension icon
2. Paste text in the "Quick Check" box
3. Click "Fact Check"
4. View results

## 🔑 API Keys

You need at least one API key:

### Google Gemini (Recommended)
- Get key: https://makersuite.google.com/app/apikey
- Model: `gemini-1.5-flash`
- Free tier available

### OpenAI ChatGPT
- Get key: https://platform.openai.com/api-keys
- Model: `gpt-4o`
- Requires billing setup

## 📁 Project Structure

```
chrome_extension/
├── src/
│   ├── background/
│   │   └── service-worker.js     # Background script
│   ├── content/
│   │   ├── content-script.js     # Content script
│   │   └── content-styles.css    # Injected styles
│   ├── popup/
│   │   ├── popup.html           # Extension popup
│   │   ├── popup.css            # Popup styles
│   │   └── popup.js             # Popup logic
│   ├── options/
│   │   ├── options.html         # Settings page
│   │   ├── options.css          # Settings styles
│   │   └── options.js           # Settings logic
│   └── utils/
│       ├── api-client.js        # API client
│       └── storage.js           # Storage utilities
├── public/
│   ├── icon16.png              # Extension icons
│   ├── icon48.png
│   └── icon128.png
├── tests/                      # Unit tests
├── plain/                      # Plain JS version (no React)
├── manifest.json              # Extension manifest
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies

```

## 🧪 Testing

Run unit tests:
```bash
npm test
```

Run tests with UI:
```bash
npm test:ui
```

## 🔒 Security & Privacy

- ✅ **No data collection**: All processing happens locally
- ✅ **Secure API storage**: Keys stored in Chrome's encrypted storage
- ✅ **Minimal permissions**: Only requests necessary permissions
- ✅ **CSP compliant**: Strict Content Security Policy
- ✅ **Open source**: Audit the code yourself

## 📝 Permissions Explained

| Permission | Why Needed |
|-----------|-----------|
| `activeTab` | Read selected text from current tab |
| `contextMenus` | Add right-click menu option |
| `storage` | Save settings and history |
| `scripting` | Inject content script for UI |
| `host_permissions` | Call Gemini/OpenAI APIs |

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development mode
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run unit tests
- `npm run lint` - Lint code
- `npm run zip` - Create distribution zip

### Tech Stack

- ⚡ **Vite**: Fast build tool
- ⚛️ **React**: UI framework (popup/options)
- 🎨 **Vanilla JS**: Content scripts
- 🧪 **Vitest**: Unit testing
- 📦 **Chrome Manifest V3**: Latest extension API

## 🚢 Publishing to Chrome Web Store

1. Build the extension:
```bash
npm run zip
```

2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

3. Upload `carmonic-verify.zip`

4. Fill in store listing details

5. Submit for review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file

## 🆘 Support

- **Issues**: Report bugs on GitHub
- **Email**: support@carmonic.com
- **Docs**: Full documentation at docs.carmonic.com

## 🎯 Roadmap

- [ ] Add more AI models (Claude, etc.)
- [ ] Source citation with links
- [ ] Batch fact-checking
- [ ] Custom fact-check templates
- [ ] Export reports as PDF
- [ ] Dark mode

## ⚡ Quick Tips

1. **Change hotkey**: Go to `chrome://extensions/shortcuts` to customize
2. **Multiple checks**: History saves last 50 checks
3. **Switch models**: Change in settings for different analysis styles
4. **Privacy**: API keys never leave your device except for API calls

---

Made with ❤️ by the Carmonic team

