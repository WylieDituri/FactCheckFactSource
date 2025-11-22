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

// Navigation handlers
backBtn.addEventListener('click', navigateBack);
forwardBtn.addEventListener('click', navigateForward);

homeBtn.addEventListener('click', () => {
  addressBar.value = '';
  addToHistory('home');
  renderHomePage();
});

historyBtn.addEventListener('click', () => {
  addToHistory('history');
  renderHistoryPage();
});

bookmarksBtn.addEventListener('click', () => {
  addToHistory('bookmarks');
  renderBookmarksPage();
});

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

// Initialize
console.log('Browser initializing...');
addToHistory('home');
renderHomePage();
console.log('Browser initialized!');
