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
    const symbolRegex = /^[a-zA-Z0-9@#%^&*!]+$/; // Allow letters, numbers, and selected symbols

    if (!symbolRegex.test(name) || !symbolRegex.test(password)) {
        alert('Only letters, numbers, and @ # % ^ & * ! are allowed.');
        return;
    }

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

document.getElementById('TokenLoginButton').addEventListener('click', async function(event) {
    event.preventDefault();

    if (BASEURL === null) {
        alert('Error: BASEURL is not set. Please check the configuration.');
        return;
    }

    const token = document.getElementById('TokenLogin').value;
    const tokenRegex = /^[a-zA-Z0-9@#%^&*!]+$/;

    if (!tokenRegex.test(token)) {
        alert('Invalid token format. Only letters, numbers, and @ # % ^ & * ! are allowed.');
        return;
    }

    try {
        const response = await fetch(`${BASEURL}/token/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer SSS155'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login successful:', data);
        } else {
            alert(data.message || 'Token login failed');
        }
    } catch (error) {
        alert(`An error occurred during token login: ${error.message}`);
    }
});
