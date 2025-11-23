const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  newTab: (url) => ipcRenderer.invoke('new-tab', url),
  getHistory: () => ipcRenderer.invoke('get-history'),
  saveBookmark: (bookmark) => ipcRenderer.invoke('save-bookmark', bookmark)
});

// Expose environment variables to renderer process
contextBridge.exposeInMainWorld('process', {
  env: {
    FISH_AUDIO_API_KEY: process.env.FISH_AUDIO_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  }
});
