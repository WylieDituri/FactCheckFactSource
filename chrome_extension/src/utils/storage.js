/**
 * Chrome Storage utilities for settings and history
 */

/**
 * Get settings from chrome.storage
 */
export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ['geminiApiKey', 'openaiApiKey', 'preferredModel'],
      (data) => {
        resolve({
          geminiApiKey: data.geminiApiKey || '',
          openaiApiKey: data.openaiApiKey || '',
          preferredModel: data.preferredModel || 'gemini'
        });
      }
    );
  });
}

/**
 * Save settings to chrome.storage
 */
export async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, () => {
      resolve();
    });
  });
}

/**
 * Get history from chrome.storage
 */
export async function getHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['history'], (data) => {
      resolve(data.history || []);
    });
  });
}

/**
 * Save to history (keep last 50 items)
 */
export async function saveToHistory(item) {
  const history = await getHistory();
  history.unshift(item);
  
  // Keep only last 50 items
  const trimmedHistory = history.slice(0, 50);
  
  return new Promise((resolve) => {
    chrome.storage.local.set({ history: trimmedHistory }, () => {
      resolve();
    });
  });
}

/**
 * Clear all history
 */
export async function clearHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ history: [] }, () => {
      resolve();
    });
  });
}

