chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ autoLoad: true, sakuraEnhance: true });
});
