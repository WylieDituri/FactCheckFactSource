# Design System - Liquid Glass Theme

## 🎨 Color Palette

### Primary Colors
```css
--glass-white: rgba(255, 255, 255, 0.7);
--glass-white-hover: rgba(255, 255, 255, 0.85);
--glass-overlay: rgba(0, 0, 0, 0.2);
--accent-purple: #667eea;
--accent-purple-light: rgba(102, 126, 234, 0.08);
```

### Status Colors
```css
/* TRUE / VERIFIED */
--status-true-bg: rgba(76, 175, 80, 0.15);
--status-true-text: #2e7d32;

/* FALSE / DEBUNKED */
--status-false-bg: rgba(244, 67, 54, 0.15);
--status-false-text: #c62828;

/* MIXED / MISLEADING */
--status-mixed-bg: rgba(255, 152, 0, 0.15);
--status-mixed-text: #ef6c00;
```

### Text Colors
```css
--text-primary: #333;
--text-secondary: #555;
--text-tertiary: #666;
--text-muted: #888;
--text-light: #999;
```

---

## 🔮 Glass Effects

### Backdrop Filters
```css
/* Main modal glass */
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);

/* Secondary panels */
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);

/* Overlay blur */
backdrop-filter: blur(2px);
-webkit-backdrop-filter: blur(2px);
```

### Background Colors
```css
/* Modal content */
background: rgba(255, 255, 255, 0.7);

/* Header */
background: rgba(255, 255, 255, 0.6);

/* Panels/Cards */
background: rgba(255, 255, 255, 0.5);

/* Glassy notification header */
background: rgba(255, 255, 255, 0.4);
```

---

## 📏 Spacing System

### Padding
```css
--padding-xs: 8px;
--padding-sm: 12px;
--padding-md: 16px;
--padding-lg: 20px;
--padding-xl: 24px;
```

### Margins
```css
--margin-sm: 10px;
--margin-md: 14px;
--margin-lg: 20px;
--margin-xl: 28px;
```

### Border Radius
```css
--radius-sm: 8px;
--radius-md: 10px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 50%;
```

---

## 🔤 Typography

### Font Families
```css
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-serif: Georgia, serif;
```

### Font Sizes
```css
--text-xs: 11px;
--text-sm: 13px;
--text-md: 14px;
--text-base: 15px;
--text-lg: 18px;
```

### Font Weights
```css
--weight-normal: 400;
--weight-semibold: 600;
--weight-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.3;
--leading-normal: 1.5;
--leading-relaxed: 1.6;
--leading-loose: 1.7;
```

### Letter Spacing
```css
--tracking-tight: -0.5px;
--tracking-wide: 0.5px;
--tracking-wider: 1px;
```

---

## 🎭 Animations

### Timing Functions
```css
--ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
--ease-default: ease;
--ease-in-out: ease-in-out;
```

### Durations
```css
--duration-fast: 0.2s;
--duration-normal: 0.3s;
--duration-slow: 0.4s;
```

### Keyframes
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { 
    transform: translateX(100%); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
}
```

---

## 📐 Layout

### Modal Dimensions
```css
--modal-width: 420px;
--modal-max-width: 90vw;
--modal-height: 100vh;
```

### Z-Index Scale
```css
--z-overlay: 2147483646;
--z-modal: 2147483647;
--z-header: 10;
```

---

## 🖱️ Interactive States

### Buttons
```css
/* Default */
.button {
  background: rgba(0, 0, 0, 0.05);
  color: #666;
  transition: all 0.2s;
}

/* Hover */
.button:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
  transform: scale(1.1);
}

/* Active */
.button:active {
  transform: scale(0.95);
}
```

### Links/Cards
```css
/* Default */
.card {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

/* Hover */
.card:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: #667eea;
  transform: translateX(-3px);
}
```

---

## 🎯 Component Styles

### Status Badge
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  backdrop-filter: blur(10px);
}
```

### Quote Box
```css
.quote-box {
  position: relative;
  padding: 18px 20px;
  background: rgba(102, 126, 234, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border-left: 3px solid #667eea;
}

.quote-mark {
  position: absolute;
  top: 12px;
  left: 16px;
  font-size: 40px;
  color: rgba(102, 126, 234, 0.3);
  font-family: Georgia, serif;
  line-height: 0;
}
```

### Scrollbar
```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
```

---

## 🔧 Utility Classes

### Glass Panels
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
```

### Section Headers
```css
.section-header {
  color: #333;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 14px;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 420px) {
  .modal-content {
    width: 90vw;
  }
}

/* Tablet */
@media (max-width: 768px) {
  .modal-content {
    width: 360px;
  }
}

/* Desktop (default) */
@media (min-width: 769px) {
  .modal-content {
    width: 420px;
  }
}
```

---

## 🎨 Browser Support

### Backdrop Filter Support
- ✅ Chrome 76+
- ✅ Edge 79+
- ✅ Safari 9+
- ✅ Firefox 103+
- ❌ IE 11 (fallback: solid background)

### Fallback Strategy
```css
/* For browsers that don't support backdrop-filter */
@supports not (backdrop-filter: blur(20px)) {
  .modal-content {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

---

## 🎯 Design Principles

1. **Minimalism** - Clean, uncluttered interface
2. **Clarity** - Easy to read and understand
3. **Fluidity** - Smooth animations and transitions
4. **Consistency** - Unified design language
5. **Accessibility** - Good contrast and readable text

---

**Last Updated:** December 2024  
**Design System Version:** 1.0.0
