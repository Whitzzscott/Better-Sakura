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
