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
    overlay.style.transition = 'opacity 0.5s ease-in-out';

    const overlayUI = document.createElement('div');
    overlayUI.style.backgroundColor = '#333';
    overlayUI.style.padding = '30px';
    overlayUI.style.borderRadius = '15px';
    overlayUI.style.width = '450px';
    overlayUI.style.maxHeight = '80%';
    overlayUI.style.overflowY = 'auto';
    overlayUI.style.boxShadow = '0 8px 30px rgba(0,0,0,0.7)';
    overlayUI.style.display = 'flex';
    overlayUI.style.flexDirection = 'column';
    overlayUI.style.transform = 'scale(0.9)';
    overlayUI.style.transition = 'transform 0.3s ease-in-out';

    const titleElement = document.createElement('h2');
    titleElement.innerText = title;
    titleElement.style.marginBottom = '20px';
    titleElement.style.color = '#e0e0e0';
    titleElement.style.textAlign = 'center';
    titleElement.style.fontFamily = 'Arial, sans-serif';
    titleElement.style.fontSize = '24px';

    const closeButton = createButton('Close');
    closeButton.style.marginTop = '20px';
    closeButton.style.alignSelf = 'center';
    closeButton.style.padding = '10px 20px';
    closeButton.style.borderRadius = '8px';
    closeButton.style.backgroundColor = '#f44336';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    closeButton.style.transition = 'background-color 0.3s ease';
    closeButton.onmouseover = () => closeButton.style.backgroundColor = '#d32f2f';
    closeButton.onmouseout = () => closeButton.style.backgroundColor = '#f44336';
    closeButton.onclick = () => {
        overlay.style.opacity = '0';
        overlayUI.style.transform = 'scale(0.9)';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    };

    overlayUI.appendChild(titleElement);
    contentElements.forEach(el => overlayUI.appendChild(el));
    overlayUI.appendChild(closeButton);
    overlay.appendChild(overlayUI);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
        overlayUI.style.transform = 'scale(1)';
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
            promptItem.style.color = 'black';
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
    
const hideButton = createButton('Hide UI');

hideButton.onclick = () => {
    floatingUI.style.display = 'none';
};

overlayContent.appendChild(hideButton);

const makeTransparentButton = createButton('Make UI Transparent');

makeTransparentButton.onclick = () => {
    floatingUI.style.backgroundColor = 'transparent';
};

overlayContent.appendChild(makeTransparentButton);
const resetBgButton = createButton('Reset Background');

resetBgButton.onclick = () => {
    floatingUI.style.backgroundImage = '';
    floatingUI.style.backgroundColor = '#333';
};

overlayContent.appendChild(resetBgButton);

const changeTextColorButton = createButton('Change Text Color');

changeTextColorButton.onclick = () => {
    const newColor = prompt("Enter the new text color (e.g., #ffffff for white):");
    if (newColor) {
        document.body.style.color = newColor;
    }
};

overlayContent.appendChild(changeTextColorButton);

const resetTextColorButton = createButton('Reset Text Color');

resetTextColorButton.onclick = () => {
    document.body.style.color = '';
};

overlayContent.appendChild(resetTextColorButton);

const increaseFontSizeButton = createButton('Increase Font Size');

increaseFontSizeButton.onclick = () => {
    const currentFontSize = window.getComputedStyle(document.body).fontSize;
    const newFontSize = parseFloat(currentFontSize) + 2 + 'px';
    document.body.style.fontSize = newFontSize;
};

overlayContent.appendChild(increaseFontSizeButton);

const decreaseFontSizeButton = createButton('Decrease Font Size');

decreaseFontSizeButton.onclick = () => {
    const currentFontSize = window.getComputedStyle(document.body).fontSize;
    const newFontSize = parseFloat(currentFontSize) - 2 + 'px';
    document.body.style.fontSize = newFontSize;
};

overlayContent.appendChild(decreaseFontSizeButton);

const toggleDarkModeButton = createButton('Toggle Dark Mode');

toggleDarkModeButton.onclick = () => {
    document.body.classList.toggle('dark-mode');
};

overlayContent.appendChild(toggleDarkModeButton);

const resetFontSizeButton = createButton('Reset Font Size');

resetFontSizeButton.onclick = () => {
    document.body.style.fontSize = '';
};

overlayContent.appendChild(resetFontSizeButton);

};

settingsButton.addEventListener('click', showSettingsOverlay);
promptButton.addEventListener('click', showPromptOverlay);
const promptLibraryButton = createButton('Open Prompt Library');

promptLibraryButton.onclick = async () => {
    try {
        const viewUrl = 'https://tiktoken-2nt2.onrender.com/prompts';
        const response = await fetch(viewUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer SSS155'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log("Error: " + errorData.error);
        } else {
            const responseData = await response.json();
            const prompts = responseData.prompts;

            const libraryOverlayContent = document.createElement('div');
            libraryOverlayContent.style.backgroundColor = '#222';
            libraryOverlayContent.style.color = '#fff';
            libraryOverlayContent.style.padding = '20px';
            libraryOverlayContent.style.borderRadius = '8px';
            libraryOverlayContent.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
            libraryOverlayContent.style.animation = 'fadeIn 0.5s ease-in-out';

            const libraryTitle = document.createElement('h2');
            libraryTitle.textContent = 'Prompt Library';
            libraryTitle.style.textAlign = 'center';
            libraryOverlayContent.appendChild(libraryTitle);

            const promptList = document.createElement('div');
            promptList.style.display = 'grid';
            promptList.style.gridTemplateColumns = '1fr';
            promptList.style.gap = '10px';

            if (prompts.length === 0) {
                const errorItem = document.createElement('div');
                errorItem.textContent = 'No prompts available.';
                errorItem.style.padding = '10px';
                errorItem.style.border = '1px solid #ccc';
                errorItem.style.borderRadius = '5px';
                promptList.appendChild(errorItem);
            } else {
                prompts.forEach(prompt => {
                    const promptItem = document.createElement('div');
                    promptItem.textContent = `ID: ${prompt.id} - Text: ${prompt.text}`;
                    promptItem.style.padding = '15px';
                    promptItem.style.border = '1px solid #444';
                    promptItem.style.borderRadius = '5px';
                    promptItem.style.backgroundColor = '#333';
                    promptItem.style.color = '#fff';
                    promptItem.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                    promptItem.style.opacity = '0';
                    promptItem.style.transform = 'translateY(20px)';
                    promptItem.style.position = 'relative';

                    setTimeout(() => {
                        promptItem.style.opacity = '1';
                        promptItem.style.transform = 'translateY(0)';
                    }, 100 * prompt.id);

                    const icon = document.createElement('span');
                    icon.textContent = '📜';
                    icon.style.marginRight = '8px';
                    promptItem.prepend(icon);

                    promptList.appendChild(promptItem);
                });
            }

            const createPromptButton = document.createElement('button');
            createPromptButton.textContent = 'Create New Prompt';
            createPromptButton.style.padding = '10px 15px';
            createPromptButton.style.backgroundColor = '#4CAF50';
            createPromptButton.style.color = 'white';
            createPromptButton.style.border = 'none';
            createPromptButton.style.borderRadius = '5px';
            createPromptButton.style.cursor = 'pointer';
            createPromptButton.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
            createPromptButton.style.width = '100%';
            createPromptButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
            createPromptButton.onmouseover = () => {
                createPromptButton.style.backgroundColor = '#45a049';
                createPromptButton.style.transform = 'scale(1.05)';
            };
            createPromptButton.onmouseout = () => {
                createPromptButton.style.backgroundColor = '#4CAF50';
                createPromptButton.style.transform = 'scale(1)';
            };

            createPromptButton.onclick = async () => {
                const newPromptText = prompt('Enter new prompt text:');
                if (newPromptText) {
                    const requestData = { text: newPromptText };
                    await submitPrompt(requestData);
                }
            };

            libraryOverlayContent.appendChild(createPromptButton);
            libraryOverlayContent.appendChild(promptList);
            createOverlay('Prompt Library', [libraryOverlayContent]);
        }
    } catch (error) {
        console.log('Failed to load prompts. Please check the server response.');
        const errorItem = document.createElement('div');
        errorItem.style.padding = '10px';
        errorItem.style.border = '1px solid #ccc';
        errorItem.style.borderRadius = '5px';
        const libraryOverlayContent = document.createElement('div');
        libraryOverlayContent.appendChild(errorItem);
        createOverlay('Prompt Library', [libraryOverlayContent]);
    }
};

async function submitPrompt(requestData) {
    const requestArea = document.createElement('div');
    requestArea.id = 'responseArea';
    document.body.appendChild(requestArea);

    if (!requestData.text) {
        requestArea.textContent = "Please enter a prompt.";
        return;
    }

    try {
        const response = await fetch('https://tiktoken-2nt2.onrender.com/prompt_library', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer SSS155'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            requestArea.textContent = "Error: " + errorData.error;
        } else {
            const responseData = await response.json();
            requestArea.textContent = "Prompt added successfully! ID: " + responseData.prompt.id;
        }
    } catch (error) {
        requestArea.textContent = "An error occurred. Please try again.";
    }
}

floatingUI.appendChild(promptLibraryButton);
floatingUI.appendChild(autoLoadButton);
floatingUI.appendChild(promptButton);
floatingUI.appendChild(settingsButton);
floatingUI.appendChild(dynamicButton);
floatingUI.appendChild(autoSummaryButton);
floatingUI.appendChild(createCharacterButton);

floatingUI.style.position = 'fixed';
floatingUI.style.left = '20px';
floatingUI.style.top = '20px';
floatingUI.style.width = '150px';
floatingUI.style.backgroundColor = '#333';
floatingUI.style.borderRadius = '8px';
floatingUI.style.zIndex = '10000';
floatingUI.style.padding = '10px';
floatingUI.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
floatingUI.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
floatingUI.style.transform = 'scale(0.9)';
floatingUI.style.opacity = '0.5';
setTimeout(() => {
    floatingUI.style.transform = 'scale(1)';
    floatingUI.style.opacity = '1';
}, 0);
floatingUI.dataset.expanded = 'true';

document.body.appendChild(floatingUI);

const textareas = document.querySelectorAll('textarea[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id=":R5dicvf6lefja:-form-item"][aria-describedby=":R5dicvf6lefja:-form-item-description"]');

textareas.forEach(async textarea => {
    let lastPTag = null;
    let overlayTags = [];
    
    const processText = async () => {
        const text = textarea.value;
        
        overlayTags.forEach(tag => tag.remove());
        overlayTags = [];

        if (text) {
            const typingIndicator = document.createElement('p');
            typingIndicator.textContent = "Typing...";
            typingIndicator.style.position = 'absolute';
            typingIndicator.style.marginTop = '5px';
            typingIndicator.style.color = '#f0f0f0';
            typingIndicator.style.zIndex = '1';
            textarea.parentNode.insertBefore(typingIndicator, textarea.nextSibling);
            overlayTags.push(typingIndicator);

            try {
                const tokenizedData = await tokenizeText(text);
                const parsedData = JSON.parse(tokenizedData);
                const tokenCount = parsedData["🧮 Total Token Count 🧮"];
                const wordCount = parsedData["💬 Word Count 💬"];

                overlayTags.forEach(tag => tag.remove());
                overlayTags = [];

                const pTag = document.createElement('p');
                pTag.textContent = `Total Token Count: ${tokenCount}, Word Count: ${wordCount}`;
                pTag.style.position = 'absolute';
                pTag.style.marginTop = '5px';
                pTag.style.color = '#f0f0f0';
                pTag.style.zIndex = '1';
                textarea.parentNode.insertBefore(pTag, textarea.nextSibling);
                overlayTags.push(pTag);

                lastPTag = pTag;
            } catch (error) {
                overlayTags.forEach(tag => tag.remove());
                overlayTags = [];
                console.error('Error processing text:', error);
            }
        }
    };

    await processText();

    textarea.addEventListener('input', processText);
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

function adjustGuiForSmallScreens() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    function handleScreenChange(e) {
        if (e.matches) {
            document.documentElement.style.fontSize = '12px';
            document.documentElement.style.padding = '5px';
        } else {
            document.documentElement.style.fontSize = '16px';
            document.documentElement.style.padding = '10px';
        }
    }
    mediaQuery.addListener(handleScreenChange);
    handleScreenChange(mediaQuery);
}

adjustGuiForSmallScreens();

// document.querySelectorAll('textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"]').forEach(textarea => {
//     textarea.addEventListener('input', async (event) => {
//         const text = event.target.value;
//         const createCommandPattern = /\/\/create([\s\S]*?)\\/;
//         const match = text.match(createCommandPattern);

//         if (match) {
//             const commandContent = match[1].trim();
//             const aiResponse = await getAIResponse(commandContent);
//             const responsePTag = document.createElement('p');
//             responsePTag.textContent = aiResponse;
//             responsePTag.style.color = '#f0f0f0';
//             responsePTag.style.marginTop = '10px';
//             textarea.parentNode.insertBefore(responsePTag, textarea.nextSibling);
//         }
//     });
// });

// async function getAIResponse(commandContent) {
//     const API_URL = 'https://tiktoken-2nt2.onrender.com/ai';
//     const AUTH_HEADER = 'Bearer SSS155';
//     const response = await fetch(API_URL, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': AUTH_HEADER
//         },
//         body: JSON.stringify({ text: `${commandContent} you are a neko girl` })
//     });
//     const data = await response.json();
//     return data.response; // Assuming the response contains the AI's response in a field named 'response'
// }


async function checkForUpdates() {
    const repoUrl = 'https://api.github.com/repos/Whitzzscott/Better-Sakura/commits?path=Extension-main-Stable';
    const localStorageKey = 'lastCommitSha';

    try {
        const response = await fetch(repoUrl);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const commits = await response.json();

        if (Array.isArray(commits) && commits.length > 0) {
            const latestCommitSha = commits[0].sha;
            const lastCommitSha = localStorage.getItem(localStorageKey);

            if (latestCommitSha !== lastCommitSha) {
                console.log(`New update found. Latest commit SHA: ${latestCommitSha}`);
                await downloadAndUpdate();
                localStorage.setItem(localStorageKey, latestCommitSha);
            } else {
                console.log('No new updates available.');
            }
        } else {
            console.warn('No commits found in the repository.');
        }
    } catch (error) {
        console.error('Error occurred while checking for updates:', error);
    }
}

async function downloadAndUpdate() {
    const downloadUrl = 'https://github.com/Whitzzscott/Better-Sakura/archive/refs/heads/main.zip';
    try {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error(`Failed to download update: ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'Better-Sakura-main.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert('Update downloaded successfully. Please extract and replace the existing files.');
    } catch (error) {
        console.error('Error occurred during the download process:', error);
    }
}

const updateCheckInterval = 3600000;
setInterval(checkForUpdates, updateCheckInterval);
checkForUpdates();
