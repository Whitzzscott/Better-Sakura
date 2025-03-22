let BASEURL = null;

async function loadConfig() {
    const configModule = await import(chrome.runtime.getURL('Config/Config.js'));
    BASEURL = configModule.BASEURL; 
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadConfig();

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!BASEURL) {
            alert('Configuration not loaded. Try again.');
            return;
        }

        const name = document.getElementById('loginName').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${BASEURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer SSS155'
                },
                body: JSON.stringify({ name, password })
            });

            const data = await response.text();

            if (response.ok) {
                alert(data);
                window.location.href = 'login.html';
            } else {
                alert(`Error: ${data}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login');
        }
    });
});
