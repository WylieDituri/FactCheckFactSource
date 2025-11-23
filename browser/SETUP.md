# Browser (Electron App) Setup

## Create .env File

The Electron browser app **does** use `.env` files. Create one now:

### Option 1: Manual Creation

Create a file named `.env` in the `browser` folder with this content:

```env
# Electron Browser - API Keys Configuration

# Google Gemini API Key
# Get yours at: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_key_here

# OpenAI API Key
# Get yours at: https://platform.openai.com/api-keys  
OPENAI_API_KEY=your_actual_key_here

# Preferred AI Model (gemini or openai)
PREFERRED_MODEL=gemini

# Environment
NODE_ENV=development
```

### Option 2: Command Line

```bash
cd /Users/patrickwang/Workspace/MadHacks/browser
cp env.template .env
# Then edit .env and add your API keys
```

### Option 3: Using nano/vim

```bash
cd /Users/patrickwang/Workspace/MadHacks/browser
nano .env
# Paste the content above, replace with your keys, save (Ctrl+O, Enter, Ctrl+X)
```

## Get API Keys

1. **Gemini** (Free): https://makersuite.google.com/app/apikey
2. **OpenAI** (Paid): https://platform.openai.com/api-keys

## Run the App

```bash
cd /Users/patrickwang/Workspace/MadHacks/browser
npm install  # if you haven't already
npm run dev
```

## Security Note

The `.env` file is in `.gitignore` - your keys won't be committed to Git.

