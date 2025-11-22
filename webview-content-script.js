/**
 * Content Script for Webviews
 * Keyboard shortcut: Ctrl+Shift+F (or Cmd+Shift+F) to fact-check selected text
 */

(function() {
  'use strict';
  
  console.log('🔍 Webview fact-check content script loaded');
  
  // Listen for keyboard shortcut: Ctrl+Shift+F (or Cmd+Shift+F)
  document.addEventListener('keydown', (e) => {
    // Check for Ctrl+Shift+F or Cmd+Shift+F
    const isFactCheckShortcut = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f';
    
    if (isFactCheckShortcut) {
      e.preventDefault();
      e.stopPropagation();
      
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 0) {
        console.log('⌨️ Fact-check shortcut triggered:', text.substring(0, 50));
        
        // Try multiple methods to communicate with parent
        try {
          // Method 1: Try console.log with special marker for parent to detect
          console.log('FACT_CHECK_REQUEST:', JSON.stringify({ text: text }));
          
          // Method 2: Try IPC if available
          if (typeof require !== 'undefined') {
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('fact-check-from-webview', text);
          }
          
          // Method 3: Try window.postMessage
          window.postMessage({ type: 'FACT_CHECK_REQUEST', text: text }, '*');
          
          // Method 4: Try parent postMessage
          if (window.parent) {
            window.parent.postMessage({ type: 'FACT_CHECK_REQUEST', text: text }, '*');
          }
        } catch (err) {
          console.error('Failed to send fact-check request:', err);
        }
        
        // Show visual feedback
        showFactCheckFeedback();
      } else {
        showNoTextFeedback();
      }
      
      return false;
    }
  }, true);
  
  // Show visual feedback when fact-checking starts
  function showFactCheckFeedback() {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      animation: slideInRight 0.3s ease;
    `;
    feedback.innerHTML = '🔍 Fact-checking...';
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
  }
  
  // Show feedback when no text is selected
  function showNoTextFeedback() {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff6b6b;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      animation: slideInRight 0.3s ease;
    `;
    feedback.innerHTML = '⚠️ Please highlight some text first';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
  }
  
  console.log('✅ Keyboard shortcut ready: Ctrl+Shift+F (or Cmd+Shift+F)');
})();
