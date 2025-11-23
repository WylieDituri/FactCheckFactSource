# 🚀 Browser Quick Start Guide

All browser files are now in the `browser/` folder!

## 📁 Structure

```
MadHacks/
├── browser/              ← All browser files here!
│   ├── *.js             (15 JavaScript files)
│   ├── *.html           (1 HTML file)
│   ├── *.css            (1 CSS file)
│   ├── *.json           (2 JSON files)
│   ├── README.md        (Full documentation)
│   └── .gitignore
│
├── Agent_Folder/        (Python AI agents)
└── adk-python/          (Google ADK)
```

## ⚡ Quick Start

### 1. Navigate to browser folder

```bash
cd browser
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create .env file

You need to create a `.env` file with your API keys:

```bash
# Create .env file
cat > .env << EOF
FISH_AUDIO_API_KEY=your_actual_key_here
GOOGLE_API_KEY=your_actual_key_here  
OPENAI_API_KEY=your_actual_key_here
EOF
```

**Get API Keys:**
- Fish Audio: https://fish.audio/account
- Google Gemini: https://makersuite.google.com/app/apikey
- OpenAI: https://platform.openai.com/api-keys

### 4. Run the browser

```bash
npm start
```

## ✨ Features

### 🎤 Voice Fact-Checking
1. Click microphone button
2. Record voice
3. Auto transcription + fact-check

### 📷 Camera Fact-Checking
1. Click camera button
2. Capture image with text
3. Auto OCR + fact-check

### ⌨️ Keyboard Shortcut
1. Highlight text on ANY website
2. Press **Ctrl+Shift+F** (or **Cmd+Shift+F**)
3. Instant fact-check!

## 📖 Full Documentation

See `browser/README.md` for complete documentation!

## 🎯 Testing the Keyboard Shortcut

1. Run the browser: `npm start`
2. Navigate to amazon.com
3. Search for any product
4. Highlight product description text
5. Press **Ctrl+Shift+F**
6. See instant AI fact-check! 🚀

