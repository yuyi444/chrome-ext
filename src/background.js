// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log('Inline Text Completion Extension Installed');
  });
  
  // Example on how to listen for the key requests (ensure you have some UI for this)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getKey') {
      chrome.storage.sync.get(['OPENAI_KEY'], (result) => {
        sendResponse({ key: result.OPENAI_KEY });
      });
      return true; // Keep the messaging channel open for sendResponse
    }
  });