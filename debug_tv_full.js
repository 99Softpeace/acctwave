const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.TEXTVERIFIED_API_KEY;
// const BASE_URL = 'https://www.textverified.com/api/v2'; // Old
const BASE_URL = 'https://www.textverified.com/api/pub/v2'; // New

const email = process.env.TEXTVERIFIED_EMAIL;

async function run() {
    console.log('1. Authenticating...');
    const authRes = await fetch(`${BASE_URL}/auth`, {
        method: 'POST',
        headers: {
            'X-API-KEY': API_KEY,
            'X-API-USERNAME': email,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        cache: 'no-store'
    });

    console.log('Auth Status:', authRes.status);
    const authText = await authRes.text();
    // console.log('Auth Body:', authText);

    let token;
    try {
        const data = JSON.parse(authText);
        token = data.token || data.bearer_token;
        console.log('Token obtained:', token ? 'YES' : 'NO');
    } catch (e) {
        console.error('Failed to parse Auth JSON:', e);
        return;
    }

    if (!token) return;

    console.log('\n2. Fetching Services (/targets)...');
    const servicesRes = await fetch(`${BASE_URL}/targets`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        cache: 'no-store'
    });

    console.log('Services Status:', servicesRes.status);
    const servicesText = await servicesRes.text();
    console.log('Services Body Preview:', servicesText.substring(0, 500));

    if (servicesRes.status === 404) {
        console.log('\n3. Retrying with Standard Path (/api/v2/targets)...');
        const v2Res = await fetch(`https://www.textverified.com/api/v2/targets`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });
        console.log('V2 Services Status:', v2Res.status);
        console.log('V2 Services Body:', (await v2Res.text()).substring(0, 500));
    }
}

run();
