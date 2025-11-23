/**
 * Content Script - Runs on all web pages
 * Handles text selection, toast notifications, and inline fact-check results
 */

console.log('🔍 FactFinder content script loaded');

let currentSelection = '';
let videoClaims = [];
let activePopup = null;
let lastCheckedTime = -1;

// Listen for keyboard shortcut (Ctrl+Shift+F)
// Listen for keyboard shortcut (Ctrl+Shift+F)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    console.log('⌨️ Manual shortcut triggered');

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

    // Show claim navigation sidebar
    showClaimSidebar();
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

  // Update sidebar highlighting
  updateSidebarHighlight(currentTime);
}

/**
 * Show Claim Navigation Sidebar
 */
function showClaimSidebar() {
  // Remove existing sidebar
  const existing = document.querySelector('.factfinder-claim-sidebar');
  if (existing) existing.remove();

  if (videoClaims.length === 0) return;

  const sidebar = document.createElement('div');
  sidebar.className = 'factfinder-claim-sidebar';

  const header = document.createElement('div');
  header.className = 'factfinder-sidebar-header';
  header.innerHTML = `
    <span>🔍 Fact Check Claims (${videoClaims.length})</span>
    <button class="factfinder-sidebar-close">×</button>
  `;

  const claimsList = document.createElement('div');
  claimsList.className = 'factfinder-claims-list';

  videoClaims.forEach((claim, index) => {
    const claimItem = document.createElement('div');
    claimItem.className = 'factfinder-claim-item';
    claimItem.dataset.timestamp = claim.timestamp;
    claimItem.dataset.index = index;

    const statusClass = claim.status.toLowerCase();
    const timeStr = formatTimestamp(claim.timestamp);
    const claimText = claim.claim.length > 80 ? claim.claim.substring(0, 80) + '...' : claim.claim;

    claimItem.innerHTML = `
      <div class="factfinder-claim-time">${timeStr}</div>
      <div class="factfinder-claim-status-badge ${statusClass}">${claim.status}</div>
      <div class="factfinder-claim-text">${claimText}</div>
    `;

    // Click to jump to timestamp AND show details
    claimItem.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling
      jumpToTimestamp(claim.timestamp);

      // Show detailed modal
      showFactCheckModal({
        text: claim.claim,
        status: claim.status,
        summary: claim.correction, // Use correction as summary
        sources: claim.sources || [],
        claims: [{
          claim: claim.claim,
          status: claim.status,
          reasoning: claim.correction
        }]
      });
    });

    claimsList.appendChild(claimItem);
  });

  sidebar.appendChild(header);
  sidebar.appendChild(claimsList);

  // Close button handler
  const closeBtn = header.querySelector('.factfinder-sidebar-close');
  closeBtn.addEventListener('click', () => sidebar.remove());

  // Add styles
  addSidebarStyles();

  document.body.appendChild(sidebar);
}

/**
 * Update sidebar highlighting based on current video time
 */
function updateSidebarHighlight(currentTime) {
  const sidebar = document.querySelector('.factfinder-claim-sidebar');
  if (!sidebar) return;

  const items = sidebar.querySelectorAll('.factfinder-claim-item');
  let foundCurrent = false;

  items.forEach((item, index) => {
    const timestamp = parseFloat(item.dataset.timestamp);
    item.classList.remove('active', 'upcoming');

    // Current claim (within 5 second window)
    if (currentTime >= timestamp && currentTime < timestamp + 5) {
      item.classList.add('active');
      foundCurrent = true;
      // Scroll into view
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    // Next upcoming claim
    else if (!foundCurrent && currentTime < timestamp && index === 0) {
      item.classList.add('upcoming');
    } else if (!foundCurrent && currentTime < timestamp) {
      const prevTimestamp = index > 0 ? parseFloat(items[index - 1].dataset.timestamp) : 0;
      if (currentTime >= prevTimestamp) {
        item.classList.add('upcoming');
      }
    }
  });
}

/**
 * Jump to timestamp in video
 */
function jumpToTimestamp(timestamp) {
  const video = document.querySelector('video');
  if (!video) return;

  video.currentTime = timestamp;
  // Optionally play the video if paused
  if (video.paused) {
    video.play();
  }
}

/**
 * Format seconds to MM:SS
 */
function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Add sidebar styles
 */
function addSidebarStyles() {
  if (document.getElementById('factfinder-sidebar-styles')) return;

  const style = document.createElement('style');
  style.id = 'factfinder-sidebar-styles';
  style.textContent = `
    .factfinder-claim-sidebar {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 350px;
      max-height: calc(100vh - 100px);
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .factfinder-sidebar-header {
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .factfinder-sidebar-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .factfinder-sidebar-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .factfinder-claims-list {
      overflow-y: auto;
      padding: 8px;
    }

    .factfinder-claim-item {
      padding: 12px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .factfinder-claim-item:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(-4px);
    }

    .factfinder-claim-item.active {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.5);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }

    .factfinder-claim-item.upcoming {
      border-left: 3px solid rgba(251, 191, 36, 0.6);
    }

    .factfinder-claim-time {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 6px;
    }

    .factfinder-claim-item.active .factfinder-claim-time {
      color: rgba(59, 130, 246, 1);
    }

    .factfinder-claim-status-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .factfinder-claim-status-badge.verified {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }

    .factfinder-claim-status-badge.debunked {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .factfinder-claim-status-badge.misleading {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }

    .factfinder-claim-status-badge.unverifiable {
      background: rgba(156, 163, 175, 0.2);
      color: #9ca3af;
    }

    .factfinder-claim-text {
      font-size: 13px;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.9);
    }

    .factfinder-claim-item.active .factfinder-claim-text {
      color: white;
      font-weight: 500;
    }
  `;

  document.head.appendChild(style);
}


/**
 * Show Glassy Notification
 */
function showGlassyNotification(claimData) {
  // Remove existing
  const existing = document.querySelector('.factfinder-glassy-card');
  if (existing) existing.remove();

  const card = document.createElement('div');
  card.className = 'factfinder-glassy-card';

  // Status Badge
  const statusClass = claimData.status.toLowerCase();

  // Source HTML
  let sourceHtml = '';
  if (claimData.source && claimData.source.url) {
    const sourceName = claimData.source.name || 'Verified Source';
    sourceHtml = `
      <div class="factfinder-glassy-source">
        Source: <a href="${claimData.source.url}" target="_blank" rel="noopener noreferrer">${sourceName}</a>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="factfinder-glassy-header">
      <span class="factfinder-glassy-badge ${statusClass}">${claimData.status}</span>
      <button class="factfinder-glassy-close">&times;</button>
    </div>
    <div class="factfinder-glassy-content">
      <div class="factfinder-glassy-claim">"${claimData.claim}"</div>
      <div class="factfinder-glassy-correction">${claimData.correction || ''}</div>
      ${sourceHtml}
    </div>
  `;

  // Close button
  card.querySelector('.factfinder-glassy-close').addEventListener('click', () => {
    card.style.opacity = '0';
    setTimeout(() => card.remove(), 300);
  });

  document.body.appendChild(card);

  // Auto-remove after 15 seconds
  setTimeout(() => {
    if (document.body.contains(card)) {
      card.style.opacity = '0';
      setTimeout(() => card.remove(), 300);
    }
  }, 15000);
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
    .factfinder - yt - btn.analyzing {
    background: #ffc107;
    color: #333;
    cursor: wait;
  }
    .factfinder - yt - btn.active {
    background: #28a745;
  }
    .factfinder - glassy - card {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    background: rgba(255, 255, 255, 0.8);
    backdrop - filter: blur(10px);
    border - radius: 16px;
    box - shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    border: 1px solid rgba(255, 255, 255, 0.18);
    z - index: 2147483647;
    font - family: -apple - system, BlinkMacSystemFont, "Segoe UI", Roboto, sans - serif;
    animation: slideInUp 0.3s ease - out;
    color: #333;
    overflow: hidden;
  }
    .factfinder - glassy - header {
    display: flex;
    justify - content: space - between;
    align - items: center;
    padding: 12px 16px;
    border - bottom: 1px solid rgba(255, 255, 255, 0.3);
  }
    .factfinder - glassy - badge {
    font - size: 12px;
    font - weight: 700;
    padding: 4px 8px;
    border - radius: 6px;
    text - transform: uppercase;
    color: white;
  }
    .factfinder - glassy - badge.TRUE { background: #28a745; }
    .factfinder - glassy - badge.FALSE { background: #dc3545; }
    .factfinder - glassy - badge.MIXED { background: #ffc107; color: #333; }
    .factfinder - glassy - close {
    background: none;
    border: none;
    font - size: 24px;
    cursor: pointer;
    color: #666;
    line - height: 1;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align - items: center;
    justify - content: center;
    border - radius: 50 %;
    transition: background - color 0.2s;
  }
    .factfinder - glassy - close:hover {
    background: rgba(0, 0, 0, 0.05);
  }
    .factfinder - glassy - content {
    padding: 16px;
  }
    .factfinder - glassy - claim {
    font - size: 15px;
    font - weight: 600;
    line - height: 1.4;
    display: block;
    margin - bottom: 10px;
  }
    .factfinder - glassy - correction {
    font - size: 14px;
    line - height: 1.5;
    color: #555;
    background: rgba(0, 123, 255, 0.1);
    padding: 8px 12px;
    border - radius: 8px;
    border - left: 3px solid #007bff;
  }
  @keyframes slideInUp {
      from { transform: translateY(100 %); opacity: 0; }
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

  const modalContent = `
    < div class="factfinder-modal-overlay" >
      <div class="factfinder-modal-content">
        <div class="factfinder-modal-header">
          <div class="factfinder-status-badge" style="background-color: ${status.color}20; color: ${status.color}; border: 1px solid ${status.color}">
            <span class="factfinder-status-icon">${status.icon}</span>
            <span class="factfinder-status-label">${status.label}</span>
          </div>
          <button class="factfinder-close-btn">&times;</button>
        </div>

        <div class="factfinder-modal-body">
          <div class="factfinder-selected-text">
            <h3>Selected Text:</h3>
            <p>"${escapeHtml(data.text.substring(0, 300))}${data.text.length > 300 ? '...' : ''}"</p>
          </div>

          <div class="factfinder-summary">
            <h3>Analysis:</h3>
            <div class="factfinder-summary-text">${formatFactCheckResponse(data.summary || 'No summary available')}</div>
          </div>

          ${data.sources && data.sources.length > 0 ? `
            <div class="factfinder-sources">
              <h3>Verified Sources:</h3>
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
              <h3>Claims Breakdown:</h3>
              ${data.claims.map(claim => `
                <div class="factfinder-claim-item">
                  <div class="factfinder-claim-header">
                    <span class="factfinder-claim-status ${claim.status}">${claim.status}</span>
                    <span class="factfinder-claim-text">${escapeHtml(claim.claim)}</span>
                  </div>
                  <p class="factfinder-claim-reasoning">${escapeHtml(claim.reasoning)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

        </div>
      </div>
    </div >
    `;

  modal.innerHTML = modalContent;

  // Add styles
  const style = document.createElement('style');
  style.id = 'factfinder-modal-styles';
  style.textContent = `
  #factfinder - modal { all: initial; }
    .factfinder - modal - overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z - index: 2147483646;
    display: flex;
    align - items: center;
    justify - content: center;
    font - family: -apple - system, BlinkMacSystemFont, "Segoe UI", Roboto, sans - serif;
    animation: fadeIn 0.3s ease;
  }
    .factfinder - modal - content {
    background: white;
    border - radius: 16px;
    max - width: 800px;
    width: 90 %;
    max - height: 90vh;
    overflow - y: auto;
    box - shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease;
  }
    .factfinder - modal - header {
    padding: 24px;
    border - bottom: 1px solid #eee;
    display: flex;
    justify - content: space - between;
    align - items: center;
    position: sticky;
    top: 0;
    background: white;
    border-radius: 16px 16px 0 0;
    z-index: 10;
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
    .factfinder-status-badge {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 16px;
  }
    .factfinder-status-icon {
    margin-right: 8px;
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
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
    border-left: 4px solid #667eea;
  }
    .factfinder-selected-text h3 {
    color: #667eea;
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
    .factfinder-selected-text p {
    margin: 0;
    font-style: italic;
    color: #555;
    line-height: 1.6;
  }
    .factfinder-summary h3, .factfinder-sources h3, .factfinder-claims h3 {
    font-size: 18px;
    font-weight: 700;
    color: #333;
    margin-bottom: 16px;
    margin-top: 0;
  }
    .factfinder-summary-text {
    line-height: 1.8;
    color: #333;
    font-size: 16px;
    margin-bottom: 32px;
  }
    .factfinder-sources {
    margin-bottom: 32px;
  }
    .factfinder-sources-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
    .factfinder-source-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.2s;
  }
    .factfinder-source-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border-color: #667eea;
    }
    .factfinder-source-icon {
      width: 24px;
      height: 24px;
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
      font-size: 14px;
    }
    .factfinder-source-domain {
      font-size: 12px;
      color: #888;
    }
    .factfinder-claims {
      margin-top: 24px;
    }
    .factfinder-claim-item {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .factfinder-claim-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .factfinder-claim-status {
      font-size: 12px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      margin-right: 12px;
      text-transform: uppercase;
    }
    .factfinder-claim-status.TRUE { background: #e8f5e9; color: #2e7d32; }
    .factfinder-claim-status.FALSE { background: #ffebee; color: #c62828; }
    .factfinder-claim-status.MIXED { background: #fff3e0; color: #ef6c00; }

    .factfinder-claim-text {
      font-weight: 600;
      color: #333;
    }
    .factfinder-claim-reasoning {
      margin: 0;
      font-size: 14px;
      color: #666;
      line-height: 1.6;
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

console.log('✅ Content script ready - Press Ctrl+Shift+F to fact-check highlighted text');

