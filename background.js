// Background service worker for Schema Markup Inspector
// Handles extension lifecycle and communication

chrome.runtime.onInstalled.addListener(() => {
  console.log('Schema Markup Inspector installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically due to manifest configuration
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'logError') {
    console.error('Content script error:', request.error);
  }
  return true;
});

// Handle tab updates to ensure content script is injected
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Content script will be automatically injected due to manifest configuration
  }
});
