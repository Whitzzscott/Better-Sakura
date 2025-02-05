let BASEURL = null;

async function loadConfig() {
    const { BASEURL: configBaseUrl } = await import(chrome.runtime.getURL('Config/Config.js'));
    BASEURL = configBaseUrl; 
}

loadConfig();

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
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
            alert(data);
        }
    } catch (error) {
        alert('An error occurred during login');
    }
});
