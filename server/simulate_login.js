const fetch = require('node-fetch');

async function testLogin() {
    try {
        console.log('Attempting login...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mishrasunny2003@gmail.com',
                password: 'wrongpassword'
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response body:', text);

        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', json);
        } catch (e) {
            console.log('Response is NOT valid JSON');
        }

    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testLogin();
