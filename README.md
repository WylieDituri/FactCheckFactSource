# Custom Browser

A native browser app with a completely custom interface built on Chromium using Electron.

## Features

- **Custom Landing Page**: Beautiful gradient homepage with quick access categories
- **Custom Search Interface**: Your own search results page with formatted content cards
- **Custom Content Display**: External pages displayed in your branded interface
- **History Management**: Track and revisit your searches
- **Bookmarks**: Save and organize your favorite pages
- **Keyboard Shortcuts**: 
  - `Cmd/Ctrl + H` - View history
  - `Cmd/Ctrl + B` - View bookmarks
  - `Cmd/Ctrl + L` - Focus address bar
- **Modern UI**: Beautiful gradient design with glassmorphism effects
- **Cross-Platform**: Works on macOS, Windows, and Linux

## Key Differentiators

This browser uses Chromium's power while hiding Chrome's branding:
- ✅ Real Google search results (powered by Chromium)
- ✅ Full web browsing with actual page loading
- ✅ Your own branded interface wrapping the content
- ✅ Custom navigation bar and controls
- ✅ Chromium engine under the hood
- ❌ No Chrome UI elements or branding visible

**How it works:** The browser uses Electron's webview to load real websites and Google search results, but displays them within your custom-designed interface. Users see your branding and navigation, while getting the full power of Chromium for rendering web content.

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Browser

Development mode (with DevTools):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Building Standalone Apps

Build for your current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

The built applications will be in the `dist` folder.

## Project Structure

```
.
├── main.js           # Electron main process
├── preload.js        # Preload script for IPC
├── index.html        # Browser UI
├── styles.css        # Styling
├── renderer.js       # Browser logic
└── package.json      # Dependencies and scripts
```

## Technology Stack

- **Electron**: Framework for building cross-platform desktop apps
- **Chromium**: The underlying browser engine
- **Node.js**: Backend runtime
- **HTML/CSS/JavaScript**: Frontend technologies

## Architecture

The browser uses Electron's `webview` tag to embed multiple Chromium instances, each representing a tab. The main process handles window management, while the renderer process manages the browser UI and tab interactions.

## Security

- Context isolation enabled
- Node integration disabled in webviews
- Secure IPC communication between processes
- User agent string configured for compatibility

## Future Enhancements

- [ ] History management
- [ ] Download manager
- [ ] Extensions support
- [ ] Settings panel
- [ ] Private browsing mode
- [ ] Password manager
- [ ] Sync across devices

## License

MIT
