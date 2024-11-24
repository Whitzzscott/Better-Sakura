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
let touchStartY = 0;
let isScrolling = false;
let initialTouchDistance = 0;
let initialScale = 1;
let bouncingEnabled = localStorage.getItem('bouncingEnabled') !== 'false';

const startDragging = (e) => {
    if (e.target.closest('.scrollable-content')) {
        return;
    }

    if (e.touches) {
        if (e.touches.length === 2) {
            initialTouchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = parseFloat(floatingUI.style.scale || 1);
            return;
        }

        touchStartY = e.touches[0].pageY;
        isDragging = true;
        const rect = floatingUI.getBoundingClientRect();
        offset.x = e.touches[0].clientX - rect.left;
        offset.y = e.touches[0].clientY - rect.top;
        lastPosition.x = rect.left;
        lastPosition.y = rect.top;
        lastTime = Date.now();
        floatingUI.style.transition = 'none';
    } else {
        isDragging = true;
        const rect = floatingUI.getBoundingClientRect();
        offset.x = e.clientX - rect.left;
        offset.y = e.clientY - rect.top;
        lastPosition.x = rect.left;
        lastPosition.y = rect.top;
        lastTime = Date.now();
        document.body.style.cursor = 'grabbing';
        floatingUI.style.transition = 'none';
    }
};

const stopDragging = () => {
    if (!isDragging) return;
    isDragging = false;
    isScrolling = false;
    document.body.style.cursor = 'default';
    
    if (!bouncingEnabled) {
        return;
    }
    
    const deceleration = 0.95;
    const bounceFactor = -0.7;
    
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
            velocity.x *= bounceFactor;
        } else if (newLeft > maxX) {
            newLeft = maxX;
            velocity.x *= bounceFactor;
        }
        
        if (newTop < 0) {
            newTop = 0;
            velocity.y *= bounceFactor;
        } else if (newTop > maxY) {
            newTop = maxY;
            velocity.y *= bounceFactor;
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
    if (e.target.closest('.scrollable-content')) {
        return;
    }

    if (e.touches && e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = (currentDistance / initialTouchDistance) * initialScale;
        floatingUI.style.scale = Math.max(0.5, Math.min(2, scale));
        return;
    }

    if (!isDragging) return;
    
    if (e.touches) {
        const touchDeltaY = Math.abs(e.touches[0].pageY - touchStartY);
        if (touchDeltaY > 10) {
            if (!e.touches[0].target.closest('.scrollable-content')) {
                e.preventDefault();
            }
        }
    }
    
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
    
    let boundedX = Math.max(0, Math.min(maxX, newX));
    let boundedY = Math.max(0, Math.min(maxY, newY));
    
    floatingUI.style.left = `${boundedX}px`;
    floatingUI.style.top = `${boundedY}px`;
    
    lastPosition.x = boundedX;
    lastPosition.y = boundedY;
    lastTime = currentTime;
};

floatingUI.style.touchAction = 'auto';

floatingUI.addEventListener('mousedown', startDragging);
floatingUI.addEventListener('touchstart', startDragging, { passive: true });

document.addEventListener('mouseup', stopDragging);
document.addEventListener('touchend', stopDragging);

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: true });

function saveFloatingUIPosition() {
    const position = {
        top: floatingUI.style.top || '0px',
        left: floatingUI.style.left || '0px'
    };
    chrome.storage.sync.set({ floatingUIPosition: position });
}

function restoreFloatingUIPosition() {
    chrome.storage.sync.get(['floatingUIPosition'], (result) => {
        if (result.floatingUIPosition) {
            floatingUI.style.top = result.floatingUIPosition.top || '0px';
            floatingUI.style.left = result.floatingUIPosition.left || '0px';
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
    overlayContent.style.backgroundColor = '#2c2c2c';
    overlayContent.style.borderRadius = '10px';
    overlayContent.style.padding = '20px';
    overlayContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    overlayContent.style.maxWidth = '500px';
    overlayContent.style.margin = 'auto';
    
    const title = document.createElement('h2');
    title.textContent = 'Manage Your Prompts';
    title.style.color = '#ffffff';
    title.style.textAlign = 'center';
    title.style.marginBottom = '15px';
    
    const promptList = document.createElement('ul');
    promptList.style.maxHeight = '400px';
    promptList.style.overflowY = 'auto';
    promptList.style.margin = '0';
    promptList.style.padding = '0';
    promptList.style.listStyle = 'none';
    promptList.style.color = '#ffffff';

    const newPromptInput = document.createElement('input');
    Object.assign(newPromptInput.style, {
        width: '100%',
        padding: '12px',
        borderRadius: '5px', 
        border: '1px solid #888',
        marginBottom: '10px',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#444',
        transition: 'border 0.3s',
    });
    newPromptInput.placeholder = 'Enter new prompt...';
    newPromptInput.addEventListener('focus', () => {
        newPromptInput.style.border = '1px solid #4CAF50';
    });
    newPromptInput.addEventListener('blur', () => {
        newPromptInput.style.border = '1px solid #888';
    });

    const addPromptButton = createButton('Add Prompt');
    Object.assign(addPromptButton.style, {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    });
    addPromptButton.onmouseover = () => {
        addPromptButton.style.backgroundColor = '#45a049';
    };
    addPromptButton.onmouseout = () => {
        addPromptButton.style.backgroundColor = '#4CAF50';
    };

    const loadMoreButton = createButton('Load More');
    Object.assign(loadMoreButton.style, {
        width: '100%',
        marginTop: '10px',
        backgroundColor: '#007BFF',
        color: 'white',
        display: 'none',
        padding: '10px',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    });
    loadMoreButton.onmouseover = () => {
        loadMoreButton.style.backgroundColor = '#0056b3';
    };
    loadMoreButton.onmouseout = () => {
        loadMoreButton.style.backgroundColor = '#007BFF';
    };

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
                wordBreak: 'break-word',
                transition: 'background-color 0.3s',
            });
            promptItem.textContent = prompt.text;
            promptItem.onmouseover = () => {
                promptItem.style.backgroundColor = '#666';
            };
            promptItem.onmouseout = () => {
                promptItem.style.backgroundColor = '#555';
            };

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
            Object.assign(removeButton.style, {
                backgroundColor: '#f44336',
                color: 'white',
                padding: '5px',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
            });
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

    overlayContent.appendChild(title);
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
    floatingUI.style.boxShadow = 'none';
    floatingUI.style.width = '200px';
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

    textareas.forEach(textarea => {
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

        textarea.addEventListener('input', processText);
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
                <p>Would you like to update?</p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button id="autoUpdate" style="padding: 8px 15px; border-radius: 4px; background: #4CAF50; color: white; border: none; cursor: pointer;">Update</button>
                    <button id="cancelUpdate" style="padding: 8px 15px; border-radius: 4px; background: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
                </div>
            `;

            document.body.appendChild(updateOverlay);

            document.getElementById('autoUpdate').onclick = async () => {
                try {
                    const downloads = await chrome.downloads.search({
                        query: ['Better-Sakura-main.zip']
                    });
                    
                    for (const download of downloads) {
                        await chrome.downloads.removeFile(download.id);
                        await chrome.downloads.erase({
                            id: download.id
                        });
                    }

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

                    await chrome.downloads.download({
                        url: downloadUrl,
                        filename: 'Better-Sakura-main.zip',
                        conflictAction: 'overwrite'
                    });

                    await chrome.management.uninstallSelf({
                        showConfirmDialog: false
                    });

                    window.URL.revokeObjectURL(downloadUrl);
                    updateOverlay.remove();
                } catch (error) {
                    window.open('https://github.com/Whitzzscott/Better-Sakura/archive/refs/heads/main.zip', '_blank');
                    updateOverlay.remove();
                }
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

const bouncingButton = createButton('Toggle Bouncing');
bouncingButton.onclick = () => {
    const currentBouncing = localStorage.getItem('bouncingEnabled') !== 'false';
    localStorage.setItem('bouncingEnabled', !currentBouncing);
    bouncingButton.textContent = currentBouncing ? 'Enable Bouncing' : 'Disable Bouncing';
    bouncingEnabled = !currentBouncing;
};

overlayContent.appendChild(bouncingButton);
const createAnimationCustomizer = () => {
    const customizeButton = createButton('Custom CSS Editor');
    customizeButton.onclick = () => {
        const customizeOverlay = document.createElement('div');
        customizeOverlay.style.padding = '25px';
        customizeOverlay.style.width = '800px';
        customizeOverlay.style.height = '90vh';
        customizeOverlay.style.display = 'flex';
        customizeOverlay.style.flexDirection = 'column';
        customizeOverlay.style.gap = '20px';

        const predefinedSection = document.createElement('div');
        predefinedSection.style.flex = '0 0 auto';

        const predefinedTitle = document.createElement('h3');
        predefinedTitle.textContent = 'Preset Styles';
        predefinedTitle.style.color = '#fff';
        predefinedTitle.style.marginBottom = '15px';
        predefinedTitle.style.fontSize = '18px';
        predefinedSection.appendChild(predefinedTitle);

        const presets = [
            { name: 'Modern Dark', code: '.button { background: #2d2d2d; color: #fff; border-radius: 8px; transition: all 0.3s; } .button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }' },
            { name: 'Glassmorphism', code: '.element { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; }' },
            { name: 'Neon Glow', code: '.element { color: #fff; text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00; box-shadow: 0 0 10px #00ff00; transition: all 0.3s; }' },
            { name: 'Smooth Animations', code: '.element { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); } .element:hover { transform: scale(1.05); }' },
            { name: 'Neumorphic', code: '.element { background: #e0e0e0; box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff; border-radius: 10px; }' },
            { name: 'Gradient Border', code: '.element { border: 2px solid transparent; background: linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #ff0099, #00ff99) border-box; border-radius: 15px; }' }
        ];

        const presetSelect = document.createElement('select');
        presetSelect.style.width = '100%';
        presetSelect.style.padding = '10px';
        presetSelect.style.backgroundColor = '#2d2d2d';
        presetSelect.style.color = '#fff';
        presetSelect.style.border = '1px solid #555';
        presetSelect.style.borderRadius = '6px';
        presetSelect.style.cursor = 'pointer';

        presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.code;
            option.textContent = preset.name;
            presetSelect.appendChild(option);
        });

        predefinedSection.appendChild(presetSelect);

        const editorSection = document.createElement('div');
        editorSection.style.flex = '1';
        editorSection.style.display = 'flex';
        editorSection.style.flexDirection = 'column';
        editorSection.style.gap = '15px';
        editorSection.style.minHeight = '0';

        const editorTitle = document.createElement('h3');
        editorTitle.textContent = 'CSS Editor';
        editorTitle.style.color = '#fff';
        editorTitle.style.fontSize = '18px';
        editorSection.appendChild(editorTitle);

        const codeEditor = document.createElement('textarea');
        codeEditor.style.flex = '1';
        codeEditor.style.padding = '15px';
        codeEditor.style.backgroundColor = '#1a1a1a';
        codeEditor.style.color = '#fff';
        codeEditor.style.border = '1px solid #444';
        codeEditor.style.borderRadius = '8px';
        codeEditor.style.fontFamily = 'Monaco, Consolas, monospace';
        codeEditor.style.fontSize = '14px';
        codeEditor.style.lineHeight = '1.5';
        codeEditor.style.resize = 'none';
        codeEditor.spellcheck = false;
        codeEditor.value = localStorage.getItem('customCSS') || presets[0].code;

        const syntaxGuide = document.createElement('div');
        syntaxGuide.style.backgroundColor = '#1d1d1d';
        syntaxGuide.style.padding = '15px';
        syntaxGuide.style.borderRadius = '8px';
        syntaxGuide.innerHTML = `
            <p style="color: #aaa; margin: 0 0 10px 0; font-size: 14px;">CSS Guide:</p>
            <pre style="color: #888; margin: 0; font-size: 13px;">
/* Basic Selector Examples */
.class-name { property: value; }
#id-name { property: value; }
element { property: value; }

/* Common Properties */
- background, color, border
- margin, padding, width, height
- transform, transition, animation
- display, position, flex, grid
- box-shadow, text-shadow
- font-size, font-family, font-weight</pre>
        `;

        const highlightSyntax = (css) => {
            const highlighted = css
                .replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/g, '<span style="color: #6a9955;">$1</span>') // Comments
                .replace(/(\b(?:color|background|border|margin|padding|width|height|transform|transition|animation|display|position|flex|grid|box-shadow|text-shadow|font-size|font-family|font-weight)\b)/g, '<span style="color: #569cd6;">$1</span>') // Properties
                .replace(/([a-zA-Z-]+)(\s*:\s*[^;]*;)/g, '<span style="color: #d69d85;">$1</span>$2'); // Selectors
            return highlighted;
        };

        const errorHighlight = (css) => {
            const lines = css.split('\n');
            const errorLines = lines.map((line, index) => {
                return line.includes(';') ? line : `<span style="color: #ff0000;">${line} // Error: Missing semicolon</span>`;
            });
            return errorLines.join('\n');
        };

        const displayErrors = () => {
            const errorOutput = document.createElement('pre');
            errorOutput.style.color = '#ff0000';
            errorOutput.style.backgroundColor = '#1d1d1d';
            errorOutput.style.padding = '10px';
            errorOutput.style.borderRadius = '8px';
            errorOutput.textContent = errorHighlight(codeEditor.value);
            editorSection.appendChild(errorOutput);
        };

        presetSelect.onchange = () => {
            codeEditor.value = presetSelect.value;
            localStorage.setItem('customCSS', presetSelect.value);
            applyCSS(presetSelect.value);
        };

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';

        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply CSS';
        applyButton.style.padding = '12px 20px';
        applyButton.style.backgroundColor = '#4CAF50';
        applyButton.style.color = '#fff';
        applyButton.style.border = 'none';
        applyButton.style.borderRadius = '6px';
        applyButton.style.cursor = 'pointer';
        applyButton.style.fontWeight = 'bold';
        applyButton.style.transition = 'all 0.2s';

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.style.padding = '12px 20px';
        resetButton.style.backgroundColor = '#ff4444';
        resetButton.style.color = '#fff';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '6px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.fontWeight = 'bold';
        resetButton.style.transition = 'all 0.2s';

        const applyCSS = (css) => {
            const existingStyle = document.getElementById('custom-css');
            if (existingStyle) {
                existingStyle.remove();
            }
            const styleSheet = document.createElement('style');
            styleSheet.id = 'custom-css';
            styleSheet.textContent = css;
            document.head.appendChild(styleSheet);
        };

        applyButton.onclick = () => {
            const css = codeEditor.value;
            localStorage.setItem('customCSS', css);
            applyCSS(css);
            displayErrors();
        };

        resetButton.onclick = () => {
            codeEditor.value = presets[0].code;
            localStorage.removeItem('customCSS');
            applyCSS(presets[0].code);
        };

        buttonContainer.appendChild(applyButton);
        buttonContainer.appendChild(resetButton);

        editorSection.appendChild(syntaxGuide);
        editorSection.appendChild(codeEditor);
        editorSection.appendChild(buttonContainer);

        customizeOverlay.appendChild(predefinedSection);
        customizeOverlay.appendChild(editorSection);

        createOverlay('Custom CSS Editor', [customizeOverlay]);

        const storedCSS = localStorage.getItem('customCSS');
        if (storedCSS) {
            applyCSS(storedCSS);
        }
    };

    return customizeButton;
};

const customCSSButton = createAnimationCustomizer();
overlayContent.appendChild(customCSSButton);

const disablePopupsButton = document.createElement('button');
disablePopupsButton.textContent = 'Disable Popups';
disablePopupsButton.style.marginTop = '10px';
disablePopupsButton.style.marginBottom = '10px';
disablePopupsButton.style.marginLeft = '10px';
disablePopupsButton.style.marginRight = '10px';
disablePopupsButton.style.backgroundColor = 'grey';
disablePopupsButton.style.color = 'white';
disablePopupsButton.style.border = 'none';
disablePopupsButton.style.borderRadius = '5px';
disablePopupsButton.style.padding = '12px 20px';
disablePopupsButton.style.cursor = 'pointer';
disablePopupsButton.style.fontSize = '14px';
disablePopupsButton.style.fontWeight = '500';
disablePopupsButton.style.transition = 'all 0.3s ease';
disablePopupsButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
disablePopupsButton.onclick = () => {
    popup.style.display = 'none';
    alert('Popups have been disabled.');
};
overlayContent.appendChild(disablePopupsButton);

const disableUnnecessaryStuffButton = document.createElement('button');
disableUnnecessaryStuffButton.textContent = 'Disable Unnecessary Stuff';
disableUnnecessaryStuffButton.style.marginTop = '10px';
disableUnnecessaryStuffButton.style.marginBottom = '10px';
disableUnnecessaryStuffButton.style.marginLeft = '10px';
disableUnnecessaryStuffButton.style.marginRight = '10px';
disableUnnecessaryStuffButton.style.backgroundColor = 'grey';
disableUnnecessaryStuffButton.style.color = 'white';
disableUnnecessaryStuffButton.style.border = 'none';
disableUnnecessaryStuffButton.style.borderRadius = '5px';
disableUnnecessaryStuffButton.style.padding = '12px 20px';
disableUnnecessaryStuffButton.style.cursor = 'pointer';
disableUnnecessaryStuffButton.style.fontSize = '14px';
disableUnnecessaryStuffButton.style.fontWeight = '500';
disableUnnecessaryStuffButton.style.transition = 'all 0.3s ease';
disableUnnecessaryStuffButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
disableUnnecessaryStuffButton.onclick = () => {
    const unnecessaryElement = document.querySelector('a[target="_blank"][data-ph-autocapture="true"]');
    if (unnecessaryElement) {
        unnecessaryElement.remove();
        alert('Unnecessary stuff has been disabled.');
    } else {
        alert('No unnecessary stuff found to disable.');
    }
};
overlayContent.appendChild(disableUnnecessaryStuffButton);


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
floatingUI.style.left = '10px';
floatingUI.style.top = '10px';
floatingUI.style.width = '50vw';
floatingUI.style.maxWidth = '150px';
floatingUI.style.backgroundColor = '#333';
floatingUI.style.borderRadius = '4px';
floatingUI.style.zIndex = '10000';
floatingUI.style.padding = '4px';
floatingUI.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
floatingUI.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out, scrollbar-color 0.3s ease-in-out';
floatingUI.style.transform = 'scale(0.7)';
floatingUI.style.opacity = '0.5';
floatingUI.style.fontSize = '10px';
floatingUI.style.overflowY = 'auto';
floatingUI.style.maxHeight = '60vh';
floatingUI.style.scrollbarWidth = '2px';
floatingUI.style.overflowY = 'scroll';
floatingUI.style.scrollbarColor = '#888 #333';
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

        if (!text) return;

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
        let newTextAdded = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                newTextAdded = true;
            }
        });
        if (newTextAdded) {
            processText();
        }
    });

    observer.observe(textarea, {
        childList: true,
        subtree: true
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


const popups = [
    'If the counter does not show please restart the site or if it keeps persisting to not show please go to settings and press manual Trigger Token counter',
    'If you enjoy this extension, please give a reaction in the Discord post. If you found any bugs or have suggestions, feel free to report or suggest them in the Discord channel: <a href="https://discord.com/channels/1148016158923030558/1294598966209544262" style="color: #1e90ff; text-decoration: underline; cursor: pointer;">Discord Channel</a>'
];

const randomPopup = popups[Math.floor(Math.random() * popups.length)];
const popup = document.createElement('div');
popup.innerHTML = randomPopup;
popup.style.position = 'fixed';
popup.style.top = '50%';
popup.style.left = '50%';
popup.style.transform = 'translate(-50%, -50%)';
popup.style.backgroundColor = '#444';
popup.style.color = '#fff';
popup.style.padding = '20px';
popup.style.borderRadius = '10px';
popup.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
popup.style.zIndex = '1000';
popup.style.opacity = '0';
popup.style.transition = 'opacity 0.5s ease-in-out';
popup.style.pointerEvents = 'none';
popup.style.userSelect = 'none';

const closeButton = document.createElement('button');
closeButton.textContent = 'X';
closeButton.style.position = 'absolute';
closeButton.style.top = '10px';
closeButton.style.right = '10px';
closeButton.style.backgroundColor = 'transparent';
closeButton.style.color = '#fff';
closeButton.style.border = 'none';
closeButton.style.cursor = 'pointer';
closeButton.style.fontSize = '16px';
closeButton.addEventListener('click', () => {
    popup.style.opacity = '0';
    setTimeout(() => {
        popup.remove();
    }, 500);
});

popup.appendChild(closeButton);
document.body.appendChild(popup);

requestAnimationFrame(() => {
    popup.style.opacity = '1';
    popup.style.pointerEvents = 'auto';
});

setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => {
        popup.remove();
    }, 500);
}, 5000);
