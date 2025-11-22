# FactCheckFactSource

A comprehensive fact-checking and source verification platform consisting of:
- **Chrome Extension**: Browser extension for real-time fact checking
- **Web Application**: Next.js-based web interface for fact verification

## Project Structure

```
FactCheckFactSource/
├── chrome-extension/    # Chrome browser extension
└── webapp/              # Next.js web application
```

## Chrome Extension

A browser extension that enables users to fact-check content and verify sources directly in their browser.

### Getting Started

1. Navigate to the extension directory:
   ```bash
   cd chrome-extension
   ```

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome-extension` directory

3. The extension icon will appear in your browser toolbar

### Features

- Real-time fact checking on web pages
- Source verification
- Interactive popup interface
- Background processing for analysis

For more details, see the [Chrome Extension README](chrome-extension/README.md).

## Web Application

A Next.js web application providing a comprehensive interface for fact-checking and source verification.

### Getting Started

1. Navigate to the webapp directory:
   ```bash
   cd webapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Linting**: ESLint

For more details, see the [Web Application README](webapp/README.md).

## Development

Both projects are set up with modern development tooling and best practices:

- TypeScript for type safety
- ESLint for code quality
- Production-ready build configurations

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing style conventions
- All linters and tests pass
- Changes are documented

## License

See LICENSE file for details.