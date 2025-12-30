const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.TEXTVERIFIED_API_KEY;
const BASE_URL = 'https://www.textverified.com/api/pub/v2';
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

    const authData = await authRes.json();
    const token = authData.token || authData.bearer_token;

    if (!token) {
        console.error('Auth failed:', authData);
        return;
    }
    console.log('Token obtained.');

    console.log('\n2. Fetching Services...');
    const servicesRes = await fetch(`${BASE_URL}/services?reservationType=verification&numberType=mobile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        cache: 'no-store'
    });

    console.log('Status:', servicesRes.status);
    const data = await servicesRes.json();
    console.log('Total items:', data.length);
    console.log('Item 0:', JSON.stringify(data[0]));
    console.log('Item 5:', JSON.stringify(data[5]));
    console.log('Item 100:', JSON.stringify(data[100]));

    // Check for any item with serviceId
    const withId = data.find(d => d.serviceId);
    if (withId) {
        console.log('Found item with serviceId:', JSON.stringify(withId));
    } else {
        console.log('NO items with serviceId found.');
    }
}

run();
