document.addEventListener('DOMContentLoaded', () => {
  const openAppBtn = document.getElementById('openAppBtn');
  const captureTabBtn = document.getElementById('captureTabBtn');
  const tabTitleEl = document.getElementById('tabTitle');

  // Query active tab title
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      tabTitleEl.textContent = tabs[0].title || 'Browser Tab';
    }
  });

  openAppBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });

  captureTabBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
  });
});
