document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('loginName').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('https://whitz-tokenizer.onrender.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, password })
        });

        const data = await response.text();
        const decodedMessage = atob(data);

        if (response.ok) {
            alert(decodedMessage);
            window.location.href = 'https://www.sakura.fm';
        } else {
            alert(decodedMessage);
        }
    } catch (error) {
        alert('An error occurred during login');
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

