// ScreenMate AI - Injected Content Script Bridge (Side Panel Primary Architecture)

(function () {
  if (window.__screenmate_content_injected) return;
  window.__screenmate_content_injected = true;

  // Listen for messaging between page and extension
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (event.data && event.data.type === 'SCREENMATE_PING_EXTENSION') {
      chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB_INFO' }, (tabInfo) => {
        window.postMessage(
          {
            type: 'SCREENMATE_EXTENSION_PONG',
            version: '1.0.0',
            tabTitle: tabInfo?.title || document.title,
            tabUrl: tabInfo?.url || window.location.href,
          },
          '*'
        );
      });
    }

    if (event.data && event.data.type === 'SCREENMATE_REQUEST_TAB_CAPTURE') {
      chrome.runtime.sendMessage({ type: 'CAPTURE_CURRENT_TAB' }, (response) => {
        if (response && response.dataUrl) {
          window.postMessage(
            {
              type: 'SCREENMATE_EXTENSION_TAB_CAPTURED',
              dataUrl: response.dataUrl,
            },
            '*'
          );
        }
      });
    }
  });
})();
