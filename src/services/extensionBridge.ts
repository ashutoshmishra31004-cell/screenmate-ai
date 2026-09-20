import { ExtensionStatus } from '../types';

export class ExtensionBridge {
  private static status: ExtensionStatus = {
    installed: false,
    version: null,
  };
  private static listeners: Set<(status: ExtensionStatus) => void> = new Set();
  private static messageHandlerAttached = false;

  public static init() {
    if (typeof window === 'undefined') return;

    if (!ExtensionBridge.messageHandlerAttached) {
      window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        const data = event.data;

        if (data && data.type === 'SCREENMATE_EXTENSION_PONG') {
          ExtensionBridge.status = {
            installed: true,
            version: data.version || '1.0.0',
            tabTitle: data.tabTitle,
            tabUrl: data.tabUrl,
          };
          ExtensionBridge.notify();
        }

        if (data && data.type === 'SCREENMATE_EXTENSION_TAB_CAPTURED') {
          // Handle incoming capture from extension
          window.dispatchEvent(
            new CustomEvent('screenmate_extension_capture', { detail: data.dataUrl })
          );
        }
      });
      ExtensionBridge.messageHandlerAttached = true;
    }

    // Ping extension
    ExtensionBridge.ping();
  }

  public static ping() {
    if (typeof window === 'undefined') return;
    window.postMessage({ type: 'SCREENMATE_PING_EXTENSION' }, '*');
  }

  public static requestTabCapture() {
    if (typeof window === 'undefined') return;
    window.postMessage({ type: 'SCREENMATE_REQUEST_TAB_CAPTURE' }, '*');
  }

  public static getStatus(): ExtensionStatus {
    return { ...ExtensionBridge.status };
  }

  public static subscribe(listener: (status: ExtensionStatus) => void): () => void {
    ExtensionBridge.listeners.add(listener);
    return () => {
      ExtensionBridge.listeners.delete(listener);
    };
  }

  private static notify() {
    ExtensionBridge.listeners.forEach((l) => l(ExtensionBridge.status));
  }
}
