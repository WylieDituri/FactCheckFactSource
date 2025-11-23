/**
 * Content Script - Runs on all web pages
 * Handles text selection, toast notifications, and inline fact-check results
 */

console.log('🔍 Carmonic Verify content script loaded');

let currentSelection = '';

// Listen for keyboard shortcut (Ctrl+Shift+F)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      currentSelection = text;
      // Send to background for fact-checking
      chrome.runtime.sendMessage({
        action: 'factCheck',
        text: text
      });
    } else {
      showToast('⚠️ Please highlight some text first', 'error');
    }
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    const selection = window.getSelection();
    sendResponse({ text: selection.toString().trim() });
  }
  
  if (request.action === 'showToast') {
    showToast(request.message, request.type);
  }
  
  if (request.action === 'showFactCheckResult') {
    showFactCheckModal(request.data);
  }
});

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  // Remove existing toasts
  const existing = document.getElementById('carmonic-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.id = 'carmonic-toast';
  toast.className = `carmonic-toast carmonic-toast-${type}`;
  toast.textContent = message;
  
  const style = document.createElement('style');
  style.textContent = `
    .carmonic-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 2147483647;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
    }
    .carmonic-toast-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .carmonic-toast-error {
      background: #ff6b6b;
    }
    .carmonic-toast-success {
      background: #4caf50;
    }
    @keyframes slideInRight {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Show fact-check result modal
 */
function showFactCheckModal(data) {
  // Remove existing modal
  const existing = document.getElementById('carmonic-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'carmonic-modal';
  modal.innerHTML = `
    <div class="carmonic-modal-overlay">
      <div class="carmonic-modal-content">
        <div class="carmonic-modal-header">
          <h2>🔍 Fact Check Results</h2>
          <button class="carmonic-close-btn">&times;</button>
        </div>
        
        <div class="carmonic-modal-body">
          <div class="carmonic-selected-text">
            <h3>Selected Text:</h3>
            <p>${escapeHtml(data.text.substring(0, 300))}${data.text.length > 300 ? '...' : ''}</p>
          </div>
          
          <div class="carmonic-score">
            <div class="carmonic-score-label">Confidence Score:</div>
            <div class="carmonic-score-bar">
              <div class="carmonic-score-fill" style="width: ${(data.score || 0.5) * 100}%"></div>
            </div>
            <div class="carmonic-score-value">${Math.round((data.score || 0.5) * 100)}%</div>
          </div>
          
          <div class="carmonic-summary">
            <h3>Summary:</h3>
            <div class="carmonic-summary-text">${formatFactCheckResponse(data.summary || data.response || 'No summary available')}</div>
          </div>
          
          ${data.evidence && data.evidence.length > 0 ? `
            <div class="carmonic-evidence">
              <h3>Evidence:</h3>
              ${data.evidence.map(e => `
                <div class="carmonic-evidence-item">
                  <strong>${escapeHtml(e.title)}</strong>
                  <a href="${escapeHtml(e.url)}" target="_blank">${escapeHtml(e.url)}</a>
                  <p>${escapeHtml(e.excerpt)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.id = 'carmonic-modal-styles';
  style.textContent = `
    #carmonic-modal { all: initial; }
    .carmonic-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2147483646;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: fadeIn 0.3s ease;
    }
    .carmonic-modal-content {
      background: white;
      border-radius: 16px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: slideUp 0.3s ease;
    }
    .carmonic-modal-header {
      padding: 24px;
      border-bottom: 2px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      background: white;
      border-radius: 16px 16px 0 0;
      z-index: 10;
    }
    .carmonic-modal-header h2 {
      margin: 0;
      color: #333;
      font-size: 24px;
      font-weight: 700;
    }
    .carmonic-close-btn {
      background: none;
      border: none;
      font-size: 32px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }
    .carmonic-close-btn:hover {
      background: #f5f5f5;
      color: #333;
    }
    .carmonic-modal-body {
      padding: 24px;
    }
    .carmonic-selected-text {
      margin-bottom: 20px;
    }
    .carmonic-selected-text h3 {
      color: #667eea;
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
    }
    .carmonic-selected-text p {
      padding: 16px;
      background: #f5f7ff;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      font-size: 14px;
      line-height: 1.8;
      color: #333;
      margin: 0;
    }
    .carmonic-score {
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .carmonic-score-label {
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }
    .carmonic-score-bar {
      height: 12px;
      background: #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .carmonic-score-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff6b6b 0%, #ffd93d 50%, #4caf50 100%);
      transition: width 0.5s ease;
    }
    .carmonic-score-value {
      text-align: right;
      font-weight: 700;
      color: #333;
    }
    .carmonic-summary {
      margin-bottom: 20px;
    }
    .carmonic-summary h3 {
      color: #ff6b6b;
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 18px;
      font-weight: 600;
    }
    .carmonic-summary-text {
      background: white;
      padding: 16px;
      border-radius: 8px;
      border: 2px solid #ff6b6b;
      line-height: 1.8;
      color: #333;
    }
    .carmonic-evidence {
      margin-top: 20px;
    }
    .carmonic-evidence h3 {
      color: #4caf50;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
    }
    .carmonic-evidence-item {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .carmonic-evidence-item strong {
      display: block;
      color: #333;
      margin-bottom: 4px;
    }
    .carmonic-evidence-item a {
      color: #667eea;
      font-size: 12px;
      display: block;
      margin-bottom: 4px;
      text-decoration: none;
    }
    .carmonic-evidence-item p {
      margin: 0;
      font-size: 13px;
      color: #666;
    }
    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  
  if (!document.getElementById('carmonic-modal-styles')) {
    document.head.appendChild(style);
  }
  
  document.body.appendChild(modal);
  
  // Close button handler
  modal.querySelector('.carmonic-close-btn').addEventListener('click', () => {
    modal.remove();
  });
  
  // Click outside to close
  modal.querySelector('.carmonic-modal-overlay').addEventListener('click', (e) => {
    if (e.target.classList.contains('carmonic-modal-overlay')) {
      modal.remove();
    }
  });
}

/**
 * Format fact-check response (convert markdown to HTML)
 */
function formatFactCheckResponse(text) {
  let html = escapeHtml(text);
  
  // Convert **bold**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #c62828; font-weight: 700;">$1</strong>');
  
  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p style="margin: 12px 0; color: #333;">');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraph
  if (!html.startsWith('<')) {
    html = '<p style="margin: 12px 0; color: #333;">' + html + '</p>';
  }
  
  return html;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

console.log('✅ Content script ready - Press Ctrl+Shift+F to fact-check highlighted text');

