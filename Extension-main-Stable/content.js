const floatingUI = document.createElement('div');

const createButton = (text, activeColor = '#4CAF50') => {
    const button = document.createElement('button');
    button.innerText = text;
    button.style.width = '100%';
    button.style.height = '50px';
    button.style.margin = '10px 0';
    button.style.borderRadius = '8px';
    button.style.backgroundColor = '#555';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.3s, transform 0.2s, box-shadow 0.3s';
    button.style.fontSize = '16px';
    button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
    button.style.fontFamily = 'Arial, sans-serif';

    button.onmousedown = () => {
        button.style.backgroundColor = activeColor;
        button.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.7)';
    };

    button.onmouseup = () => {
        button.style.backgroundColor = '#555';
        button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
    };

    return button;
};

const autoLoadButton = createButton('Auto Load');
const promptButton = createButton('Prompt');
const settingsButton = createButton('Settings');
const dynamicButton = createButton('Dynamic Button');
const autoSummaryButton = createButton('Auto Summary');
const createCharacterButton = createButton('Create Character');

let autoLoadEnabled = false;
let autoLoadInterval;

let isDragging = false;
let offset = { x: 0, y: 0 };

floatingUI.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = floatingUI.getBoundingClientRect();
    offset.x = e.clientX - rect.left;
    offset.y = e.clientY - rect.top;
    document.body.style.cursor = 'grabbing';
});

document.onmouseup = () => {
    isDragging = false;
    document.body.style.cursor = 'default';
};

document.onmousemove = (e) => {
    if (isDragging) {
        floatingUI.style.left = `${e.clientX - offset.x}px`;
        floatingUI.style.top = `${e.clientY - offset.y}px`;
    }
};

const toggleExpand = (expand) => {
    Array.from(floatingUI.children).forEach(child => {
        if (child !== minimizeButton) {
            child.style.opacity = expand ? '1' : '0';
            child.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            child.style.animation = expand ? 'fadeIn 0.3s ease, slideIn 0.3s ease' : 'fadeOut 0.3s ease, slideOut 0.3s ease';
            child.style.transform = expand ? 'translateY(0)' : 'translateY(-10px)';
            setTimeout(() => {
                child.style.display = expand ? 'block' : 'none';
            }, expand ? 0 : 300);
        }
    });
};

const minimizeButton = createButton('−', '#F44336');
minimizeButton.onclick = () => {
    const expanded = floatingUI.dataset.expanded === 'true';
    toggleExpand(!expanded);
    floatingUI.dataset.expanded = !expanded;
    minimizeButton.style.animation = expanded ? 'bounceOut 0.5s ease' : 'bounceIn 0.5s ease';
};

floatingUI.appendChild(minimizeButton);

autoLoadButton.addEventListener('click', () => {
    autoLoadEnabled = !autoLoadEnabled;
    autoLoadButton.style.backgroundColor = autoLoadEnabled ? '#4CAF50' : '#555';
    if (autoLoadEnabled) {
        autoLoadInterval = setInterval(() => {
            const loadMoreButton = document.querySelector('button.inline-flex.items-center.justify-center.rounded-full.text-sm.transition-colors.focus-visible\\:outline-none.disabled\\:pointer-events-none.disabled\\:opacity-50.select-none.bg-primary.text-primary-foreground.shadow.hover\\:bg-primary\\/90.active\\:bg-primary\\/90.h-9.px-4.py-2.mb-4.max-md\\:self-stretch');
            if (loadMoreButton) {
                loadMoreButton.click();
            }
        }, 3000);
    } else {
        clearInterval(autoLoadInterval);
    }
});

autoSummaryButton.addEventListener('click', () => {
    const popupUrl = chrome.runtime.getURL('popup.html');
    window.open(popupUrl, '_blank', 'width=600,height=400');
});

createCharacterButton.addEventListener('click', () => {
    const creatingUrl = chrome.runtime.getURL('creating.html');
    window.open(creatingUrl, '_blank', 'width=600,height=400');
});

const sendTokenizerButton = createButton('Tokenizer');
sendTokenizerButton.onclick = () => {
    const tokenizerUrl = chrome.runtime.getURL('tokenizer.html');
    if (window.chrome && window.chrome.runtime && window.chrome.runtime.openOptionsPage) {
        window.chrome.runtime.openOptionsPage();
    } else {
        window.open(tokenizerUrl, '_blank', 'width=600,height=400');
    }
};
floatingUI.appendChild(sendTokenizerButton);


const createOverlay = (title, contentElements) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = 'white';
    overlay.style.opacity = '0';

    const overlayUI = document.createElement('div');
    overlayUI.style.backgroundColor = '#444';
    overlayUI.style.padding = '20px';
    overlayUI.style.borderRadius = '12px';
    overlayUI.style.width = '400px';
    overlayUI.style.maxHeight = '80%';
    overlayUI.style.overflowY = 'auto';
    overlayUI.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
    overlayUI.style.display = 'flex';
    overlayUI.style.flexDirection = 'column';

    const titleElement = document.createElement('h2');
    titleElement.innerText = title;
    titleElement.style.marginBottom = '15px';
    titleElement.style.color = '#f0f0f0';
    titleElement.style.textAlign = 'center';
    titleElement.style.fontFamily = 'Arial, sans-serif';

    const closeButton = createButton('Close');
    closeButton.onclick = () => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 500);
    };

    overlayUI.appendChild(titleElement);
    contentElements.forEach(el => overlayUI.appendChild(el));
    overlayUI.appendChild(closeButton);
    overlay.appendChild(overlayUI);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 0);
};

const showPromptOverlay = () => {
    const overlayContent = document.createElement('div');
    const promptList = document.createElement('ul');
    const loadMoreButton = createButton('Load More');
    const newPromptInput = document.createElement('input');
    newPromptInput.style.width = '100%';
    newPromptInput.style.padding = '10px';
    newPromptInput.style.borderRadius = '5px';
    newPromptInput.style.border = '1px solid #ccc';
    newPromptInput.style.marginBottom = '10px';
    newPromptInput.style.fontSize = '16px';

    const addPromptButton = createButton('Add Prompt');

    let currentPromptCount = 5;

    const loadPrompts = () => {
        const storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
        promptList.innerHTML = '';
        storedPrompts.slice(0, currentPromptCount).forEach(prompt => {
            const promptItem = document.createElement('li');
            promptItem.textContent = prompt.text;
            promptItem.style.cursor = 'pointer';
            promptItem.style.marginBottom = '10px';
            promptItem.style.color = '#f0f0f0';
            promptItem.style.padding = '10px';
            promptItem.style.borderRadius = '5px';
            promptItem.style.backgroundColor = '#555';

            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'space-between';
            buttonContainer.style.marginTop = '5px';

            const downloadButton = createButton('Download', '#2196F3');
            downloadButton.style.flex = '1';
            downloadButton.onclick = () => {
                const blob = new Blob([prompt.text], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'prompt.txt';
                link.click();
            };

            const copyButton = createButton('Copy', '#2196F3');
            copyButton.style.flex = '1';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(prompt.text).then(() => {
                    alert('Prompt copied to clipboard!');
                });
            };

            const removeButton = createButton('Remove', '#F44336');
            removeButton.style.flex = '1';
            removeButton.onclick = () => {
                let storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
                storedPrompts = storedPrompts.filter(p => p.text !== prompt.text);
                localStorage.setItem('prompts', JSON.stringify(storedPrompts));
                loadPrompts();
            };

            buttonContainer.appendChild(downloadButton);
            buttonContainer.appendChild(copyButton);
            buttonContainer.appendChild(removeButton);
            promptItem.appendChild(buttonContainer);
            promptList.appendChild(promptItem);
        });
    };

    loadPrompts();

    loadMoreButton.onclick = () => {
        currentPromptCount += 5;
        loadPrompts();
    };

    addPromptButton.onclick = () => {
        const newPrompt = newPromptInput.value;
        if (newPrompt) {
            const storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
            storedPrompts.push({ text: newPrompt });
            localStorage.setItem('prompts', JSON.stringify(storedPrompts));
            newPromptInput.value = '';
            loadPrompts();
        }
    };

    overlayContent.appendChild(newPromptInput);
    overlayContent.appendChild(addPromptButton);
    overlayContent.appendChild(promptList);
    overlayContent.appendChild(loadMoreButton);
    createOverlay('Prompts', [overlayContent]);
};

const showSettingsOverlay = () => {
    const overlayContent = document.createElement('div');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    const changeBgButton = createButton('Change Background');

    changeBgButton.onclick = () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                sidebar.style.backgroundImage = `url(${event.target.result})`;
                sidebar.style.backgroundSize = 'cover';
                sidebar.style.backgroundPosition = 'center';
            };
            reader.readAsDataURL(file);
        }
    };

    overlayContent.appendChild(fileInput);
    overlayContent.appendChild(changeBgButton);
    createOverlay('Settings', [overlayContent]);
};

settingsButton.addEventListener('click', showSettingsOverlay);
promptButton.addEventListener('click', showPromptOverlay);

floatingUI.appendChild(autoLoadButton);
floatingUI.appendChild(promptButton);
floatingUI.appendChild(settingsButton);
floatingUI.appendChild(dynamicButton);
floatingUI.appendChild(autoSummaryButton);
floatingUI.appendChild(createCharacterButton);

floatingUI.style.position = 'fixed';
floatingUI.style.left = '20px';
floatingUI.style.top = '20px';
floatingUI.style.width = '200px';
floatingUI.style.backgroundColor = '#333';
floatingUI.style.borderRadius = '8px';
floatingUI.style.zIndex = '10000';
floatingUI.style.padding = '10px';
floatingUI.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
floatingUI.dataset.expanded = 'true';

document.body.appendChild(floatingUI);

const textareas = document.querySelectorAll('textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"]');

textareas.forEach(textarea => {
    textarea.addEventListener('input', async () => {
        const text = textarea.value;
        if (text) {
            const responseContainer = document.getElementById(':Riicvf6lefja:-form-item');
            const responses = await Promise.all(Array(4).fill(0).map(async () => {
                const response = await tokenizeText(text);
                return response;
            }));
            if (responseContainer) {
                responseContainer.value = responses.join('\n\n');
            }
        }
    });
});

async function tokenizeText(text) {
    const API_URL = 'https://tiktoken-2nt2.onrender.com/tokenize';
    const AUTH_HEADER = 'Bearer SSS155';
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH_HEADER
        },
        body: JSON.stringify({ text: text })
    });
    const data = await response.json();
    return JSON.stringify(data, null, 2);
}
