export interface ElectronAPI {
    onMaximize: (callback: () => void) => void;
    onUnmaximize: (callback: () => void) => void;
    onEnterFullScreen: (callback: () => void) => void;
    onLeaveFullScreen: (callback: () => void) => void;
    isMaximized: () => Promise<boolean>;
    isFullScreen: () => Promise<boolean>;
    removeAllListeners: (channel: string) => void;
}

declare global {
    interface Window {
        electron?: ElectronAPI;
    }
}
