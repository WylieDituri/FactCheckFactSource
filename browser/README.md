# Browser — Environment variables

This folder contains the Electron-based browser app. To securely provide API keys
for development, create a `.env` file in this folder (a template is provided as
`.env.example`). The repo-level `.gitignore` already ignores `.env` files.

Steps:

1. Copy the example file:

   cp .env.example .env

2. Open `.env` and paste your real keys:

   GEMINI_API_KEY=your_real_gemini_key_here
   FISH_AUDIO_API_KEY=your_real_fish_audio_key_here

3. Start the app from this folder so the `.env` file is loaded automatically:

   npm install    # if you haven't already
   npm run dev

Notes:
- `browser/main.js` loads the `.env` file from this folder using `dotenv`.
- Access keys in the main process with `process.env.GEMINI_API_KEY`.
- If you need the renderer to access keys, expose only required values via
  secure IPC from the main process — avoid putting secrets directly into
  renderer bundles that could be inspected by end users.
# 🌐 AI-Powered Fact-Checking Browser

A Chromium-based browser built with Electron that includes real-time fact-checking powered by AI.

## Features

### Voice Recording & Fact-Checking
- Click the microphone button in the toolbar
- Record your voice
- Automatic transcription using Fish Audio API
- Instant AI fact-checking with Gemini or ChatGPT
- Download results as JSON

### Camera Capture & Text Extraction
- Click the camera button in the toolbar
- Capture images containing text
- Automatic OCR using Gemini Vision or GPT-4 Vision
- Instant fact-checking of extracted text
- Download results as JSON

### Keyboard Shortcut Fact-Checking
- Highlight any text on any webpage
- Press **Ctrl+Shift+F** (Windows/Linux) or **Cmd+Shift+F** (Mac)
- Instant AI-powered fact-checking
- Works inside any website (Amazon, YouTube, news sites, etc.)