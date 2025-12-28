const https = require('https');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const API_KEY = process.env.SMSPOOL_API_KEY;
const BASE_URL = 'https://api.smspool.net'; // Assuming this based on smspool.ts

if (!API_KEY) {
    console.error('❌ SMSPOOL_API_KEY is missing');
}

console.log(`Using SMSPool API Key: ${API_KEY ? API_KEY.substring(0, 5) + '...' : 'NONE'}`);

function request(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${endpoint}`;
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                // SMSPool usually uses query params for key, but let's check basic connectivity to domain
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        };

        console.log(`Requesting: ${url}`);

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Response Status: ${res.statusCode}`);
                resolve(res.statusCode);
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function test() {
    try {
        await request('/request/country'); // Check countries endpoint
        console.log('✅ SMSPool Connection Success');
    } catch (error) {
        console.error('❌ SMSPool Failed:', error.code || error.message);
    }
}

test();
