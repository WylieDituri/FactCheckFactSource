/**
 * Content Script - Runs on all web pages
 * Handles text selection, toast notifications, and inline fact-check results
 */

console.log('🔍 FactFinder content script loaded');

let videoClaims = [];
let activePopup = null;
let lastCheckedTime = -1;

// Listen for keyboard shortcut (Ctrl+Shift+F)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
    e.preventDefault();

    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
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

  if (request.action === 'videoClaimsAnalyzed') {
    videoClaims = request.claims;
    showToast(`✅ Video analyzed! Found ${videoClaims.length} claims.`, 'success');

    // Update button state
    const btn = document.querySelector('.factfinder-yt-btn');
    if (btn) {
      btn.textContent = '✅ Fact Checked';
      btn.classList.remove('analyzing');
      btn.classList.add('active');
    }
  }
});

// YouTube Integration
if (window.location.hostname.includes('youtube.com')) {
  setInterval(checkForVideoPlayer, 1000);
  setInterval(checkVideoTime, 500);
}

function checkForVideoPlayer() {
  const controls = document.querySelector('.ytp-right-controls');
  if (controls && !document.querySelector('.factfinder-yt-btn')) {
    const btn = document.createElement('button');
    btn.className = 'factfinder-yt-btn';
    btn.innerHTML = '🔍 Fact Check';
    btn.title = 'Analyze video transcript for claims';

    btn.onclick = () => {
      btn.classList.add('analyzing');
      btn.innerHTML = '⏳ Analyzing...';

      // Send URL to background to fetch transcript
      chrome.runtime.sendMessage({
        action: 'analyzeVideo',
        url: window.location.href
      });
    };

    controls.prepend(btn);
  }
}

function checkVideoTime() {
  const video = document.querySelector('video');
  if (!video || videoClaims.length === 0) return;

  const currentTime = video.currentTime;

  // Find claim matching current time (within 5 seconds window)
  const claim = videoClaims.find(c =>
    currentTime >= c.timestamp &&
    currentTime < c.timestamp + 5 &&
    Math.floor(currentTime) !== lastCheckedTime // Avoid spamming same second
  );

  if (claim) {
    lastCheckedTime = Math.floor(currentTime);
    showGlassyNotification(claim);
  }
}

/**
 * Show Glassy Notification (New UI)
 */
function showGlassyNotification(claim) {
  if (activePopup) activePopup.remove();

  const popup = document.createElement('div');
  popup.className = 'factfinder-glassy-card';

  popup.innerHTML = `
    <div class="factfinder-glassy-header">
      <span class="factfinder-glassy-badge ${claim.status}">${claim.status}</span>
      <button class="factfinder-glassy-close">&times;</button>
    </div>
    <div class="factfinder-glassy-content">
      <span class="factfinder-glassy-claim">"${escapeHtml(claim.claim)}"</span>
      ${claim.correction ? `<div class="factfinder-glassy-correction">💡 ${escapeHtml(claim.correction)}</div>` : ''}
    </div>
  `;

  document.body.appendChild(popup);
  activePopup = popup;

  // Auto-remove after 8 seconds
  const timeout = setTimeout(() => {
    if (popup.parentNode) popup.remove();
    if (activePopup === popup) activePopup = null;
  }, 8000);

  popup.querySelector('.factfinder-glassy-close').onclick = () => {
    popup.remove();
    activePopup = null;
    clearTimeout(timeout);
  };
}


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
    .factfinder-yt-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      margin-left: 10px;
      transition: background-color 0.2s, transform 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .factfinder-yt-btn:hover {
      background: #0056b3;
      transform: translateY(-1px);
    }
    .factfinder-yt-btn.analyzing {
      background: #ffc107;
      color: #333;
      cursor: wait;
    }
    .factfinder-yt-btn.active {
      background: #28a745;
    }
    .factfinder-glassy-card {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      border: 1px solid rgba(255, 255, 255, 0.18);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: slideInUp 0.3s ease-out;
      color: #333;
      overflow: hidden;
    }
    .factfinder-glassy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    .factfinder-glassy-badge {
      font-size: 12px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      color: white;
    }
    .factfinder-glassy-badge.TRUE { background: #28a745; }
    .factfinder-glassy-badge.FALSE { background: #dc3545; }
    .factfinder-glassy-badge.MIXED { background: #ffc107; color: #333; }
    .factfinder-glassy-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      line-height: 1;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    .factfinder-glassy-close:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .factfinder-glassy-content {
      padding: 16px;
    }
    .factfinder-glassy-claim {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
      display: block;
      margin-bottom: 10px;
    }
    .factfinder-glassy-correction {
      font-size: 14px;
      line-height: 1.5;
      color: #555;
      background: rgba(0, 123, 255, 0.1);
      padding: 8px 12px;
      border-radius: 8px;
      border-left: 3px solid #007bff;
    }
    @keyframes slideInUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
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

  // Determine status color and icon
  const statusMap = {
    'VERIFIED': { color: '#4caf50', icon: '✅', label: 'Verified' },
    'DEBUNKED': { color: '#f44336', icon: '❌', label: 'Debunked' },
    'PARTIALLY_TRUE': { color: '#ff9800', icon: '⚠️', label: 'Partially True' },
    'UNVERIFIABLE': { color: '#9e9e9e', icon: '❓', label: 'Unverifiable' },
    'NOT_FACTUAL': { color: '#607d8b', icon: 'ℹ️', label: 'Not Factual' },
    'UNKNOWN': { color: '#9e9e9e', icon: '❓', label: 'Unknown' }
  };

  const status = statusMap[data.status] || statusMap['UNKNOWN'];

  // Get the logo URL - use chrome.runtime.getURL to access extension files
  const logoUrl = chrome.runtime.getURL('IMG_2285.PNG');
  
  const modalContent = `
    <div class="factfinder-modal-overlay">
      <div class="factfinder-modal-content">
        <div class="factfinder-modal-header">
          <h2 class="factfinder-modal-title">
            <img src="${logoUrl}" alt="FactFinder" class="factfinder-logo" />
            <span>Fact Check</span>
          </h2>
          <button class="factfinder-close-btn">&times;</button>
        </div>

        <div class="factfinder-modal-body">
          <div class="factfinder-status-badge" style="background-color: ${status.color}15; color: ${status.color}; border: 1px solid ${status.color}40">
            <span class="factfinder-status-icon">${status.icon}</span>
            <span class="factfinder-status-label">${status.label}</span>
          </div>

          <div class="factfinder-selected-text">
            <h3>Selected Text</h3>
            <div class="factfinder-quote-box">
              <span class="factfinder-quote-mark">"</span>
              <p>${formatHighlightedText(data.text.substring(0, 300))}${data.text.length > 300 ? '<span class="factfinder-ellipsis">...</span>' : ''}</p>
            </div>
          </div>

          <div class="factfinder-summary">
            <h3>Analysis</h3>
            <div class="factfinder-summary-text">${formatFactCheckResponse(data.summary || 'No summary available')}</div>
          </div>

          ${data.sources && data.sources.length > 0 ? `
            <div class="factfinder-sources">
              <h3>Verified Sources</h3>
              <div class="factfinder-sources-list">
                ${data.sources.map(source => `
                  <a href="${escapeHtml(source.url)}" target="_blank" class="factfinder-source-item">
                    <img src="https://www.google.com/s2/favicons?domain=${source.domain}&sz=32" alt="${escapeHtml(source.name)}" class="factfinder-source-icon">
                    <div class="factfinder-source-info">
                      <span class="factfinder-source-name">${escapeHtml(source.name)}</span>
                      <span class="factfinder-source-domain">${escapeHtml(source.domain)}</span>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${data.claims && data.claims.length > 0 ? `
            <div class="factfinder-claims">
              <h3>Claims Breakdown</h3>
              ${data.claims.map(claim => `
                <div class="factfinder-claim-item">
                  <div class="factfinder-claim-header">
                    <span class="factfinder-claim-status ${claim.status}">${claim.status}</span>
                  </div>
                  <p class="factfinder-claim-text">${escapeHtml(claim.claim)}</p>
                  <p class="factfinder-claim-reasoning">${escapeHtml(claim.reasoning)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

        </div>
      </div>
    </div>
  `;

  modal.innerHTML = modalContent;

  // Add styles
  const style = document.createElement('style');
  style.id = 'factfinder-modal-styles';
  style.textContent = `
    #factfinder-modal { all: initial; }
    
    /* Overlay without backdrop blur */
    .factfinder-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      z-index: 2147483646;
      display: flex;
      align-items: stretch;
      justify-content: flex-end;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: fadeIn 0.3s ease;
    }
    
    /* Right-side column with liquid glass effect */
    .factfinder-modal-content {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-left: 1px solid rgba(255, 255, 255, 0.3);
      width: 420px;
      max-width: 90vw;
      height: calc(100vh - 1in);
      margin: 0.5in 0;
      overflow-y: auto;
      box-shadow: none;
      border-radius: 20px 0 0 20px;
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    /* Smooth scrollbar */
    .factfinder-modal-content::-webkit-scrollbar {
      width: 8px;
    }
    
    .factfinder-modal-content::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }
    
    .factfinder-modal-content::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
    
    .factfinder-modal-content::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }
    
    /* Header with purple gradient */
    .factfinder-modal-header {
      padding: 20px 20px;
      border-bottom: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px 0 0 0;
      z-index: 10;
    }
    
    .factfinder-modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: white;
      letter-spacing: -0.5px;
    }
    
    .factfinder-logo {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
    
    /* Status badge */
    .factfinder-status-badge {
      display: inline-flex;
      align-items: center;
      padding: 10px 16px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    
    .factfinder-status-icon {
      margin-right: 8px;
      font-size: 16px;
    }
    
    /* Close button */
    .factfinder-close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: white;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }
    
    .factfinder-close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      color: white;
      transform: scale(1.1);
    }
    
    /* Modal body */
    .factfinder-modal-body {
      padding: 24px 20px;
    }
    
    /* Selected text with quote styling */
    .factfinder-selected-text {
      margin-bottom: 28px;
    }
    
    .factfinder-selected-text h3 {
      color: #667eea;
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
    }
    
    .factfinder-quote-box {
      position: relative;
      padding: 18px 20px;
      background: rgba(102, 126, 234, 0.08);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 12px;
      border-left: 3px solid #667eea;
    }
    
    .factfinder-quote-mark {
      position: absolute;
      top: 12px;
      left: 16px;
      font-size: 40px;
      color: rgba(102, 126, 234, 0.3);
      font-family: Georgia, serif;
      line-height: 0;
    }
    
    .factfinder-quote-box p {
      margin: 0;
      padding-left: 28px;
      font-size: 15px;
      line-height: 1.7;
      color: #333;
    }
    
    .factfinder-quote-box strong {
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .factfinder-quote-box em {
      font-style: italic;
      color: #555;
    }
    
    .factfinder-quote-box u {
      text-decoration: underline;
      text-decoration-color: #667eea;
      text-decoration-thickness: 2px;
    }
    
    .factfinder-ellipsis {
      color: #999;
      margin-left: 2px;
    }
    
    /* Section headings */
    .factfinder-summary h3, 
    .factfinder-sources h3, 
    .factfinder-claims h3 {
      font-size: 13px;
      font-weight: 700;
      color: #333;
      margin-bottom: 14px;
      margin-top: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* Summary section */
    .factfinder-summary {
      margin-bottom: 28px;
    }
    
    .factfinder-summary-text {
      line-height: 1.7;
      color: #333;
      font-size: 15px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    
    /* Sources section */
    .factfinder-sources {
      margin-bottom: 28px;
    }
    
    .factfinder-sources-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .factfinder-source-item {
      display: flex;
      align-items: center;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s;
    }
    
    .factfinder-source-item:hover {
      background: rgba(255, 255, 255, 0.7);
      border-color: #667eea;
      transform: translateX(-3px);
    }
    
    .factfinder-source-icon {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      border-radius: 4px;
    }
    
    .factfinder-source-info {
      display: flex;
      flex-direction: column;
    }
    
    .factfinder-source-name {
      font-weight: 600;
      color: #333;
      font-size: 13px;
      line-height: 1.3;
    }
    
    .factfinder-source-domain {
      font-size: 11px;
      color: #888;
      margin-top: 2px;
    }
    
    /* Claims section */
    .factfinder-claims {
      margin-top: 24px;
    }
    
    .factfinder-claim-item {
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 14px 16px;
      border-radius: 10px;
      margin-bottom: 12px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    
    .factfinder-claim-header {
      margin-bottom: 10px;
    }
    
    .factfinder-claim-status {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .factfinder-claim-status.TRUE { 
      background: rgba(76, 175, 80, 0.15); 
      color: #2e7d32; 
    }
    
    .factfinder-claim-status.FALSE { 
      background: rgba(244, 67, 54, 0.15); 
      color: #c62828; 
    }
    
    .factfinder-claim-status.MIXED { 
      background: rgba(255, 152, 0, 0.15); 
      color: #ef6c00; 
    }

    .factfinder-claim-text {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      line-height: 1.5;
      margin: 8px 0;
    }
    
    .factfinder-claim-reasoning {
      margin: 0;
      font-size: 13px;
      color: #666;
      line-height: 1.6;
    }

    /* Animations */
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
 * Format highlighted text with bold, italic, and emphasis
 */
function formatHighlightedText(text) {
  let html = escapeHtml(text);
  
  // Convert **bold** to strong
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to em
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Convert _underline_ to u
  html = html.replace(/_(.+?)_/g, '<u>$1</u>');
  
  return html;
}

/**
 * Format fact-check response (convert markdown to HTML)
 */
function formatFactCheckResponse(text) {
  let html = escapeHtml(text);

  // Convert **bold**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #333; font-weight: 700;">$1</strong>');

  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p style="margin: 12px 0;">');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph
  if (!html.startsWith('<')) {
    html = '<p style="margin: 12px 0;">' + html + '</p>';
  }

  return html;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

console.log('✅ Content script ready - Press Ctrl+Shift+F to fact-check highlighted text');

