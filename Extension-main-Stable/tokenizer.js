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

        const tokenizeBtn = document.getElementById('tokenizeBtn');
        const typingIndicator = document.getElementById('typingIndicator');
        const responseContainer = document.getElementById('responseContainer');
        const fileInput = document.getElementById('fileInput');
        const fileNameDisplay = document.getElementById('fileName');
        const textInput = document.getElementById('textInput');
        
        tokenizeBtn.addEventListener('click', () => {
            let textToTokenize = textInput.value;

            if (textToTokenize.trim() === '') {
                alert('Please enter some text to tokenize.');
                return;
            }

            typingIndicator.classList.remove('hidden');
            setTimeout(() => {
                typingIndicator.classList.add('hidden');
                responseContainer.classList.remove('hidden');
                responseContainer.textContent = `Tokenized Text: ${textToTokenize.split(/\s+/).join(', ')}`;
            }, 3000);
        });

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.type === 'text/plain') {
                fileNameDisplay.textContent = `Selected file: ${file.name}`;
                const reader = new FileReader();
                reader.onload = function (e) {
                    const fileContent = e.target.result;
                    typingIndicator.classList.remove('hidden');
                    setTimeout(() => {
                        typingIndicator.classList.add('hidden');
                        responseContainer.classList.remove('hidden');
                        responseContainer.textContent = `Tokenized File Content: ${fileContent.split(/\s+/).join(', ')}`;
                    }, 3000);
                };
                reader.readAsText(file);
            } else {
                fileNameDisplay.textContent = 'Please select a valid .txt file.';
                fileInput.value = '';
            }
        });