// Browser state
let currentPage = 'home';
let searchHistory = [];
let bookmarks = [];
let navigationHistory = [];
let historyIndex = -1;

// DOM elements
const contentArea = document.getElementById('content-area');
const addressBar = document.getElementById('address-bar');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const homeBtn = document.getElementById('home-btn');
const historyBtn = document.getElementById('history-btn');
const bookmarksBtn = document.getElementById('bookmarks-btn');
const floatingBookmark = document.getElementById('floating-bookmark');

// Active webview management
let currentWebview = null;

// Utility functions
function addToHistory(page, query = '') {
  const entry = { page, query, timestamp: Date.now() };
  navigationHistory = navigationHistory.slice(0, historyIndex + 1);
  navigationHistory.push(entry);
  historyIndex = navigationHistory.length - 1;
  updateNavigationButtons();
}

function updateNavigationButtons() {
  backBtn.disabled = historyIndex <= 0;
  forwardBtn.disabled = historyIndex >= navigationHistory.length - 1;
}

function createWebview(url) {
  // Remove existing webview
  if (currentWebview) {
    currentWebview.remove();
  }

  // Create new webview
  const webview = document.createElement('webview');
  webview.src = url;
  webview.style.width = '100%';
  webview.style.height = '100%';
  webview.setAttribute('allowpopups', '');

  // Add event listeners
  webview.addEventListener('did-start-loading', () => {
    contentArea.style.opacity = '0.7';
  });

  webview.addEventListener('did-stop-loading', () => {
    contentArea.style.opacity = '1';
  });

  webview.addEventListener('new-window', (e) => {
    e.preventDefault();
    loadUrlInWebview(e.url);
  });

  currentWebview = webview;
  return webview;
}

function loadUrlInWebview(url) {
  contentArea.innerHTML = '';
  const webview = createWebview(url);
  contentArea.appendChild(webview);
  addressBar.value = url;
  addToHistory('webview', url);

  // Show floating bookmark button
  floatingBookmark.classList.add('show');
}

// Rendering functions
function renderHomePage() {
  // Hide floating bookmark button on home page
  floatingBookmark.classList.remove('show');

  contentArea.innerHTML = `
    <div class="home-page">
      <div class="hero-section">
        <h1 class="logo">FactFinder</h1>
        <p class="tagline">Trust the Truth</p>
        
        <div class="search-container">
          <div class="search-box-large">
            <svg class="search-icon-large" width="24" height="24" viewBox="0 0 24 24">
              <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="M15 15 L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input type="text" id="home-search" placeholder="Search anything..." />
          </div>
        </div>
      </div>

      ${bookmarks.length > 0 ? `
        <div class="bookmarks-section">
          <h2>Bookmarks</h2>
          <div class="bookmark-list">
            ${bookmarks.map(b => `
              <div class="bookmark-item" data-url="${b.url}">
                <div class="bookmark-icon">🔖</div>
                <div class="bookmark-info">
                  <div class="bookmark-title">${b.title}</div>
                  <div class="bookmark-url">${b.url}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Add event listeners
  const homeSearch = document.getElementById('home-search');
  if (homeSearch) {
    homeSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && homeSearch.value.trim()) {
        performSearch(homeSearch.value.trim());
      }
    });
    homeSearch.focus();
  }

  // Quick link handlers
  document.querySelectorAll('.quick-link').forEach(link => {
    link.addEventListener('click', () => {
      const category = link.dataset.category;
      searchByCategory(category);
    });
  });

  // Bookmark handlers
  document.querySelectorAll('.bookmark-item').forEach(item => {
    item.addEventListener('click', () => {
      const url = item.dataset.url;
      loadUrlInWebview(url);
    });
  });
}

function performSearch(query) {
  console.log('Performing search for:', query);
  addressBar.value = query;

  // Check if it's a URL
  if (query.startsWith('http://') || query.startsWith('https://') ||
    (query.includes('.') && !query.includes(' ') && query.split('.').length >= 2)) {
    // It's a URL, load it directly
    const url = query.startsWith('http') ? query : 'https://' + query;
    loadUrlInWebview(url);
  } else {
    // It's a search query, use Google
    const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    loadUrlInWebview(searchUrl);
  }

  // Add to search history
  searchHistory.unshift({ query, timestamp: Date.now() });
  if (searchHistory.length > 50) searchHistory.pop();
}

function searchByCategory(category) {
  const categoryUrls = {
    news: 'https://news.google.com',
    tech: 'https://www.google.com/search?q=technology+news',
    science: 'https://www.google.com/search?q=science+news',
    entertainment: 'https://www.google.com/search?q=entertainment+news',
    sports: 'https://www.google.com/search?q=sports+news',
    business: 'https://www.google.com/search?q=business+news'
  };

  const url = categoryUrls[category] || `https://www.google.com/search?q=${category}`;
  addressBar.value = url;
  loadUrlInWebview(url);
}

function renderHistoryPage() {
  floatingBookmark.classList.remove('show');

  contentArea.innerHTML = `
    <div class="history-page">
      <div class="page-header-simple">
        <h2>📜 Browse History</h2>
        <button class="clear-history-btn" id="clear-history">Clear All</button>
      </div>
      
      ${searchHistory.length > 0 ? `
        <div class="history-list">
          ${searchHistory.map((item, index) => `
            <div class="history-item" data-index="${index}">
              <div class="history-icon">🔍</div>
              <div class="history-info">
                <div class="history-query">${item.query}</div>
                <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
              </div>
              <button class="history-remove" data-index="${index}">×</button>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty-state"><p>No history yet. Start browsing!</p></div>'}
    </div>
  `;

  // History item click handlers
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.classList.contains('history-remove')) {
        const index = item.dataset.index;
        const query = searchHistory[index].query;
        addressBar.value = query;
        performSearch(query);
      }
    });
  });

  // Remove handlers
  document.querySelectorAll('.history-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      searchHistory.splice(index, 1);
      renderHistoryPage();
    });
  });

  // Clear all handler
  const clearBtn = document.getElementById('clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all history?')) {
        searchHistory = [];
        renderHistoryPage();
      }
    });
  }
}

function renderBookmarksPage() {
  floatingBookmark.classList.remove('show');

  contentArea.innerHTML = `
    <div class="bookmarks-page">
      <div class="page-header-simple">
        <h2>🔖 Your Bookmarks</h2>
      </div>
      
      ${bookmarks.length > 0 ? `
        <div class="bookmarks-grid">
          ${bookmarks.map((bookmark, index) => `
            <div class="bookmark-card" data-index="${index}">
              <div class="bookmark-card-header">
                <div class="bookmark-card-icon">🔖</div>
                <button class="bookmark-remove" data-index="${index}">×</button>
              </div>
              <h3 class="bookmark-card-title">${bookmark.title}</h3>
              <div class="bookmark-card-url">${bookmark.url}</div>
              <div class="bookmark-card-date">${new Date(bookmark.timestamp).toLocaleDateString()}</div>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty-state"><p>No bookmarks yet. Save your favorite pages!</p></div>'}
    </div>
  `;

  // Bookmark card click handlers
  document.querySelectorAll('.bookmark-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('bookmark-remove')) {
        const index = card.dataset.index;
        loadUrlInWebview(bookmarks[index].url);
      }
    });
  });

  // Remove handlers
  document.querySelectorAll('.bookmark-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      bookmarks.splice(index, 1);
      renderBookmarksPage();
    });
  });
}

function addBookmark(title, url) {
  const existing = bookmarks.find(b => b.url === url);
  if (!existing) {
    bookmarks.unshift({ title, url, timestamp: Date.now() });
    alert('✅ Bookmark added!');
  } else {
    alert('ℹ️ Already bookmarked!');
  }
}

function navigateBack() {
  if (historyIndex > 0) {
    historyIndex--;
    const entry = navigationHistory[historyIndex];
    loadHistoryEntry(entry);
    updateNavigationButtons();
  }
}

function navigateForward() {
  if (historyIndex < navigationHistory.length - 1) {
    historyIndex++;
    const entry = navigationHistory[historyIndex];
    loadHistoryEntry(entry);
    updateNavigationButtons();
  }
}

function loadHistoryEntry(entry) {
  if (entry.page === 'home') {
    renderHomePage();
  } else if (entry.page === 'webview') {
    loadUrlInWebview(entry.query);
  } else if (entry.page === 'history') {
    renderHistoryPage();
  } else if (entry.page === 'bookmarks') {
    renderBookmarksPage();
  }
}

// New DOM element selections
const magnetBtn = document.getElementById('magnet-btn');
const menuBtn = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const settingsBtn = document.getElementById('settings-btn');

// Menu handlers
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', () => {
  dropdownMenu.classList.remove('show');
});

dropdownMenu.addEventListener('click', (e) => {
  e.stopPropagation();
});

// Magnet button handler
magnetBtn.addEventListener('click', () => {
  // Placeholder for fact check logic
  const currentUrl = addressBar.value;
  alert(`🔍 Scanning ${currentUrl} for facts...`);
  // Here you would trigger your fact checking logic
});

// Navigation handlers
backBtn.addEventListener('click', navigateBack);
forwardBtn.addEventListener('click', navigateForward);

homeBtn.addEventListener('click', () => {
  addressBar.value = '';
  addToHistory('home');
  renderHomePage();
});

historyBtn.addEventListener('click', () => {
  dropdownMenu.classList.remove('show');
  addToHistory('history');
  renderHistoryPage();
});

bookmarksBtn.addEventListener('click', () => {
  dropdownMenu.classList.remove('show');
  addToHistory('bookmarks');
  renderBookmarksPage();
});

if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    dropdownMenu.classList.remove('show');
    alert('Settings coming soon!');
  });
}

// Floating bookmark button
floatingBookmark.addEventListener('click', () => {
  if (currentWebview) {
    const title = currentWebview.getTitle() || addressBar.value;
    const url = currentWebview.getURL() || addressBar.value;
    addBookmark(title, url);
  }
});

// Address bar handler
addressBar.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && addressBar.value.trim()) {
    console.log('Enter pressed in address bar');
    performSearch(addressBar.value.trim());
  }
});

addressBar.addEventListener('focus', () => {
  addressBar.select();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Cmd/Ctrl+H for history
  if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
    e.preventDefault();
    addToHistory('history');
    renderHistoryPage();
  }

  // Cmd/Ctrl+B for bookmarks
  if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
    e.preventDefault();
    addToHistory('bookmarks');
    renderBookmarksPage();
  }

  // Cmd/Ctrl+D for bookmark current page
  if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
    e.preventDefault();
    if (currentWebview) {
      const title = currentWebview.getTitle() || addressBar.value;
      const url = currentWebview.getURL() || addressBar.value;
      addBookmark(title, url);
    }
  }

  // Cmd/Ctrl+L to focus address bar
  if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
    e.preventDefault();
    addressBar.focus();
    addressBar.select();
  }
});

// Voice Recording Elements and State
const voiceRecordBtn = document.getElementById('voice-record-btn');
const voiceModal = document.getElementById('voice-modal');
const voiceModalClose = document.getElementById('voice-modal-close');
const recordButton = document.getElementById('record-button');
const recordButtonText = document.getElementById('record-button-text');
const micIcon = document.getElementById('mic-icon');
const recordingStatus = document.getElementById('recording-status');
const recordingTimer = document.getElementById('recording-timer');
const transcriptionResult = document.getElementById('transcription-result');

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingStartTime = 0;
let timerInterval = null;

// Voice Recording Functions
function openVoiceModal() {
  voiceModal.classList.add('show');
  resetRecordingUI();
}

function closeVoiceModal() {
  voiceModal.classList.remove('show');
  if (isRecording) {
    stopRecording();
  }
}

function resetRecordingUI() {
  recordingStatus.textContent = 'Click to start recording';
  recordingTimer.textContent = '00:00';
  transcriptionResult.classList.remove('show');
  transcriptionResult.innerHTML = '';
  micIcon.classList.remove('recording');
  recordButton.classList.remove('recording');
  recordButtonText.textContent = 'Start Recording';
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  recordingTimer.textContent = `${minutes}:${seconds}`;
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      console.log('🎤 Audio recorded:', (audioBlob.size / 1024).toFixed(2), 'KB');
      await processAudio(audioBlob);
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.start();
    isRecording = true;
    recordingStartTime = Date.now();
    
    micIcon.classList.add('recording');
    recordButton.classList.add('recording');
    recordButtonText.textContent = 'Stop Recording';
    recordingStatus.textContent = 'Recording...';
    voiceRecordBtn.classList.add('recording');
    
    timerInterval = setInterval(updateTimer, 1000);
    
    console.log('Recording started');
  } catch (error) {
    console.error('Error accessing microphone:', error);
    recordingStatus.textContent = 'Error: Could not access microphone';
    alert('Could not access microphone. Please check permissions.');
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    
    micIcon.classList.remove('recording');
    recordButton.classList.remove('recording');
    recordButtonText.textContent = 'Start Recording';
    recordingStatus.textContent = 'Processing...';
    voiceRecordBtn.classList.remove('recording');
    
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    
    console.log('Recording stopped');
  }
}

async function processAudio(audioBlob) {
  console.log('Processing audio, size:', audioBlob.size);
  
  recordingStatus.textContent = 'Transcribing...';
  
  try {
    const transcription = await transcribeWithFishAudio(audioBlob);
    
    transcriptionResult.classList.add('show');
    transcriptionResult.innerHTML = `
      <div style="margin-bottom: 12px;">
        <strong style="color: #667eea;">Transcription:</strong>
      </div>
      <div style="margin-bottom: 16px; max-height: 150px; overflow-y: auto;">${transcription.text || 'No speech detected'}</div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
        <button onclick="copyTranscription()" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">Copy</button>
        <button onclick="saveTranscriptionAsJSON()" style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">Save JSON</button>
        <button onclick="autoFactCheck()" style="padding: 8px 16px; background: #ff6b6b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">🔍 Fact Check</button>
      </div>
      <div id="ai-response-container" style="display: none; margin-top: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
        <div style="margin-bottom: 8px;">
          <strong style="color: #667eea;">Fact Check Results:</strong>
        </div>
        <div id="ai-response-text" style="color: #333; line-height: 1.6; white-space: pre-wrap;"></div>
      </div>
    `;
    
    recordingStatus.textContent = 'Transcription complete!';
    window.currentTranscription = transcription;
    
    // Automatically send to agent for fact-checking
    console.log('🤖 Auto-sending to AI agent for fact-checking...');
    setTimeout(() => autoFactCheck(), 500);
    
  } catch (error) {
    console.error('Error transcribing audio:', error);
    recordingStatus.textContent = 'Error during transcription';
    transcriptionResult.classList.add('show');
    transcriptionResult.innerHTML = `
      <div style="color: #ff4444;">
        <strong>Error:</strong> ${error.message}
      </div>
    `;
  }
}

async function transcribeWithFishAudio(audioBlob) {
  const apiKey = window.process && window.process.env && window.process.env.FISH_AUDIO_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No Fish Audio API key found');
    return {
      text: 'Error: No API key configured. Add FISH_AUDIO_API_KEY to your .env file.',
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }
  
  try {
    const fishClient = new FishAudioClient(apiKey);
    const res = await fishClient.transcribe(audioBlob);
    console.log('✅ Transcription:', res.text);
    return res;
  } catch (error) {
    console.error('❌ Fish Audio failed:', error.message);
    return {
      text: `Transcription failed: ${error.message}\n\nCheck:\n1. API key is valid at fish.audio/account\n2. Account has sufficient credits\n3. Audio format is supported`,
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }
}


// Global functions for transcription actions
window.copyTranscription = function() {
  if (window.currentTranscription && window.currentTranscription.text) {
    navigator.clipboard.writeText(window.currentTranscription.text)
      .then(() => {
        alert('✅ Transcription copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy transcription');
      });
  }
};

window.saveTranscriptionAsJSON = function() {
  if (window.currentTranscription) {
    const dataToSave = {
      transcription: window.currentTranscription,
      aiResponse: window.currentAIResponse || null
    };
    
    const jsonData = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✅ Transcription saved as JSON!');
  }
};

// Format fact-check response from markdown to HTML
function formatFactCheckResponse(text) {
  let html = text;
  
  // Convert headers (### text)
  html = html.replace(/###\s*\*\*(.*?)\*\*/g, '<h3 style="color: #d32f2f; font-size: 20px; margin: 20px 0 12px 0; font-weight: 700;">$1</h3>');
  html = html.replace(/###\s*(.*?)$/gm, '<h3 style="color: #d32f2f; font-size: 20px; margin: 20px 0 12px 0; font-weight: 700;">$1</h3>');
  
  // Convert horizontal rules (*** or ---)
  html = html.replace(/^\*\*\*$/gm, '<hr style="border: none; border-top: 2px solid #ffcdd2; margin: 16px 0;">');
  html = html.replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid #ffcdd2; margin: 16px 0;">');
  
  // Convert bullet lists (* item)
  html = html.replace(/^\*\s+(.+)$/gm, '<li style="margin: 8px 0; color: #424242;">$1</li>');
  
  // Wrap consecutive <li> tags in <ul>
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, (match) => {
    return '<ul style="margin: 12px 0; padding-left: 24px; list-style-type: disc;">' + match + '</ul>';
  });
  
  // Convert bold text (**text**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #c62828; font-weight: 700;">$1</strong>');
  
  // Convert italic text (*text*)
  html = html.replace(/\*(.+?)\*/g, '<em style="color: #666;">$1</em>');
  
  // Convert line breaks to <br> or <p>
  html = html.replace(/\n\n/g, '</p><p style="margin: 12px 0; color: #333;">');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p style="margin: 12px 0; color: #333;">' + html + '</p>';
  }
  
  // Add special styling for verification status
  html = html.replace(/(TRUE|FALSE|PARTIALLY TRUE|UNVERIFIABLE)/g, (match) => {
    const colors = {
      'TRUE': '#4caf50',
      'FALSE': '#f44336',
      'PARTIALLY TRUE': '#ff9800',
      'UNVERIFIABLE': '#9e9e9e'
    };
    return `<span style="background: ${colors[match]}; color: white; padding: 4px 12px; border-radius: 16px; font-weight: 700; font-size: 14px;">${match}</span>`;
  });
  
  // Add special styling for confidence level
  html = html.replace(/(High|Medium|Low)(?=\s*$)/gm, (match) => {
    const colors = {
      'High': '#4caf50',
      'Medium': '#ff9800',
      'Low': '#f44336'
    };
    return `<span style="background: ${colors[match]}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 16px; display: inline-block; margin-top: 8px;">${match}</span>`;
  });
  
  return html;
}

// Auto fact-check function - sends transcription to AI agent
window.autoFactCheck = async function() {
  if (!window.currentTranscription) {
    console.warn('No transcription available for fact-checking');
    return;
  }

  const responseContainer = document.getElementById('ai-response-container');
  const responseText = document.getElementById('ai-response-text');
  
  if (!responseContainer || !responseText) {
    console.error('Response container not found');
    return;
  }

  // Show loading state
  responseContainer.style.display = 'block';
  responseText.innerHTML = `
    <div style="text-align: center;">
      <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid #ff6b6b; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <div style="margin-top: 12px; color: #666; font-weight: 600;">🔍 Fact-checking with AI Agent...</div>
    </div>
  `;
  recordingStatus.textContent = 'Fact-checking...';

  try {
    const apiKey = window.process && window.process.env && window.process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google API key not configured. Add GOOGLE_API_KEY to your .env file.');
    }
    
    const geminiClient = new GeminiClient(apiKey);
    
    const factCheckPrompt = `You are a fact-checking AI agent. Analyze the following transcribed text and provide a detailed fact-check report.

Transcribed Text:
"${window.currentTranscription.text}"

Please provide:
1. **Claims Identified**: List all factual claims made in the text
2. **Verification Status**: For each claim, indicate if it's TRUE, FALSE, PARTIALLY TRUE, or UNVERIFIABLE
3. **Evidence**: Provide brief reasoning or context for each verification
4. **Overall Assessment**: Give a summary of the factual accuracy
5. **Confidence Level**: Rate your confidence in the fact-check (High/Medium/Low)

Format your response in a clear, structured way.`;

    const response = await geminiClient.generateContent(factCheckPrompt);
    
    console.log('✅ Fact-check complete:', response.text.substring(0, 100) + '...');
    
    // Store the response
    window.currentAIResponse = {
      task: 'fact-check',
      input: {
        text: window.currentTranscription.text,
        timestamp: window.currentTranscription.timestamp
      },
      response: response.text,
      timestamp: new Date().toISOString()
    };
    
    // Display the fact-check results with formatted HTML
    const formattedResponse = formatFactCheckResponse(response.text);
    
    responseText.innerHTML = `
      <div style="background: white; padding: 24px; border-radius: 12px; border: 2px solid #ff6b6b; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #ffe0e0;">
          <span style="font-size: 32px;">🔍</span>
          <strong style="color: #ff6b6b; font-size: 24px;">Fact Check Results</strong>
        </div>
        <div style="color: #333; line-height: 1.8;">${formattedResponse}</div>
      </div>
      <div style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 8px; border-left: 4px solid #4caf50;">
        <strong style="color: #2e7d32; font-size: 16px;">💾 Response saved to JSON</strong>
        <div style="margin-top: 12px;">
          <button onclick="saveTranscriptionAsJSON()" style="padding: 10px 20px; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.3s;">Download Full Report (JSON)</button>
        </div>
      </div>
    `;
    
    recordingStatus.textContent = 'Fact-check complete!';
    
  } catch (error) {
    console.error('❌ Fact-check error:', error);
    
    responseText.innerHTML = `
      <div style="color: #ff4444; padding: 16px; background: #ffebee; border-radius: 8px;">
        <strong>⚠️ Fact-Check Error:</strong><br><br>
        ${error.message}<br><br>
        <small style="color: #666;">
          ${!window.process?.env?.GOOGLE_API_KEY ? 
            'Make sure to add GOOGLE_API_KEY to your .env file.' : 
            'Check your internet connection and API key validity.'}
        </small>
      </div>
    `;
    
    recordingStatus.textContent = 'Fact-check failed';
  }
};

window.sendToGemini = async function() {
  if (!window.currentTranscription) {
    alert('No transcription available');
    return;
  }

  if (typeof GeminiClient === 'undefined') {
    alert('❌ Gemini AI client not loaded');
    return;
  }

  const geminiClient = new GeminiClient();
  
  if (!geminiClient.isConfigured()) {
    alert('⚠️ Gemini API key not configured!\n\nPlease add your Google API key to config.js:\n\ngemini: {\n  apiKey: "YOUR_API_KEY_HERE"\n}\n\nGet your key from: https://makersuite.google.com/app/apikey');
    return;
  }

  const taskSelect = document.getElementById('ai-task-select');
  const task = taskSelect ? taskSelect.value : 'analyze';
  
  const responseContainer = document.getElementById('ai-response-container');
  const responseText = document.getElementById('ai-response-text');
  
  if (responseContainer && responseText) {
    responseContainer.style.display = 'block';
    responseText.innerHTML = '<div style="text-align: center;"><div style="display: inline-block; width: 20px; height: 20px; border: 3px solid #667eea; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div><div style="margin-top: 8px; color: #666;">Analyzing with Gemini AI...</div></div>';
  }

  try {
    console.log('Sending to Gemini:', task, window.currentTranscription.text);
    
    const result = await geminiClient.analyzeTranscription(window.currentTranscription, task);
    
    console.log('Gemini response:', result);
    window.currentAIResponse = result;
    
    if (responseText) {
      responseText.textContent = result.response;
    }
    
    recordingStatus.textContent = 'AI analysis complete!';
    
  } catch (error) {
    console.error('Gemini API error:', error);
    
    if (responseText) {
      responseText.innerHTML = `<div style="color: #ff4444;">
        <strong>Error:</strong> ${error.message}
        <br><br>
        <small>Make sure your API key is valid and you have internet connection.</small>
      </div>`;
    }
    
    alert('❌ Failed to analyze with Gemini AI:\n\n' + error.message);
  }
};

// Voice recording event listeners
if (voiceRecordBtn) {
  voiceRecordBtn.addEventListener('click', openVoiceModal);
}
if (voiceModalClose) {
  voiceModalClose.addEventListener('click', closeVoiceModal);
}
if (recordButton) {
  recordButton.addEventListener('click', () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });
}
if (voiceModal) {
  voiceModal.addEventListener('click', (e) => {
    if (e.target === voiceModal) {
      closeVoiceModal();
    }
  });
}

// Initialize
console.log('Browser initializing...');
addToHistory('home');
renderHomePage();
console.log('Browser initialized!');
