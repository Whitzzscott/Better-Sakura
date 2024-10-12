const sidebar = document.createElement('div');
sidebar.style.position = 'fixed';
sidebar.style.top = '0';
sidebar.style.right = '0';
sidebar.style.width = '50px';
sidebar.style.height = '100%';
sidebar.style.backgroundColor = '#2c2c2c';
sidebar.style.color = 'white';
sidebar.style.overflowY = 'auto';
sidebar.style.transition = 'width 0.3s';
sidebar.style.zIndex = '9999';
sidebar.style.padding = '10px';
sidebar.style.display = 'flex';
sidebar.style.flexDirection = 'column';
sidebar.style.alignItems = 'center';
sidebar.style.borderLeft = '2px solid #555';

let autoLoadEnabled = false;
let autoLoadInterval;
let autoLoadIntervalTime = 3000;

const toggleExpand = (expand) => {
    sidebar.style.width = expand ? '200px' : '50px';
    Array.from(sidebar.children).forEach(child => {
        if (child.tagName !== 'BUTTON') {
            child.style.display = expand ? 'block' : 'none';
        }
    });
};

sidebar.addEventListener('mouseenter', () => toggleExpand(true));
sidebar.addEventListener('mouseleave', () => toggleExpand(false));

const createButton = (text) => {
    const button = document.createElement('button');
    button.innerText = text;
    button.style.width = '40px';
    button.style.height = '40px';
    button.style.margin = '5px 0';
    button.style.padding = '0';
    button.style.fontSize = '10px';
    button.style.borderRadius = '5px';
    button.style.backgroundColor = '#555';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.onmouseover = () => button.style.backgroundColor = '#777';
    button.onmouseleave = () => {
        if (button.style.backgroundColor !== 'green') {
            button.style.backgroundColor = '#555';
        }
    };
    
    button.addEventListener('click', () => {
        if (button.style.backgroundColor === 'green') {
            button.style.backgroundColor = '#555';
        } else {
            button.style.backgroundColor = 'green';
        }
    });

    return button;
};

const autoLoadButton = createButton('Auto Load');
const customJSButton = createButton('Add JS');
const promptButton = createButton('Prompt');
const settingsButton = createButton('Settings');

sidebar.appendChild(autoLoadButton);
sidebar.appendChild(customJSButton);
sidebar.appendChild(promptButton);
sidebar.appendChild(settingsButton);
document.body.appendChild(sidebar);

const autoLoadMore = () => {
    const loadMoreButton = document.querySelector('button.inline-flex.items-center.justify-center.rounded-full.text-sm.transition-colors.focus-visible\\:outline-none.disabled\\:pointer-events-none.disabled\\:opacity-50.select-none.bg-primary.text-primary-foreground.shadow.hover\\:bg-primary\\/90.active\\:bg-primary\\/90.h-9.px-4.py-2.mb-4.max-md\\:self-stretch');
    if (loadMoreButton && loadMoreButton.textContent.trim() === 'Load more') {
        loadMoreButton.click();
    }
};

window.addEventListener('scroll', () => {
    if (autoLoadEnabled) {
        autoLoadMore();
    }
});

autoLoadButton.addEventListener('click', () => {
    autoLoadEnabled = !autoLoadEnabled;
    autoLoadButton.style.backgroundColor = autoLoadEnabled ? 'green' : '#555';
    if (autoLoadEnabled) {
        autoLoadInterval = setInterval(autoLoadMore, autoLoadIntervalTime);
    } else {
        clearInterval(autoLoadInterval);
    }
});

customJSButton.addEventListener('click', () => {
    const jsCode = prompt('Enter your JavaScript code:');
    if (jsCode) {
        try {
            eval(jsCode);
            alert('JavaScript executed successfully!');
        } catch (e) {
            alert('Error executing JavaScript: ' + e.message);
        }
    }
});

const createOverlay = (title, contentElements) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = 'white';

    const overlayUI = document.createElement('div');
    overlayUI.style.backgroundColor = '#444';
    overlayUI.style.padding = '20px';
    overlayUI.style.borderRadius = '10px';
    overlayUI.style.width = '400px';
    overlayUI.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
    overlayUI.style.display = 'flex';
    overlayUI.style.flexDirection = 'column';

    const titleElement = document.createElement('h2');
    titleElement.innerText = title;
    titleElement.style.marginBottom = '15px';
    titleElement.style.color = '#f0f0f0';
    titleElement.style.textAlign = 'center';

    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    closeButton.style.marginTop = '10px';
    closeButton.style.border = 'none';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '5px 10px';
    closeButton.style.borderRadius = '5px';

    overlayUI.appendChild(titleElement);
    contentElements.forEach(el => overlayUI.appendChild(el));
    overlayUI.appendChild(closeButton);
    overlay.appendChild(overlayUI);
    document.body.appendChild(overlay);
};

const showPromptOverlay = (prompt) => {
    const overlayContent = document.createElement('div');

    const renameInput = document.createElement('input');
    renameInput.placeholder = 'Rename prompt';
    renameInput.value = prompt.text;
    renameInput.style.width = '100%';
    renameInput.style.marginBottom = '10px';
    renameInput.style.padding = '5px';
    renameInput.style.border = '1px solid #ccc';
    renameInput.style.borderRadius = '5px';

    const renameButton = document.createElement('button');
    renameButton.innerText = 'Rename Prompt';
    renameButton.style.marginBottom = '10px';
    renameButton.onclick = () => {
        const newName = renameInput.value.trim();
        if (newName) {
            const storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
            const updatedPrompts = storedPrompts.map(p => p.text === prompt.text ? { text: newName } : p);
            localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
            loadPrompts();
            document.body.removeChild(overlay);
        }
    };

    const copyButton = document.createElement('button');
    copyButton.innerText = 'Copy Prompt';
    copyButton.style.marginBottom = '10px';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(prompt.text).then(() => {
            alert('Prompt copied to clipboard!');
        });
    };

    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'Download Prompt';
    downloadButton.style.marginBottom = '10px';
    downloadButton.onclick = () => {
        const blob = new Blob([prompt.text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prompt.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const removeButton = document.createElement('button');
    removeButton.innerText = 'Remove Prompt';
    removeButton.onclick = () => {
        const storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
        const updatedPrompts = storedPrompts.filter(p => p.text !== prompt.text);
        localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
        loadPrompts();
        document.body.removeChild(overlay);
    };

    overlayContent.appendChild(renameInput);
    overlayContent.appendChild(renameButton);
    overlayContent.appendChild(copyButton);
    overlayContent.appendChild(downloadButton);
    overlayContent.appendChild(removeButton);
    
    createOverlay('Manage Prompt', [overlayContent]);
};

const showSettingsOverlay = () => {
    const overlayContent = document.createElement('div');

    const themeSelect = document.createElement('select');
    themeSelect.innerHTML = `
        <option value="black">Dark</option>
        <option value="blue">Blue</option>
        <option value="yellow">Yellow</option>
        <option value="white">White</option>
    `;
    themeSelect.onchange = (e) => {
        sidebar.style.backgroundColor = e.target.value;
    };

    const intervalInput = document.createElement('input');
    intervalInput.type = 'number';
    intervalInput.value = autoLoadIntervalTime / 1000;
    intervalInput.placeholder = 'Auto Load Interval (s)';
    intervalInput.style.width = '100%';
    intervalInput.style.marginBottom = '10px';
    intervalInput.style.padding = '5px';
    intervalInput.style.border = '1px solid #ccc';
    intervalInput.style.borderRadius = '5px';

    const updateIntervalButton = document.createElement('button');
    updateIntervalButton.innerText = 'Update Interval';
    updateIntervalButton.style.marginBottom = '10px';
    updateIntervalButton.onclick = () => {
        const newInterval = parseInt(intervalInput.value) * 1000;
        autoLoadIntervalTime = newInterval;
        if (autoLoadEnabled) {
            clearInterval(autoLoadInterval);
            autoLoadInterval = setInterval(autoLoadMore, autoLoadIntervalTime);
        }
        alert(`Auto load interval updated to ${newInterval / 1000} seconds.`);
    };

    const deleteDiscordButton = document.createElement('button');
    deleteDiscordButton.innerText = 'Delete Discord Button';
    deleteDiscordButton.onclick = () => {
        const discordButton = document.querySelector('a[data-ph-autocapture="true"]');
        if (discordButton) {
            discordButton.remove();
            alert('Discord button deleted.');
        } else {
            alert('Discord button not found.');
        }
    };

    overlayContent.appendChild(themeSelect);
    overlayContent.appendChild(intervalInput);
    overlayContent.appendChild(updateIntervalButton);
    overlayContent.appendChild(deleteDiscordButton);
    
    createOverlay('Settings', [overlayContent]);
};

settingsButton.addEventListener('click', showSettingsOverlay);

promptButton.addEventListener('click', () => {
    const overlayContent = document.createElement('div');
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = 'white';

    const promptMarketUI = document.createElement('div');
    promptMarketUI.style.backgroundColor = '#444';
    promptMarketUI.style.padding = '20px';
    promptMarketUI.style.borderRadius = '10px';
    promptMarketUI.style.width = '400px';
    promptMarketUI.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
    promptMarketUI.style.display = 'flex';
    promptMarketUI.style.flexDirection = 'column';

    const closeButton = createButton('X');
    closeButton.onclick = () => {
        document.body.removeChild(overlay);
    };

    const promptInput = document.createElement('input');
    promptInput.placeholder = 'Enter your prompt';
    promptInput.style.width = '100%';
    promptInput.style.marginBottom = '10px';
    promptInput.style.padding = '5px';
    promptInput.style.border = '1px solid #ccc';
    promptInput.style.borderRadius = '5px';

    const addButton = document.createElement('button');
    addButton.innerText = 'Add Prompt';
    addButton.style.marginBottom = '10px';

    const promptList = document.createElement('ul');

    const loadPrompts = () => {
        const storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
        promptList.innerHTML = '';
        storedPrompts.forEach(prompt => {
            const promptItem = document.createElement('li');
            promptItem.textContent = prompt.text;
            promptItem.style.cursor = 'pointer';
            promptItem.ondblclick = () => showPromptOverlay(prompt);
            promptItem.style.marginBottom = '10px';
            promptItem.style.color = '#f0f0f0';
            promptItem.style.padding = '5px';
            promptItem.style.borderRadius = '5px';
            promptItem.style.backgroundColor = '#555';
            promptItem.onmouseover = () => promptItem.style.backgroundColor = '#666';
            promptItem.onmouseleave = () => promptItem.style.backgroundColor = '#555';
            promptList.appendChild(promptItem);
        });
    };

    addButton.addEventListener('click', () => {
        const promptText = promptInput.value.trim();
        if (promptText) {
            const newPrompt = { text: promptText };
            const storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
            storedPrompts.push(newPrompt);
            localStorage.setItem('prompts', JSON.stringify(storedPrompts));
            loadPrompts();
            promptInput.value = '';
        }
    });

    promptMarketUI.appendChild(closeButton);
    promptMarketUI.appendChild(promptInput);
    promptMarketUI.appendChild(addButton);
    promptMarketUI.appendChild(promptList);
    overlay.appendChild(promptMarketUI);
    document.body.appendChild(overlay);

    loadPrompts();
});

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'p') {
        promptButton.click();
    }
    if (event.ctrlKey && event.key === 's') {
        settingsButton.click();
    }
});

toggleExpand(false);