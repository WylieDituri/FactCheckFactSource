/**
 * Popup UI Script
 */

// DOM elements
const quickCheckInput = document.getElementById('quick-check-input');
const quickCheckBtn = document.getElementById('quick-check-btn');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const settingsBtn = document.getElementById('settings-btn');

// Initialize
loadHistory();

// Quick check button
quickCheckBtn.addEventListener('click', async () => {
  const text = quickCheckInput.value.trim();
  
  if (!text) {
    return;
  }
  
  // Disable button
  quickCheckBtn.disabled = true;
  quickCheckBtn.textContent = 'Checking...';
  
  try {
    // Send to background for fact-checking
    const response = await chrome.runtime.sendMessage({
      action: 'factCheck',
      text: text
    });
    
    if (response.success) {
      // Clear input
      quickCheckInput.value = '';
      
      // Reload history
      await loadHistory();
      
      // Show success
      showToast('✅ Fact-check complete! Check history below.');
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Fact-check error:', error);
    showToast('❌ Error: ' + error.message);
  } finally {
    quickCheckBtn.disabled = false;
    quickCheckBtn.textContent = 'Fact Check';
  }
});

// Clear history button
clearHistoryBtn.addEventListener('click', async () => {
  if (confirm('Clear all fact-check history?')) {
    await chrome.runtime.sendMessage({ action: 'clearHistory' });
    await loadHistory();
    showToast('🗑️ History cleared');
  }
});

// Settings button
settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

/**
 * Load and display history
 */
async function loadHistory() {
  const response = await chrome.runtime.sendMessage({ action: 'getHistory' });
  const history = response.history || [];
  
  if (history.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        No recent fact-checks yet. Highlight text on any webpage and press Ctrl+Shift+F (or Cmd+Shift+F) to get started!
      </div>
    `;
    return;
  }
  
  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="history-item-text">${escapeHtml(item.text)}</div>
      <div class="history-item-meta">
        <span>${formatTime(item.timestamp)}</span>
        <div class="history-item-score">
          <span class="score-badge score-${getScoreClass(item.score)}">
            ${Math.round(item.score * 100)}%
          </span>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Get score class based on value
 */
function getScoreClass(score) {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

/**
 * Format timestamp
 */
function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Escape HTML
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Show toast notification
 */
function showToast(message) {
  // Simple in-popup notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    z-index: 1000;
    animation: fadeInOut 2s ease;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

