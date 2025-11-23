# Testing Guide - Chrome Extension Liquid Glass UI

## 🚀 Quick Start

### Step 1: Load the Extension

1. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

2. Enable **Developer mode** (toggle in the top-right corner)

3. Click **"Load unpacked"**

4. Navigate to and select:
   ```
   /Users/wyliedituri/FactCheckFactSource/chrome_extension
   ```

5. The extension should now appear in your extensions list with a checkmark ✅

---

### Step 2: Test the Popup Modal

1. **Navigate to any webpage** (e.g., a news article, blog post, etc.)

2. **Highlight some text** with your mouse

3. **Press the keyboard shortcut:**
   - **Mac:** `Cmd + Shift + F`
   - **Windows/Linux:** `Ctrl + Shift + F`

4. **Watch for the liquid glass modal** to slide in from the right! 🎉

---

### Step 3: What to Expect

The modal should:

✅ **Slide in smoothly from the right side** of the screen  
✅ Have a **translucent liquid glass background** with blur effect  
✅ Show the **highlighted text** in a styled quote box  
✅ Display **fact-check analysis** if available  
✅ Include **verified sources** (if data is returned)  
✅ Have **NO heavy shadow** - just a clean, minimal look  
✅ Be positioned as a **full-height column** on the right  

---

### Step 4: Test Text Formatting

Try highlighting text that contains markdown-style formatting:

**Example text to highlight:**
```
This is **bold text** and this is *italic text* and this is _underlined text_.
```

The modal should display:
- **bold text** → in bold
- *italic text* → in italics
- _underlined text_ → underlined

---

### Step 5: Test Interactions

**Close Button:**
- Click the ✕ button in the top-right
- Modal should smoothly fade out

**Click Outside:**
- Click anywhere on the dimmed background
- Modal should close

**Scroll:**
- If the content is long, test scrolling
- The scrollbar should be slim and styled
- The header should remain sticky at the top

---

## 🎨 Visual Features to Look For

### Glass Effect
- Background should be **semi-transparent**
- You should see **blurred webpage content** behind the modal
- The effect should look like **frosted glass**

### Right Column Layout
- Modal appears on the **far right** of the screen
- Width: **420px** (or 90vw on mobile)
- Height: **Full viewport height**
- Alignment: **Right edge of screen**

### No Shadow
- The modal should have **no dark box-shadow**
- Only a subtle **white border** on the left
- The overlay should be **barely visible** (20% black)

### Smooth Animations
- **Slide-in:** Cubic bezier easing from right
- **Fade-in:** Gentle opacity transition
- **Hover effects:** Scale and color changes on buttons

---

## 🐛 Troubleshooting

### Modal Not Appearing?
1. Check that the extension is **enabled** in `chrome://extensions/`
2. **Refresh the webpage** after loading the extension
3. Open the **Chrome DevTools Console** (F12) and look for errors
4. Verify you're pressing the correct keyboard shortcut

### No Glass Effect?
1. Ensure you're using a **modern browser** (Chrome 76+, Edge 79+)
2. Check if **backdrop-filter is supported** in your browser
3. Try a different webpage (some sites may have CSS conflicts)

### Text Not Formatted?
1. Make sure your highlighted text contains `**bold**`, `*italic*`, or `_underline_` syntax
2. Check that the `formatHighlightedText()` function is being called
3. View the HTML source in DevTools to verify formatting is applied

---

## 📱 Responsive Design

The modal adapts to different screen sizes:

- **Desktop (> 420px):** Fixed 420px width column
- **Mobile (< 420px):** Takes up 90% of viewport width
- **Height:** Always full viewport height (100vh)

---

## 🎯 Example Screenshots

### Before (Old Design)
```
┌─────────────────────────────────────────┐
│              Dark Overlay               │
│                                         │
│   ┌───────────────────────────┐        │
│   │  FactFinder Modal         │        │
│   │  (Centered, white box)    │        │
│   │  Heavy shadow             │        │
│   └───────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

### After (New Liquid Glass Design)
```
┌────────────────────────────┬────────────┐
│   Subtle Backdrop          │ 🔍 Fact ✕ │
│   (barely visible)         ├────────────┤
│                            │            │
│                            │ [Badge]    │
│                            │            │
│                            │ Quote Box  │
│                            │            │
│                            │ Analysis   │
│                            │            │
│                            │ Sources    │
│   Webpage Content          │            │
│   (blurred behind)         │            │
│                            │            │
│                            │            │
│                            │            │
└────────────────────────────┴────────────┘
       Main Content          Glass Column
                             (420px wide)
```

---

## ✅ Success Criteria

Your extension is working correctly if:

- ✅ Modal slides in from the right side
- ✅ Background has a translucent glass effect
- ✅ No heavy shadows are visible
- ✅ Text formatting (bold/italic/underline) displays correctly
- ✅ Header stays sticky when scrolling
- ✅ Close button works smoothly
- ✅ Hover effects are responsive
- ✅ The scrollbar is slim and styled

---

**Happy Testing!** 🎉

If you encounter any issues, check the browser console for error messages and verify that all files are properly saved.
