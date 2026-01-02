// Native fetch in Node 18+
require('dotenv').config({ path: '.env.local' });
if (!process.env.SMSPOOL_API_KEY) require('dotenv').config({ path: '.env' });

const API_KEY = process.env.SMSPOOL_API_KEY;
const BASE_URL = 'https://api.smspool.net';

async function testHistory() {
    console.log('Testing /order/history...');
    try {
        const url = `${BASE_URL}/order/history?key=${API_KEY}`;
        const res = await fetch(url, { method: 'POST' }); // Search said POST? Or try GET.
        // Search said "uses a POST request".
        // Let's try POST.

        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Data:', JSON.stringify(data, null, 2).substring(0, 500)); // Log first 500 chars
    } catch (e) {
        console.error('Error:', e);
    }
}

testHistory();
