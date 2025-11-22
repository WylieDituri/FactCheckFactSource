const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  newTab: (url) => ipcRenderer.invoke('new-tab', url),
  getHistory: () => ipcRenderer.invoke('get-history'),
  saveBookmark: (bookmark) => ipcRenderer.invoke('save-bookmark', bookmark)
});
