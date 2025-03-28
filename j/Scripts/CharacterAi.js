if (window.location.href.includes('https://character.ai/')) {
    (function() {
        function extractChats() {
            const chatElements = [
                ...document.querySelectorAll('div.mt-1.max-w-xl.rounded-2xl.px-3.min-h-12.flex.justify-center.py-3.bg-surface-elevation-3'),
                ...document.querySelectorAll('div.mb-8.flex.w-full.flex-1.flex-col.gap-2\\.5'),
                ...document.querySelectorAll('div.css-0'),
                ...document.querySelectorAll('[data-testid="completed-message"]')
            ];

            const chatContents = new Set();

            const extractChatContent = (chat) => {
                const isSwiperSlide = ['swiper-slide', 'swiper-slide-visible', 
                                    'swiper-slide-fully-visible', 'swiper-slide-active']
                                    .every(className => chat.classList.contains(className));
                
                const aiIndicator = chat.querySelector('div.rounded-2xl.text-sm.bg-secondary.px-2.font-light.h-fit');
                if (aiIndicator && aiIndicator.textContent.trim() === 'c.ai') {
                    return;
                }

                const pTag = chat.querySelector('p[node]');
                if (pTag && pTag.innerText.trim()) {
                    chatContents.add(pTag.innerText.trim());
                }

                const divContent = chat.innerText.trim();
                if (divContent && !chatContents.has(divContent)) {
                    chatContents.add(divContent);
                }
            };

            chatElements.forEach(extractChatContent);
            const topChatContents = Array.from(chatContents).slice(0, 10);

            if (topChatContents.length > 0) {
                chrome.runtime.sendMessage({
                    type: 'CHATS_EXTRACTED',
                    data: topChatContents
                });
            } else {
                alert('No chat messages found. Please check the page structure.');
            }
        }

        const extractButton = document.createElement('button');
        extractButton.textContent = 'Extract Chats';
        Object.assign(extractButton.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease, transform 0.2s',
            zIndex: '999'
        });
        extractButton.addEventListener('mouseenter', () => {
            extractButton.style.transform = 'scale(1.1)';
        });
        extractButton.addEventListener('mouseleave', () => {
            extractButton.style.transform = 'scale(1)';
        });
        document.body.appendChild(extractButton);

        extractButton.addEventListener('click', extractChats);

        const uploadButton = document.createElement('button');
        uploadButton.textContent = 'Upload Chat File';
        Object.assign(uploadButton.style, {
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            padding: '12px 24px',
            backgroundColor: '#007BFF',
            color: '#FFFFFF',
            fontSize: '18px',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.2s',
            zIndex: '999',
            ':hover': {
                backgroundColor: '#0056b3',
                transform: 'scale(1.05)',
            },
            ':active': {
                transform: 'scale(0.95)',
            },
        });
        uploadButton.addEventListener('mouseenter', () => {
            uploadButton.style.transform = 'scale(1.1)';
        });
        uploadButton.addEventListener('mouseleave', () => {
            uploadButton.style.transform = 'scale(1)';
        });
        document.body.appendChild(uploadButton);

        const messageCounter = document.createElement('div');
        messageCounter.style.position = 'fixed';
        messageCounter.style.bottom = '120px';
        messageCounter.style.right = '20px';
        messageCounter.style.padding = '10px 20px';
        messageCounter.style.backgroundColor = '#FF9800';
        messageCounter.style.color = 'white';
        messageCounter.style.fontSize = '16px';
        messageCounter.style.border = 'none';
        messageCounter.style.borderRadius = '5px';
        messageCounter.style.textAlign = 'center';
        messageCounter.style.display = 'none';
        messageCounter.style.zIndex = '999';
        messageCounter.textContent = 'Messages Left: 0';
        document.body.appendChild(messageCounter);

        let interval = 10000;

        uploadButton.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.html';
            fileInput.style.display = 'none';

            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) {
                    alert('No file selected.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    let fileContent = e.target.result;

                    fileContent = fileContent.replace(/<p[^>]*>|<\/p>/gi, '');
                    const listItems = fileContent.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
                    const chatMessages = listItems.map(item => item.replace(/<li[^>]*>|<\/li>/gi, '').trim()).filter(msg => msg.length > 0);

                    if (chatMessages.length > 0) {
                        messageCounter.style.display = 'block';
                        sendMessages(chatMessages.reverse());
                    } else {
                        alert('No valid chat messages found in the file.');
                    }
                };
                reader.readAsText(file);
            });

            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });

        const setIntervalButton = document.createElement('button');
        setIntervalButton.textContent = 'Set Sending Message Interval';
        Object.assign(setIntervalButton.style, {
            position: 'fixed',
            bottom: '160px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease, transform 0.2s',
            zIndex: '999'
        });
        setIntervalButton.addEventListener('mouseenter', () => {
            setIntervalButton.style.transform = 'scale(1.1)';
        });
        setIntervalButton.addEventListener('mouseleave', () => {
            setIntervalButton.style.transform = 'scale(1)';
        });
        document.body.appendChild(setIntervalButton);

        setIntervalButton.addEventListener('click', () => {
            let userInterval = prompt('Enter the interval in seconds for each message (default is 10s):');
            userInterval = userInterval.replace(/\D/g, '');
            const parsedInterval = parseInt(userInterval, 10);
            if (!isNaN(parsedInterval) && parsedInterval > 0) {
                interval = parsedInterval * 1000;
                alert(`Message interval set to ${parsedInterval} seconds.`);
            } else {
                alert('Invalid input. Keeping the default interval of 10 seconds.');
            }
        });

        function sendMessages(chatMessages) {
            const textArea = document.querySelector('textarea[placeholder="Message"]');
            const continueButton = document.querySelector('button[type="submit"]');

            if (textArea && continueButton) {
                let messageIndex = 0;

                function sendMessage() {
                    if (messageIndex >= chatMessages.length) {
                        alert('All messages sent successfully!');
                        messageCounter.style.display = 'none';
                        return;
                    }

                    const message = chatMessages[messageIndex];
                    textArea.value = message;
                    textArea.dispatchEvent(new Event('input', { bubbles: true }));

                    continueButton.click();
                    messageIndex++;

                    messageCounter.textContent = `Messages Left: ${chatMessages.length - messageIndex}`;

                    setTimeout(sendMessage, interval);
                }

                sendMessage();
            } else {
                alert('Message input or send button not found.');
            }
        }
    })();
}