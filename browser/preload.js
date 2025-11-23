const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, single electronAPI object to the renderer. Do NOT expose ipcRenderer directly.
contextBridge.exposeInMainWorld('electronAPI', {
  newTab: (url) => ipcRenderer.invoke('new-tab', url),
  getHistory: () => ipcRenderer.invoke('get-history'),
  saveBookmark: (bookmark) => ipcRenderer.invoke('save-bookmark', bookmark),
  // Proxy fact-check: runs in main process to avoid CORS and keep keys secure
  proxyFactCheck: (text) => ipcRenderer.invoke('proxy-fact-check', text)
});

// Expose a minimal process.env to the renderer so code can read required keys
contextBridge.exposeInMainWorld('process', {
  env: {
    FISH_AUDIO_API_KEY: process.env.FISH_AUDIO_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  }
});
