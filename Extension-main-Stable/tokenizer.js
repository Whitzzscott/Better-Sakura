        const API_URL = 'https://tiktoken-2nt2.onrender.com/tokenize';
        const AUTH_HEADER = 'Bearer SSS155';

        document.getElementById('tokenizeBtn').addEventListener('click', function () {
            const textInput = document.getElementById('textInput').value.trim();
            if (textInput) {
                showTypingIndicator();
                tokenizeText(textInput);
            } else {
                alert('Please enter some text to tokenize.');
            }
        });

        function showTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator');
            typingIndicator.style.display = 'block';
        }

        function hideTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator');
            typingIndicator.style.display = 'none'; 
        }

        function tokenizeText(text) {
            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_HEADER
                },
                body: JSON.stringify({ text: text })
            })
            .then(response => response.json())
            .then(data => {
                hideTypingIndicator();
                displayResponse(data);
            })
            .catch(error => {
                hideTypingIndicator();
                displayError(error);
            });
        }

        function displayResponse(data) {
            const responseContainer = document.getElementById('responseContainer');
            let plainTextResponse = '';
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    if (typeof data[key] === 'object') {
                        plainTextResponse += `${key}:\n`;
                        for (let subKey in data[key]) {
                            if (data[key].hasOwnProperty(subKey)) {
                                plainTextResponse += `${subKey}: ${data[key][subKey]}\n`;
                            }
                        }
                    } else {
                        plainTextResponse += `${key}: ${data[key]}\n`;
                    }
                }
            }
            responseContainer.textContent = plainTextResponse;
            responseContainer.style.display = 'block';
        }

        function displayError(error) {
            const responseContainer = document.getElementById('responseContainer');
            responseContainer.classList.add('error');
            responseContainer.textContent = `Error: ${error.message}`;
            responseContainer.style.display = 'block';
        }