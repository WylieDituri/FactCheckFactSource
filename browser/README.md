# 🌐 AI-Powered Fact-Checking Browser

A Chromium-based browser built with Electron that includes real-time fact-checking powered by AI.

## ✨ Features

### 🎤 Voice Recording & Fact-Checking
- Click the microphone button in the toolbar
- Record your voice
- Automatic transcription using Fish Audio API
- Instant AI fact-checking with Gemini or ChatGPT
- Download results as JSON

### 📷 Camera Capture & Text Extraction
- Click the camera button in the toolbar
- Capture images containing text
- Automatic OCR using Gemini Vision or GPT-4 Vision
- Instant fact-checking of extracted text
- Download results as JSON

### ⌨️ Keyboard Shortcut Fact-Checking
- Highlight any text on any webpage
- Press **Ctrl+Shift+F** (Windows/Linux) or **Cmd+Shift+F** (Mac)
- Instant AI-powered fact-checking
- Works inside any website (Amazon, YouTube, news sites, etc.)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up API Keys

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
FISH_AUDIO_API_KEY=your_actual_key_here
GOOGLE_API_KEY=your_actual_key_here
OPENAI_API_KEY=your_actual_key_here
```

**Get API Keys:**
- **Fish Audio**: https://fish.audio/account
- **Google Gemini**: https://makersuite.google.com/app/apikey
- **OpenAI**: https://platform.openai.com/api-keys

### 3. Run the Browser

```bash
npm start
```

## 🎯 How to Use

### Voice Fact-Checking
1. Click the 🎤 microphone button
2. Click "Start Recording"
3. Speak your statement
4. Click "Stop Recording"
5. Wait for transcription and automatic fact-check

### Camera Fact-Checking
1. Click the 📷 camera button
2. Click "Start Camera"
3. Point camera at text
4. Click "Capture Image"
5. Wait for text extraction and automatic fact-check

### Keyboard Shortcut Fact-Checking
1. Navigate to any website (e.g., amazon.com, news sites)
2. Highlight any text
3. Press **Ctrl+Shift+F** (or **Cmd+Shift+F** on Mac)
4. View instant fact-check results

## 📁 Project Structure

```
browser/
├── main.js                      # Electron main process
├── preload.js                   # Preload script (IPC bridge)
├── renderer.js                  # Browser UI logic
├── index.html                   # Main HTML structure
├── styles.css                   # UI styles
├── config.js                    # Configuration
├── fish-audio-client.js         # Fish Audio API client
├── gemini-client.js             # Google Gemini AI client
├── openai-client.js             # OpenAI ChatGPT client
├── camera-handler.js            # Camera capture logic
├── highlight-fact-check.js      # Keyboard shortcut handler
├── webview-content-script.js    # Injected into webviews
├── package.json                 # Node.js dependencies
└── .env                         # API keys (create from .env.example)
```

## 🔑 API Keys Required

| Service | Purpose | Required |
|---------|---------|----------|
| **Fish Audio** | Speech-to-text transcription | ✅ For voice feature |
| **Google Gemini** | AI fact-checking & vision | ✅ Primary AI |
| **OpenAI** | Alternative AI fact-checking | ⚠️ Optional fallback |

**Note**: You need at least Fish Audio + (Gemini OR OpenAI) for full functionality.

## 🎨 UI Features

- Modern gradient design
- Smooth animations
- Real-time loading indicators
- Toast notifications
- Beautiful formatted fact-check results
- Responsive modal dialogs

## 🔧 Development

### Run in Development Mode

```bash
npm run dev
```

This opens DevTools automatically for debugging.

### Build for Production

```bash
npm run build         # All platforms
npm run build:mac     # macOS only
npm run build:win     # Windows only
npm run build:linux   # Linux only
```

## 🐛 Troubleshooting

### "API key not configured"
- Make sure you've created a `.env` file from `.env.example`
- Verify your API keys are correct
- Restart the application after adding keys

### Keyboard shortcut not working
- Make sure you're pressing Ctrl+Shift+F (or Cmd+Shift+F on Mac)
- Ensure text is highlighted before pressing the shortcut
- Check console for error messages

### Transcription not working
- Verify your Fish Audio API key is valid
- Check if your Fish Audio account has credits
- Ensure microphone permissions are granted

### Camera not working
- Grant camera permissions when prompted
- Check if another application is using the camera
- Try restarting the browser

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and pull requests!

## ⚠️ Security Note

**NEVER commit your `.env` file to version control!**

The `.env` file contains sensitive API keys and is already in `.gitignore`.

