chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ autoLoad: true, sakuraEnhance: true }, () => {
        console.log("Default settings have been set.");
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSettings") {
        chrome.storage.sync.get(["autoLoad", "sakuraEnhance"], (data) => {
            sendResponse(data);
        });
        return true;
    }
});