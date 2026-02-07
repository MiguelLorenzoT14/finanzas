import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    // Window state listeners
    onMaximize: (callback: () => void) => ipcRenderer.on('window-maximized', callback),
    onUnmaximize: (callback: () => void) => ipcRenderer.on('window-unmaximized', callback),
    onEnterFullScreen: (callback: () => void) => ipcRenderer.on('window-enter-fullscreen', callback),
    onLeaveFullScreen: (callback: () => void) => ipcRenderer.on('window-leave-fullscreen', callback),

    // Get initial window state
    isMaximized: () => ipcRenderer.invoke('is-maximized'),
    isFullScreen: () => ipcRenderer.invoke('is-fullscreen'),

    // Remove listeners
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
});
