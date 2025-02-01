let BASEURL = null;

async function loadConfig() {
    const { BASEURL: configBaseUrl } = await import(chrome.runtime.getURL('Config/Config.js'));
    BASEURL = configBaseUrl;
}

loadConfig();

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (BASEURL === null) {
        alert('Error: BASEURL is not set. Please check the configuration.');
        return;
    }

    const name = document.getElementById('loginName').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${BASEURL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer SSS155'
            },
            body: JSON.stringify({ name, password })
        });

        const data = await response.text();

        // Check if the response data is Base64-encoded
        let decodedMessage;
        try {
            decodedMessage = atob(data);
        } catch (decodeError) {
            decodedMessage = `Error decoding message: ${decodeError.message}`;
        }

        if (response.ok) {
            alert(decodedMessage);
            window.location.href = 'https://www.sakura.fm';
        } else {
            alert(decodedMessage);
        }
    } catch (error) {
        let decodedMessage = '';
        // If possible, try decoding the error message if it's Base64
        try {
            decodedMessage = atob(error.message);
        } catch (decodeError) {
            decodedMessage = `Error decoding message: ${decodeError.message}`;
        }
        alert(`An error occurred during login: ${decodedMessage}`);
    }
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    const loginName = document.getElementById('loginName').value;
    const loginPassword = document.getElementById('loginPassword').value;
    const symbolRegex = /[^a-zA-Z0-9]/;

    if (symbolRegex.test(loginName) || symbolRegex.test(loginPassword)) {
        e.preventDefault();
        alert('Symbols are not allowed in username or password. Only letters and numbers are permitted.');
        return false;
    }
});
