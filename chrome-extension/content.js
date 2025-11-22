// Content script for FactCheck FactSource extension
// This script runs on web pages to analyze content

console.log('FactCheck FactSource content script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkFacts') {
    // Analyze the page content
    const pageText = document.body.innerText;
    const wordCount = pageText.split(/\s+/).length;
    
    console.log('Checking facts on page with', wordCount, 'words');
    
    // Send response back to popup
    sendResponse({
      success: true,
      message: `Analyzed ${wordCount} words on this page.`
    });
  }
  return true; // Keep message channel open for async response
});

// Function to highlight suspicious claims (example)
function highlightClaims() {
  // This is a placeholder for future fact-checking logic
  console.log('Highlighting claims...');
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', highlightClaims);
} else {
  highlightClaims();
}
