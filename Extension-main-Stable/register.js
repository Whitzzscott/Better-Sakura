document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('loginName').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('https://whitz-tokenizer.onrender.com/register', {
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
            window.location.href = 'login.html';
        } else {
            alert(decodedMessage);
        }
    } catch (error) {
        alert('An error occurred during login');
    }
});