chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "ai-suggestion",
      title: "Improve with AI",
      contexts: ["editable"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "ai-suggestion") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: improveText
      });
    }
  });
  
  function improveText() {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === "TEXTAREA" || activeElement.isContentEditable) {
      chrome.runtime.sendMessage({ text: activeElement.value }, (response) => {
        if (response && response.suggestion) {
          activeElement.value = response.suggestion;
        }
      });
    }
  }
  