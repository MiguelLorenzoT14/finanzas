import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    // Remove native menu bar
    Menu.setApplicationMenu(null);

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 750,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        icon: path.join(__dirname, '../assets/icon.png'),
        titleBarOverlay: {
            color: '#1a1a24',
            symbolColor: '#e0e0e0',
            height: 32
        },
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Window state events
    mainWindow.on('maximize', () => {
        mainWindow?.webContents.send('window-maximized');
    });

    mainWindow.on('unmaximize', () => {
        mainWindow?.webContents.send('window-unmaximized');
    });

    mainWindow.on('enter-full-screen', () => {
        mainWindow?.webContents.send('window-enter-fullscreen');
    });

    mainWindow.on('leave-full-screen', () => {
        mainWindow?.webContents.send('window-leave-fullscreen');
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        // mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// IPC handlers for getting window state
ipcMain.handle('is-maximized', () => {
    return mainWindow?.isMaximized() ?? false;
});

ipcMain.handle('is-fullscreen', () => {
    return mainWindow?.isFullScreen() ?? false;
});

app.on('ready', () => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
