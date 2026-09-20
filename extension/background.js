// ScreenMate AI - Background Service Worker with Target Tab Tracking & Isolated Capture

chrome.runtime.onInstalled.addListener(() => {
  console.log('ScreenMate AI Extension Installed');
});

// Configure Side Panel behavior to open on extension icon click
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
}

// Track active target tab changes
function notifyActiveTabChange(tab) {
  if (!tab || !tab.id) return;
  chrome.runtime.sendMessage({
    type: 'ACTIVE_TAB_CHANGED',
    tabId: tab.id,
    title: tab.title || 'Target Screen',
    url: tab.url || '',
  }).catch(() => {}); // Ignore error if sidepanel is closed
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab) notifyActiveTabChange(tab);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && (changeInfo.title || changeInfo.url)) {
    notifyActiveTabChange(tab);
  }
});

// Message Dispatcher
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Capture ONLY the target tab visible area (excludes Side Panel completely)
  if (message.type === 'CAPTURE_CURRENT_TAB') {
    chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 85 }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ dataUrl });
      }
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'GET_ACTIVE_TAB_INFO') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      sendResponse({
        tabId: tab?.id,
        title: tab?.title || 'Target Screen',
        url: tab?.url || '',
      });
    });
    return true;
  }
});
