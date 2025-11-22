# FactCheck FactSource Chrome Extension

A Chrome extension for fact-checking and source verification.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `chrome-extension` directory from this repository

## Files Structure

- `manifest.json` - Extension configuration and permissions
- `popup.html` - Extension popup interface
- `popup.css` - Styling for the popup
- `popup.js` - Popup interaction logic
- `background.js` - Background service worker
- `content.js` - Content script that runs on web pages
- `icons/` - Extension icons (add your own icon images here)

## Features

- Click the extension icon to open the popup
- Click "Check Facts" button to analyze the current page
- Content script analyzes page text
- Background worker handles extension lifecycle

## Development

To make changes:
1. Edit the files in this directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card to reload changes

## Icon Requirements

Add icon files to the `icons/` directory:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Next Steps

- Implement actual fact-checking logic
- Add API integration for fact verification
- Create more sophisticated content analysis
- Add user preferences and settings
