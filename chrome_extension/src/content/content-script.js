/**
 * Content Script - Runs on all web pages
 * Handles text selection, toast notifications, and inline fact-check results
 */

console.log('🔍 FactFinder content script loaded');

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
  const existing = document.getElementById('factfinder-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.id = 'factfinder-toast';
  toast.className = `factfinder-toast factfinder-toast-${type}`;
  toast.textContent = message;
  
  const style = document.createElement('style');
  style.textContent = `
    .factfinder-toast {
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
    .factfinder-toast-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .factfinder-toast-error {
      background: #ff6b6b;
    }
    .factfinder-toast-success {
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
  const existing = document.getElementById('factfinder-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'factfinder-modal';
  
  // Check if text is not verifiable
  const isNotVerifiable = data.isNotVerifiable || (data.summary && data.summary.trim().startsWith('NOT_VERIFIABLE:'));
  let modalContent;
  
  if (isNotVerifiable) {
    // Extract explanation
    const explanation = data.summary.replace('NOT_VERIFIABLE:', '').trim();
    
    modalContent = `
      <div class="factfinder-modal-overlay">
        <div class="factfinder-modal-content">
          <div class="factfinder-modal-header">
            <h2>ℹ️ No Fact-Checking Needed</h2>
            <button class="factfinder-close-btn">&times;</button>
          </div>
          
          <div class="factfinder-modal-body">
            <div class="factfinder-selected-text">
              <h3>Selected Text:</h3>
              <p>${escapeHtml(data.text.substring(0, 300))}${data.text.length > 300 ? '...' : ''}</p>
            </div>
            
            <div class="factfinder-info-message">
              <p>${escapeHtml(explanation)}</p>
            </div>
            
            <div class="factfinder-tip">
              <strong>💡 Tip:</strong> Fact-checking works best with declarative statements containing factual claims.
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    modalContent = `
      <div class="factfinder-modal-overlay">
        <div class="factfinder-modal-content">
          <div class="factfinder-modal-header">
            <h2>🔍 Fact Check Results</h2>
            <button class="factfinder-close-btn">&times;</button>
          </div>
          
          <div class="factfinder-modal-body">
            <div class="factfinder-selected-text">
              <h3>Selected Text:</h3>
              <p>${escapeHtml(data.text.substring(0, 300))}${data.text.length > 300 ? '...' : ''}</p>
            </div>
            
            <div class="factfinder-score">
              <div class="factfinder-score-label">Confidence Score:</div>
              <div class="factfinder-score-bar">
                <div class="factfinder-score-fill" style="width: ${(data.score || 0.5) * 100}%"></div>
              </div>
              <div class="factfinder-score-value">${Math.round((data.score || 0.5) * 100)}%</div>
            </div>
            
            <div class="factfinder-summary">
              <h3>Summary:</h3>
              <div class="factfinder-summary-text">${formatFactCheckResponse(data.summary || data.response || 'No summary available')}</div>
            </div>
            
            ${data.evidence && data.evidence.length > 0 ? `
              <div class="factfinder-evidence">
                <h3>Evidence:</h3>
                ${data.evidence.map(e => `
                  <div class="factfinder-evidence-item">
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
  }
  
  modal.innerHTML = modalContent;
  
  // Add styles
  const style = document.createElement('style');
  style.id = 'factfinder-modal-styles';
  style.textContent = `
    #factfinder-modal { all: initial; }
    .factfinder-modal-overlay {
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
    .factfinder-modal-content {
      background: white;
      border-radius: 16px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: slideUp 0.3s ease;
    }
    .factfinder-modal-header {
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
    .factfinder-modal-header h2 {
      margin: 0;
      color: #333;
      font-size: 24px;
      font-weight: 700;
    }
    .factfinder-close-btn {
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
    .factfinder-close-btn:hover {
      background: #f5f5f5;
      color: #333;
    }
    .factfinder-modal-body {
      padding: 24px;
    }
    .factfinder-selected-text {
      margin-bottom: 20px;
    }
    .factfinder-selected-text h3 {
      color: #667eea;
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
    }
    .factfinder-selected-text p {
      padding: 16px;
      background: #f5f7ff;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      font-size: 14px;
      line-height: 1.8;
      color: #333;
      margin: 0;
    }
    .factfinder-score {
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .factfinder-score-label {
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }
    .factfinder-score-bar {
      height: 12px;
      background: #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .factfinder-score-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff6b6b 0%, #ffd93d 50%, #4caf50 100%);
      transition: width 0.5s ease;
    }
    .factfinder-score-value {
      text-align: right;
      font-weight: 700;
      color: #333;
    }
    .factfinder-summary {
      margin-bottom: 20px;
    }
    .factfinder-summary h3 {
      color: #ff6b6b;
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 18px;
      font-weight: 600;
    }
    .factfinder-summary-text {
      background: white;
      padding: 16px;
      border-radius: 8px;
      border: 2px solid #ff6b6b;
      line-height: 1.8;
      color: #333;
    }
    .factfinder-evidence {
      margin-top: 20px;
    }
    .factfinder-evidence h3 {
      color: #4caf50;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
    }
    .factfinder-evidence-item {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .factfinder-evidence-item strong {
      display: block;
      color: #333;
      margin-bottom: 4px;
    }
    .factfinder-evidence-item a {
      color: #667eea;
      font-size: 12px;
      display: block;
      margin-bottom: 4px;
      text-decoration: none;
    }
    .factfinder-evidence-item p {
      margin: 0;
      font-size: 13px;
      color: #666;
    }
    .factfinder-info-message {
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #9e9e9e;
      margin-bottom: 20px;
    }
    .factfinder-info-message p {
      margin: 0;
      color: #555;
      line-height: 1.8;
      font-size: 15px;
    }
    .factfinder-tip {
      padding: 16px;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-radius: 8px;
      border-left: 4px solid #2196f3;
      color: #1565c0;
      font-size: 14px;
      line-height: 1.6;
    }
    .factfinder-tip strong {
      display: block;
      margin-bottom: 4px;
    }
    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  
  if (!document.getElementById('factfinder-modal-styles')) {
    document.head.appendChild(style);
  }
  
  document.body.appendChild(modal);
  
  // Close button handler
  modal.querySelector('.factfinder-close-btn').addEventListener('click', () => {
    modal.remove();
  });
  
  // Click outside to close
  modal.querySelector('.factfinder-modal-overlay').addEventListener('click', (e) => {
    if (e.target.classList.contains('factfinder-modal-overlay')) {
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

