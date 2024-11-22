chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ 
        autoLoad: true,
        sakuraEnhance: true,
        showPTag: true,
        autoTrigger: true,
        customFont: '',
        fontSize: '16px',
        theme: 'dark'
    }, () => {
        console.log("Extension installed: Default settings initialized");
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSettings") {
        chrome.storage.sync.get([
            "autoLoad", 
            "sakuraEnhance", 
            "showPTag",
            "autoTrigger",
            "customFont",
            "fontSize",
            "theme"
        ], (data) => {
            data.showPTag = true;
            data.autoTrigger = true;
            sendResponse(data);
        });
        return true;
    } 
    
    if (request.action === "updateShowPTag") {
        chrome.storage.sync.set({ 
            showPTag: true,
            autoTrigger: true 
        }, () => {
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === "resetSettings") {
        chrome.storage.sync.set({
            autoLoad: true,
            sakuraEnhance: true, 
            showPTag: true,
            autoTrigger: true,
            customFont: '',
            fontSize: '16px',
            theme: 'dark'
        }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});
