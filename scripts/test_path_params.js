// Native fetch in Node 18+
require('dotenv').config({ path: '.env.local' });
if (!process.env.SMSPOOL_API_KEY) require('dotenv').config({ path: '.env' });

const API_KEY = process.env.SMSPOOL_API_KEY;
const BASE_URL = 'https://api.smspool.net';
const TEST_ID = 'mf3XGICImwdnZLxU8OLx';

const ENDPOINTS = [
    '/esim/check',
    '/esim/profile',
    '/esim/order',
    '/esim/purchase', // maybe purchase/ID?
    '/order'
];

async function testPath(endpoint) {
    const url = `${BASE_URL}${endpoint}/${TEST_ID}?key=${API_KEY}`;
    console.log(`Testing GET ${endpoint}/${TEST_ID}...`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            const text = await res.text();
            console.log(text.substring(0, 300));
        }
    } catch (e) { console.error(e); }
}

async function run() {
    for (const ep of ENDPOINTS) {
        await testPath(ep);
    }
}

run();
