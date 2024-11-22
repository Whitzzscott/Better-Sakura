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

const startDragging = (e) => {
    isDragging = true;
    const rect = floatingUI.getBoundingClientRect();
    offset.x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    offset.y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    document.body.style.cursor = 'grabbing';
    floatingUI.style.transition = 'none';
};

const stopDragging = () => {
    isDragging = false;
    document.body.style.cursor = 'default';
    floatingUI.style.transition = 'left 0.3s ease, top 0.3s ease';
};

const drag = (e) => {
    if (isDragging) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        floatingUI.style.left = `${clientX - offset.x}px`;
        floatingUI.style.top = `${clientY - offset.y}px`;
    }
};

floatingUI.addEventListener('mousedown', startDragging);
floatingUI.addEventListener('touchstart', startDragging);

document.addEventListener('mouseup', stopDragging);
document.addEventListener('touchend', stopDragging);

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag);

function saveFloatingUIPosition() {
    const floatingUI = document.querySelector('.floating-ui');
    if (!floatingUI) return;

    floatingUI.addEventListener('mousedown', (event) => {
        isDragging = true;
        const startX = event.clientX - floatingUI.offsetLeft;
        const startY = event.clientY - floatingUI.offsetTop;

        function onMouseMove(e) {
            if (!isDragging) return;
            floatingUI.style.left = `${e.clientX - startX}px`;
            floatingUI.style.top = `${e.clientY - startY}px`;
            floatingUI.style.transition = 'left 0.2s ease-out, top 0.2s ease-out';
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            const position = {
                top: floatingUI.style.top,
                left: floatingUI.style.left
            };
            chrome.storage.sync.set({ floatingUIPosition: position });
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp, { once: true });
    });
}

function restoreFloatingUIPosition() {
    const floatingUI = document.querySelector('.floating-ui');
    if (!floatingUI) return;

    const position = localStorage.getItem('floatingUIPosition');
    if (position) {
        const parsedPosition = JSON.parse(position);
        floatingUI.style.top = parsedPosition.top;
        floatingUI.style.left = parsedPosition.left;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    restoreFloatingUIPosition();
    saveFloatingUIPosition();
});

const toggleExpand = (expand) => {
    Array.from(floatingUI.children).forEach(child => {
        if (child !== minimizeButton) {
            child.style.opacity = expand ? '1' : '0';
            child.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            child.style.animation = expand ? 'fadeIn 0.3s ease, slideIn 0.3s ease' : 'fadeOut 0.3s ease, slideOut 0.3s ease';
            child.style.transform = expand ? 'translateY(0)' : 'translateY(-10px)';
            if (expand) {
                child.style.display = 'block';
                setTimeout(() => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, 0);
            } else {
                child.style.opacity = '0';
                child.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    child.style.display = 'none';
                }, 300);
            }
        }
    });
};

const minimizeButton = createButton('−', '#F44336');
minimizeButton.onclick = () => {
    const isExpanded = floatingUI.dataset.expanded === 'true';
    toggleExpand(!isExpanded);
    floatingUI.dataset.expanded = !isExpanded;
    minimizeButton.style.animation = isExpanded ? 'bounceOut 0.5s ease' : 'bounceIn 0.5s ease';
    minimizeButton.textContent = isExpanded ? '−' : '+';
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
    newPromptInput.style.color = 'white';

    const addPromptButton = createButton('Add Prompt');

    let currentPromptCount = 5;

    const loadPrompts = () => {
        const storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
        promptList.innerHTML = '';
        
        storedPrompts.slice(0, currentPromptCount).forEach(prompt => {
            const promptItem = document.createElement('li');
            Object.assign(promptItem.style, {
                cursor: 'pointer',
                marginBottom: '10px',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: '#555'
            });
            promptItem.textContent = prompt.text;

            const buttonContainer = document.createElement('div');
            Object.assign(buttonContainer.style, {
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '5px'
            });

            const createButtonWithAction = (text, color, action) => {
                const button = createButton(text, color);
                button.style.flex = '1';
                button.onclick = action;
                return button;
            };

            const downloadButton = createButtonWithAction('Download', '#2196F3', () => {
                const blob = new Blob([prompt.text], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'prompt.txt';
                link.click();
            });

            const copyButton = createButtonWithAction('Copy', '#2196F3', () => {
                navigator.clipboard.writeText(prompt.text).then(() => {
                    alert('Prompt copied to clipboard!');
                });
            });

            const removeButton = createButtonWithAction('Remove', '#F44336', () => {
                const updatedPrompts = storedPrompts.filter(p => p.text !== prompt.text);
                localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
                loadPrompts();
            });

            [downloadButton, copyButton, removeButton].forEach(button => buttonContainer.appendChild(button));
            promptItem.appendChild(buttonContainer);
            promptList.appendChild(promptItem);
        });
    };

    loadPrompts();

    loadMoreButton.style.display = 'none';

    const checkLoadMoreVisibility = () => {
        const promptItems = document.querySelectorAll('.prompt-item');
        const totalHeight = Array.from(promptItems).reduce((sum, item) => sum + item.offsetHeight, 0);
        const promptListHeight = promptList.offsetHeight;

        if (totalHeight > promptListHeight) {
            loadMoreButton.style.display = 'block';
        } else {
            loadMoreButton.style.display = 'none';
        }
    };

    loadMoreButton.onclick = () => {
        currentPromptCount += 5;
        loadPrompts();
        checkLoadMoreVisibility();
    };

    checkLoadMoreVisibility();

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
                floatingUI.style.backgroundImage = `url(${event.target.result})`;
                floatingUI.style.backgroundSize = 'cover';
                floatingUI.style.backgroundPosition = 'center';
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

const increaseFontSizeButton = createButton('Increase Font Size');

increaseFontSizeButton.onclick = () => {
    const currentFontSize = window.getComputedStyle(document.body).fontSize;
    const newFontSize = parseFloat(currentFontSize) + 2 + 'px';
    document.body.style.fontSize = newFontSize;
    floatingUI.style.fontSize = newFontSize;
};

overlayContent.appendChild(increaseFontSizeButton);

const decreaseFontSizeButton = createButton('Decrease Font Size');

decreaseFontSizeButton.onclick = () => {
    const currentFontSize = window.getComputedStyle(document.body).fontSize;
    const newFontSize = parseFloat(currentFontSize) - 2 + 'px';
    document.body.style.fontSize = newFontSize;
    floatingUI.style.fontSize = newFontSize;
};

overlayContent.appendChild(decreaseFontSizeButton);

const resetFontSizeButton = createButton('Reset Font Size');

resetFontSizeButton.onclick = () => {
    document.body.style.fontSize = '';
    floatingUI.style.fontSize = '';
};

overlayContent.appendChild(resetFontSizeButton);

const resetFontStyleButton = createButton('Reset Font Style');

resetFontStyleButton.onclick = () => {
    document.body.style.fontFamily = '';
    floatingUI.style.fontFamily = '';
};

const fontStyleDropdown = document.createElement('select');
fontStyleDropdown.style.padding = '8px';
fontStyleDropdown.style.borderRadius = '4px';
fontStyleDropdown.style.border = '1px solid #555';
fontStyleDropdown.style.backgroundColor = '#444';
fontStyleDropdown.style.color = '#fff';
fontStyleDropdown.style.cursor = 'pointer';
fontStyleDropdown.style.transition = 'all 0.3s ease';

const fontStyles = [
"Arial",  
"Franklin Gothic",  
"Gill Sans",  
"Perpetua",  
"Baskerville Old Face",  
"Candara",  
"Corbel",  
"Calibri",  
"Cambria",  
"Segoe UI",  
"Avenir",  
"Lato",  
"Open Sans",  
"Roboto",  
"Merriweather",  
"Playfair Display",  
"Raleway",  
"Ubuntu",  
"PT Serif",  
"PT Sans",  
"Oswald",  
"Montserrat",  
"Nunito",  
"Quicksand",  
"Source Sans Pro",  
"Varela Round",  
"Zilla Slab",  
"Crimson Text",  
"Droid Serif",  
"Josefin Sans",  
"Karla",  
"Libre Baskerville",  
"Rubik",  
"Titillium Web",  
"Work Sans",  
"Abril Fatface",  
"Arvo",  
"Exo",  
"Fira Sans",  
"Inconsolata",  
"Lora",  
"Overpass",  
"Pacifico",  
"Poppins",  
"Proxima Nova",  
"Satisfy",  
"Slabo",  
"Spectral",  
"Yellowtail",  
"Amatic SC",  
"Anton",  
"Archivo",  
"Barlow",  
"Catamaran",  
"Cinzel",  
"Cormorant",  
"Fredoka One",  
"Gloria Hallelujah",  
"Great Vibes",  
"Kaushan Script",  
"Lexend",  
"Lobster",  
"Merriweather Sans",  
"Monda",  
"Nanum Gothic",  
"Orbitron",  
"Permanent Marker",  
"Righteous",  
"Sarina",  
"Scheherazade",  
"Shadows Into Light",  
"Syncopate",  
"Ubuntu Mono",  
"Yatra One",  
"ZCOOL XiaoWei",  
"Zeyada",  
"Alfa Slab One",  
"Archivo Narrow",  
"Bangers",  
"Cabin",  
"Chewy",  
"Chivo",  
"Comfortaa",  
"Concert One",  
"Covered By Your Grace",  
"Crete Round",  
"Didact Gothic",  
"Domine",  
"Fjalla One",  
"Goudy Bookletter 1911",  
"Indie Flower",  
"Josefin Slab",  
"Kalam",  
"Kanit",  
"Martel",  
"Neuton",  
"Old Standard TT",  
"Patua One",  
"Questrial",  
"Rambla",  
"Special Elite",  
"Spinnaker",  
"Syncopate",  
"Tillana",  
"Vidaloka",  
"Yanone Kaffeesatz"  
];

const placeholderOption = document.createElement('option');
placeholderOption.value = '';
placeholderOption.textContent = 'Select a font...';
fontStyleDropdown.appendChild(placeholderOption);

fontStyles.forEach(style => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style;
    option.style.fontFamily = style;
    fontStyleDropdown.appendChild(option);
});

const savedFont = localStorage.getItem('selectedFont');
if (savedFont) {
    document.body.style.fontFamily = savedFont;
    floatingUI.style.fontFamily = savedFont;
    fontStyleDropdown.value = savedFont;
}

fontStyleDropdown.onchange = () => {
    if (fontStyleDropdown.value) {
        const selectedFont = fontStyleDropdown.value;
        document.body.style.fontFamily = selectedFont;
        floatingUI.style.fontFamily = selectedFont;
        localStorage.setItem('selectedFont', selectedFont);

        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            element.style.fontFamily = selectedFont;
        });
    }
};

fontStyleDropdown.onmouseover = () => {
    fontStyleDropdown.style.backgroundColor = '#555';
    fontStyleDropdown.style.transform = 'scale(1.02)';
};

fontStyleDropdown.onmouseout = () => {
    fontStyleDropdown.style.backgroundColor = '#444';
    fontStyleDropdown.style.transform = 'scale(1)';
};

const customFontUpload = document.createElement('input');
customFontUpload.type = 'file';
customFontUpload.accept = '.ttf,.otf,.woff,.woff2';
customFontUpload.style.display = 'none';

const customFontButton = document.createElement('button');
customFontButton.textContent = 'Upload Custom Font';
customFontButton.style.padding = '8px 12px';
customFontButton.style.margin = '0 10px';
customFontButton.style.backgroundColor = '#444';
customFontButton.style.border = '1px solid #555';
customFontButton.style.borderRadius = '4px';
customFontButton.style.color = '#fff';
customFontButton.style.cursor = 'pointer';
customFontButton.style.transition = 'all 0.3s ease';

customFontButton.onmouseover = () => {
    customFontButton.style.backgroundColor = '#555';
    customFontButton.style.transform = 'scale(1.02)';
};

customFontButton.onmouseout = () => {
    customFontButton.style.backgroundColor = '#444';
    customFontButton.style.transform = 'scale(1)';
};

customFontButton.onclick = () => customFontUpload.click();

customFontUpload.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fontName = file.name.split('.')[0];
            const fontFace = new FontFace(fontName, e.target.result);
            fontFace.load().then((loadedFace) => {
                document.fonts.add(loadedFace);
                const option = document.createElement('option');
                option.value = fontName;
                option.textContent = `${fontName} (Custom)`;
                option.style.fontFamily = fontName;
                fontStyleDropdown.appendChild(option);
                fontStyleDropdown.value = fontName;
                document.body.style.fontFamily = fontName;
            });
        };
        reader.readAsArrayBuffer(file);
    }
};

overlayContent.appendChild(fontStyleDropdown);
overlayContent.appendChild(customFontButton);
overlayContent.appendChild(customFontUpload);
overlayContent.appendChild(resetFontStyleButton);

const tokenizeButton = createButton('Manual Trigger Token Counter');

tokenizeButton.onclick = async () => {
    const textareas = document.querySelectorAll('input[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], input[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id=":R5dicvf6lefja:-form-item"][aria-describedby=":R5dicvf6lefja:-form-item-description"]');
    
    const autoTrigger = localStorage.getItem('autoTrigger') === 'true';
    textareas.forEach(async textarea => {
        const updateCounter = async () => {
            const text = textarea.value;
            if (text || autoTrigger) {
                try {
                    const tokenizedData = await tokenizeText(text);
                    const parsedData = JSON.parse(tokenizedData);
                    const tokenCount = parsedData["🧮 Total Token Count 🧮"];
                    const wordCount = parsedData["💬 Word Count 💬"];

                    let pTag = textarea.parentNode.querySelector('p');
                    if (!pTag) {
                        pTag = document.createElement('p');
                        pTag.textContent = `Tokens: ${tokenCount}, Words: ${wordCount}`;
                        pTag.style.position = 'absolute';
                        pTag.style.marginTop = '5px';
                        pTag.style.color = '#f0f0f0';
                        pTag.style.zIndex = '1';
                        pTag.style.fontSize = '0.8em';
                        pTag.style.fontStyle = 'italic';
                        pTag.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
                        pTag.style.transform = 'translateY(-10px)';
                        pTag.style.opacity = '0';
                        textarea.parentNode.insertBefore(pTag, textarea.nextSibling);
                    } else {
                        pTag.textContent = `Tokens: ${tokenCount}, Words: ${wordCount}`;
                        pTag.style.opacity = '0';
                        requestAnimationFrame(() => {
                            pTag.style.transform = 'translateY(0)';
                            pTag.style.opacity = '1';
                        });
                    }

                    requestAnimationFrame(() => {
                        pTag.style.transform = 'translateY(0)';
                        pTag.style.opacity = '1';
                    });
                } catch (error) {
                    console.error('Error processing text:', error);
                }
            }
        };

        await updateCounter();

        textarea.addEventListener('input', updateCounter);
    });
    if (autoTrigger) {
        localStorage.setItem('autoTrigger', 'true');
        console.log("Auto Trigger is on");
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                updateCounter();
            }
        });
    });

    observer.observe(textarea, {
        childList: true,
        attributes: true,
        subtree: true
    });
    }
};

overlayContent.appendChild(tokenizeButton);

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

const textareas = document.querySelectorAll('input[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], input[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id=":R5dicvf6lefja:-form-item"][aria-describedby=":R5dicvf6lefja:-form-item-description"]');

textareas.forEach(async textarea => {
    let lastPTag = null;
    let overlayTags = [];
    
    const processText = async () => {
        const text = textarea.value;
        
        overlayTags.forEach(tag => tag.remove());
        overlayTags = [];

        const typingIndicator = document.createElement('p');
        typingIndicator.textContent = "Processing...";
        Object.assign(typingIndicator.style, {
            position: 'absolute',
            marginTop: '5px', 
            color: '#32CD32',
            zIndex: '1',
            fontSize: '0.95em',
            fontStyle: 'italic', 
            transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
            opacity: '0',
            transform: 'translateY(-5px)'
        });
        textarea.parentNode.insertBefore(typingIndicator, textarea.nextSibling);
        overlayTags.push(typingIndicator);

        requestAnimationFrame(() => {
            typingIndicator.style.opacity = '1';
            typingIndicator.style.transform = 'translateY(0)';
        });

        try {
            const tokenizedData = await tokenizeText(text || " "); 
            const parsedData = JSON.parse(tokenizedData);
            const tokenCount = parsedData["🧮 Total Token Count 🧮"];
            const wordCount = parsedData["💬 Word Count 💬"];

            overlayTags.forEach(tag => tag.remove());
            overlayTags = [];

            const pTag = document.createElement('p');
            pTag.textContent = `Tokens: ${tokenCount}, Words: ${wordCount}`;
            pTag.style.position = 'absolute';
            pTag.style.marginTop = '5px';
            pTag.style.color = '#f0f0f0';
            pTag.style.zIndex = '1';
            pTag.style.fontSize = '0.8em';
            pTag.style.fontStyle = 'italic';
            pTag.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
            pTag.style.transform = 'translateY(-10px)';
            pTag.style.opacity = '0';
            textarea.parentNode.insertBefore(pTag, textarea.nextSibling);
            overlayTags.push(pTag);

            setTimeout(() => {
                pTag.style.transform = 'translateY(0)';
                pTag.style.opacity = '1';
            }, 0);

            lastPTag = pTag;
        } catch (error) {
            overlayTags.forEach(tag => tag.remove());
            overlayTags = [];
            console.error('Error processing text:', error);
        }
        
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                const pTag = textarea.parentNode.querySelector('p');
                if (window.location.pathname.includes('/tokenize') || localStorage.getItem('showPTag') === 'true') {
                    pTag.style.opacity = '1';
                    pTag.style.transform = 'translateY(10px)';
                }
            }
        });
    });

    observer.observe(textarea, {
        attributes: true,
        attributeFilter: ['value']
    });

    const originalSetValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    Object.defineProperty(textarea, 'value', {
        set: function(val) {
            originalSetValue.call(this, val);
            const pTag = this.parentNode.querySelector('p');
            if (window.location.pathname.includes('/tokenize') || localStorage.getItem('showPTag') === 'true') {
                pTag.style.opacity = '1';
                pTag.style.transform = 'translateY(10px)'; // Move slightly below textarea
                localStorage.setItem('showPTag', 'true');
            }
        }
    });
    };

    await processText(); 

    textarea.addEventListener('input', processText);

    setInterval(() => {
        const pTag = textarea.parentNode.querySelector('p');
        if (pTag && window.getComputedStyle(pTag).opacity === '0') {
            pTag.style.opacity = '1';
            pTag.style.transform = 'translateY(0)';
        }
    }, 1000);
});

const instructionPTag = document.querySelector('p#\\:Rcicvf6lefja\\:-form-item-description.text-muted-foreground.text-\\[0\\.8rem\\]');
if (instructionPTag) {
    instructionPTag.remove();
}

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

document.addEventListener('DOMContentLoaded', () => {
    const buttons = [
        'promptLibraryButton',
        'autoLoadButton',
        'promptButton',
        'settingsButton',
        'dynamicButton',
        'autoSummaryButton',
        'createCharacterButton'
    ];

    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (!button) {
            console.error(`Button with ID ${buttonId} is missing.`);
        } else {
            button.addEventListener('click', () => {
                console.log(`${buttonId} clicked`);
            });
        }
    });

    const menu = document.querySelector('.floating-ui');
    const extensionButton = document.querySelector('.minimizeButton');

    if (menu && extensionButton) {
        const observer = new MutationObserver(() => {
            if (menu.classList.contains('open')) {
                extensionButton.style.pointerEvents = 'none';
            } else {
                extensionButton.style.pointerEvents = 'auto';
            }
        });

        observer.observe(menu, { attributes: true, attributeFilter: ['class'] });
    } else {
        console.error('Menu or extension button is missing.');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const hasVisited = localStorage.getItem('userhaswenttothesite');

    if (!hasVisited) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#333';
        popup.style.color = '#fff';
        popup.style.padding = '20px';
        popup.style.borderRadius = '8px';
        popup.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
        popup.style.zIndex = '10000';
        popup.style.textAlign = 'center';
        popup.style.animation = 'fadeIn 0.5s ease-in-out';

        const message = document.createElement('p');
        message.textContent = 'If the token counter doesn\'t load, go to Settings > Manual Trigger Token Counter';
        popup.appendChild(message);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '10px';
        closeButton.style.padding = '8px 12px';
        closeButton.style.backgroundColor = '#444';
        closeButton.style.border = '1px solid #555';
        closeButton.style.borderRadius = '4px';
        closeButton.style.color = '#fff';
        closeButton.style.cursor = 'pointer';
        closeButton.style.transition = 'all 0.3s ease';

        closeButton.onmouseover = () => {
            closeButton.style.backgroundColor = '#555';
            closeButton.style.transform = 'scale(1.02)';
        };

        closeButton.onmouseout = () => {
            closeButton.style.backgroundColor = '#444';
            closeButton.style.transform = 'scale(1)';
        };

        closeButton.onclick = () => {
            document.body.removeChild(popup);
        };

        popup.appendChild(closeButton);
        document.body.appendChild(popup);

        localStorage.setItem('userhaswenttothesite', 'true');
    }
});
