# Plain JavaScript Version

This folder contains a simplified, plain JavaScript version of the Carmonic Verify extension without React or build tools.

## Structure

```
plain/
├── manifest.json          # Manifest V3
├── background.js          # Service worker
├── content.js            # Content script
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── options.html          # Options page
├── options.js            # Options logic
├── styles.css            # Shared styles
└── utils.js              # Shared utilities
```

## How to Use

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `plain/` folder
5. Configure API key in extension options

## Key Differences from Main Version

- ✅ **No build step**: Ready to load immediately
- ✅ **No dependencies**: Pure vanilla JavaScript
- ✅ **Simpler**: Easier to understand and modify
- ❌ **No React**: Basic DOM manipulation
- ❌ **No hot reload**: Manual refresh required
- ❌ **No modern bundling**: Larger file sizes

## Use Cases

- **Learning**: Understand Chrome extension basics
- **Quick testing**: No build setup required
- **Simple modifications**: Edit and reload
- **Minimal deployment**: No build artifacts

## Recommendation

For production use, we recommend the main Vite + React version for better performance, maintainability, and developer experience.

