const https = require('https');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const API_KEY = process.env.TEXTVERIFIED_API_KEY;
const BASE_URL = 'https://www.textverified.com/api/v2';

if (!API_KEY) {
    console.error('❌ TEXTVERIFIED_API_KEY is missing');
    process.exit(1);
}

console.log(`Using API Key: ${API_KEY.substring(0, 5)}...`);

function request(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                // 'Authorization': `Simple ${API_KEY}`, // Try Simple auth if Bearer fails?
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        console.log(`Requesting: ${method} ${url}`);

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Response Status: ${res.statusCode}`);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject({ status: res.statusCode, body: data, headers: res.headers });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function test() {
    try {
        console.log('--- Testing /targets ---');
        const targets = await request('/targets');
        console.log(`✅ Success! Found ${targets.length} targets.`);
        if (targets.length > 0) {
            console.log('Sample Name:', targets[0].name);
            console.log('Sample Cost:', targets[0].cost);
        } else {
            console.warn('⚠️ Returned empty array.');
        }
    } catch (error) {
        console.error('❌ Error Failed:', error);
        if (error.code) console.error('Code:', error.code);
        if (error.message) console.error('Message:', error.message);
        if (error.response) console.error('Response:', error.response);
    }
}

test();
