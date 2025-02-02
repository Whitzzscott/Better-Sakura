let BASEURL = null;

async function loadConfig() {
    const { BASEURL: configBaseUrl } = await import(chrome.runtime.getURL('Config/Config.js'));
    BASEURL = configBaseUrl; 
}

loadConfig();


console.log("TEST:", BASEURL); 

const checkLoginStatus = async () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        await delay(100)
        
        const response = await fetch(`${BASEURL}/check-login-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer SSS155'
            }
        });
        const responseData = await response.json();
        const data = responseData;
        
        if (data.is_login === false) {
            const overlay = document.createElement('div');
            overlay.innerHTML = `
                <style>
                    @import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

                    .login-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.9);
                        z-index: 9998;
                        opacity: 0;
                        backdrop-filter: blur(12px);
                        transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .login-popup {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 9999;
                        min-width: 500px;
                        border-radius: 24px;
                        box-shadow: 0 25px 60px rgba(0,0,0,0.6);
                        overflow: hidden;
                    }

                    .popup-body {
                        background: linear-gradient(165deg, #6366f1, #4338ca);
                        padding: 4rem;
                        text-align: center;
                        color: white;
                    }

                    .popup-title {
                        font-weight: 800;
                        margin-bottom: 1.5rem;
                        font-size: 2.5rem;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        animation: animate__animated animate__fadeInDown animate__delay-0.5s;
                    }

                    .popup-text {
                        font-size: 1.3rem;
                        line-height: 1.7;
                        margin-bottom: 2rem;
                        opacity: 0.95;
                        animation: animate__animated animate__fadeIn animate__delay-0.7s;
                    }

                    #info {
                        background: rgba(0, 0, 0, 0.2);
                        padding: 1.2rem;
                        border-radius: 12px;
                        font-size: 1.1rem;
                        line-height: 1.6;
                        margin: 1.5rem 0;
                        color: rgba(255, 255, 255, 0.9);
                        border-left: 4px solid rgba(255, 255, 255, 0.3);
                        animation: animate__animated animate__fadeIn animate__delay-0.9s;
                    }

                    .button-container {
                        display: flex;
                        gap: 2rem;
                        justify-content: center;
                        margin-top: 2.5rem;
                        animation: animate__animated animate__fadeInUp animate__delay-1s;
                    }

                    .login-btn, .register-btn {
                        font-size: 1.3rem;
                        padding: 1.2rem 3rem;
                        font-weight: bold;
                        border: none;
                        border-radius: 14px;
                        cursor: pointer;
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        min-width: 160px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }

                    .login-btn {
                        background: white;
                        color: #4f46e5;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
                    }

                    .register-btn {
                        background: rgba(255,255,255,0.1);
                        color: white;
                        border: 2px solid rgba(255,255,255,0.8);
                        backdrop-filter: blur(4px);
                    }

                    .login-btn:hover {
                        transform: translateY(-4px) scale(1.05);
                        box-shadow: 0 8px 30px rgba(79, 70, 229, 0.4);
                        animation: animate__animated animate__pulse;
                    }

                    .register-btn:hover {
                        transform: translateY(-4px) scale(1.05);
                        box-shadow: 0 8px 30px rgba(255, 255, 255, 0.2);
                        animation: animate__animated animate__pulse;
                    }

                    .login-btn:active, .register-btn:active {
                        transform: translateY(-2px) scale(1.02);
                    }
                </style>
                <div class="login-overlay">
                    <div class="login-popup animate__animated animate__zoomIn">
                        <div class="popup-body">
                            <h3 class="popup-title">Welcome to Better Sakura</h3>
                            <p class="popup-text">Please login or register to unlock all features and enhance your experience</p>
                            <p id="info">Better Sakura is only being managed by one dev. To support this project please login or register or if you would like to further support this project even more then you can also donate to us via setting > donate button - this would mean a lot as releasing this for free isn't fair considering this is 3K+ lines of code which takes a lot to manage and add new features in as well as maintain the server, by donating your are supporting the project and allowing us to maintain the servers.</p>
                            <div class="button-container">
                                <button class="login-btn">Login</button>
                                <button class="register-btn">Register</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const loginBtn = overlay.querySelector('.login-btn');
            const registerBtn = overlay.querySelector('.register-btn');
            const popup = overlay.querySelector('.login-popup');
            const overlayEl = overlay.querySelector('.login-overlay');

            const animateAndOpen = (url) => {
                popup.style.transform = 'translate(-50%, -150%) scale(0.9)';
                popup.style.opacity = '0';
                overlayEl.style.opacity = '0';
                setTimeout(() => {
                    window.open(chrome.runtime.getURL(url), '_blank', 'width=600,height=400');
                    overlay.remove();
                }, 600);
            };

            loginBtn.onclick = () => animateAndOpen('login.html');
            registerBtn.onclick = () => animateAndOpen('register.html');

            setTimeout(() => overlayEl.style.opacity = '1', 100);
            return false;
        }
        
        return true;
    } catch (error) {
        const errorPopup = document.createElement('div');
        errorPopup.innerHTML = `
            <style>
                .error-popup {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(145deg, #ff4d4d, #dc3545);
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                    z-index: 9999;
                    text-align: center;
                    min-width: 320px;
                    animation: errorPopIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes errorPopIn {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }

                .error-message {
                    margin: 0 0 20px 0;
                    font-size: 1.1rem;
                    color: white;
                    font-weight: 500;
                }

                .close-btn {
                    padding: 10px 25px;
                    background-color: rgba(255,255,255,0.9);
                    color: #dc3545;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }

                .close-btn:hover {
                    background-color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
            </style>
            <div class="error-popup">
                <p class="error-message">Error checking login status. Please try again later.</p>
                <button class="close-btn">Close</button>
            </div>
        `;

        document.body.appendChild(errorPopup);
        errorPopup.querySelector('.close-btn').onclick = () => {
            errorPopup.style.opacity = '0';
            errorPopup.style.transform = 'translate(-50%, -40%)';
            setTimeout(() => errorPopup.remove(), 300);
        };
        return false;
    }
};
const loginStatusCheck = async () => {
    const responseDatav1 = await fetch(`${BASEURL}/check-login-status` , {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer SSS155'
        }
    });
    const isLoggedIn = await responseDatav1.json();
    console.log(isLoggedIn)
    if (isLoggedIn && isLoggedIn.is_login === true) {
        const floatingUI = document.createElement('div');
        floatingUI.style.position = 'fixed';
        floatingUI.style.right = '15px';
        floatingUI.style.bottom = '50px';
        floatingUI.style.width = '40vw';
        floatingUI.style.maxWidth = '160px';
        floatingUI.style.borderRadius = '12px';
        floatingUI.style.zIndex = '10000';
        floatingUI.style.padding = '12px';
        floatingUI.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        floatingUI.style.transform = 'scale(0.95) translateY(-10px)';
        floatingUI.style.opacity = '0';
        floatingUI.style.fontSize = '13px';
        floatingUI.style.overflowY = 'auto';
        floatingUI.style.maxHeight = '60vh';
        floatingUI.style.backgroundColor = 'rgba(23, 25, 35, 0.9)';
        floatingUI.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15)';
        floatingUI.style.border = '1px solid rgba(255, 255, 255, 0.15)';
        floatingUI.style.backdropFilter = 'blur(8px)';
        floatingUI.style.scrollbarWidth = 'thin';
        floatingUI.style.scrollbarColor = 'rgba(255, 255, 255, 0.3) transparent';
        floatingUI.style.animation = 'fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        
        setTimeout(() => {
            floatingUI.style.transform = 'scale(1) translateY(0)';
            floatingUI.style.opacity = '1';
        }, 100);
        
        floatingUI.onmouseenter = () => {
            floatingUI.style.transform = 'scale(1.01)';
            floatingUI.style.border = '1px solid rgba(255,255,255,0.15)';
            floatingUI.style.boxShadow = '0 5px 20px rgba(0,0,0,0.25)';
        };
        
        floatingUI.onmouseleave = () => {
            floatingUI.style.transform = 'scale(1)';
            floatingUI.style.border = '1px solid rgba(255,255,255,0.1)';
            floatingUI.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
        };
        
        floatingUI.dataset.expanded = 'true';
        
        
        document.body.appendChild(floatingUI);
        
        

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
            button.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            button.style.fontSize = '16px';
            button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
            button.style.fontFamily = 'Arial, sans-serif';
            button.style.animation = 'buttonPop 0.5s ease-out';
            button.style.transform = 'scale(1)';
  
            button.onmouseenter = () => {
                button.style.transform = 'scale(1.05)';
                button.style.backgroundColor = activeColor;
            };
        
            button.onmouseleave = () => {
                button.style.transform = 'scale(1)';
                button.style.backgroundColor = '#555';
            };
        
            button.onmousedown = () => {
                button.style.transform = 'scale(0.95)';
                button.style.backgroundColor = activeColor;
                button.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.7)';
                button.style.animation = 'buttonPress 0.2s ease-out';
            };
        
            button.onmouseup = () => {
                button.style.transform = 'scale(1.05)';
                button.style.backgroundColor = '#555';
                button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
                button.style.animation = 'buttonRelease 0.2s ease-out';
            };
        
            return button;
        };
        

        const toggleExpand = (expand) => {
            Array.from(floatingUI.children).forEach(child => {
                if (child !== minimizeButton) {
                    child.style.opacity = expand ? '1' : '0';
                    child.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    child.style.animation = expand ? 'fadeIn 0.5s ease, slideIn 0.5s ease' : 'fadeOut 0.5s ease, slideOut 0.5s ease';
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
                        }, 500);
                    }
                }
            });
        
            floatingUI.classList.remove('animate__slideOutLeft', 'animate__slideInLeft');
            floatingUI.offsetWidth;
        
            if (expand) {
                floatingUI.classList.add('animate__slideInLeft');
                floatingUI.style.width = '300px';
            } else {
                floatingUI.classList.add('animate__slideOutLeft');
                floatingUI.style.width = '50px';
            }
        };
        
        const minimizeButton = createButton('−', '#F44336');
        
        if (window.innerWidth <= 768) {
            minimizeButton.style.width = '40px';
            minimizeButton.style.height = '40px';
            minimizeButton.style.fontSize = '20px';
            minimizeButton.style.padding = '4px';
            minimizeButton.style.background = `linear-gradient(to bottom, #F44336 0%, #F44336 ${minimizeButton.style.height})`;
            minimizeButton.style.backgroundSize = '40px 40px';
            minimizeButton.style.borderRadius = '50%';
            minimizeButton.style.transition = 'transform 0.3s ease, background 0.3s ease';
        } else {
            minimizeButton.style.width = '50px';
            minimizeButton.style.height = '50px';
            minimizeButton.style.fontSize = '24px';
            minimizeButton.style.padding = '6px';
            minimizeButton.style.background = `linear-gradient(to bottom, #F44336 0%, #F44336 ${minimizeButton.style.height})`;
            minimizeButton.style.backgroundSize = '50px 50px';
            minimizeButton.style.borderRadius = '50%';
            minimizeButton.style.transition = 'transform 0.3s ease, background 0.3s ease';
        }
        
        minimizeButton.addEventListener('mouseenter', () => {
            minimizeButton.style.transform = 'scale(1.1)';
            minimizeButton.style.background = 'linear-gradient(to bottom, #E53935 0%, #E53935 40px)';
        });
        
        minimizeButton.addEventListener('mouseleave', () => {
            minimizeButton.style.transform = 'scale(1)';
            minimizeButton.style.background = `linear-gradient(to bottom, #F44336 0%, #F44336 ${minimizeButton.style.height})`;
        });
        
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

        const autoLoadButton = createButton('Auto Load');
        const promptButton = createButton('Prompt');
        const settingsButton = createButton('Settings');
        const dynamicButton = createButton('Dynamic Button');
        const autoSummaryButton = createButton('Auto Summary');
        const createCharacterButton = createButton('Create Character');
        

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
                backgroundColor: 'rgba(0,0,0,0.85)',
                zIndex: '10000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(5px)',
                animation: 'fadeIn 0.4s ease-out'
            });
        
            const overlayUI = document.createElement('div');
            Object.assign(overlayUI.style, {
                backgroundColor: '#2c2c2c',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transform: 'scale(0.95) translateY(20px)',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'slideUp 0.6s ease-out',
                overflowY: 'auto'
            });
        
            const topBar = document.createElement('div');
            Object.assign(topBar.style, {
                width: '100%',
                height: '60px',
                backgroundColor: '#4A90E2',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 20px',
                fontSize: '22px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                borderBottom: '2px solid #2E7DB2',
                position: 'sticky',
                top: '0',
                zIndex: '10001'
            });
        
            const titleElement = document.createElement('h2');
            titleElement.innerText = title;
            titleElement.style.fontWeight = 'bold';
        
            const closeButton = document.createElement('button');
            closeButton.textContent = '✕';
            Object.assign(closeButton.style, {
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '25px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                padding: '5px'
            });
        
            closeButton.addEventListener('mouseover', () => {
                closeButton.style.transform = 'rotate(180deg)';
            });
        
            closeButton.addEventListener('mouseleave', () => {
                closeButton.style.transform = 'rotate(0deg)';
            });
        
            closeButton.addEventListener('click', () => {
                overlay.classList.add('animate__animated', 'animate__fadeOut');
                setTimeout(() => overlay.remove(), 600);
            });
        
            topBar.appendChild(titleElement);
            topBar.appendChild(closeButton);
        
            overlayUI.appendChild(topBar);
        
            contentElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.classList.add('animate__animated', 'animate__fadeInUp');
                overlayUI.appendChild(el);
            });
        
            overlay.appendChild(overlayUI);
            document.body.appendChild(overlay);
        
            requestAnimationFrame(() => {
                overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
                overlay.style.backdropFilter = 'blur(5px)';
                overlayUI.style.transform = 'scale(1) translateY(0)';
                overlayUI.style.opacity = '1';
                contentElements.forEach((el, index) => {
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, 200 + (index * 100));
                });
            });
            const styleInputs = () => {
                const inputs = overlayUI.querySelectorAll('input, textarea, select');
                
                inputs.forEach(input => {
                    Object.assign(input.style, {
                        margin: '10px 0',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        backgroundColor: '#333',
                        color: 'white',
                        fontSize: '16px',
                        width: '100%',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                    });
        
                    input.addEventListener('focus', () => {
                        input.style.borderColor = '#4A90E2';
                        input.style.boxShadow = '0 0 8px rgba(74, 144, 226, 0.8)';
                    });
        
                    input.addEventListener('blur', () => {
                        input.style.borderColor = '#444';
                        input.style.boxShadow = 'none';
                    });
        
                    input.addEventListener('hover', () => {
                        input.style.transform = 'scale(1.02)';
                    });
                });
            };
        
            styleInputs();
        };
        
        
        
        
        const showPromptOverlay = () => {
            const overlayContent = document.createElement('div');
            Object.assign(overlayContent.style, {
                backgroundColor: '#2c2c2c',
                borderRadius: '10px',
                padding: '20px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                maxWidth: '500px',
                margin: 'auto',
                animation: 'fadeIn 0.5s ease-out',
                scrollbarWidth: 'thin',
                scrollbarColor: '#666 #2c2c2c'
            });
        
            const title = document.createElement('h2');
            title.textContent = 'Manage Your Prompts';
            Object.assign(title.style, {
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '15px',
                animation: 'slideDown 0.5s ease-out',
                fontSize: '24px',
                fontWeight: '500',
            });
        
            const promptList = document.createElement('ul');
            Object.assign(promptList.style, {
                maxHeight: '400px',
                overflowY: 'auto',
                margin: '0',
                padding: '0 4px 0 0',
                listStyle: 'none',
                color: '#ffffff',
                animation: 'fadeIn 0.8s ease-out',
                scrollbarWidth: 'thin',
                scrollbarColor: '#666 #2c2c2c',
            });
        
            promptList.addEventListener('mouseover', () => {
                promptList.style.scrollbarColor = '#888 #2c2c2c';
            });
        
            promptList.addEventListener('mouseout', () => {
                promptList.style.scrollbarColor = '#666 #2c2c2c';
            });
        
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
                transition: 'all 0.3s ease',
                animation: 'slideIn 0.5s ease-out',
                outline: 'none',
            });
            newPromptInput.placeholder = 'Enter new prompt...';
            newPromptInput.addEventListener('focus', () => {
                newPromptInput.style.border = '1px solid #4CAF50';
                newPromptInput.style.transform = 'scale(1.02)';
                newPromptInput.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.3)';
            });
            newPromptInput.addEventListener('blur', () => {
                newPromptInput.style.border = '1px solid #888';
                newPromptInput.style.transform = 'scale(1)';
                newPromptInput.style.boxShadow = 'none';
            });
        
            const addPromptButton = createButton('Add Prompt');
            Object.assign(addPromptButton.style, {
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '12px',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: 'slideIn 0.6s ease-out',
                fontWeight: '500',
            });
            addPromptButton.onmouseover = () => {
                addPromptButton.style.backgroundColor = '#45a049';
                addPromptButton.style.transform = 'translateY(-2px)';
                addPromptButton.style.boxShadow = '0 4px 12px rgba(69, 160, 73, 0.3)';
            };
            addPromptButton.onmouseout = () => {
                addPromptButton.style.backgroundColor = '#4CAF50';
                addPromptButton.style.transform = 'translateY(0)';
                addPromptButton.style.boxShadow = 'none';
            };
        
            const loadMoreButton = createButton('Load More');
            Object.assign(loadMoreButton.style, {
                width: '100%',
                marginTop: '10px',
                backgroundColor: '#007BFF',
                color: 'white',
                display: 'none',
                padding: '12px',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: 'slideUp 0.5s ease-out',
                fontWeight: '500',
            });
            loadMoreButton.onmouseover = () => {
                loadMoreButton.style.backgroundColor = '#0056b3';
                loadMoreButton.style.transform = 'translateY(-2px)';
                loadMoreButton.style.boxShadow = '0 4px 12px rgba(0, 86, 179, 0.3)';
            };
            loadMoreButton.onmouseout = () => {
                loadMoreButton.style.backgroundColor = '#007BFF';
                loadMoreButton.style.transform = 'translateY(0)';
                loadMoreButton.style.boxShadow = 'none';
            };
        
            let currentPromptCount = 10;
            const PROMPTS_PER_PAGE = 10;
        
            const loadPrompts = () => {
                const storedPrompts = JSON.parse(localStorage.getItem('prompts')) || [];
                promptList.innerHTML = '';
                
                const promptsToShow = storedPrompts.slice(0, currentPromptCount);
                
                promptsToShow.forEach((prompt, index) => {
                    const promptItem = document.createElement('li');
                    Object.assign(promptItem.style, {
                        cursor: 'pointer',
                        marginBottom: '10px',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '5px',
                        backgroundColor: '#555',
                        wordBreak: 'break-word',
                        transition: 'all 0.3s ease',
                        animation: `slideIn 0.5s ease-out ${index * 0.1}s`,
                        opacity: '0',
                        transform: 'translateX(-20px)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    });
                    promptItem.textContent = prompt.text;
        
                    setTimeout(() => {
                        promptItem.style.opacity = '1';
                        promptItem.style.transform = 'translateX(0)';
                    }, 50 + (index * 100));
        
                    promptItem.onmouseover = () => {
                        promptItem.style.backgroundColor = '#666';
                        promptItem.style.transform = 'scale(1.02)';
                        promptItem.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                    };
                    promptItem.onmouseout = () => {
                        promptItem.style.backgroundColor = '#555';
                        promptItem.style.transform = 'scale(1)';
                        promptItem.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
                    };
        
                    const buttonContainer = document.createElement('div');
                    Object.assign(buttonContainer.style, {
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                        animation: 'fadeIn 0.5s ease-out',
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
                                copyButton.style.transform = 'scale(1.1)';
                                const originalText = copyButton.textContent;
                                copyButton.textContent = 'Copied!';
                                setTimeout(() => {
                                    copyButton.textContent = originalText;
                                    copyButton.style.transform = 'scale(1)';
                                }, 1000);
                            });
                    };
        
                    const removeButton = createButton('Remove');
                    Object.assign(removeButton.style, {
                        backgroundColor: '#f44336',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    });
                    removeButton.onclick = (e) => {
                        e.stopPropagation();
                        promptItem.style.transform = 'translateX(100%)';
                        promptItem.style.opacity = '0';
                        setTimeout(() => {
                            const updatedPrompts = storedPrompts.filter(p => p.text !== prompt.text);
                            localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
                            loadPrompts();
                            updateLoadMoreButton(updatedPrompts.length);
                        }, 300);
                    };
        
                    [downloadButton, copyButton, removeButton].forEach(button => {
                        button.style.flex = '1';
                        button.style.transition = 'all 0.3s ease';
                        buttonContainer.appendChild(button);
                    });
        
                    promptItem.appendChild(buttonContainer);
                    promptList.appendChild(promptItem);
                });
        
                updateLoadMoreButton(storedPrompts.length);
            };
        
            const updateLoadMoreButton = (totalPrompts) => {
                loadMoreButton.style.display = totalPrompts > currentPromptCount ? 'block' : 'none';
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
            try {
                const loginCheckResponse = await fetch(`${BASEURL}/check-login-status`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer SSS155'
                    }
                });
        
                const loginStatus = await loginCheckResponse.json();
        
                if (!loginStatus.is_login) {
                    const errorOverlay = document.createElement('div');
                    errorOverlay.style.position = 'fixed';
                    errorOverlay.style.top = '50%';
                    errorOverlay.style.left = '50%';
                    errorOverlay.style.transform = 'translate(-50%, -50%)';
                    errorOverlay.style.backgroundColor = '#222';
                    errorOverlay.style.color = '#fff';
                    errorOverlay.style.padding = '20px';
                    errorOverlay.style.borderRadius = '8px';
                    errorOverlay.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
                    errorOverlay.style.zIndex = '10000';
                    errorOverlay.innerHTML = `
                        <h3>Error</h3>
                        <p>Please log in to use this feature</p>
                        <button id="goToRegister" style="padding: 8px 15px; border-radius: 4px; background: #4CAF50; color: white; border: none; cursor: pointer; margin-top: 10px;">Go to Register</button>
                    `;
                    document.body.appendChild(errorOverlay);
        
                    document.getElementById('goToRegister').onclick = () => {
                        const registerUrl = chrome.runtime.getURL('register.html');
                        window.open(registerUrl, '_blank', 'width=600,height=400');
                        errorOverlay.remove();
                    };
                    return;
                } else {
                    alert('Token Counter is now active! Please add text to the input field to see the token count.');
                }
        
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
                    if (!window.tokenCounterActive) {
                        alert("Token Counter is now active! Please add text to the input field to see the token count.");
                        window.tokenCounterActive = true;
                    }
                });
            } catch (error) {
                console.error('Error checking login status:', error);
            }
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
                        .replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/g, '<span style="color: #6a9955;">$1</span>')
                        .replace(/(\b(?:color|background|border|margin|padding|width|height|transform|transition|animation|display|position|flex|grid|box-shadow|text-shadow|font-size|font-family|font-weight)\b)/g, '<span style="color: #569cd6;">$1</span>') // Properties
                        .replace(/([a-zA-Z-]+)(\s*:\s*[^;]*;)/g, '<span style="color: #d69d85;">$1</span>$2');
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
        disablePopupsButton.textContent = '⏹️ Disable Popups';
        disablePopupsButton.style.width = '100%';
        disablePopupsButton.style.height = '50px';
        disablePopupsButton.style.margin = '10px 0';
        disablePopupsButton.style.borderRadius = '8px';
        disablePopupsButton.style.backgroundColor = '#555';
        disablePopupsButton.style.color = 'white';
        disablePopupsButton.style.border = 'none';
        disablePopupsButton.style.cursor = 'pointer';
        disablePopupsButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        disablePopupsButton.style.fontSize = '16px';
        disablePopupsButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        disablePopupsButton.style.fontFamily = 'Arial, sans-serif';
        disablePopupsButton.style.transform = 'scale(1)';
        disablePopupsButton.onclick = () => {
            popup.style.display = 'none';
            alert('Popups have been disabled.');
        };
        overlayContent.appendChild(disablePopupsButton);
        
        const disableUnnecessaryStuffButton = document.createElement('button');
        disableUnnecessaryStuffButton.textContent = 'Disable Unnecessary Stuff';
        disableUnnecessaryStuffButton.style.width = '100%';
        disableUnnecessaryStuffButton.style.height = '50px';
        disableUnnecessaryStuffButton.style.margin = '10px 0';
        disableUnnecessaryStuffButton.style.borderRadius = '8px';
        disableUnnecessaryStuffButton.style.backgroundColor = '#555';
        disableUnnecessaryStuffButton.style.color = 'white';
        disableUnnecessaryStuffButton.style.border = 'none';
        disableUnnecessaryStuffButton.style.cursor = 'pointer';
        disableUnnecessaryStuffButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        disableUnnecessaryStuffButton.style.fontSize = '16px';
        disableUnnecessaryStuffButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        disableUnnecessaryStuffButton.style.fontFamily = 'Arial, sans-serif';
        disableUnnecessaryStuffButton.style.transform = 'scale(1)';
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
        
        const autoGrammarButton = document.createElement('button');
        autoGrammarButton.textContent = 'Auto Grammar Check';
        autoGrammarButton.style.width = '100%';
        autoGrammarButton.style.height = '50px';
        autoGrammarButton.style.margin = '10px 0';
        autoGrammarButton.style.borderRadius = '8px';
        autoGrammarButton.style.backgroundColor = '#555';
        autoGrammarButton.style.color = 'white';
        autoGrammarButton.style.border = 'none';
        autoGrammarButton.style.cursor = 'pointer';
        autoGrammarButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        autoGrammarButton.style.fontSize = '16px';
        autoGrammarButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        autoGrammarButton.style.fontFamily = 'Arial, sans-serif';
        autoGrammarButton.style.transform = 'scale(1)';
        autoGrammarButton.onmouseover = () => {
            autoGrammarButton.style.transform = 'translateY(-3px)';
            autoGrammarButton.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.4)';
            autoGrammarButton.style.backgroundColor = '#22c55e';
        };
        autoGrammarButton.onmouseout = () => {
            autoGrammarButton.style.transform = 'translateY(0)';
            autoGrammarButton.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
            autoGrammarButton.style.backgroundColor = '#555';
        };
        
        const checkGrammar = async (textarea) => {
            const text = textarea.value;
            if (!text) return;
        
            try {
                const response = await fetch('https://grammar-checker-j30b.onrender.com/grammar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text, language })
                });
        
                if (!response.ok) {
                    throw new Error('Grammar check request failed');
                }
        
                const result = await response.json();
                if (result["Corrected Text"] && result["Corrected Text"] !== "") {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = result["Corrected Text"];
                    
                    const errorTexts = Array.from(tempDiv.querySelectorAll('.error-text'))
                        .map(el => el.textContent);
        
                    errorTexts.forEach(errorText => {
                        const startIndex = text.indexOf(errorText);
                        if (startIndex !== -1) {
                            const endIndex = startIndex + errorText.length;
                            const wrapper = document.createElement('span');
                            wrapper.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                            wrapper.style.borderBottom = '2px wavy red';
                            wrapper.textContent = errorText;
                            const before = text.substring(0, startIndex);
                            const after = text.substring(endIndex);
                            textarea.value = before + wrapper.outerHTML + after;
                        }
                    });
        
                    let resultParagraph = textarea.nextElementSibling;
                    if (!resultParagraph || !resultParagraph.classList.contains('grammar-result')) {
                        resultParagraph = document.createElement('p');
                        resultParagraph.classList.add('grammar-result');
                        textarea.parentNode.insertBefore(resultParagraph, textarea.nextSibling);
                    }
        
                    resultParagraph.style.backgroundColor = '#444';
                    resultParagraph.style.color = '#fff';
                    resultParagraph.style.padding = '10px';
                    resultParagraph.style.borderRadius = '5px';
                    resultParagraph.style.marginTop = '5px';
                    resultParagraph.style.fontSize = '14px';
                    resultParagraph.style.display = 'block';
                    resultParagraph.textContent = result["Corrected Text"];
        
                    setTimeout(() => {
                        resultParagraph.remove();
                    }, 5000);
                }
            } catch (error) {
            }
        };
        
        const setupGrammarCheck = () => {
            const textareas = document.querySelectorAll('input[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], input[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id^=":"][aria-describedby^=":"]');
            
            textareas.forEach(textarea => {
                textarea.addEventListener('input', () => {
                    clearTimeout(textarea.grammarTimeout);
                    textarea.grammarTimeout = setTimeout(() => {
                        checkGrammar(textarea);
                    }, 1000);
                });
            });
        };
        
        const grammarObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    setupGrammarCheck();
                }
            });
        });
        
        grammarObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setupGrammarCheck();
        
        autoGrammarButton.onclick = () => {
            const textareas = document.querySelectorAll('input[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], input[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id^=":"][aria-describedby^=":"]');
            textareas.forEach(textarea => {
                checkGrammar(textarea);
            });
            alert('Grammar check initialized for all text areas');
        };
        const logoutButton = document.createElement('button');
        logoutButton.textContent = '⏹️ Logout';
        logoutButton.style.width = '100%';
        logoutButton.style.height = '50px';
        logoutButton.style.margin = '10px 0';
        logoutButton.style.borderRadius = '8px';
        logoutButton.style.backgroundColor = '#555';
        logoutButton.style.color = 'white';
        logoutButton.style.border = 'none';
        logoutButton.style.cursor = 'pointer';
        logoutButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        logoutButton.style.fontSize = '16px';
        logoutButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        logoutButton.style.fontFamily = 'Arial, sans-serif';
        logoutButton.style.transform = 'scale(1)';
        logoutButton.onmouseover = () => {
            logoutButton.style.transform = 'translateY(-3px)';
            logoutButton.style.boxShadow = '0 8px 20px rgba(0, 255, 0, 0.4)';
        };
        logoutButton.onmouseout = () => {
            logoutButton.style.transform = 'translateY(0)';
            logoutButton.style.boxShadow = '0 4px 15px rgba(0, 255, 0, 0.3)';
        };
        
        logoutButton.onclick = () => {
            const alertOverlay = document.createElement('div');
            alertOverlay.style.position = 'fixed';
            alertOverlay.style.top = '0';
            alertOverlay.style.left = '0';
            alertOverlay.style.width = '100%';
            alertOverlay.style.height = '100%';
            alertOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            alertOverlay.style.display = 'flex';
            alertOverlay.style.justifyContent = 'center';
            alertOverlay.style.alignItems = 'center';
            alertOverlay.style.zIndex = '10000';
            alertOverlay.style.opacity = '0';
            alertOverlay.style.transition = 'opacity 0.3s ease-in-out';
        
            const alertBox = document.createElement('div');
            alertBox.style.backgroundColor = '#000';
            alertBox.style.padding = '30px';
            alertBox.style.borderRadius = '15px';
            alertBox.style.border = '2px solid #fff';
            alertBox.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
            alertBox.style.textAlign = 'center';
            alertBox.style.maxWidth = '400px';
            alertBox.style.width = '90%';
            alertBox.classList.add('animate__animated', 'animate__zoomIn');
        
            const alertIcon = document.createElement('div');
            alertIcon.innerHTML = '<i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #fff; margin-bottom: 20px;"></i>';
            alertIcon.classList.add('animate__animated', 'animate__bounceIn');
        
            const alertText = document.createElement('p');
            alertText.textContent = 'ARE YOU SURE YOU WANT TO LOG OUT?';
            alertText.style.fontSize = '20px';
            alertText.style.marginBottom = '25px';
            alertText.style.color = '#fff';
            alertText.style.fontWeight = 'bold';
            alertText.style.lineHeight = '1.4';
            alertText.classList.add('animate__animated', 'animate__fadeInUp');
        
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'center';
            buttonContainer.style.gap = '15px';
            buttonContainer.classList.add('animate__animated', 'animate__fadeInUp');
        
            const yesButton = document.createElement('button');
            yesButton.innerHTML = '<i class="fas fa-check"></i> Yes';
            yesButton.style.padding = '12px 25px';
            yesButton.style.backgroundColor = '#ff0000';
            yesButton.style.color = '#fff';
            yesButton.style.border = '2px solid #fff';
            yesButton.style.borderRadius = '8px';
            yesButton.style.cursor = 'pointer';
            yesButton.style.transition = 'all 0.3s';
            yesButton.style.fontSize = '16px';
            yesButton.style.fontWeight = '600';
            yesButton.onmouseover = () => {
                yesButton.style.backgroundColor = '#fff';
                yesButton.style.color = '#ff0000';
                yesButton.style.transform = 'translateY(-2px)';
            };
            yesButton.onmouseout = () => {
                yesButton.style.backgroundColor = '#ff0000';
                yesButton.style.color = '#fff';
                yesButton.style.transform = 'translateY(0)';
            };
            yesButton.onclick = async () => {
                try {
                    const statusResponse = await fetch(`${BASEURL}/check-login-status`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer SSS155'
                        }
                    });
                    const data = await statusResponse.json();
        
                    if (data.is_login === false) {
                        alert('Please login first');
                        alertOverlay.remove();
                        return;
                    }
        
                    const response = await fetch(`${BASEURL}/logout`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer SSS155'
                        }
                    });
        
                    if (response.ok) {
                        alert('Logged out successfully');
                        alertOverlay.remove();
                    } else {
                        alert('Logout failed');
                    }
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            };
            const noButton = document.createElement('button');
            noButton.innerHTML = '<i class="fas fa-times"></i> No';
            noButton.style.padding = '12px 25px';
            noButton.style.backgroundColor = '#000';
            noButton.style.color = '#fff';
            noButton.style.border = '2px solid #fff';
            noButton.style.borderRadius = '8px';
            noButton.style.cursor = 'pointer';
            noButton.style.transition = 'all 0.3s';
            noButton.style.fontSize = '16px';
            noButton.style.fontWeight = '600';
            noButton.onmouseover = () => {
                noButton.style.backgroundColor = '#fff';
                noButton.style.color = '#000';
                noButton.style.transform = 'translateY(-2px)';
            };
            noButton.onmouseout = () => {
                noButton.style.backgroundColor = '#000';
                noButton.style.color = '#fff';
                noButton.style.transform = 'translateY(0)';
            };
            noButton.onclick = () => {
                alertBox.classList.remove('animate__zoomIn');
                alertBox.classList.add('animate__zoomOut');
                setTimeout(() => document.body.removeChild(alertOverlay), 500);
            };
        
            buttonContainer.appendChild(yesButton);
            buttonContainer.appendChild(noButton);
            alertBox.appendChild(alertIcon);
            alertBox.appendChild(alertText);
            alertBox.appendChild(buttonContainer);
            alertOverlay.appendChild(alertBox);
            document.body.appendChild(alertOverlay);
        
            setTimeout(() => {
                alertOverlay.style.opacity = '1';
            }, 10);
        };
        const loginButton = document.createElement('button');
        loginButton.textContent = '🔑 Login';
        loginButton.style.width = '100%';
        loginButton.style.height = '50px';
        loginButton.style.margin = '10px 0';
        loginButton.style.borderRadius = '8px';
        loginButton.style.backgroundColor = '#555';
        loginButton.style.color = 'white';
        loginButton.style.border = 'none';
        loginButton.style.cursor = 'pointer';
        loginButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        loginButton.style.fontSize = '16px';
        loginButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        loginButton.style.fontFamily = 'Arial, sans-serif';
        loginButton.style.transform = 'scale(1)';
        loginButton.onmouseover = () => {
            loginButton.style.transform = 'translateY(-3px)';
            loginButton.style.boxShadow = '0 8px 20px rgba(29, 161, 242, 0.4)';
        };
        loginButton.onmouseout = () => {
            loginButton.style.transform = 'translateY(0)';
            loginButton.style.boxShadow = '0 4px 15px rgba(29, 161, 242, 0.3)';
        };
        loginButton.onclick = () => {
            const loginUrl = chrome.runtime.getURL('login.html');
            window.open(loginUrl, '_blank', 'width=600,height=400');
        };
        
        const registerButton = document.createElement('button');
        registerButton.textContent = '📝 Register';
        registerButton.style.width = '100%';
        registerButton.style.height = '50px';
        registerButton.style.margin = '10px 0';
        registerButton.style.borderRadius = '8px';
        registerButton.style.backgroundColor = '#555';
        registerButton.style.color = 'white';
        registerButton.style.border = 'none';
        registerButton.style.cursor = 'pointer';
        registerButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        registerButton.style.fontSize = '16px';
        registerButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        registerButton.style.fontFamily = 'Arial, sans-serif';
        registerButton.style.transform = 'scale(1)';
        registerButton.onmouseover = () => {
            registerButton.style.transform = 'translateY(-3px)';
            registerButton.style.boxShadow = '0 8px 20px rgba(233, 30, 99, 0.4)';
        };
        registerButton.onmouseout = () => {
            registerButton.style.transform = 'translateY(0)';
            registerButton.style.boxShadow = '0 4px 15px rgba(233, 30, 99, 0.3)';
        };
        registerButton.onclick = () => {
            const creatingUrl = chrome.runtime.getURL('register.html');
            window.open(creatingUrl, '_blank', 'width=600,height=400');
        };
        
        
        const stopButton = document.createElement('button');
        stopButton.textContent = '⏹️ Stop Purge';
        stopButton.style.width = '100%';
        stopButton.style.height = '50px';
        stopButton.style.margin = '10px 0';
        stopButton.style.borderRadius = '8px';
        stopButton.style.backgroundColor = '#555';
        stopButton.style.color = 'white';
        stopButton.style.border = 'none';
        stopButton.style.cursor = 'pointer';
        stopButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        stopButton.style.fontSize = '16px';
        stopButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        stopButton.style.fontFamily = 'Arial, sans-serif';
        stopButton.style.transform = 'scale(1)';

        stopButton.onmouseover = () => {
            stopButton.style.transform = 'translateY(-3px)';
            stopButton.style.boxShadow = '0 8px 20px rgba(108, 117, 125, 0.4)';
            stopButton.style.backgroundColor = '#5a6268';
        };

        stopButton.onmouseout = () => {
            stopButton.style.transform = 'translateY(0)';
            stopButton.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
            stopButton.style.backgroundColor = '#6c757d';
        };

        stopButton.onclick = () => {
            if (!localStorage.getItem('Purgestop')) {
                localStorage.setItem('Purgestop', 'true');
                stopButton.textContent = '▶️ Unstop Purge';
                stopButton.style.backgroundColor = '#28a745';
            } else {
                localStorage.removeItem('Purgestop');
                stopButton.textContent = '⏹️ Stop Purge';
                stopButton.style.backgroundColor = '#6c757d';
            }
        };

       
        const contributionButton = document.createElement('button');
        contributionButton.textContent = '🌟 Contribution';
        contributionButton.style.width = '100%';
        contributionButton.style.height = '50px';
        contributionButton.style.margin = '10px 0';
        contributionButton.style.borderRadius = '8px';
        contributionButton.style.backgroundColor = '#555';
        contributionButton.style.color = 'white';
        contributionButton.style.border = 'none';
        contributionButton.style.cursor = 'pointer';
        contributionButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        contributionButton.style.fontSize = '16px';
        contributionButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        contributionButton.style.fontFamily = 'Arial, sans-serif';
        contributionButton.style.transform = 'scale(1)';
        contributionButton.style.animation = 'pulse 2s infinite';
        const keyframes = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
        `;
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);

        contributionButton.onmouseenter = () => {
            contributionButton.style.transform = 'scale(1.02)';
            contributionButton.style.backgroundColor = '#9c27b0';
        };

        contributionButton.onmouseleave = () => {
            contributionButton.style.transform = 'scale(1)';
            contributionButton.style.backgroundColor = '#555';
        };
        contributionButton.onclick = () => {
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.backgroundColor = 'rgba(26, 31, 46, 0.95)';
            popup.style.padding = '30px';
            popup.style.borderRadius = '20px';
            popup.style.boxShadow = '0 20px 40px rgba(0,0,0,0.9)';
            popup.style.zIndex = '10000';
            popup.style.width = '90%';
            popup.style.maxWidth = '500px';
            popup.style.color = 'white';
            popup.style.fontFamily = 'Poppins, Arial, sans-serif';
            popup.style.backdropFilter = 'blur(15px)';
            popup.style.border = '2px solid rgba(255,255,255,0.1)';
            popup.className = 'animate__animated animate__fadeIn animate__faster';

            const content = document.createElement('div');
            content.style.marginBottom = '20px';
            content.innerHTML = `
                <div class="animate__animated animate__fadeInUp" style="border: 2px solid rgba(52, 152, 219, 0.4); background: rgba(52, 152, 219, 0.08); border-radius: 15px; margin-bottom: 20px; padding: 20px; box-shadow: 0 10px 20px rgba(52, 152, 219, 0.1); transition: all 0.3s ease; user-select: none;">
                    <h2 style="color: #3498db; margin: 0; font-size: 22px; letter-spacing: 0.8px; font-weight: 600; transform-origin: left; transition: transform 0.3s ease;">Developer</h2>
                    <p style="margin: 15px 0; line-height: 1.6; font-size: 14px; opacity: 0.9; transition: all 0.3s ease;"><strong style="color: #3498db; font-size: 16px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.1)';this.style.textShadow='0 0 10px rgba(52, 152, 219, 0.5)'" onmouseout="this.style.transform='scale(1)';this.style.textShadow='none'">Whitzscott</strong> – The sole developer and maintainer of this project.</p>
                </div>

                <div class="animate__animated animate__fadeInUp animate__delay-1s" style="border: 2px solid rgba(231, 76, 60, 0.4); background: rgba(231, 76, 60, 0.08); border-radius: 15px; margin-bottom: 20px; padding: 20px; box-shadow: 0 10px 20px rgba(231, 76, 60, 0.1); transition: all 0.3s ease; user-select: none;">
                    <h2 style="color: #e74c3c; margin: 0; font-size: 22px; letter-spacing: 0.8px; font-weight: 600; transform-origin: left; transition: transform 0.3s ease;">Beta Testers</h2>
                    <p style="margin: 15px 0; line-height: 1.6; font-size: 14px; opacity: 0.9; transition: all 0.3s ease;"><strong style="color: #e74c3c; font-size: 16px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.1)';this.style.textShadow='0 0 10px rgba(231, 76, 60, 0.5)'" onmouseout="this.style.transform='scale(1)';this.style.textShadow='none'">Ahmad Zaki</strong> – A huge thank you for your invaluable contributions!</p>
                    <p style="margin: 15px 0; line-height: 1.6; font-size: 14px; opacity: 0.9; transition: all 0.3s ease;"><strong style="color: #e74c3c; font-size: 16px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.1)';this.style.textShadow='0 0 10px rgba(231, 76, 60, 0.5)'" onmouseout="this.style.transform='scale(1)';this.style.textShadow='none'">Contracepy</strong> – A friend who offered excellent advice and support.</p>
                    <p style="margin: 15px 0; line-height: 1.6; font-size: 14px; opacity: 0.9; transition: all 0.3s ease;"><strong style="color: #e74c3c; font-size: 16px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.1)';this.style.textShadow='0 0 10px rgba(231, 76, 60, 0.5)'" onmouseout="this.style.transform='scale(1)';this.style.textShadow='none'">You</strong> – Thank you for giving this extension a try! ✨</p>
                </div>
            `;

            const sections = content.querySelectorAll('div[class^="animate__animated"]');
            sections.forEach(section => {
                section.onmouseenter = () => {
                    section.style.transform = 'translateY(-3px) scale(1.01)';
                    section.style.boxShadow = '0 12px 25px rgba(0,0,0,0.2)';
                };
                section.onmouseleave = () => {
                    section.style.transform = 'translateY(0) scale(1)';
                    section.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                };
            });

            const closeButton = document.createElement('button');
            closeButton.textContent = '✕ Close';
            closeButton.style.padding = '12px 25px';
            closeButton.style.backgroundColor = '#e74c3c';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '12px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            closeButton.style.fontSize = '15px';
            closeButton.style.fontWeight = '600';
            closeButton.style.boxShadow = '0 8px 20px rgba(231, 76, 60, 0.5)';
            closeButton.style.display = 'block';
            closeButton.style.margin = '0 auto';
            closeButton.className = 'animate__animated animate__fadeInUp animate__delay-2s';

            closeButton.onmouseenter = () => {
                closeButton.style.backgroundColor = '#c0392b';
                closeButton.style.transform = 'translateY(-2px) scale(1.03)';
                closeButton.style.boxShadow = '0 12px 25px rgba(231, 76, 60, 0.6)';
            };

            closeButton.onmouseleave = () => {
                closeButton.style.backgroundColor = '#e74c3c';
                closeButton.style.transform = 'translateY(0) scale(1)';
                closeButton.style.boxShadow = '0 8px 20px rgba(231, 76, 60, 0.5)';
            };

            closeButton.onclick = () => {
                popup.className = 'animate__animated animate__fadeOut animate__faster';
                setTimeout(() => {
                    document.body.removeChild(popup);
                }, 500);
            };

            popup.onclick = (e) => {
                if (e.target === popup) {
                    popup.className = 'animate__animated animate__fadeOut animate__faster';
                    setTimeout(() => {
                        document.body.removeChild(popup);
                    }, 500);
                }
            };

            popup.appendChild(content);
            popup.appendChild(closeButton);
            document.body.appendChild(popup);
        };


        const extractChatsButton = document.createElement('button');
        extractChatsButton.textContent = 'Extract Chats';
        Object.assign(extractChatsButton.style, {
            width: '100%',
            height: '50px',
            margin: '10px 0',
            borderRadius: '8px',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: '16px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
            fontFamily: 'Arial, sans-serif',
            transform: 'scale(1)'
        });
        
        const container = document.querySelector('.max-w-page.px-page.md\\:px-page-md.mx-auto.w-full.pb-6.pt-8.max-md\\:pt-6.flex.flex-col');
        
        if (container) {
            extractChatsButton.addEventListener('click', extractChats);
        
            function extractChats() {
                const chatContainers = container.querySelectorAll('.flex.flex-row.items-start.gap-4.max-md\\:gap-3.py-2');
                
                if (chatContainers.length > 0) {
                    const parsedSpans = Array.from(chatContainers).map(chatItem => {
                        const spans = new Set();
                        
                        chatItem.querySelectorAll('span').forEach(span => spans.add(span.innerText));
                        chatItem.querySelectorAll('button span').forEach(buttonSpan => spans.add(buttonSpan.innerText));
        
                        return Array.from(spans).join(', ');
                    });
                    
                    const extractedHtml = generateHtml(parsedSpans);
                    downloadHtml(extractedHtml);
                } else {
                    console.error('Chat containers not found');
                }
            }
        
            function generateHtml(parsedSpans) {
                return `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Extracted Chats</title>
                    </head>
                    <body>
                        <h1>Extracted Chats</h1>
                        <div>
                            ${parsedSpans.map(span => `<p>${span}</p>`).join('')}
                        </div>
                    </body>
                    </html>
                `;
            }
        
            function downloadHtml(htmlContent) {
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'extracted_chats.html';
                link.click();
            }
        } else {
            console.error('Container element not found');
        }
        
const extractCharacterButton = document.createElement('button');
extractCharacterButton.textContent = 'Extract Character';
extractCharacterButton.style.width = '100%';
extractCharacterButton.style.height = '50px';
extractCharacterButton.style.margin = '10px 0';
extractCharacterButton.style.borderRadius = '8px';
extractCharacterButton.style.backgroundColor = '#ff4d4d';
extractCharacterButton.style.color = 'white';
extractCharacterButton.style.border = 'none';
extractCharacterButton.style.cursor = 'pointer';
extractCharacterButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
extractCharacterButton.style.fontSize = '16px';
extractCharacterButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
extractCharacterButton.style.fontFamily = 'Arial, sans-serif';
extractCharacterButton.style.transform = 'scale(1)';

document.body.appendChild(extractCharacterButton);

extractCharacterButton.addEventListener('click', () => {
    extractCharacterData();
});

function extractCharacterData() {
    const groupElements = document.querySelectorAll('div.flex.flex-col.space-y-6.pt-6');
    const results = [];
    
    groupElements.forEach(group => {
      const textMutedClass3 = group.querySelectorAll('.text-muted-foreground.line-clamp-3');
      const textMutedClass2 = group.querySelectorAll('.text-muted-foreground.line-clamp-2');
      const textMutedClass5 = group.querySelectorAll('.text-muted-foreground.line-clamp-5');
    
      const groupResult = {
        lineClamp3: [],
        lineClamp2: [],
        lineClamp5: []
      };
    
      const extractElementInfo = (elements) => {
        return Array.from(elements).map(element => {
          return {
            tagName: element.tagName.toLowerCase(),
            textContent: element.textContent.trim()
          };
        });
      };
    
      groupResult.lineClamp3 = extractElementInfo(textMutedClass3);
      groupResult.lineClamp2 = extractElementInfo(textMutedClass2);
      groupResult.lineClamp5 = extractElementInfo(textMutedClass5);
    
      results.push(groupResult);
    });
    
    const jsonContent = JSON.stringify(results, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'data.json';
    downloadLink.style.display = 'none';
    

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
}

let isActive = false;
let intervalId;

const semiTransButton = document.createElement('button');
Object.assign(semiTransButton, {
  textContent: 'Make Buttons Semi-Transparent',
  style: 'width: auto; height: 40px; padding: 10px 20px; background-color: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; transition: background-color 0.3s; margin: 10px 0;'
});

semiTransButton.addEventListener('click', () => {
  isActive = !isActive;
  if (isActive) {
    semiTransButton.textContent = 'Stop Make Buttons Semi-Transparent';
    startInterval();
  } else {
    semiTransButton.textContent = 'Make Buttons Semi-Transparent';
    stopInterval();
  }
});

function startInterval() {
  intervalId = setInterval(() => {
    const targetElement = document.querySelector('.max-w-page.px-page.md\\:px-page-md.mx-auto.w-full.pb-6.pt-8.max-md\\:pt-6.flex.flex-col');
    if (targetElement) {
      const divs = targetElement.querySelectorAll('div.flex.flex-row.items-start.gap-4.max-md\\:gap-3.py-2');
      divs.forEach(div => {
        const buttons = div.querySelectorAll('button');
        buttons.forEach(button => {
          const spans = button.querySelectorAll('span');
          const shouldStyleButton = Array.from(spans).every(span => {
            return !span.classList.contains('italic') && !span.classList.contains('opacity-60') && !span.classList.contains('font-bold');
          });

          if (shouldStyleButton) {
            button.style.opacity = '0.5'; 
            button.style.transition = 'opacity 0.3s';
            spans.forEach(span => {
              span.style.opacity = '1'; 
              span.style.color = 'white'; 
            });
          }
        });
      });
    }
  }, 1000);
}

function stopInterval() {
  clearInterval(intervalId);
}

const textEditorButton = document.createElement('button');
Object.assign(textEditorButton, {
  textContent: '🔄 Text Editor',
  style: 'width: 100%; height: 50px; margin: 10px 0; border-radius: 8px; background-color: #555; color: white; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 16px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5); font-family: Arial, sans-serif; transform: scale(1);'
});

textEditorButton.addEventListener('click', () => {
  createTextEditorOverlay();
});

overlayContent.appendChild(textEditorButton);

function createTextEditorOverlay() {
  const overlay = document.createElement('div');
  Object.assign(overlay, {
    style: 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;'
  });

  const container = document.createElement('div');
  Object.assign(container, {
    style: 'background-color: black; padding: 20px; border-radius: 8px; width: 400px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);'
  });

  const apostropheColorLabel = document.createElement('label');
  apostropheColorLabel.textContent = 'Change Apostrophe Color';
  const apostropheColorInput = document.createElement('input');
  Object.assign(apostropheColorInput, {
    type: 'color',
    style: 'width: 100%; margin: 10px 0;',
    value: localStorage.getItem('apostropheColor') || '#000000'
  });

  const italicsColorLabel = document.createElement('label');
  italicsColorLabel.textContent = 'Change Italic Color';
  const italicsColorInput = document.createElement('input');
  Object.assign(italicsColorInput, {
    type: 'color',
    style: 'width: 100%; margin: 10px 0;',
    value: localStorage.getItem('italicsColor') || '#000000'
  });

  const fontBoldColorLabel = document.createElement('label');
  fontBoldColorLabel.textContent = 'Change Font Bold Color';
  const fontBoldColorInput = document.createElement('input');
  Object.assign(fontBoldColorInput, {
    type: 'color',
    style: 'width: 100%; margin: 10px 0;',
    value: localStorage.getItem('fontBoldColor') || '#000000'
  });

  const markdownLabel = document.createElement('label');
  markdownLabel.textContent = 'Activate Markdown';
  const markdownCheckbox = document.createElement('input');
  Object.assign(markdownCheckbox, {
    type: 'checkbox',
    style: 'margin: 10px 0;',
    checked: JSON.parse(localStorage.getItem('markdownActive')) || false
  });

  const submitButton = document.createElement('button');
  Object.assign(submitButton, {
    textContent: 'Apply Changes',
    style: 'width: 100%; height: 40px; background-color: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; transition: background-color 0.3s; margin: 10px 0;'
  });

  submitButton.addEventListener('click', () => {
    const choices = {
      apostropheColor: apostropheColorInput.value,
      italicsColor: italicsColorInput.value,
      fontBoldColor: fontBoldColorInput.value,
      markdownActive: markdownCheckbox.checked
    };

    saveToLocalStorage(choices);
    applyChanges(choices);
    document.body.removeChild(overlay);
  });

  container.appendChild(apostropheColorLabel);
  container.appendChild(apostropheColorInput);
  container.appendChild(italicsColorLabel);
  container.appendChild(italicsColorInput);
  container.appendChild(fontBoldColorLabel);
  container.appendChild(fontBoldColorInput);
  container.appendChild(markdownLabel);
  container.appendChild(markdownCheckbox);
  container.appendChild(submitButton);

  overlay.appendChild(container);
  document.body.appendChild(overlay);
}

function saveToLocalStorage({ apostropheColor, italicsColor, fontBoldColor, markdownActive }) {
  localStorage.setItem('apostropheColor', apostropheColor);
  localStorage.setItem('italicsColor', italicsColor);
  localStorage.setItem('fontBoldColor', fontBoldColor);
  localStorage.setItem('markdownActive', JSON.stringify(markdownActive));
}

function applyChanges({ apostropheColor, italicsColor, fontBoldColor, markdownActive }) {
  const targetElement = document.querySelector('.max-w-page.px-page.md\\:px-page-md.mx-auto.w-full.pb-6.pt-8.max-md\\:pt-6.flex.flex-col');
  if (targetElement) {
    const divs = targetElement.querySelectorAll('div.flex.flex-row.items-start.gap-4.max-md\\:gap-3.py-2');
    divs.forEach(div => {
      const buttons = div.querySelectorAll('button');
      buttons.forEach(button => {
        const spans = button.querySelectorAll('span');

        spans.forEach(span => {
          if (span.textContent.includes("'")) {
            span.style.color = apostropheColor;
          }
        });

        const shouldStyleButton = Array.from(spans).every(span => {
          return !span.classList.contains('italic') && !span.classList.contains('opacity-60') && !span.classList.contains('font-bold');
        });
        if (shouldStyleButton) {
          spans.forEach(span => {
            if (span.classList.contains('italic')) {
              span.style.color = italicsColor;
            }
          });
        }

        spans.forEach(span => {
          if (span.classList.contains('font-bold')) {
            span.style.color = fontBoldColor;
          }
        });

        if (markdownActive) {
          spans.forEach(span => {
            if (span.textContent.includes('```')) {
              span.style.backgroundColor = 'black';
              span.style.color = 'white';
            }
          });
        }
      });
    });
  }
}

window.addEventListener('load', () => {
  const savedChoices = {
    apostropheColor: localStorage.getItem('apostropheColor') || '#000000',
    italicsColor: localStorage.getItem('italicsColor') || '#000000',
    fontBoldColor: localStorage.getItem('fontBoldColor') || '#000000',
    markdownActive: JSON.parse(localStorage.getItem('markdownActive')) || false
  };
  applyChanges(savedChoices);
});

overlayContent.appendChild(textEditorButton);

        const converterButton = document.createElement('button');
        converterButton.textContent = '🔄 Text Converter';
        converterButton.style.width = '100%';
        converterButton.style.height = '50px';
        converterButton.style.margin = '10px 0';
        converterButton.style.borderRadius = '8px';
        converterButton.style.backgroundColor = '#555';
        converterButton.style.color = 'white';
        converterButton.style.border = 'none';
        converterButton.style.cursor = 'pointer';
        converterButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        converterButton.style.fontSize = '16px';
        converterButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        converterButton.style.fontFamily = 'Arial, sans-serif';
        converterButton.style.transform = 'scale(1)';

        converterButton.onmouseenter = () => {
            converterButton.style.transform = 'scale(1.05)';
            converterButton.style.backgroundColor = '#666';
            converterButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.6)';
        };

        converterButton.onmouseleave = () => {
            converterButton.style.transform = 'scale(1)';
            converterButton.style.backgroundColor = '#555';
            converterButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        };

        converterButton.onclick = () => {
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = '10000';

            const container = document.createElement('div');
            container.style.backgroundColor = '#2c3e50';
            container.style.padding = '30px';
            container.style.borderRadius = '15px';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '15px';
            container.className = 'animate__animated animate__fadeInDown';
            container.classList.add('converter-container');

            const createConverterUI = (title, color) => {
                const converterOverlay = document.createElement('div');
                converterOverlay.style.position = 'fixed';
                converterOverlay.style.top = '0';
                converterOverlay.style.left = '0';
                converterOverlay.style.width = '100%';
                converterOverlay.style.height = '100%';
                converterOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                converterOverlay.style.display = 'flex';
                converterOverlay.style.justifyContent = 'center';
                converterOverlay.style.alignItems = 'center';
                converterOverlay.style.zIndex = '10001';
                converterOverlay.className = 'animate__animated animate__fadeIn';

                const converterContainer = document.createElement('div');
                converterContainer.style.backgroundColor = color;
                converterContainer.style.padding = '40px';
                converterContainer.style.borderRadius = '20px';
                converterContainer.style.minWidth = '600px';
                converterContainer.style.minHeight = '400px';
                converterContainer.className = 'animate__animated animate__zoomIn';
                converterContainer.classList.add('converter-container');

                const titleElement = document.createElement('h2');
                titleElement.textContent = title;
                titleElement.style.color = 'white';
                titleElement.style.textAlign = 'center';
                titleElement.style.marginBottom = '20px';
                titleElement.className = 'animate__animated animate__fadeInDown';

                const closeBtn = document.createElement('button');
                closeBtn.textContent = '✕';
                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '20px';
                closeBtn.style.right = '20px';
                closeBtn.style.backgroundColor = 'transparent';
                closeBtn.style.border = 'none';
                closeBtn.style.color = 'white';
                closeBtn.style.fontSize = '24px';
                closeBtn.style.cursor = 'pointer';
                closeBtn.onclick = () => {
                    converterOverlay.className = 'animate__animated animate__fadeOut';
                    setTimeout(() => {
                        if (converterOverlay.parentNode) {
                            converterOverlay.parentNode.removeChild(converterOverlay);
                        }
                    }, 500);
                };

                converterContainer.appendChild(titleElement);
                converterContainer.appendChild(closeBtn);
                converterOverlay.appendChild(converterContainer);
                return converterOverlay;
            };

            const jsonButton = document.createElement('button');
            jsonButton.textContent = 'Convert to JSON';
            jsonButton.style.padding = '15px 25px';
            jsonButton.style.backgroundColor = '#3498db';
            jsonButton.style.color = 'white';
            jsonButton.style.border = 'none';
            jsonButton.style.borderRadius = '8px';
            jsonButton.style.cursor = 'pointer';
            jsonButton.style.transition = 'all 0.3s ease';

            const wppButton = document.createElement('button');
            wppButton.textContent = 'Convert to W++';
            wppButton.style.padding = '15px 25px';
            wppButton.style.backgroundColor = '#2ecc71';
            wppButton.style.color = 'white';
            wppButton.style.border = 'none';
            wppButton.style.borderRadius = '8px';
            wppButton.style.cursor = 'pointer';
            wppButton.style.transition = 'all 0.3s ease';

            const proseButton = document.createElement('button');
            proseButton.textContent = 'Convert to Prose';
            proseButton.style.padding = '15px 25px';
            proseButton.style.backgroundColor = '#e74c3c';
            proseButton.style.color = 'white';
            proseButton.style.border = 'none';
            proseButton.style.borderRadius = '8px';
            proseButton.style.cursor = 'pointer';
            proseButton.style.transition = 'all 0.3s ease';

            jsonButton.onclick = () => {
                const converterUI = createConverterUI('JSON Converter', '#3498db');
                if (!converterUI) return;
                
                const inputField = document.createElement('textarea');
                inputField.style.width = '100%';
                inputField.style.height = '150px';
                inputField.style.margin = '10px 0';
                inputField.style.padding = '10px';
                inputField.style.borderRadius = '8px';
                inputField.style.border = '1px solid #ccc';
                inputField.placeholder = 'Enter plain text here...';
                inputField.className = 'animate__animated animate__fadeIn animate__faster';

                const outputField = document.createElement('textarea');
                outputField.style.width = '100%';
                outputField.style.height = '150px';
                outputField.style.margin = '10px 0';
                outputField.style.padding = '10px';
                outputField.style.borderRadius = '8px';
                inputField.style.backgroundColor = '#f8f9fa';
                outputField.style.border = '1px solid #ccc';
                outputField.readOnly = true;
                outputField.placeholder = 'JSON output will appear here...';
                outputField.className = 'animate__animated animate__fadeIn animate__faster';

                const convertButton = document.createElement('button');
                convertButton.textContent = 'Convert';
                convertButton.style.padding = '12px 24px';
                convertButton.style.backgroundColor = '#ffffff';
                convertButton.style.color = '#3498db';
                convertButton.style.border = '2px solid #3498db';
                convertButton.style.borderRadius = '8px';
                convertButton.style.cursor = 'pointer';
                convertButton.style.margin = '10px 0';
                convertButton.style.fontWeight = 'bold';
                convertButton.style.transition = 'all 0.3s ease';
                convertButton.className = 'animate__animated animate__fadeIn animate__faster';

                convertButton.onmouseover = () => {
                    convertButton.style.backgroundColor = '#3498db';
                    convertButton.style.color = '#ffffff';
                    convertButton.style.transform = 'scale(1.05)';
                };

                convertButton.onmouseout = () => {
                    convertButton.style.backgroundColor = '#ffffff';
                    convertButton.style.color = '#3498db';
                    convertButton.style.transform = 'scale(1)';
                };

                convertButton.onclick = () => {
                    try {
                        const jsonObject = { text: inputField.value };
                        outputField.value = JSON.stringify(jsonObject, null, 2);
                        outputField.className = 'animate__animated animate__pulse animate__faster';
                        setTimeout(() => {
                            outputField.className = 'animate__animated animate__fadeIn animate__faster';
                        }, 1000);
                    } catch (error) {
                        outputField.value = 'Error converting to JSON';
                    }
                };

                const container = converterUI.querySelector('.converter-container');
                if (container) {
                    container.appendChild(inputField);
                    container.appendChild(convertButton);
                    container.appendChild(outputField);
                }

                document.body.appendChild(converterUI);
            };

            wppButton.onclick = () => {
                const converterUI = createConverterUI('W++ Converter', '#2ecc71');
                if (!converterUI) return;
                
                const inputField = document.createElement('textarea');
                inputField.style.width = '100%';
                inputField.style.height = '150px';
                inputField.style.margin = '10px 0';
                inputField.style.padding = '10px';
                inputField.style.borderRadius = '8px';
                inputField.style.border = '1px solid #ccc';
                inputField.placeholder = 'Enter plain text here...';
                inputField.className = 'animate__animated animate__fadeIn animate__faster';

                const outputField = document.createElement('textarea');
                outputField.style.width = '100%';
                outputField.style.height = '150px';
                outputField.style.margin = '10px 0';
                outputField.style.padding = '10px';
                outputField.style.borderRadius = '8px';
                inputField.style.backgroundColor = '#f8f9fa';
                outputField.style.border = '1px solid #ccc';
                outputField.readOnly = true;
                outputField.placeholder = 'W++ output will appear here...';
                outputField.className = 'animate__animated animate__fadeIn animate__faster';

                const convertButton = document.createElement('button');
                convertButton.textContent = 'Convert';
                convertButton.style.padding = '12px 24px';
                convertButton.style.backgroundColor = '#ffffff';
                convertButton.style.color = '#2ecc71';
                convertButton.style.border = '2px solid #2ecc71';
                convertButton.style.borderRadius = '8px';
                convertButton.style.cursor = 'pointer';
                convertButton.style.margin = '10px 0';
                convertButton.style.fontWeight = 'bold';
                convertButton.style.transition = 'all 0.3s ease';
                convertButton.className = 'animate__animated animate__fadeIn animate__faster';

                convertButton.onmouseover = () => {
                    convertButton.style.backgroundColor = '#2ecc71';
                    convertButton.style.color = '#ffffff';
                    convertButton.style.transform = 'scale(1.05)';
                };

                convertButton.onmouseout = () => {
                    convertButton.style.backgroundColor = '#ffffff';
                    convertButton.style.color = '#2ecc71';
                    convertButton.style.transform = 'scale(1)';
                };

                convertButton.onclick = () => {
                    try {
                        const text = inputField.value;
                        const wppFormat = `Apperance("${text}")\n\nBackstory("${text}")\n\nPersonality("${text}")`;
                        outputField.value = wppFormat;
                        outputField.className = 'animate__animated animate__pulse animate__faster';
                        setTimeout(() => {
                            outputField.className = 'animate__animated animate__fadeIn animate__faster';
                        }, 1000);
                    } catch (error) {
                        outputField.value = 'Error converting to W++';
                    }
                };

                const container = converterUI.querySelector('.converter-container');
                if (container) {
                    container.appendChild(inputField);
                    container.appendChild(convertButton);
                    container.appendChild(outputField);
                }

                document.body.appendChild(converterUI);
            };

            proseButton.onclick = () => {
                const converterUI = createConverterUI('Prose Converter', '#e74c3c');
                if (!converterUI) return;
                
                const inputField = document.createElement('textarea');
                inputField.style.width = '100%';
                inputField.style.height = '150px';
                inputField.style.margin = '10px 0';
                inputField.style.padding = '10px';
                inputField.style.borderRadius = '8px';
                inputField.style.border = '1px solid #ccc';
                inputField.placeholder = 'Enter plain text here...';
                inputField.className = 'animate__animated animate__fadeIn';

                const outputField = document.createElement('textarea');
                outputField.style.width = '100%';
                outputField.style.height = '150px';
                outputField.style.margin = '10px 0';
                outputField.style.padding = '10px';
                outputField.style.borderRadius = '8px';
                outputField.style.border = '1px solid #ccc';
                outputField.readOnly = true;
                outputField.placeholder = 'Prose output will appear here...';
                outputField.className = 'animate__animated animate__fadeIn';

                const convertButton = document.createElement('button');
                convertButton.textContent = 'Convert';
                convertButton.style.padding = '10px 20px';
                convertButton.style.backgroundColor = '#e74c3c';
                convertButton.style.color = 'white';
                convertButton.style.border = 'none';
                convertButton.style.borderRadius = '8px';
                convertButton.style.cursor = 'pointer';
                convertButton.style.margin = '10px 0';
                convertButton.className = 'animate__animated animate__fadeIn';

                const container = converterUI.querySelector('.converter-container');
                if (container) {
                    container.appendChild(inputField);
                    container.appendChild(convertButton);
                    container.appendChild(outputField);
                }

                document.body.appendChild(converterUI);
            };

            [jsonButton, wppButton, proseButton].forEach(button => {
                button.onmouseenter = () => {
                    button.style.transform = 'scale(1.05)';
                    button.style.filter = 'brightness(1.2)';
                };
                button.onmouseleave = () => {
                    button.style.transform = 'scale(1)';
                    button.style.filter = 'brightness(1)';
                };
            });

            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    overlay.className = 'animate__animated animate__fadeOut';
                    setTimeout(() => {
                        if (overlay.parentNode) {
                            overlay.parentNode.removeChild(overlay);
                        }
                    }, 500);
                }
            };

            container.appendChild(jsonButton);
            container.appendChild(wppButton);
            container.appendChild(proseButton);
            overlay.appendChild(container);
            document.body.appendChild(overlay);
        };
        const softMemoryButton = document.createElement('button');
        softMemoryButton.textContent = '🧠 Bot Formatter';
        softMemoryButton.style.width = '100%';
        softMemoryButton.style.height = '50px';
        softMemoryButton.style.margin = '10px 0';
        softMemoryButton.style.borderRadius = '8px';
        softMemoryButton.style.backgroundColor = '#555';
        softMemoryButton.style.color = 'white';
        softMemoryButton.style.border = 'none';
        softMemoryButton.style.cursor = 'pointer';
        softMemoryButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        softMemoryButton.style.fontSize = '16px';
        softMemoryButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        softMemoryButton.style.fontFamily = 'Arial, sans-serif';
        softMemoryButton.style.transform = 'scale(1)';

        softMemoryButton.onmouseenter = () => {
            softMemoryButton.style.transform = 'scale(1.05)';
            softMemoryButton.style.backgroundColor = '#666';
            softMemoryButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.6)';
        };

        softMemoryButton.onmouseleave = () => {
            softMemoryButton.style.transform = 'scale(1)';
            softMemoryButton.style.backgroundColor = '#555';
            softMemoryButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        };
        softMemoryButton.onclick = () => {
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
            overlay.style.backdropFilter = 'blur(8px)';
            overlay.style.zIndex = '9999';
            overlay.className = 'animate__animated animate__fadeIn';

            const chatUI = document.createElement('div');
            chatUI.className = 'animate__animated animate__fadeIn';
            chatUI.style.position = 'fixed';
            chatUI.style.top = '50%';
            chatUI.style.left = '50%';
            chatUI.style.transform = 'translate(-50%, -50%)';
            chatUI.style.backgroundColor = '#0f1218';
            chatUI.style.padding = '25px';
            chatUI.style.borderRadius = '24px';
            chatUI.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.5)';
            chatUI.style.width = '95%';
            chatUI.style.maxWidth = '450px';
            chatUI.style.height = '85vh';
            chatUI.style.maxHeight = '700px';
            chatUI.style.display = 'flex';
            chatUI.style.flexDirection = 'column';
            chatUI.style.zIndex = '10000';
            chatUI.style.backdropFilter = 'blur(15px)';
            chatUI.style.border = '1px solid rgba(255, 255, 255, 0.15)';

            const chatHeader = document.createElement('div');
            chatHeader.style.marginBottom = '20px';
            chatHeader.style.textAlign = 'center';
            chatHeader.style.position = 'relative';
            
            const chatTitle = document.createElement('h2');
            chatTitle.innerHTML = '<i class="fas fa-brain"></i>  Bot Formatter';
            chatTitle.style.color = '#fff';
            chatTitle.style.fontSize = '24px';
            chatTitle.style.margin = '0';
            chatTitle.style.fontWeight = '700';
            chatTitle.style.letterSpacing = '0.8px';
            chatTitle.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
            chatHeader.appendChild(chatTitle);

            const chatMessages = document.createElement('div');
            chatMessages.className = 'animate__animated animate__fadeIn';
            chatMessages.style.flex = '1';
            chatMessages.style.overflowY = 'auto';
            chatMessages.style.marginBottom = '20px';
            chatMessages.style.padding = '20px';
            chatMessages.style.backgroundColor = 'rgba(30, 41, 59, 0.6)';
            chatMessages.style.borderRadius = '18px';
            chatMessages.style.scrollBehavior = 'smooth';
            chatMessages.style.boxShadow = 'inset 0 2px 15px rgba(0,0,0,0.2)';

            const inputContainer = document.createElement('div');
            inputContainer.className = 'animate__animated animate__fadeInUp';
            inputContainer.style.display = 'flex';
            inputContainer.style.gap = '12px';
            inputContainer.style.marginTop = 'auto';
            inputContainer.style.position = 'relative';

            const input = document.createElement('input');
            input.style.flex = '1';
            input.style.padding = '15px 20px';
            input.style.borderRadius = '15px';
            input.style.border = '2px solid rgba(155, 89, 182, 0.4)';
            input.style.backgroundColor = 'rgba(30, 41, 59, 0.6)';
            input.style.color = 'white';
            input.style.fontSize = '15px';
            input.style.transition = 'all 0.3s ease';
            input.style.backdropFilter = 'blur(8px)';
            input.placeholder = 'Type your message...';

            input.onfocus = () => {
                input.style.border = '2px solid rgba(155, 89, 182, 0.9)';
                input.style.boxShadow = '0 0 25px rgba(155, 89, 182, 0.3)';
            };

            input.onblur = () => {
                input.style.border = '2px solid rgba(155, 89, 182, 0.4)';
                input.style.boxShadow = 'none';
            };

            const sendButton = document.createElement('button');
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendButton.style.padding = '15px 20px';
            sendButton.style.backgroundColor = '#9b59b6';
            sendButton.style.color = 'white';
            sendButton.style.border = 'none';
            sendButton.style.borderRadius = '15px';
            sendButton.style.cursor = 'pointer';
            sendButton.style.transition = 'all 0.3s ease';
            sendButton.style.display = 'flex';
            sendButton.style.alignItems = 'center';
            sendButton.style.justifyContent = 'center';

            sendButton.onmouseenter = () => {
                sendButton.style.transform = 'scale(1.05) translateY(-2px)';
                sendButton.style.backgroundColor = '#8e44ad';
                sendButton.style.boxShadow = '0 8px 20px rgba(155, 89, 182, 0.5)';
            };

            sendButton.onmouseleave = () => {
                sendButton.style.transform = 'scale(1) translateY(0)';
                sendButton.style.backgroundColor = '#9b59b6';
                sendButton.style.boxShadow = 'none';
            };

            const closeButton = document.createElement('button');
            closeButton.innerHTML = '<i class="fas fa-times"></i>';
            closeButton.style.position = 'absolute';
            closeButton.style.right = '15px';
            closeButton.style.top = '15px';
            closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            closeButton.style.border = 'none';
            closeButton.style.color = 'white';
            closeButton.style.width = '36px';
            closeButton.style.height = '36px';
            closeButton.style.borderRadius = '12px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.transition = 'all 0.3s ease';
            closeButton.style.display = 'flex';
            closeButton.style.alignItems = 'center';
            closeButton.style.justifyContent = 'center';

            closeButton.onmouseenter = () => {
                closeButton.style.transform = 'scale(1.1)';
                closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            };

            closeButton.onmouseleave = () => {
                closeButton.style.transform = 'scale(1)';
                closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            };

            const createContextMenu = (x, y, options) => {
                const menu = document.createElement('div');
                menu.className = 'animate__animated animate__fadeIn animate__faster';
                menu.style.position = 'fixed';
                menu.style.left = `${x}px`;
                menu.style.top = `${y}px`;
                menu.style.backgroundColor = '#1a1f2e';
                menu.style.borderRadius = '16px';
                menu.style.padding = '12px';
                menu.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
                menu.style.zIndex = '10001';
                menu.style.minWidth = '200px';
                menu.style.backdropFilter = 'blur(20px)';
                menu.style.border = '2px solid rgba(255, 255, 255, 0.1)';
                menu.style.transform = 'scale(0.98)';
                menu.style.opacity = '0';
                menu.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                
                setTimeout(() => {
                    menu.style.transform = 'scale(1)';
                    menu.style.opacity = '1';
                }, 50);

                options.forEach((option, index) => {
                    const button = document.createElement('button');
                    button.innerHTML = `<i class="${option.icon}"></i> ${option.label}`;
                    button.className = 'animate__animated animate__fadeInRight';
                    button.style.display = 'flex';
                    button.style.alignItems = 'center';
                    button.style.gap = '12px';
                    button.style.width = '100%';
                    button.style.padding = '12px 18px';
                    button.style.margin = '4px 0';
                    button.style.border = 'none';
                    button.style.borderRadius = '12px';
                    button.style.backgroundColor = 'rgba(255,255,255,0.95)';
                    button.style.color = '#1a1f2e';
                    button.style.cursor = 'pointer';
                    button.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    button.style.textAlign = 'left';
                    button.style.fontSize = '14px';
                    button.style.fontWeight = '500';
                    button.style.letterSpacing = '0.3px';
                    button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    button.style.animationDelay = `${index * 0.1}s`;
                    button.style.transform = 'translateX(0)';
                    
                    button.onclick = () => {
                        menu.style.transform = 'scale(0.95)';
                        menu.style.opacity = '0';
                        setTimeout(() => {
                            if (menu.parentNode) {
                                menu.parentNode.removeChild(menu);
                            }
                            option.action();
                        }, 200);
                    };

                    button.onmouseenter = () => {
                        button.style.backgroundColor = '#ffffff';
                        button.style.transform = 'translateX(10px)';
                        button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    };

                    button.onmouseleave = () => {
                        button.style.backgroundColor = 'rgba(255,255,255,0.95)';
                        button.style.transform = 'translateX(0)';
                        button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    };

                    menu.appendChild(button);
                });

                document.body.appendChild(menu);

                const closeMenu = (e) => {
                    if (!menu.contains(e.target)) {
                        menu.style.transform = 'scale(0.95)';
                        menu.style.opacity = '0';
                        setTimeout(() => {
                            if (menu.parentNode) {
                                document.body.removeChild(menu);
                            }
                        }, 200);
                        document.removeEventListener('click', closeMenu);
                    }
                };

                setTimeout(() => {
                    document.addEventListener('click', closeMenu);
                }, 0);

                return menu;
            };

            const createTypingIndicator = () => {
                const indicator = document.createElement('div');
                indicator.className = 'animate__animated animate__fadeIn';
                indicator.style.padding = '15px';
                indicator.style.color = '#fff';
                indicator.style.display = 'flex';
                indicator.style.gap = '6px';
                indicator.style.alignItems = 'center';
                indicator.style.backgroundColor = 'rgba(46, 204, 113, 0.2)';
                indicator.style.borderRadius = '12px';
                indicator.style.width = 'fit-content';
                
                const dots = Array(3).fill(0).map(() => {
                    const dot = document.createElement('div');
                    dot.style.width = '8px';
                    dot.style.height = '8px';
                    dot.style.backgroundColor = '#2ecc71';
                    dot.style.borderRadius = '50%';
                    dot.style.opacity = '0.6';
                    dot.style.animation = 'pulse 1s infinite';
                    return dot;
                });
                
                const keyframes = `
                    @keyframes pulse {
                        0%, 100% { transform: scale(0.8); opacity: 0.6; }
                        50% { transform: scale(1.2); opacity: 1; }
                    }
                `;
                const style = document.createElement('style');
                style.textContent = keyframes;
                document.head.appendChild(style);
                
                dots.forEach((dot, i) => {
                    dot.style.animationDelay = `${i * 0.15}s`;
                    indicator.appendChild(dot);
                });

                return indicator;
            };

            const addMessage = (text, isUser = false) => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `animate__animated animate__fadeInUp ${isUser ? 'user' : ''}`;
                messageDiv.style.marginBottom = '15px';
                messageDiv.style.padding = '15px 20px';
                messageDiv.style.borderRadius = isUser ? '18px 18px 0 18px' : '18px 18px 18px 0';
                messageDiv.style.maxWidth = '75%';
                messageDiv.style.wordWrap = 'break-word';
                messageDiv.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
                messageDiv.style.backgroundColor = isUser ? '#9b59b6' : '#2ecc71';
                messageDiv.style.color = 'white';
                messageDiv.style.boxShadow = isUser ? '0 3px 10px rgba(155, 89, 182, 0.3)' : '0 3px 10px rgba(46, 204, 113, 0.3)';
                messageDiv.style.fontSize = '15px';
                messageDiv.style.lineHeight = '1.6';
                messageDiv.style.transition = 'all 0.3s ease';
                messageDiv.style.marginLeft = isUser ? 'auto' : '0';
                messageDiv.style.marginRight = isUser ? '0' : 'auto';
                messageDiv.style.position = 'relative';
                messageDiv.textContent = text;

                messageDiv.onmouseenter = () => {
                    messageDiv.style.transform = 'translateY(-2px) scale(1.01)';
                    messageDiv.style.boxShadow = isUser ? '0 5px 15px rgba(155, 89, 182, 0.4)' : '0 5px 15px rgba(46, 204, 113, 0.4)';
                };

                messageDiv.onmouseleave = () => {
                    messageDiv.style.transform = 'translateY(0) scale(1)';
                    messageDiv.style.boxShadow = isUser ? '0 3px 10px rgba(155, 89, 182, 0.3)' : '0 3px 10px rgba(46, 204, 113, 0.3)';
                };

                let contextMenuTimer;
                messageDiv.oncontextmenu = (e) => {
                    e.preventDefault();
                    const options = [
                        {
                            label: 'Copy',
                            icon: 'fas fa-copy',
                            action: () => navigator.clipboard.writeText(text)
                        },
                        {
                            label: 'Delete',
                            icon: 'fas fa-trash-alt',
                            action: () => {
                                messageDiv.className = 'animate__animated animate__fadeOut';
                                setTimeout(() => chatMessages.removeChild(messageDiv), 500);
                                const savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
                                const updatedMessages = savedMessages.filter(msg => msg.text !== text);
                                localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
                            }
                        }
                    ];

                    if (!isUser) {
                        options.push(
                            {
                                label: 'Regenerate',
                                icon: 'fas fa-redo',
                                action: () => {
                                    messageDiv.className = 'animate__animated animate__fadeOut';
                                    setTimeout(async () => {
                                        chatMessages.removeChild(messageDiv);
                                        const typingIndicator = createTypingIndicator();
                                        chatMessages.appendChild(typingIndicator);
                                        const response = await fetch('https://own-seree-icgr.onrender.com/api/chat', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                message: input.value
                                            })
                                        });
                                        const data = await response.json();
                                        chatMessages.removeChild(typingIndicator);
                                        addMessage(data.response, false);
                                    }, 500);
                                }
                            },
                            {
                                label: 'Speak',
                                icon: 'fas fa-volume-up', 
                                action: () => {
                                    const utterance = new SpeechSynthesisUtterance(text);
                                    const voices = speechSynthesis.getVoices();
                                    const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
                                    if (englishVoice) {
                                        utterance.voice = englishVoice;
                                    }
                                    speechSynthesis.speak(utterance);
                                }
                            },
                            {
                                label: 'Switch Mode',
                                icon: 'fas fa-exchange-alt',
                                action: () => {
                                    const currentMode = localStorage.getItem('chatMode') || 'none';
                                    const newMode = currentMode === 'none' ? 'character_creation' : 'none';
                                    localStorage.setItem('chatMode', newMode);
                                    const messages = Array.from(chatMessages.children);
                                    messages.forEach(msg => {
                                        msg.className = 'animate__animated animate__fadeOut';
                                        setTimeout(() => chatMessages.removeChild(msg), 500);
                                    });
                                    localStorage.setItem('chatMessages', '[]');
                                }
                            }
                        );
                    }

                    createContextMenu(e.clientX, e.clientY, options);
                };

                messageDiv.onmousedown = (e) => {
                    if (e.button === 0) {
                        contextMenuTimer = setTimeout(() => {
                            messageDiv.oncontextmenu(e);
                        }, 500);
                    }
                };

                messageDiv.onmouseup = () => {
                    clearTimeout(contextMenuTimer);
                };

                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            };

            let isGenerating = false;

            sendButton.onclick = async () => {
                if (!input.value.trim()) return;
                if (isGenerating) {
                    alert('Please wait while the bot is generating a response...');
                    return;
                }

                const today = new Date().toLocaleDateString();
                const messageCount = parseInt(localStorage.getItem(`messageCount_${today}`) || '0');

                if (messageCount >= 150) {
                    alert('You have exceeded your daily message limit of 150 messages. Please try again tomorrow.');
                    return;
                }

                isGenerating = true;
                const userMessage = input.value;
                addMessage(userMessage, true);
                input.value = '';

                const typingIndicator = createTypingIndicator();
                chatMessages.appendChild(typingIndicator);

                try {
                    const response = await fetch(`${BASEURL}/api/generate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer SSS155'
                        },
                        body: JSON.stringify({
                            prompt: userMessage,
                            options: {
                                mode: localStorage.getItem('chatMode') || 'none'
                            }
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    if (data.response && data.response.result && data.response.result.response) {
                        chatMessages.removeChild(typingIndicator);
                        addMessage(data.response.result.response);
                        localStorage.setItem(`messageCount_${today}`, messageCount + 1);
                    } else {
                        throw new Error('Invalid response format from server');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    chatMessages.removeChild(typingIndicator);
                    addMessage(`Error: ${error.message}`);
                } finally {
                    isGenerating = false;
                }
            };

            input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    if (isGenerating) {
                        alert('Please wait while the bot is generating a response...');
                        return;
                    }
                    sendButton.onclick();
                }
            };

            closeButton.onclick = () => {
                chatUI.className = 'animate__animated animate__fadeOut';
                setTimeout(() => {
                    document.body.removeChild(chatUI);
                }, 500);
            };

            inputContainer.appendChild(input);
            inputContainer.appendChild(sendButton);
            chatUI.appendChild(chatHeader);
            chatUI.appendChild(closeButton);
            chatUI.appendChild(chatMessages);
            chatUI.appendChild(inputContainer);
            document.body.appendChild(chatUI);

            input.focus();
        };
        
        const bugReportButton = document.createElement('button');
        bugReportButton.textContent = '🐛 Report Bug';
        bugReportButton.style.width = '100%';
        bugReportButton.style.height = '50px';
        bugReportButton.style.margin = '10px 0';
        bugReportButton.style.borderRadius = '8px';
        bugReportButton.style.backgroundColor = '#555';
        bugReportButton.style.color = 'white';
        bugReportButton.style.border = 'none';
        bugReportButton.style.cursor = 'pointer';
        bugReportButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        bugReportButton.style.fontSize = '16px';
        bugReportButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        bugReportButton.style.fontFamily = 'Arial, sans-serif';
        bugReportButton.style.transform = 'scale(1)';

        bugReportButton.onmouseenter = () => {
            bugReportButton.style.transform = 'scale(1.05)';
            bugReportButton.style.backgroundColor = '#666';
            bugReportButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.6)';
        };

        bugReportButton.onmouseleave = () => {
            bugReportButton.style.transform = 'scale(1)';
            bugReportButton.style.backgroundColor = '#555';
            bugReportButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        };

        bugReportButton.onclick = () => {
            const bugReportUI = document.createElement('div');
            bugReportUI.className = 'animate__animated animate__fadeIn';
            bugReportUI.style.position = 'fixed';
            bugReportUI.style.top = '50%';
            bugReportUI.style.left = '50%';
            bugReportUI.style.transform = 'translate(-50%, -50%)';
            bugReportUI.style.backgroundColor = '#1a1f2e';
            bugReportUI.style.padding = '20px';
            bugReportUI.style.borderRadius = '20px';
            bugReportUI.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.3)';
            bugReportUI.style.width = '85%';
            bugReportUI.style.maxWidth = '400px';
            bugReportUI.style.zIndex = '10000';
            bugReportUI.style.backdropFilter = 'blur(10px)';
            bugReportUI.style.border = '1px solid rgba(255, 255, 255, 0.1)';

            const title = document.createElement('h2');
            title.textContent = '🐛 Report a Bug';
            title.style.color = '#fff';
            title.style.marginBottom = '15px';
            title.style.fontSize = '20px';
            title.style.textAlign = 'center';

            const input = document.createElement('textarea');
            input.style.width = '100%';
            input.style.height = '150px';
            input.style.padding = '12px';
            input.style.marginBottom = '15px';
            input.style.borderRadius = '12px';
            input.style.border = '2px solid rgba(255, 255, 255, 0.1)';
            input.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            input.style.color = 'white';
            input.style.fontSize = '14px';
            input.style.resize = 'none';
            input.placeholder = 'Please describe the bug in detail...';

            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';
            buttonContainer.style.justifyContent = 'flex-end';

            const sendButton = document.createElement('button');
            sendButton.textContent = 'Send Report';
            sendButton.style.padding = '10px 20px';
            sendButton.style.borderRadius = '10px';
            sendButton.style.border = 'none';
            sendButton.style.backgroundColor = '#4CAF50';
            sendButton.style.color = 'white';
            sendButton.style.cursor = 'pointer';
            sendButton.style.fontSize = '14px';
            sendButton.style.transition = 'all 0.3s ease';

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Cancel';
            closeButton.style.padding = '10px 20px';
            closeButton.style.borderRadius = '10px';
            closeButton.style.border = 'none';
            closeButton.style.backgroundColor = '#ff4444';
            closeButton.style.color = 'white';
            closeButton.style.cursor = 'pointer';
            closeButton.style.fontSize = '14px';
            closeButton.style.transition = 'all 0.3s ease';

            sendButton.onclick = async () => {
                if (input.value.trim()) {
                    try {
                        const response = await fetch(`${BASEURL}/api/send/bugrepot`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer SSS155'
                            },
                            body: JSON.stringify({ report: input.value })
                        });

                        if (response.ok) {
                            bugReportUI.className = 'animate__animated animate__fadeOut';
                            setTimeout(() => {
                                document.body.removeChild(bugReportUI);
                            }, 500);
                        }
                    } catch (error) {
                        alert('Failed to send bug report. Please try again.');
                    }
                }
            };

            closeButton.onclick = () => {
                bugReportUI.className = 'animate__animated animate__fadeOut';
                setTimeout(() => {
                    document.body.removeChild(bugReportUI);
                }, 500);
            };

            buttonContainer.appendChild(closeButton);
            buttonContainer.appendChild(sendButton);
            bugReportUI.appendChild(title);
            bugReportUI.appendChild(input);
            bugReportUI.appendChild(buttonContainer);
            document.body.appendChild(bugReportUI);

            input.focus();
        };
        const feedbackButton = document.createElement('button');
        feedbackButton.textContent = '📝 Send Feedback';
        feedbackButton.style.width = '100%';
        feedbackButton.style.height = '50px';
        feedbackButton.style.margin = '10px 0';
        feedbackButton.style.borderRadius = '8px';
        feedbackButton.style.backgroundColor = '#555';
        feedbackButton.style.color = 'white';
        feedbackButton.style.border = 'none';
        feedbackButton.style.cursor = 'pointer';
        feedbackButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        feedbackButton.style.fontSize = '16px';
        feedbackButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        feedbackButton.style.fontFamily = 'Arial, sans-serif';
        feedbackButton.style.transform = 'scale(1)';

        feedbackButton.onmouseenter = () => {
            feedbackButton.style.transform = 'scale(1.02)';
            feedbackButton.style.backgroundColor = '#666';
        };

        feedbackButton.onmouseleave = () => {
            feedbackButton.style.transform = 'scale(1)';
            feedbackButton.style.backgroundColor = '#555';
        };

        feedbackButton.onclick = () => {
            const feedbackUI = document.createElement('div');
            feedbackUI.style.position = 'fixed';
            feedbackUI.style.top = '50%';
            feedbackUI.style.left = '50%';
            feedbackUI.style.transform = 'translate(-50%, -50%)';
            feedbackUI.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            feedbackUI.style.padding = '20px';
            feedbackUI.style.borderRadius = '20px';
            feedbackUI.style.zIndex = '10000';
            feedbackUI.style.display = 'flex';
            feedbackUI.style.flexDirection = 'column';
            feedbackUI.style.gap = '15px';
            feedbackUI.style.width = '90%';
            feedbackUI.style.maxWidth = '350px';
            feedbackUI.className = 'animate__animated animate__fadeIn';

            const title = document.createElement('h2');
            title.textContent = 'Send Your Feedback';
            title.style.color = 'white';
            title.style.margin = '0';
            title.style.textAlign = 'center';
            title.style.fontSize = '20px';

            const input = document.createElement('textarea');
            input.style.width = '100%';
            input.style.height = '120px';
            input.style.padding = '12px';
            input.style.borderRadius = '10px';
            input.style.border = '2px solid #444';
            input.style.backgroundColor = '#333';
            input.style.color = 'white';
            input.style.resize = 'none';
            input.style.fontSize = '14px';
            input.placeholder = 'Type your feedback here...';

            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '8px';
            buttonContainer.style.justifyContent = 'flex-end';

            const sendButton = document.createElement('button');
            sendButton.textContent = 'Send';
            sendButton.style.padding = '10px 20px';
            sendButton.style.borderRadius = '10px';
            sendButton.style.border = 'none';
            sendButton.style.backgroundColor = '#4CAF50';
            sendButton.style.color = 'white';
            sendButton.style.cursor = 'pointer';
            sendButton.style.fontSize = '14px';
            sendButton.style.transition = 'all 0.3s ease';

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Cancel';
            closeButton.style.padding = '10px 20px';
            closeButton.style.borderRadius = '10px';
            closeButton.style.border = 'none';
            closeButton.style.backgroundColor = '#ff4444';
            closeButton.style.color = 'white';
            closeButton.style.cursor = 'pointer';
            closeButton.style.fontSize = '14px';
            closeButton.style.transition = 'all 0.3s ease';

            sendButton.onclick = async () => {
                if (input.value.trim()) {
                    try {
                        const response = await fetch(`${BASEURL}/api/send/feedback`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer SSS155'
                            },
                            body: JSON.stringify({ feedback: input.value })
                        });

                        if (response.ok) {
                            feedbackUI.className = 'animate__animated animate__fadeOut';
                            setTimeout(() => {
                                document.body.removeChild(feedbackUI);
                            }, 500);
                        }
                    } catch (error) {
                        alert('Failed to send feedback. Please try again.');
                    }
                }
            };

            closeButton.onclick = () => {
                feedbackUI.className = 'animate__animated animate__fadeOut';
                setTimeout(() => {
                    document.body.removeChild(feedbackUI);
                }, 500);
            };

            buttonContainer.appendChild(closeButton);
            buttonContainer.appendChild(sendButton);
            feedbackUI.appendChild(title);
            feedbackUI.appendChild(input);
            feedbackUI.appendChild(buttonContainer);
            document.body.appendChild(feedbackUI);

            input.focus();
        };

        const clearStorageButton = document.createElement('button');
        clearStorageButton.textContent = '🗑️ Clear All Data';
        clearStorageButton.style.width = '100%';
        clearStorageButton.style.height = '50px';
        clearStorageButton.style.margin = '10px 0';
        clearStorageButton.style.borderRadius = '8px';
        clearStorageButton.style.backgroundColor = '#d32f2f';
        clearStorageButton.style.color = 'white';
        clearStorageButton.style.border = 'none';
        clearStorageButton.style.cursor = 'pointer';
        clearStorageButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        clearStorageButton.style.fontSize = '16px';
        clearStorageButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        clearStorageButton.style.fontFamily = 'Arial, sans-serif';
        clearStorageButton.style.transform = 'scale(1)';

        clearStorageButton.onmouseenter = () => {
            clearStorageButton.style.transform = 'scale(1.05)';
            clearStorageButton.style.backgroundColor = '#e33371';
            clearStorageButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.6)';
        };

        clearStorageButton.onmouseleave = () => {
            clearStorageButton.style.transform = 'scale(1)';
            clearStorageButton.style.backgroundColor = '#d32f2f';
            clearStorageButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        };

        clearStorageButton.onclick = () => {
            if (confirm('Warning: This will delete all saved data including chat history and prompts. This action cannot be undone. Are you sure you want to continue?')) {
                localStorage.clear();
                alert('All data has been cleared successfully.');
                location.reload();
            }
        };

        const donateMe = document.createElement('a');
        Object.assign(donateMe, {
          href: 'https://ko-fi.com/Z8Z419CSXF',
          target: '_blank',
          textContent: 'Donate Me',
          style: 'width: 100%; height: 50px; margin: 10px 0; border-radius: 8px; background-color: #2196F3; color: white; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 16px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5); font-family: Arial, sans-serif; transform: scale(1); display: flex; align-items: center; justify-content: center; text-decoration: none;'
        });
        
        donateMe.addEventListener('mouseenter', () => {
          donateMe.style.transform = 'scale(1.1)';
        });
        
        donateMe.addEventListener('mouseleave', () => {
          donateMe.style.transform = 'scale(1)';
        });
    
        


        const contactButton = document.createElement('button');
        contactButton.textContent = '📧 Contact Us';
        contactButton.style.width = '100%';
        contactButton.style.height = '50px';
        contactButton.style.margin = '10px 0';
        contactButton.style.borderRadius = '8px';
        contactButton.style.backgroundColor = '#9C27B0';
        contactButton.style.color = 'white';
        contactButton.style.border = 'none';
        contactButton.style.cursor = 'pointer';
        contactButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        contactButton.style.fontSize = '16px';
        contactButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        contactButton.style.fontFamily = 'Arial, sans-serif';
        contactButton.style.transform = 'scale(1)';

        contactButton.onmouseenter = () => {
            contactButton.style.transform = 'scale(1.05)';
            contactButton.style.backgroundColor = '#7B1FA2';
            contactButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.6)';
        };

        contactButton.onmouseleave = () => {
            contactButton.style.transform = 'scale(1)';
            contactButton.style.backgroundColor = '#9C27B0';
            contactButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        };

        contactButton.onclick = () => {
            window.location.href = 'mailto:whitzscott@gmail.com';
        };

        const searchButton = document.createElement('button');
        searchButton.textContent = '🔍 Search User';
        searchButton.style.width = '100%';
        searchButton.style.height = '50px';
        searchButton.style.margin = '10px 0';
        searchButton.style.borderRadius = '8px';
        searchButton.style.backgroundColor = '#FF5722';
        searchButton.style.color = 'white';
        searchButton.style.border = 'none';
        searchButton.style.cursor = 'pointer';
        searchButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        searchButton.style.fontSize = '16px';
        searchButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        searchButton.style.fontFamily = 'Arial, sans-serif';
        searchButton.style.transform = 'scale(1)';

        searchButton.onmouseenter = () => {
            searchButton.style.transform = 'scale(1.05)';
            searchButton.style.backgroundColor = '#E64A19';
            searchButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.6)';
        };

        searchButton.onmouseleave = () => {
            searchButton.style.transform = 'scale(1)';
            searchButton.style.backgroundColor = '#FF5722';
            searchButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        };

        searchButton.onclick = () => {
            const searchOverlay = document.createElement('div');
            searchOverlay.style.position = 'fixed';
            searchOverlay.style.top = '0';
            searchOverlay.style.left = '0';
            searchOverlay.style.width = '100%';
            searchOverlay.style.height = '100%';
            searchOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            searchOverlay.style.display = 'flex';
            searchOverlay.style.justifyContent = 'center';
            searchOverlay.style.alignItems = 'center';
            searchOverlay.style.zIndex = '10000';
            searchOverlay.style.opacity = '0';
            searchOverlay.style.transition = 'opacity 0.3s ease-in-out';
            
            setTimeout(() => {
                searchOverlay.style.opacity = '1';
            }, 10);

            const searchContainer = document.createElement('div');
            searchContainer.style.backgroundColor = '#1a1a1a';
            searchContainer.style.padding = '30px';
            searchContainer.style.borderRadius = '15px';
            searchContainer.style.width = '350px';
            searchContainer.style.position = 'relative';
            searchContainer.style.transform = 'scale(0.9)';
            searchContainer.style.opacity = '0';
            searchContainer.style.transition = 'all 0.3s ease-in-out';
            searchContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.5)';

            setTimeout(() => {
                searchContainer.style.transform = 'scale(1)';
                searchContainer.style.opacity = '1';
            }, 100);

            const closeButton = document.createElement('button');
            closeButton.innerHTML = '<i class="fas fa-times"></i>';
            closeButton.style.position = 'absolute';
            closeButton.style.right = '15px';
            closeButton.style.top = '15px';
            closeButton.style.border = 'none';
            closeButton.style.background = 'none';
            closeButton.style.color = '#fff';
            closeButton.style.fontSize = '20px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.transition = 'transform 0.2s ease';
            closeButton.onmouseenter = () => closeButton.style.transform = 'scale(1.1)';
            closeButton.onmouseleave = () => closeButton.style.transform = 'scale(1)';
            closeButton.onclick = () => {
                searchOverlay.style.opacity = '0';
                setTimeout(() => searchOverlay.remove(), 300);
            };

            const textarea = document.createElement('textarea');
            textarea.style.width = '100%';
            textarea.style.height = '100px';
            textarea.style.marginBottom = '15px';
            textarea.style.padding = '15px';
            textarea.style.borderRadius = '10px';
            textarea.style.border = '2px solid #333';
            textarea.style.backgroundColor = '#2a2a2a';
            textarea.style.color = '#fff';
            textarea.style.fontSize = '16px';
            textarea.style.resize = 'none';
            textarea.placeholder = 'Enter username to search...';
            textarea.style.transition = 'border-color 0.3s ease';
            textarea.onfocus = () => textarea.style.borderColor = '#FF5722';
            textarea.onblur = () => textarea.style.borderColor = '#333';

            const searchIconButton = document.createElement('button');
            searchIconButton.innerHTML = '<i class="fas fa-search"></i> Search User';
            searchIconButton.style.width = '100%';
            searchIconButton.style.padding = '15px';
            searchIconButton.style.backgroundColor = '#FF5722';
            searchIconButton.style.color = 'white';
            searchIconButton.style.border = 'none';
            searchIconButton.style.borderRadius = '10px';
            searchIconButton.style.cursor = 'pointer';
            searchIconButton.style.fontSize = '16px';
            searchIconButton.style.fontWeight = 'bold';
            searchIconButton.style.transition = 'all 0.3s ease';
            searchIconButton.style.transform = 'translateY(0)';
            searchIconButton.onmouseenter = () => {
                searchIconButton.style.backgroundColor = '#E64A19';
                searchIconButton.style.transform = 'translateY(-2px)';
            };
            searchIconButton.onmouseleave = () => {
                searchIconButton.style.backgroundColor = '#FF5722';
                searchIconButton.style.transform = 'translateY(0)';
            };
            searchIconButton.onclick = () => {
                const username = textarea.value.trim();
                if (username) {
                    window.open(`https://www.sakura.fm/user/${username}`, '_blank');
                }
            };

            searchContainer.appendChild(closeButton);
            searchContainer.appendChild(textarea);
            searchContainer.appendChild(searchIconButton);
            searchOverlay.appendChild(searchContainer);
            document.body.appendChild(searchOverlay);
        };
        overlayContent.appendChild(semiTransButton);
        overlayContent.appendChild(stopButton);
        overlayContent.appendChild(registerButton);
        overlayContent.appendChild(autoGrammarButton);
        overlayContent.appendChild(autoLoadButton);
        overlayContent.appendChild(dynamicButton);
        overlayContent.appendChild(softMemoryButton);
        overlayContent.appendChild(searchButton);
        overlayContent.appendChild(extractCharacterButton);
        overlayContent.appendChild(extractChatsButton);
        overlayContent.appendChild(converterButton);
        overlayContent.appendChild(loginButton);
        overlayContent.appendChild(registerButton);
        overlayContent.appendChild(logoutButton);
        overlayContent.appendChild(clearStorageButton);
        overlayContent.appendChild(bugReportButton);
        overlayContent.appendChild(feedbackButton);
        overlayContent.appendChild(updateButton);
        overlayContent.appendChild(contactButton);
        overlayContent.appendChild(donateMe);
        overlayContent.appendChild(contributionButton);

        const horizontalRule2 = document.createElement('hr');
        horizontalRule2.style.border = 'none';
        horizontalRule2.style.borderTop = '1px solid #ccc';
        horizontalRule2.style.margin = '20px 0';
        overlayContent.appendChild(horizontalRule2);
        
        const funStuffHeader = document.createElement('h1');
        funStuffHeader.textContent = '<=====FUN STUFF=====>';
        funStuffHeader.style.textAlign = 'center';
        funStuffHeader.style.color = '#fff';
        funStuffHeader.style.marginTop = '20px';
        funStuffHeader.style.animation = 'fadeIn 1s ease-in-out';
        funStuffHeader.style.fontSize = '24px';
        funStuffHeader.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        funStuffHeader.style.userSelect = 'none';
        funStuffHeader.style.transition = 'transform 0.3s ease, color 0.3s ease';
        funStuffHeader.onmouseover = () => {
            funStuffHeader.style.transform = 'scale(1.05)';
            funStuffHeader.style.color = '#ffcc00';
        };
        funStuffHeader.onmouseout = () => {
            funStuffHeader.style.transform = 'scale(1)';
            funStuffHeader.style.color = '#fff';
        };
        overlayContent.appendChild(funStuffHeader);
        
        const chatButton = document.createElement('button');
        chatButton.textContent = '💬 Open Chat';
        chatButton.style.marginTop = '10px';
        chatButton.style.backgroundColor = '#4CAF50';
        chatButton.style.color = 'white';
        chatButton.style.border = 'none';
        chatButton.style.borderRadius = '10px';
        chatButton.style.padding = '15px 25px';
        chatButton.style.cursor = 'pointer';
        chatButton.style.fontSize = '16px';
        chatButton.style.fontFamily = "'Poppins', sans-serif";
        chatButton.style.fontWeight = '600';
        chatButton.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        chatButton.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
        chatButton.style.transform = 'translateY(0)';
        chatButton.onmouseover = () => {
            chatButton.style.transform = 'translateY(-3px)';
            chatButton.style.boxShadow = '0 8px 20px rgba(76, 175, 80, 0.4)';
            chatButton.style.backgroundColor = '#45a049';
        };
        chatButton.onmouseout = () => {
            chatButton.style.transform = 'translateY(0)';
            chatButton.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
            chatButton.style.backgroundColor = '#4CAF50';
        };
        
        let chatOverlay = null;
        
        chatButton.onclick = () => {
            if (chatOverlay) {
                return;
            }
        
            chatOverlay = document.createElement('div');
            chatOverlay.style.position = 'fixed';
            chatOverlay.style.top = '0';
            chatOverlay.style.left = '0';
            chatOverlay.style.width = '100%';
            chatOverlay.style.height = '100%';
            chatOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
            chatOverlay.style.display = 'flex';
            chatOverlay.style.justifyContent = 'center';
            chatOverlay.style.alignItems = 'center';
            chatOverlay.style.zIndex = '999999999';
            chatOverlay.style.animation = 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            chatOverlay.style.backdropFilter = 'blur(8px)';
        
            const chatBox = document.createElement('div');
            chatBox.style.backgroundColor = '#1a2634';
            chatBox.style.color = '#fff';
            chatBox.style.padding = '30px';
            chatBox.style.borderRadius = '20px';
            chatBox.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
            chatBox.style.position = 'relative';
            chatBox.style.width = '450px';
            chatBox.style.animation = 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            chatBox.style.border = '1px solid rgba(255,255,255,0.1)';
        
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '&times;';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '15px';
            closeButton.style.right = '15px';
            closeButton.style.backgroundColor = '#ff4757';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '50%';
            closeButton.style.width = '35px';
            closeButton.style.height = '35px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.fontSize = '24px';
            closeButton.style.display = 'flex';
            closeButton.style.justifyContent = 'center';
            closeButton.style.alignItems = 'center';
            closeButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            closeButton.style.transform = 'rotate(0deg)';
            closeButton.onmouseover = () => {
                closeButton.style.backgroundColor = '#ff6b81';
                closeButton.style.transform = 'rotate(90deg)';
            };
            closeButton.onmouseout = () => {
                closeButton.style.backgroundColor = '#ff4757';
                closeButton.style.transform = 'rotate(0deg)';
            };
            closeButton.onclick = () => {
                chatOverlay.style.animation = 'fadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                chatBox.style.animation = 'slideOutDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => {
                    document.body.removeChild(chatOverlay);
                    chatOverlay = null;
                }, 400);
            };
        
            const userNameInput = document.createElement('input');
            userNameInput.placeholder = '👤 Enter your name';
            userNameInput.style.width = '100%';
            userNameInput.style.padding = '15px';
            userNameInput.style.marginBottom = '20px';
            userNameInput.style.borderRadius = '12px';
            userNameInput.style.border = '2px solid #2d3f50';
            userNameInput.style.backgroundColor = '#2d3f50';
            userNameInput.style.color = '#fff';
            userNameInput.style.fontSize = '15px';
            userNameInput.style.fontFamily = "'Poppins', sans-serif";
            userNameInput.style.transition = 'all 0.3s ease';
            userNameInput.style.outline = 'none';
            userNameInput.onfocus = () => userNameInput.style.border = '2px solid #3498db';
            userNameInput.onblur = () => userNameInput.style.border = '2px solid #2d3f50';
        
            const messagesDiv = document.createElement('div');
            messagesDiv.style.maxHeight = '350px';
            messagesDiv.style.overflowY = 'auto';
            messagesDiv.style.marginBottom = '20px';
            messagesDiv.style.padding = '15px';
            messagesDiv.style.backgroundColor = '#2d3f50';
            messagesDiv.style.borderRadius = '12px';
            messagesDiv.style.scrollBehavior = 'smooth';
        
            const userMessageInput = document.createElement('input');
            userMessageInput.placeholder = '✍️ Type your message';
            userMessageInput.style.width = '100%';
            userMessageInput.style.padding = '15px';
            userMessageInput.style.marginBottom = '20px';
            userMessageInput.style.borderRadius = '12px';
            userMessageInput.style.border = '2px solid #2d3f50';
            userMessageInput.style.backgroundColor = '#2d3f50';
            userMessageInput.style.color = '#fff';
            userMessageInput.style.fontSize = '15px';
            userMessageInput.style.fontFamily = "'Poppins', sans-serif";
            userMessageInput.style.transition = 'all 0.3s ease';
            userMessageInput.style.outline = 'none';
            userMessageInput.onfocus = () => userMessageInput.style.border = '2px solid #3498db';
            userMessageInput.onblur = () => userMessageInput.style.border = '2px solid #2d3f50';
        
            const sendButton = document.createElement('button');
            sendButton.innerHTML = '📤 Send Message';
            sendButton.style.backgroundColor = '#3498db';
            sendButton.style.color = 'white';
            sendButton.style.border = 'none';
            sendButton.style.borderRadius = '12px';
            sendButton.style.padding = '15px 25px';
            sendButton.style.cursor = 'pointer';
            sendButton.style.width = '100%';
            sendButton.style.fontSize = '15px';
            sendButton.style.fontFamily = "'Poppins', sans-serif";
            sendButton.style.fontWeight = '600';
            sendButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            sendButton.style.transform = 'translateY(0)';
            sendButton.onmouseover = () => {
                sendButton.style.backgroundColor = '#2980b9';
                sendButton.style.transform = 'translateY(-2px)';
            };
            sendButton.onmouseout = () => {
                sendButton.style.backgroundColor = '#3498db';
                sendButton.style.transform = 'translateY(0)';
            };
        
            chatBox.appendChild(closeButton);
            chatBox.appendChild(userNameInput);
            chatBox.appendChild(messagesDiv);
            chatBox.appendChild(userMessageInput);
            chatBox.appendChild(sendButton);
            chatOverlay.appendChild(chatBox);
            document.body.appendChild(chatOverlay);
        
            const SERVER_URL = 'https://chat-8c4o.onrender.com/chat';
            let lastMessageCount = 0;
            let typingTimeout;
        
            fetchMessages();
            setInterval(fetchMessages, 500);
        
            const handleSendMessage = () => {
                const message = userMessageInput.value.trim();
                const user = userNameInput.value.trim() || 'User';
                if (message) {
                    sendMessage(user, message);
                    userMessageInput.value = '';
                    removeTypingIndicator(user);
                }
            };
        
            sendButton.addEventListener('click', handleSendMessage);
        
            userMessageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSendMessage();
                } else {
                    const user = userNameInput.value.trim() || 'User';
                    if (userMessageInput.value.trim()) {
                        showTypingIndicator(user);
                    } else {
                        removeTypingIndicator(user);
                    }
                }
            });
        
            userMessageInput.addEventListener('input', () => {
                const user = userNameInput.value.trim() || 'User';
                if (userMessageInput.value.trim()) {
                    showTypingIndicator(user);
                } else {
                    removeTypingIndicator(user);
                }
            });
        
            function showTypingIndicator(user) {
                clearTimeout(typingTimeout);
                const existingIndicator = document.querySelector(`[data-typing-user="${user}"]`);
                if (!existingIndicator) {
                    const typingElement = document.createElement('div');
                    typingElement.classList.add('typing-indicator');
                    typingElement.setAttribute('data-typing-user', user);
                    typingElement.textContent = `${user} is typing...`;
                    typingElement.style.color = '#666';
                    typingElement.style.fontStyle = 'italic';
                    typingElement.style.padding = '5px';
                    messagesDiv.appendChild(typingElement);
                }
                typingTimeout = setTimeout(() => removeTypingIndicator(user), 2000);
            }
        
            function removeTypingIndicator(user) {
                const indicator = document.querySelector(`[data-typing-user="${user}"]`);
                if (indicator) {
                    indicator.remove();
                }
            }
        
            function fetchMessages() {
                fetch(SERVER_URL, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'CHAT1234'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.messages.length !== lastMessageCount) {
                        lastMessageCount = data.messages.length;
                        updateMessages(data.messages);
                    }
                })
                .catch(error => console.error('Error fetching messages:', error));
            }
        
            function updateMessages(messages) {
                const fragment = document.createDocumentFragment();
                const existingMessages = messagesDiv.querySelectorAll('.message');
                const existingIds = new Set(Array.from(existingMessages).map(el => el.dataset.messageId));
        
                messages.forEach(msg => {
                    const messageId = `${msg.user}-${msg.message}`;
                    if (!existingIds.has(messageId)) {
                        const messageElement = createMessageElement(msg, messageId);
                        fragment.appendChild(messageElement);
                    }
                });
        
                if (fragment.children.length) {
                    messagesDiv.appendChild(fragment);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }
            }
        
            function createMessageElement(message, messageId) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');
                messageElement.dataset.messageId = messageId;
                const timestamp = new Date(message.timestamp).toLocaleTimeString();
                messageElement.textContent = `${message.user} [${timestamp}]: ${message.message}`;
                return messageElement;
            }
        
            function sendMessage(user, message) {
                const messageData = {
                    user: user,
                    message: message,
                    timestamp: Date.now()
                };
        
                fetch(SERVER_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'CHAT1234',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(messageData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to send message');
                    }
                    fetchMessages();
                })
                .catch(error => console.error('Error sending message:', error));
            }
        };
        overlayContent.appendChild(chatButton);
        
        const randomFeatureButton = document.createElement('button');
        randomFeatureButton.textContent = 'Random Number';
        randomFeatureButton.style.marginTop = '10px';
        randomFeatureButton.style.backgroundColor = '#007BFF';
        randomFeatureButton.style.color = 'white';
        randomFeatureButton.style.border = 'none';
        randomFeatureButton.style.borderRadius = '5px';
        randomFeatureButton.style.padding = '12px 20px';
        randomFeatureButton.style.cursor = 'pointer';
        randomFeatureButton.style.fontSize = '14px';
        randomFeatureButton.style.fontWeight = '500';
        randomFeatureButton.style.transition = 'all 0.3s ease';
        randomFeatureButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        randomFeatureButton.onclick = () => {
            const randomNumber = Math.floor(Math.random() * 100) + 1;
            alert(`Random number generated: ${randomNumber}`);
        };
        
        overlayContent.appendChild(randomFeatureButton);
        
        let gameStarted = false;
        
        const playDinoGameButton = document.createElement('button');
        playDinoGameButton.textContent = '🦖 Play Dino Game';
        playDinoGameButton.style.marginTop = '10px';
        playDinoGameButton.style.backgroundColor = '#007BFF';
        playDinoGameButton.style.color = 'white';
        playDinoGameButton.style.border = 'none';
        playDinoGameButton.style.borderRadius = '5px';
        playDinoGameButton.style.padding = '12px 20px';
        playDinoGameButton.style.cursor = 'pointer';
        playDinoGameButton.style.fontSize = '14px';
        playDinoGameButton.style.fontWeight = '500';
        playDinoGameButton.style.transition = 'all 0.3s ease';
        playDinoGameButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        playDinoGameButton.onclick = () => {
            if (gameStarted) return;
            gameStarted = true;
        
            const dinoGameContainer = document.createElement('div');
            dinoGameContainer.style.position = 'relative';
            dinoGameContainer.style.width = '100%';
            dinoGameContainer.style.height = '200px';
            dinoGameContainer.style.overflow = 'hidden';
            dinoGameContainer.style.backgroundColor = '#f7f7f7';
        
            const dino = document.createElement('div');
            dino.style.position = 'absolute';
            dino.style.bottom = '0';
            dino.style.left = '50px';
            dino.style.width = '40px';
            dino.style.height = '40px';
            dino.style.backgroundColor = 'green';
        
            dinoGameContainer.appendChild(dino);
            overlayContent.appendChild(dinoGameContainer);
        
            let isJumping = false;
            let level = 1;
            let cactusSpeed = 2000;
            let gameOverAlerted = false;
        
            function jump() {
                if (isJumping) return;
                isJumping = true;
                let jumpHeight = 0;
                const jumpInterval = setInterval(() => {
                    if (jumpHeight >= 100) {
                        clearInterval(jumpInterval);
                        const fallInterval = setInterval(() => {
                            if (jumpHeight <= 0) {
                                clearInterval(fallInterval);
                                isJumping = false;
                            }
                            jumpHeight -= 5;
                            dino.style.bottom = `${jumpHeight}px`;
                        }, 20);
                    }
                    jumpHeight += 5;
                    dino.style.bottom = `${jumpHeight}px`;
                }, 20);
            }
        
            document.addEventListener('keydown', (event) => {
                if (event.code === 'Space') {
                    jump();
                }
            });
        
            function spawnCactus() {
                const cactus = document.createElement('div');
                cactus.style.position = 'absolute';
                cactus.style.bottom = '0';
                cactus.style.right = '50px';
                cactus.style.width = '20px';
                cactus.style.height = '40px';
                cactus.style.backgroundColor = 'brown';
                dinoGameContainer.appendChild(cactus);
        
                let cactusInterval = setInterval(() => {
                    const cactusPosition = parseInt(cactus.style.right);
                    if (cactusPosition < 0) {
                        clearInterval(cactusInterval);
                        cactus.remove();
                    } else {
                        cactus.style.right = `${cactusPosition + 5}px`;
                        if (collision(dino, cactus)) {
                            if (!gameOverAlerted) {
                                alert('Game Over!');
                                gameOverAlerted = true;
                            }
                            clearInterval(cactusInterval);
                            dinoGameContainer.remove();
                        }
                    }
                }, 20);
            }
        
            function collision(dino, cactus) {
                const dinoRect = dino.getBoundingClientRect();
                const cactusRect = cactus.getBoundingClientRect();
                return !(
                    dinoRect.top > cactusRect.bottom ||
                    dinoRect.bottom < cactusRect.top ||
                    dinoRect.right < cactusRect.left ||
                    dinoRect.left > cactusRect.right
                );
            }
        
            const closeButton = document.createElement('button');
            closeButton.textContent = '❌';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.backgroundColor = 'red';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '5px';
            closeButton.style.cursor = 'pointer';
            closeButton.onclick = () => {
                dinoGameContainer.remove();
                gameStarted = false;
                gameOverAlerted = false;
            };
        
            dinoGameContainer.appendChild(closeButton);
            setInterval(() => {
                spawnCactus();
                level++;
                cactusSpeed = Math.max(500, cactusSpeed - 200);
            }, cactusSpeed);
        };
        overlayContent.appendChild(playDinoGameButton);
        
        const horizontalRule = document.createElement('hr');
        horizontalRule.style.border = 'none';
        horizontalRule.style.borderTop = '1px solid #ccc';
        horizontalRule.style.margin = '20px 0';
        overlayContent.appendChild(horizontalRule);
        
        const versionHeader = document.createElement('div');
        versionHeader.style.display = 'flex';
        versionHeader.style.alignItems = 'center';
        versionHeader.style.justifyContent = 'center';
        versionHeader.style.backgroundColor = '#333';
        versionHeader.style.color = '#fff';
        versionHeader.style.padding = '10px';
        versionHeader.style.borderRadius = '5px';
        versionHeader.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        versionHeader.style.animation = 'fadeIn 0.5s ease-in-out';
        versionHeader.style.userSelect = 'none';
        versionHeader.style.transition = 'transform 0.3s, background-color 0.3s';
        versionHeader.onmouseover = () => {
            versionHeader.style.transform = 'scale(1.05)';
            versionHeader.style.backgroundColor = '#444';
        };
        versionHeader.onmouseout = () => {
            versionHeader.style.transform = 'scale(1)';
            versionHeader.style.backgroundColor = '#333';
        };
        
        
        const versionText = document.createElement('h3');
        versionText.textContent = 'VERSION: ';
        versionText.style.margin = '0 10px';
        
        const fetchVersion = async () => {
            try {
                const response = await fetch('https://raw.githubusercontent.com/Whitzzscott/Better-Sakura/main/Extension-main-Stable/Extension-main-Stable/manifest.json');
                if (!response.ok) throw new Error('Failed to fetch manifest');
                const manifest = await response.json();
                const version = manifest.version;
                const versionDisplay = document.createElement('span');
                versionDisplay.textContent = version;
                versionDisplay.style.fontWeight = 'bold';
                versionText.appendChild(versionDisplay);
            } catch (error) {
                console.error('Error fetching version:', error);
                const versionDisplay = document.createElement('span');
                versionDisplay.textContent = 'Unknown';
                versionDisplay.style.fontWeight = 'bold';
                versionText.appendChild(versionDisplay);
            }
        };
        
        versionHeader.appendChild(versionText);
        overlayContent.appendChild(versionHeader);
        fetchVersion();
        
        
        const fetchExtensionId = () => {
            return chrome.runtime.id || 'defaultExtensionId';
        };
        
        const displayUserId = () => {
            let userId = fetchExtensionId();
        
            const userIdDisplay = document.createElement('div');
            userIdDisplay.textContent = `EXTENSION ID: ${userId}`;
            userIdDisplay.style.textAlign = 'center';
            userIdDisplay.style.color = '#fff';
            userIdDisplay.style.marginTop = '20px';
            userIdDisplay.style.backgroundColor = '#333';
            userIdDisplay.style.borderRadius = '8px';
            userIdDisplay.style.padding = '10px';
            userIdDisplay.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)';
            userIdDisplay.style.transition = 'transform 0.3s ease, color 0.3s ease';
            userIdDisplay.onmouseover = () => {
                userIdDisplay.style.transform = 'scale(1.05)';
                userIdDisplay.style.backgroundColor = '#444';
            };
            userIdDisplay.onmouseout = () => {
                userIdDisplay.style.transform = 'scale(1)';
                userIdDisplay.style.backgroundColor = '#333';
            };
            overlayContent.appendChild(userIdDisplay);
        };
        
        displayUserId();
        
    };
        
        settingsButton.addEventListener('click', showSettingsOverlay);
        promptButton.addEventListener('click', showPromptOverlay);
        const promptLibraryButton = createButton('Open Prompt Library');
        
        promptLibraryButton.onclick = async () => {
            try {
                const viewUrl = `${BASEURL}/prompts`;
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
                const response = await fetch(`${BASEURL}/prompt_library`, {
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
        floatingUI.appendChild(promptButton);
        floatingUI.appendChild(settingsButton);
        floatingUI.appendChild(autoSummaryButton);
        floatingUI.appendChild(createCharacterButton);
        
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
        
            const API_URL = `${BASEURL}/tokenize`;
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
        
        const checkGrammar = async (textarea) => {
            const text = textarea.value;
            if (!text) return;
        
            let language;
            if (!window.languagePromptShown) {
                language = prompt("Please choose a language: en, de, es, fr");
                if (!['en', 'de', 'es', 'fr'].includes(language)) {
                    alert("Invalid language selected. Please choose from en, de, es, fr.");
                    return;
                }
                window.languagePromptShown = true;
            }
        
            try {
                const response = await fetch('https://grammar-checker-sh9h.onrender.com/grammar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text, language })
                });
        
                if (!response.ok) {
                    throw new Error('Grammar check request failed');
                }
        
                const result = await response.json();
                if (result["Corrected Text"] && result["Corrected Text"] !== "") {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = result["Corrected Text"];
                    
                    const errorTexts = Array.from(tempDiv.querySelectorAll('.error-text'))
                        .map(el => el.textContent);
        
                    errorTexts.forEach(errorText => {
                        const startIndex = text.indexOf(errorText);
                        if (startIndex !== -1) {
                            const endIndex = startIndex + errorText.length;
                            const wrapper = document.createElement('span');
                            wrapper.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                            wrapper.style.borderBottom = '2px wavy red';
                            wrapper.textContent = errorText;
                            const before = text.substring(0, startIndex);
                            const after = text.substring(endIndex);
                            textarea.value = before + wrapper.outerHTML + after;
                        }
                    });
        
                    let resultParagraph = textarea.nextElementSibling;
                    if (!resultParagraph || !resultParagraph.classList.contains('grammar-result')) {
                        resultParagraph = document.createElement('p');
                        resultParagraph.classList.add('grammar-result');
                        textarea.parentNode.insertBefore(resultParagraph, textarea.nextSibling);
                    }
        
                    resultParagraph.style.backgroundColor = '#444';
                    resultParagraph.style.color = '#fff';
                    resultParagraph.style.padding = '15px';
                    resultParagraph.style.borderRadius = '8px';
                    resultParagraph.style.marginTop = '10px';
                    resultParagraph.style.fontSize = '16px';
                    resultParagraph.style.display = 'block';
                    resultParagraph.style.transition = 'opacity 0.5s ease-in-out';
                    resultParagraph.textContent = result["Corrected Text"];
                    resultParagraph.style.opacity = '1';
        
                    setTimeout(() => {
                        resultParagraph.style.opacity = '0';
                        setTimeout(() => {
                            resultParagraph.remove();
                        }, 500);
                    }, 5000);
                }
            } catch (error) {
            }
        };
        
        const setupGrammarCheck = () => {
            const textareas = document.querySelectorAll('input[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], input[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id^=":"][aria-describedby^=":"]');
        
            textareas.forEach(textarea => {
                textarea.addEventListener('input', () => {
                    clearTimeout(textarea.grammarTimeout);
                    textarea.grammarTimeout = setTimeout(() => {
                        checkGrammar(textarea);
                    }, 1000);
                });
            });
        };
        
        const grammarObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    setupGrammarCheck();
                }
            });
        });
        
        grammarObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setupGrammarCheck();
        
        function clearElements() {
            const targetDiv = document.querySelector('.px-page.md\\:px-page-md.mx-auto.flex.w-full.flex-col.items-center.py-4.md\\:pt-8.max-w-5xl');
        
            if (targetDiv) {
                const button = targetDiv.querySelector('.inline-flex.items-center.justify-center.rounded-full.text-sm.transition-colors.focus-visible\\:outline-none.disabled\\:pointer-events-none.disabled\\:opacity-50.select-none.border.border-input.bg-transparent.shadow-sm.hover\\:bg-accent.hover\\:text-accent-foreground.active\\:bg-accent.active\\:text-accent-foreground.h-9.px-4.py-2.gap-2.max-md\\:w-full');
                
                if (!button) {
                    const h3 = targetDiv.querySelector('h3');
                    
                    if (h3 && h3.textContent.trim() === 'Your deleted chats') {
                        targetDiv.remove();
                    }
                }
            }
        }
        

        function checkAndClear() {
            if (!localStorage.getItem('Purgestop')) {
                clearElements();
            }
        }

        window.addEventListener('beforeunload', clearElements);
        setInterval(checkAndClear, 10);
    }
    
}

window.addEventListener('load', () => {
    const popup = document.createElement('div');
    popup.id = 'popup';
    popup.classList.add(
        'fixed', 'top-0', 'left-0', 'w-full', 'h-full', 'bg-gray-500', 
        'bg-opacity-70', 'flex', 'justify-center', 'items-center', 'z-50', 'hidden'
    );

    const popupContent = document.createElement('div');
    popupContent.classList.add(
        'bg-gradient-to-r', 'from-blue-500', 'to-indigo-500', 'p-8', 'rounded-lg', 'shadow-xl', 
        'text-center', 'text-white', 'max-w-lg', 'w-full', 'animate__animated', 'animate__fadeIn', 'space-y-4'
    );
    
    const heading = document.createElement('h2');
    heading.classList.add('text-2xl', 'font-semibold');
    heading.innerText = 'Please wait';

    const message = document.createElement('p');
    message.classList.add('text-lg', 'font-light', 'leading-relaxed');
    message.innerText = 'Loading the extension and checking if all functions are working correctly...';

    const spinner = document.createElement('div');
    spinner.classList.add('w-12', 'h-12', 'border-4', 'border-t-4', 'border-white', 'border-solid', 'rounded-full', 'animate-spin', 'mx-auto');
    
    popupContent.appendChild(heading);
    popupContent.appendChild(message);
    popupContent.appendChild(spinner);

    popup.appendChild(popupContent);
    document.body.appendChild(popup);

    popup.classList.remove('hidden');

    function resizeTextareas() {
        const textareas = document.querySelectorAll('.space-y-2 textarea');
        
        if (textareas.length > 0) {
            textareas.forEach(textarea => {
                textarea.style.height = '200px';
                textarea.style.transition = 'height 0.3s ease'; 
                
                textarea.addEventListener('input', function () {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                });
            });
        } else {
            console.error('Textarea elements not found');
        }
    
        const style = document.createElement('style');
        style.innerHTML = `
            .space-y-2 textarea::-webkit-scrollbar {
                width: 12px;
            }
            .space-y-2 textarea::-webkit-scrollbar-thumb {
                background-color: red;
                border-radius: 10px;
            }
            .space-y-2 textarea::-webkit-scrollbar-track {
                background: black;
                border-radius: 10px;
            }
            .space-y-2 textarea::-webkit-scrollbar-thumb:hover {
                background-color: darkred;
            }
        `;
        document.head.appendChild(style);
    }

    function replaceSakuraImages() {
        const anchor = document.querySelector('a.mr-auto.flex.flex-row.items-center.gap-1');
        
        if (anchor) {
            const img = anchor.querySelector('img[alt="Sakura flower"]');
            
            if (img) {
                img.srcset = chrome.runtime.getURL('../logos/BetterSakura.png');
                console.log('Sakura flower image srcset replaced');
            } else {
                console.log('No Sakura flower image found inside the anchor');
            }
        } else {
            console.log('Anchor with specified classes not found');
        }
    }
    

    function updateAnchorText() {
        const anchor = document.querySelector('a.mr-auto.flex.flex-row.items-center.gap-1');
        
        if (anchor) {
            const h1 = anchor.querySelector('h1');
            
            if (h1) {
                console.log('Changing h1 text to "Better Sakura"');
                h1.textContent = 'Better Sakura';
            } else {
                console.log('No h1 found inside the anchor.');
            }
        } else {
            console.log('Anchor with specified classes not found.');
        }
    }    
    
    function startFunctionsOnPageChange() {
        setTimeout(() => {
            popup.classList.add('hidden');
            loginStatusCheck();
            checkLoginStatus(); 
            resizeTextareas();
            replaceSakuraImages();
            updateAnchorText();
            
            setInterval(() => {
                replaceSakuraImages();
                updateAnchorText();
            }, 10000);
        }, 2000);
    }
    
    startFunctionsOnPageChange();
    
    window.addEventListener('popstate', () => {
        startFunctionsOnPageChange();
    });
    
    window.addEventListener('pushState', () => {
        startFunctionsOnPageChange();
    });
    
});
