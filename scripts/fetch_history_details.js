const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
if (!process.env.SMSPOOL_API_KEY) require('dotenv').config({ path: '.env' });

const API_KEY = process.env.SMSPOOL_API_KEY;
const BASE_URL = 'https://api.smspool.net';

async function tryEndpoint(method, endpoint) {
    const url = `${BASE_URL}${endpoint}?key=${API_KEY}`;
    console.log(`Fetching ${method} ${endpoint}...`);
    try {
        const res = await fetch(url, { method });
        const text = await res.text();
        console.log('Status:', res.status);
        if (res.status === 200) {
            fs.writeFileSync('history_output.json', text);
            console.log('Saved to history_output.json');
            return true;
        }
    } catch (e) { console.error(e); }
    return false;
}

async function run() {
    if (await tryEndpoint('POST', '/order/history')) return;
    if (await tryEndpoint('POST', '/request/history')) return;
    if (await tryEndpoint('GET', '/request/history')) return;
    if (await tryEndpoint('GET', '/esim/history')) return;
}

run();
