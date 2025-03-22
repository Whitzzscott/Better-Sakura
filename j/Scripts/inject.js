(function () {
    console.log("inject.js loaded");  

  
    window.injectContent = function (content) {
        console.log("injectContent function called with content:", content);  
        window.content = content;

      
        waitForBody(() => {
            const observer = new MutationObserver(() => {
                setupButtonListeners(window.content);
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setupButtonListeners(window.content);
        });
    };

    function waitForBody(callback) {
        if (document.body) {
            callback();
        } else {
            new MutationObserver((_, observer) => {
                if (document.body) {
                    callback();
                    observer.disconnect();
                }
            }).observe(document.documentElement, { childList: true });
        }
    }

    function setupButtonListeners(content) {
        const button1 = document.querySelector(".h-9.w-9.bg-primary");
        const button2 = document.querySelector(".h-9.px-4.py-2.bg-primary");

        if (button1) {
            button1.removeEventListener("click", enableFetchInterceptor);
            button1.addEventListener("click", function () {
                enableFetchInterceptor(content);
            });
        }
        if (button2) {
            button2.removeEventListener("click", enableFetchInterceptor);
            button2.addEventListener("click", function () {
                enableFetchInterceptor(content);
            });
        }
    }

    function enableFetchInterceptor(content) {
        if (!window.fetchModified) {
            const originalFetch = window.fetch.bind(window);
            window.fetch = modifyFetchPayload(originalFetch, content);
            window.fetchModified = true;
        }
    }

    function modifyFetchPayload(originalFetch, content) {
        return async function (input, init = {}) {
            let url = typeof input === 'string' ? input : input.url;
            if (url.includes("https://api.sakura.fm/api/chat") && init.method === "POST") {
                if (init && init.body) {
                    try {
                        let body;
                        if (typeof init.body === 'string') {
                            body = JSON.parse(init.body);
                        }

                        if (body && body.action && body.action.content) {
                            body.action.content += content;
                            init.body = JSON.stringify(body);
                        }
                    } catch (error) {
                        console.error("Error modifying fetch payload:", error);
                    }
                }
            }
            return originalFetch(input, init);
        };
    }
})();
