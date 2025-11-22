// Background service worker for FactCheck FactSource extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('FactCheck FactSource extension installed');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    // Handle fact-checking analysis
    console.log('Received analysis request:', request.data);
    sendResponse({ success: true, message: 'Analysis complete' });
  }
  return true; // Keep message channel open for async response
});

// Handle browser action click (optional)
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked for tab:', tab.id);
});
