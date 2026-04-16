import axios from 'axios';

// Testing against the Vite Frontend URL (Proxy)
// Vite usually defaults to 5173. We will try 5173.
const FRONTEND_URL = 'http://localhost:5173/api/auth';

const testUser = {
    username: 'proxy_test_' + Date.now(),
    email: 'proxy' + Date.now() + '@example.com',
    password: 'password123'
};

async function testProxyAuth() {
    console.log('--- Testing Frontend Proxy Auth ---');
    console.log(`Target: ${FRONTEND_URL}`);

    try {
        // 1. Register
        console.log('\n1. Testing Registration via Proxy...');
        console.log('Sending:', testUser);
        const regRes = await axios.post(`${FRONTEND_URL}/register`, testUser);
        console.log('✅ Proxy Registration Success!');
        console.log('Response:', regRes.data);

    } catch (error) {
        console.log('❌ Proxy Request Failed');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
            if (error.response.status === 404) {
                console.log('Hint: 404 means the Proxy is NOT rewriting the path correctly or Server is not running.');
            }
        } else if (error.request) {
            console.log('No response received. Is Vite running on port 5173?');
        } else {
            console.log('Error:', error.message);
        }
    }
}

testProxyAuth();
