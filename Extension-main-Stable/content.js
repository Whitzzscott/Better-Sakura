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
let lastPosition = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };
let lastTime = 0;

const startDragging = (e) => {
    isDragging = true;
    const rect = floatingUI.getBoundingClientRect();
    offset.x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    offset.y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    lastPosition.x = rect.left;
    lastPosition.y = rect.top;
    lastTime = Date.now();
    document.body.style.cursor = 'grabbing';
    floatingUI.style.transition = 'none';
    floatingUI.style.transform = 'scale(1.02)';
};

const stopDragging = () => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = 'default';
    floatingUI.style.transform = 'scale(1)';
    
    const deceleration = 0.95;
    const animate = () => {
        if (Math.abs(velocity.x) < 0.1 && Math.abs(velocity.y) < 0.1) {
            floatingUI.style.transition = 'transform 0.2s ease';
            return;
        }
        
        const currentLeft = parseFloat(floatingUI.style.left) || 0;
        const currentTop = parseFloat(floatingUI.style.top) || 0;
        const maxX = window.innerWidth - floatingUI.offsetWidth;
        const maxY = window.innerHeight - floatingUI.offsetHeight;
        
        let newLeft = currentLeft + velocity.x;
        let newTop = currentTop + velocity.y;
        
        if (newLeft < 0) {
            newLeft = 0;
            velocity.x = -velocity.x * 0.5;
        } else if (newLeft > maxX) {
            newLeft = maxX;
            velocity.x = -velocity.x * 0.5;
        }
        
        if (newTop < 0) {
            newTop = 0;
            velocity.y = -velocity.y * 0.5;
        } else if (newTop > maxY) {
            newTop = maxY;
            velocity.y = -velocity.y * 0.5;
        }
        
        floatingUI.style.left = `${newLeft}px`;
        floatingUI.style.top = `${newTop}px`;
        
        velocity.x *= deceleration;
        velocity.y *= deceleration;
        
        requestAnimationFrame(animate);
    };
    animate();
};

const drag = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const newX = clientX - offset.x;
    const newY = clientY - offset.y;
    
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;
    if (deltaTime > 0) {
        velocity.x = (newX - lastPosition.x) / deltaTime * 16;
        velocity.y = (newY - lastPosition.y) / deltaTime * 16;
    }
    
    const maxX = window.innerWidth - floatingUI.offsetWidth;
    const maxY = window.innerHeight - floatingUI.offsetHeight;
    
    let boundedX = newX;
    let boundedY = newY;
    
    if (newX < 0) {
        boundedX = newX * 0.3;
    } else if (newX > maxX) {
        boundedX = maxX + (newX - maxX) * 0.3;
    }
    
    if (newY < 0) {
        boundedY = newY * 0.3;
    } else if (newY > maxY) {
        boundedY = maxY + (newY - maxY) * 0.3;
    }
    
    floatingUI.style.left = `${boundedX}px`;
    floatingUI.style.top = `${boundedY}px`;
    
    lastPosition.x = boundedX;
    lastPosition.y = boundedY;
    lastTime = currentTime;
};

floatingUI.addEventListener('mousedown', startDragging);
floatingUI.addEventListener('touchstart', startDragging, { passive: false });

document.addEventListener('mouseup', stopDragging);
document.addEventListener('touchend', stopDragging);

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: false });

function saveFloatingUIPosition() {
    const position = {
        top: floatingUI.style.top,
        left: floatingUI.style.left
    };
    chrome.storage.sync.set({ floatingUIPosition: position });
}

function restoreFloatingUIPosition() {
    chrome.storage.sync.get(['floatingUIPosition'], (result) => {
        if (result.floatingUIPosition) {
            floatingUI.style.top = result.floatingUIPosition.top;
            floatingUI.style.left = result.floatingUIPosition.left;
        }
    });
}

document.addEventListener('mouseup', saveFloatingUIPosition);
document.addEventListener('touchend', saveFloatingUIPosition);

document.addEventListener('DOMContentLoaded', restoreFloatingUIPosition);

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
if (window.innerWidth <= 768) {
    minimizeButton.style.width = '40px';
    minimizeButton.style.height = '40px';
    minimizeButton.style.fontSize = '20px';
    minimizeButton.style.padding = '4px';
    minimizeButton.style.background = `linear-gradient(
        to bottom,
        #F44336 0%,
        #F44336 ${minimizeButton.style.height}
    )`;
    minimizeButton.style.backgroundSize = '40px 40px';
}
minimizeButton.onclick = () => {
    const isExpanded = floatingUI.dataset.expanded === 'true';
    toggleExpand(!isExpanded);
    floatingUI.dataset.expanded = !isExpanded;
    minimizeButton.style.animation = isExpanded ? 'bounceOut 0.5s ease' : 'bounceIn 0.5s ease';
    minimizeButton.textContent = isExpanded ? '−' : '+';
    
    if (window.innerWidth <= 768) {
        minimizeButton.style.backgroundSize = '40px 40px';
    } else {
        minimizeButton.style.backgroundSize = '50px 50px'; 
    }
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

const createOverlay = (title, contentElements) => {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(0px)'
    });

    const overlayUI = document.createElement('div');
    Object.assign(overlayUI.style, {
        backgroundColor: '#2c2c2c',
        padding: '35px',
        borderRadius: '20px',
        width: '500px',
        maxHeight: '85%',
        overflowY: 'auto',
        boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        transform: 'scale(0.95) translateY(20px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(255,255,255,0.1)'
    });

    const titleElement = document.createElement('h2');
    Object.assign(titleElement.style, {
        margin: '0 0 25px 0',
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: '28px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        opacity: '0',
        transform: 'translateY(-10px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
    });
    titleElement.innerText = title;

    const closeButton = createButton('Close');
    Object.assign(closeButton.style, {
        marginTop: '25px',
        alignSelf: 'center',
        padding: '12px 24px',
        borderRadius: '12px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        transform: 'translateY(10px)',
        opacity: '0'
    });

    closeButton.onmouseover = () => {
        closeButton.style.backgroundColor = '#d32f2f';
        closeButton.style.transform = 'translateY(-2px)';
        closeButton.style.boxShadow = '0 5px 15px rgba(244, 67, 54, 0.4)';
    };
    
    closeButton.onmouseout = () => {
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.transform = 'translateY(0)';
        closeButton.style.boxShadow = 'none';
    };

    closeButton.onclick = () => {
        overlay.style.backgroundColor = 'rgba(0,0,0,0)';
        overlay.style.backdropFilter = 'blur(0px)';
        overlayUI.style.transform = 'scale(0.95) translateY(20px)';
        overlayUI.style.opacity = '0';
        titleElement.style.opacity = '0';
        titleElement.style.transform = 'translateY(-10px)';
        closeButton.style.opacity = '0';
        closeButton.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            overlay.remove();
        }, 600);
    };

    overlayUI.appendChild(titleElement);
    contentElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        overlayUI.appendChild(el);
    });
    overlayUI.appendChild(closeButton);
    overlay.appendChild(overlayUI);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
        overlay.style.backdropFilter = 'blur(5px)';
        overlayUI.style.transform = 'scale(1) translateY(0)';
        overlayUI.style.opacity = '1';
        titleElement.style.opacity = '1';
        titleElement.style.transform = 'translateY(0)';
        closeButton.style.opacity = '1';
        closeButton.style.transform = 'translateY(0)';
        
        contentElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 200 + (index * 100));
        });
    });
};

const showPromptOverlay = () => {
    const overlayContent = document.createElement('div');
    const promptList = document.createElement('ul');
    promptList.style.maxHeight = '400px';
    promptList.style.overflowY = 'auto';
    promptList.style.margin = '0';
    promptList.style.padding = '0';
    promptList.style.listStyle = 'none';

    const newPromptInput = document.createElement('input');
    Object.assign(newPromptInput.style, {
        width: '100%',
        padding: '10px',
        borderRadius: '5px', 
        border: '1px solid #ccc',
        marginBottom: '10px',
        fontSize: '16px',
        color: 'white',
        backgroundColor: '#444'
    });
    newPromptInput.placeholder = 'Enter new prompt...';

    const addPromptButton = createButton('Add Prompt');
    const loadMoreButton = createButton('Load More');
    Object.assign(loadMoreButton.style, {
        width: '100%',
        marginTop: '10px',
        backgroundColor: '#4CAF50',
        display: 'none'
    });

    let currentPromptCount = 10;
    const PROMPTS_PER_PAGE = 10;

    const loadPrompts = () => {
        const storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
        promptList.innerHTML = '';
        
        const promptsToShow = storedPrompts.slice(0, currentPromptCount);
        
        promptsToShow.forEach(prompt => {
            const promptItem = document.createElement('li');
            Object.assign(promptItem.style, {
                cursor: 'pointer',
                marginBottom: '10px',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: '#555',
                wordBreak: 'break-word'
            });
            promptItem.textContent = prompt.text;

            const buttonContainer = document.createElement('div');
            Object.assign(buttonContainer.style, {
                display: 'flex',
                gap: '5px',
                justifyContent: 'space-between',
                marginTop: '5px'
            });

            const downloadButton = createButton('Download');
            downloadButton.onclick = (e) => {
                e.stopPropagation();
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

            const copyButton = createButton('Copy');
            copyButton.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(prompt.text)
                    .then(() => {
                        const originalText = copyButton.textContent;
                        copyButton.textContent = 'Copied!';
                        setTimeout(() => {
                            copyButton.textContent = originalText;
                        }, 1000);
                    });
            };

            const removeButton = createButton('Remove');
            removeButton.style.backgroundColor = '#f44336';
            removeButton.onclick = (e) => {
                e.stopPropagation();
                const updatedPrompts = storedPrompts.filter(p => p.text !== prompt.text);
                localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
                loadPrompts();
                updateLoadMoreButton(updatedPrompts.length);
            };

            [downloadButton, copyButton, removeButton].forEach(button => {
                button.style.flex = '1';
                buttonContainer.appendChild(button);
            });

            promptItem.appendChild(buttonContainer);
            promptList.appendChild(promptItem);
        });

        updateLoadMoreButton(storedPrompts.length);
    };

    const updateLoadMoreButton = (totalPrompts) => {
        loadMoreButton.style.display = totalPrompts > 10 ? 'block' : 'none';
    };

    loadMoreButton.onclick = () => {
        currentPromptCount += PROMPTS_PER_PAGE;
        loadPrompts();
    };

    addPromptButton.onclick = () => {
        const newPrompt = newPromptInput.value.trim();
        if (newPrompt) {
            const storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
            storedPrompts.unshift({ text: newPrompt });
            localStorage.setItem('prompts', JSON.stringify(storedPrompts));
            newPromptInput.value = '';
            loadPrompts();
        }
    };

    newPromptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPromptButton.click();
        }
    });

    loadPrompts();

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
                marginTop: '8px', 
                color: '#FFFFFF',
                zIndex: '1000',
                fontSize: '14px',
                fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                fontWeight: '500',
                letterSpacing: '0.3px',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                opacity: '0',
                transform: 'translateY(-5px)',
                userSelect: 'none'
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
                const tokenCount = parsedData["🧮 Total Token Count 🧮"] || 0;
                const wordCount = parsedData["💬 Word Count 💬"] || 0;

                overlayTags.forEach(tag => tag.remove());
                overlayTags = [];

                const pTag = document.createElement('p');
                pTag.textContent = `Tokens: ${tokenCount} | Words: ${wordCount}`;
                Object.assign(pTag.style, {
                    position: 'absolute',
                    marginTop: textarea.matches('input[class*="rounded-l-none"]') ? '-20px' : '8px',
                    color: '#FFFFFF',
                    zIndex: '1000',
                    fontSize: textarea.matches('input[class*="rounded-l-none"]') ? '10px' : (window.innerWidth <= 768 ? '12px' : '14px'),
                    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                    fontWeight: '500',
                    letterSpacing: '0.3px',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                    opacity: '0',
                    transform: 'translateY(-5px)',
                    userSelect: 'none',
                    whiteSpace: 'nowrap'
                });
                textarea.parentNode.insertBefore(pTag, textarea.nextSibling);
                overlayTags.push(pTag);

                requestAnimationFrame(() => {
                    pTag.style.opacity = '1';
                    pTag.style.transform = 'translateY(0)';
                });

                lastPTag = pTag;
            } catch (error) {
                overlayTags.forEach(tag => tag.remove());
                overlayTags = [];
                console.error('Error processing text:', error);
            }
        };

        await processText();
    });
};

overlayContent.appendChild(tokenizeButton);

const updateButton = createButton('Check for Updates');
updateButton.onclick = async () => {
    try {
        if (!chrome.runtime?.id) {
            alert('Extension context invalidated. Please refresh the page and try again.');
            return;
        }
        const versionUrl = 'https://raw.githubusercontent.com/Whitzzscott/Better-Sakura/main/Extension-main-Stable/manifest.json';
        const response = await fetch(versionUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch manifest');
        }

        const remoteManifest = await response.json();
        const currentManifest = chrome.runtime.getManifest();

        if (remoteManifest.version !== currentManifest.version) {
            const updateOverlay = document.createElement('div');
            updateOverlay.style.position = 'fixed';
            updateOverlay.style.top = '50%';
            updateOverlay.style.left = '50%';
            updateOverlay.style.transform = 'translate(-50%, -50%)';
            updateOverlay.style.backgroundColor = '#222';
            updateOverlay.style.color = '#fff';
            updateOverlay.style.padding = '20px';
            updateOverlay.style.borderRadius = '8px';
            updateOverlay.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
            updateOverlay.style.zIndex = '10000';

            updateOverlay.innerHTML = `
                <h3>Update Available!</h3>
                <p>Current version: ${currentManifest.version}</p>
                <p>New version: ${remoteManifest.version}</p>
                <p>How would you like to update?</p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button id="autoUpdate" style="padding: 8px 15px; border-radius: 4px; background: #4CAF50; color: white; border: none; cursor: pointer;">Auto Update</button>
                    <button id="manualUpdate" style="padding: 8px 15px; border-radius: 4px; background: #2196F3; color: white; border: none; cursor: pointer;">Manual Update</button>
                    <button id="cancelUpdate" style="padding: 8px 15px; border-radius: 4px; background: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
                </div>
            `;

            document.body.appendChild(updateOverlay);

            document.getElementById('autoUpdate').onclick = async () => {
                try {
                    const zipUrl = 'https://github.com/Whitzzscott/Better-Sakura/archive/refs/heads/main.zip';
                    const zipResponse = await fetch(zipUrl, {
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/zip'
                        }
                    });

                    if (!zipResponse.ok) {
                        throw new Error('Network error: Failed to fetch');
                    }

                    const blob = await zipResponse.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = 'Better-Sakura-main.zip';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(downloadUrl);
                    updateOverlay.remove();
                } catch (error) {
                    window.open('https://github.com/Whitzzscott/Better-Sakura/archive/refs/heads/main.zip', '_blank');
                    updateOverlay.remove();
                }
            };

            document.getElementById('manualUpdate').onclick = () => {
                window.open('https://github.com/Whitzzscott/Better-Sakura', '_blank');
                updateOverlay.remove();
            };

            document.getElementById('cancelUpdate').onclick = () => {
                updateOverlay.remove();
            };
        } else {
            alert('You are already on the latest version!');
        }
    } catch (error) {
        window.open('https://github.com/Whitzzscott/Better-Sakura/archive/refs/heads/main.zip', '_blank');
    }
};

overlayContent.appendChild(updateButton);

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
const createAnimationCustomizer = () => {
    const customizeButton = createButton('Customize Animations');
    customizeButton.onclick = () => {
        const customizeOverlay = document.createElement('div');
        customizeOverlay.style.padding = '20px';
        customizeOverlay.style.maxWidth = '600px';
        customizeOverlay.style.maxHeight = '80vh';
        customizeOverlay.style.overflowY = 'auto';

        const predefinedSection = document.createElement('div');
        predefinedSection.style.marginBottom = '30px';

        const predefinedTitle = document.createElement('h3');
        predefinedTitle.textContent = 'Animation Code Editor';
        predefinedTitle.style.color = '#fff';
        predefinedTitle.style.marginBottom = '15px';
        predefinedSection.appendChild(predefinedTitle);

        const codeEditor = document.createElement('textarea');
        codeEditor.style.width = '100%';
        codeEditor.style.height = '300px';
        codeEditor.style.padding = '12px';
        codeEditor.style.backgroundColor = '#2d2d2d';
        codeEditor.style.color = '#fff';
        codeEditor.style.border = '1px solid #555';
        codeEditor.style.borderRadius = '4px';
        codeEditor.style.fontFamily = 'monospace';
        codeEditor.style.marginBottom = '15px';
        codeEditor.placeholder = `Button {
    animation: bounce 0.5s;
    hover: scale(1.1);
    active: translateY(2px);
}

Page {
    enter: fadeIn 0.3s ease;
    exit: fadeOut 0.3s ease;
    transition: slide 0.5s;
}`;

        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply Animations';
        applyButton.style.padding = '10px';
        applyButton.style.backgroundColor = '#4CAF50';
        applyButton.style.color = '#fff';
        applyButton.style.border = 'none';
        applyButton.style.borderRadius = '4px';
        applyButton.style.cursor = 'pointer';
        applyButton.style.marginTop = '15px';

        applyButton.onclick = () => {
            const code = codeEditor.value;
            const buttonMatch = code.match(/Button\s*{([^}]*)}/);
            const pageMatch = code.match(/Page\s*{([^}]*)}/);

            if (buttonMatch) {
                const buttonStyles = buttonMatch[1].trim().split('\n');
                const styleSheet = document.createElement('style');
                let buttonCSS = '';

                buttonStyles.forEach(style => {
                    const [property, value] = style.split(':').map(s => s.trim());
                    if (property === 'animation') {
                        buttonCSS += `button { animation: ${value}; }\n`;
                    } else if (property === 'hover') {
                        buttonCSS += `button:hover { transform: ${value}; }\n`;
                    } else if (property === 'active') {
                        buttonCSS += `button:active { transform: ${value}; }\n`;
                    }
                });

                styleSheet.textContent = buttonCSS;
                document.head.appendChild(styleSheet);
            }

            if (pageMatch) {
                const pageStyles = pageMatch[1].trim().split('\n');
                const styleSheet = document.createElement('style');
                let pageCSS = '';

                pageStyles.forEach(style => {
                    const [property, value] = style.split(':').map(s => s.trim());
                    if (property === 'enter') {
                        pageCSS += `@keyframes pageEnter { from { opacity: 0; } to { opacity: 1; } }\n`;
                        pageCSS += `.page-enter { animation: ${value}; }\n`;
                    } else if (property === 'exit') {
                        pageCSS += `@keyframes pageExit { from { opacity: 1; } to { opacity: 0; } }\n`;
                        pageCSS += `.page-exit { animation: ${value}; }\n`;
                    } else if (property === 'transition') {
                        pageCSS += `.page-transition { transition: ${value}; }\n`;
                    }
                });

                styleSheet.textContent = pageCSS;
                document.head.appendChild(styleSheet);
            }

            localStorage.setItem('customAnimationCode', code);
        };

        predefinedSection.appendChild(codeEditor);
        predefinedSection.appendChild(applyButton);
        customizeOverlay.appendChild(predefinedSection);

        createOverlay('Animation Customizer', [customizeOverlay]);
    };

    return customizeButton;
};

const animationCustomizerButton = createAnimationCustomizer();
floatingUI.appendChild(animationCustomizerButton);


floatingUI.appendChild(promptLibraryButton);
floatingUI.appendChild(autoLoadButton);
floatingUI.appendChild(promptButton);
floatingUI.appendChild(settingsButton);
floatingUI.appendChild(dynamicButton);
floatingUI.appendChild(autoSummaryButton);
floatingUI.appendChild(createCharacterButton);

floatingUI.style.position = 'fixed';
floatingUI.style.left = '10px';
floatingUI.style.top = '10px';
floatingUI.style.width = '50vw';
floatingUI.style.maxWidth = '150px';
floatingUI.style.backgroundColor = '#333';
floatingUI.style.borderRadius = '4px';
floatingUI.style.zIndex = '10000';
floatingUI.style.padding = '4px';
floatingUI.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
floatingUI.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
floatingUI.style.transform = 'scale(0.7)';
floatingUI.style.opacity = '0.5';
floatingUI.style.fontSize = '10px';
floatingUI.style.overflowY = 'auto';
floatingUI.style.maxHeight = '60vh';
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
            marginTop: '8px',
            color: '#FFFFFF',
            zIndex: '1000',
            fontSize: '14px',
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
            fontWeight: '500',
            letterSpacing: '0.3px',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            opacity: '0',
            transform: 'translateY(-5px)',
            userSelect: 'none'
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
            const tokenCount = parsedData["🧮 Total Token Count 🧮"] || 0;
            const wordCount = parsedData["💬 Word Count 💬"] || 0;

            overlayTags.forEach(tag => tag.remove());
            overlayTags = [];

            const pTag = document.createElement('p');
            pTag.textContent = `Tokens: ${tokenCount} | Words: ${wordCount}`;
            Object.assign(pTag.style, {
                position: 'absolute',
                marginTop: textarea.matches('input[class*="rounded-l-none"]') ? '-20px' : '8px',
                color: '#FFFFFF',
                zIndex: '1000',
                fontSize: textarea.matches('input[class*="rounded-l-none"]') ? '10px' : (window.innerWidth <= 768 ? '12px' : '14px'),
                fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                fontWeight: '500',
                letterSpacing: '0.3px',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                opacity: '0',
                transform: 'translateY(-5px)',
                userSelect: 'none',
                whiteSpace: 'nowrap'
            });
            textarea.parentNode.insertBefore(pTag, textarea.nextSibling);
            overlayTags.push(pTag);

            requestAnimationFrame(() => {
                pTag.style.opacity = '1';
                pTag.style.transform = 'translateY(0)';
            });

            lastPTag = pTag;
        } catch (error) {
            overlayTags.forEach(tag => tag.remove());
            overlayTags = [];
            console.error('Error processing text:', error);
        }
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                const pTag = textarea.parentNode.querySelector('p');
                if (window.location.pathname.includes('/tokenize') || localStorage.getItem('showPTag') === 'true') {
                    if (pTag) {
                        pTag.style.opacity = '1';
                        pTag.style.transform = 'translateY(0)';
                    }
                }
            }
        });
    });

    observer.observe(textarea, {
        attributes: true,
        attributeFilter: ['value']
    });

    textarea.addEventListener('input', processText);
    textarea.addEventListener('change', function() {
        const pTag = this.parentNode.querySelector('p');
        if (pTag && (window.location.pathname.includes('/tokenize') || localStorage.getItem('showPTag') === 'true')) {
            pTag.style.opacity = '1';
            pTag.style.transform = 'translateY(0)';
            localStorage.setItem('showPTag', 'true');
        }
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(processText, 100);
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const pTag = textarea.parentNode.querySelector('p');
            if (pTag) {
                pTag.style.fontSize = textarea.matches('input[class*="rounded-l-none"]') ? '10px' : (window.innerWidth <= 768 ? '12px' : '14px');
            }
        }, 250);
    });

    await processText();

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
    if (!text || text.trim().length === 0) {
        return JSON.stringify({ error: "Empty or invalid input" }, null, 2);
    }

    const API_URL = 'https://tiktoken-2nt2.onrender.com/tokenize';
    const AUTH_HEADER = 'Bearer SSS155';
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH_HEADER
        },
        body: JSON.stringify({ text: text.trim() })
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
            
            const floatingUI = document.querySelector('.floating-ui');
            if (floatingUI) {
                floatingUI.style.transform = 'scale(0.8)';
                floatingUI.style.right = '10px';
                floatingUI.style.bottom = '10px';
                
                const buttons = floatingUI.querySelectorAll('button');
                buttons.forEach(button => {
                    button.style.padding = '6px 10px';
                    button.style.fontSize = '11px';
                    button.style.margin = '3px';
                });

                const minimizeBtn = floatingUI.querySelector('minimizeButton');
                if (minimizeBtn) {
                    minimizeBtn.style.padding = '4px 8px';
                    minimizeBtn.style.fontSize = '10px';
                    minimizeBtn.style.minWidth = '20px';
                }
            }
            
        } else {
            document.documentElement.style.fontSize = '16px';
            document.documentElement.style.padding = '10px';
            
            const floatingUI = document.querySelector('.floating-ui');
            if (floatingUI) {
                floatingUI.style.transform = 'scale(1)';
                floatingUI.style.right = '20px';
                floatingUI.style.bottom = '20px';
                
                const buttons = floatingUI.querySelectorAll('button');
                buttons.forEach(button => {
                    button.style.padding = '8px 12px';
                    button.style.fontSize = '14px';
                    button.style.margin = '5px';
                });

                const minimizeBtn = floatingUI.querySelector('minimizeButton');
                if (minimizeBtn) {
                    minimizeBtn.style.padding = '6px 10px';
                    minimizeBtn.style.fontSize = '12px';
                    minimizeBtn.style.minWidth = '24px';
                }
            }
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

const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
        const descriptionElement = document.querySelector('p[id$="-form-item-description"]');
        if (descriptionElement && descriptionElement.textContent.includes('These instructions will affect')) {
            descriptionElement.remove();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
