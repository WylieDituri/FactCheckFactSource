document.addEventListener('DOMContentLoaded', function() {
  const checkButton = document.getElementById('checkButton');
  const resultsDiv = document.getElementById('results');

  checkButton.addEventListener('click', async function() {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send a message to the content script
    chrome.tabs.sendMessage(tab.id, { action: 'checkFacts' }, function(response) {
      if (response && response.success) {
        resultsDiv.textContent = response.message || 'Facts checked successfully!';
      } else {
        resultsDiv.textContent = 'Error checking facts.';
      }
      resultsDiv.classList.add('visible');
    });
  });
});
