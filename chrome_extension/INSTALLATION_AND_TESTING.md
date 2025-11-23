# Extension Installation and Testing Guide

## ✅ Build Status
**Last Build**: Successful - November 23, 2024
**Merge Conflicts**: All Resolved
**Build Output**: `/Users/wyliedituri/FactCheckFactSource/chrome_extension/dist`

---

## 🚀 Installation Instructions

### 1. Load Extension in Chrome

1. Open Google Chrome
2. Navigate to: `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the folder: `/Users/wyliedituri/FactCheckFactSource/chrome_extension/dist`

### 2. Verify Installation

After loading, you should see:
- ✅ Extension appears in the extensions list
- ✅ Custom logo (IMG_2285.PNG) displays in the toolbar
- ✅ Extension name: "FactFinder"
- ✅ No error messages

---

## 🧪 Testing Checklist

### Basic Functionality Tests

#### Test 1: Extension Icon
- [ ] Logo appears in Chrome toolbar
- [ ] Logo is clear and not pixelated
- [ ] Clicking icon opens popup (if implemented)

#### Test 2: Keyboard Shortcut
- [ ] Navigate to any webpage
- [ ] Highlight some text
- [ ] Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)
- [ ] Modal should slide in from the right

#### Test 3: Modal Display
- [ ] Modal has liquid glass effect (translucent with blur)
- [ ] Purple gradient header displays correctly
- [ ] Logo appears in modal header (top-left)
- [ ] Close button appears (top-right)
- [ ] Modal width is approximately 420px
- [ ] Modal has rounded corners on the left side

#### Test 4: Modal Interaction
- [ ] Modal smoothly animates in from the right
- [ ] Click close button - modal disappears
- [ ] Click outside modal (on overlay) - modal closes
- [ ] Scrolling works smoothly inside modal
- [ ] Custom scrollbar appears on the right

#### Test 5: Content Display
Test with this sample text:
```
The Earth is flat according to some conspiracy theorists.
```

Expected behavior:
- [ ] Selected text appears in a quote box
- [ ] Quote has purple left border
- [ ] Text is properly formatted
- [ ] Background has subtle glass effect

---

## 🎨 Visual Verification

### Header Styling
- **Background**: Purple gradient (#667eea → #764ba2)
- **Logo**: 32x32px, white background
- **Title**: "FactFinder" in white, bold
- **Close Button**: White circle with × icon

### Modal Body
- **Background**: Semi-transparent white with blur
- **Text Color**: Dark gray (#333)
- **Quote Box**: Light purple background, purple left border
- **Source Cards**: White cards with glass effect

### Animations
- **Modal Entry**: Slides in from right, 300ms
- **Hover Effects**: Smooth color transitions
- **Close**: Fades out smoothly

---

## 🔧 Advanced Testing

### Test with Real Data

1. **News Article Test**:
   - Go to a news website (e.g., CNN, BBC)
   - Highlight a factual claim
   - Press `Ctrl+Shift+F`
   - Check if API response displays correctly

2. **YouTube Test** (if implemented):
   - Go to a YouTube video
   - Look for fact-check button near video controls
   - Click to test claim analysis

3. **Multiple Claims Test**:
   - Highlight text with multiple claims
   - Verify all claims are listed
   - Check status badges (TRUE/FALSE/MIXED)

### Performance Testing

- [ ] Modal opens quickly (< 300ms)
- [ ] No lag when scrolling modal content
- [ ] No layout shifts or flickering
- [ ] Blur effect performs smoothly

### Edge Cases

- [ ] Test with very long text (500+ characters)
- [ ] Test with special characters (quotes, emojis)
- [ ] Test with formatted text (bold, italic, links)
- [ ] Test on mobile viewport (if responsive)

---

## 🐛 Known Issues

### Minor Issues
1. **Unused Variable Warning**: `activePopup` in content-script.js (line 9)
   - **Impact**: None - just a linting warning
   - **Fix**: Can be safely removed if not planning to use

### Browser Compatibility
- **Tested**: Chrome/Chromium-based browsers
- **Not Tested**: Firefox, Safari (requires different manifest format)

---

## 📊 Extension Structure Verification

### Files in dist/ folder:
```
dist/
├── IMG_2285.PNG              ✅ Logo asset
├── manifest.json             ✅ Extension config
├── src/
│   ├── background/
│   │   └── service-worker.js ✅ Background script
│   ├── content/
│   │   ├── content-script.js ✅ Content script
│   │   └── content-styles.css ✅ Styles
│   ├── popup/
│   │   ├── popup.html        ✅ Popup UI
│   │   ├── popup.js          ✅ Popup logic
│   │   └── popup.css         ✅ Popup styles
│   └── options/
│       ├── options.html      ✅ Settings page
│       ├── options.js        ✅ Settings logic
│       └── options.css       ✅ Settings styles
└── chunks/                   ✅ Code splitting
```

---

## 🔍 Debugging Tips

### If Modal Doesn't Appear:
1. Open Chrome DevTools (F12)
2. Check Console for errors
3. Look for messages starting with "FactFinder:"
4. Verify content script injected: `document.getElementById('factfinder-modal')`

### If Logo Doesn't Show:
1. Open DevTools → Network tab
2. Try to open modal
3. Look for failed request to "IMG_2285.PNG"
4. Check manifest.json has correct `web_accessible_resources`

### If Styles Look Wrong:
1. Inspect modal element in DevTools
2. Check if `content-styles.css` loaded
3. Verify `backdrop-filter` is supported (requires Chrome 76+)
4. Check computed styles for `.factfinder-modal-content`

### Console Commands for Testing:
```javascript
// Check if content script loaded
console.log(document.querySelector('#factfinder-modal'));

// Manually trigger modal (after highlighting text)
document.dispatchEvent(new KeyboardEvent('keydown', {
  key: 'f',
  ctrlKey: true,
  shiftKey: true
}));

// Check logo URL
chrome.runtime.getURL('IMG_2285.PNG');
```

---

## ✅ Success Criteria

Your extension is working correctly if:
1. ✅ Extension loads without errors
2. ✅ Logo displays in toolbar and modal
3. ✅ Modal opens with keyboard shortcut
4. ✅ Liquid glass effect is visible
5. ✅ All animations are smooth
6. ✅ Text highlighting works
7. ✅ Modal closes properly
8. ✅ No console errors

---

## 📝 Next Steps After Testing

If all tests pass:
1. **Package Extension**: Zip the dist folder for distribution
2. **Submit to Store**: Follow Chrome Web Store guidelines
3. **User Testing**: Get feedback from real users
4. **Monitor Errors**: Set up error tracking

If tests fail:
1. Document the specific issue
2. Check browser console for errors
3. Verify all files are in dist folder
4. Review MERGE_RESOLUTION_SUMMARY.md for potential issues

---

## 📞 Support

For issues or questions:
- Check console logs for error messages
- Review MERGE_RESOLUTION_SUMMARY.md
- Verify build completed successfully
- Ensure Chrome version supports backdrop-filter (Chrome 76+)

**Happy Testing! 🎉**
