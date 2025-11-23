// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;
const tabs = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      partition: 'persist:main',
      enableWebSQL: false,
      allowRunningInsecureContent: false
    },
    titleBarStyle: 'default',
    backgroundColor: '#667eea',
    show: false,
    title: 'Browser'
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadFile('index.html');

  // Enable context menu (right-click) for the main window
  mainWindow.webContents.on('context-menu', (event, params) => {
    // Allow context menu to work
    event.preventDefault = () => {};
  });

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('new-tab', async (event, url) => {
  return { success: true, url: url || 'https://www.google.com' };
});

ipcMain.handle('get-history', async () => {
  return [];
});

ipcMain.handle('save-bookmark', async (event, bookmark) => {
  console.log('Bookmark saved:', bookmark);
  return { success: true };
});

// Handle fact-check requests from webviews
ipcMain.on('fact-check-from-webview', (event, text) => {
  console.log('Fact-check request from webview:', text.substring(0, 50));
  // Forward to renderer process
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('fact-check-text', text);
  }
});
