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

        const data = await response.json();

        if (response.ok) {
            chrome.storage.local.set({ loginResponse: data }, () => {
                if (chrome.runtime.lastError) {
                    alert(`Error saving login data: ${chrome.runtime.lastError.message}`);
                } else {
                    alert('Login successful');
                    window.location.href = 'https://www.sakura.fm';
                }
            });
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert(`An error occurred during login: ${error.message}`);
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
