// Load environment variables from .env file
require('dotenv').config();

const { app, BrowserWindow, ipcMain, screen, globalShortcut, desktopCapturer } = require('electron');
const path = require('path');

let mainWindow;
let isRecording = false;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        x: 0,
        y: 0,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        hasShadow: false,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Click-through by default
    mainWindow.setIgnoreMouseEvents(true, { forward: true });

    mainWindow.loadFile('index.html');
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}

app.whenReady().then(() => {
    createWindow();

    // Register Global Shortcut
    const ret = globalShortcut.register('Command+]', () => {
        console.log('Command+] pressed');
        isRecording = !isRecording;

        // Notify renderer to toggle state
        if (mainWindow) {
            mainWindow.webContents.send('toggle-recording', isRecording);
        }
    });

    if (!ret) {
        console.log('Registration failed');
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers for Click-Through Logic
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.setIgnoreMouseEvents(ignore, options);
});

// Get Screen Source for System Audio
ipcMain.handle('get-stream-source', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    // Usually the first screen is the main display
    if (sources.length > 0) {
        return sources[0].id;
    }
    return null;
});

// Mock Intelligence Handlers (Still used for now as placeholder for Gemini)
ipcMain.handle('analyze-audio', async (event, text) => {
    console.log('Analyzing text:', text);
    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock Result
    return {
        isTrue: false,
        statement: "The GDP has doubled in the last year!",
        correction: "GDP growth has remained flat at 0.1%.",
        source: "World Bank Data 2024"
    };
});

// Handle logs from renderer
ipcMain.on('log-message', (event, message) => {
    console.log('[Renderer]:', message);
});
