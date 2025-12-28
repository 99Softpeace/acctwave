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
                'Content-Type': 'application/json'
            }
        };

        console.log(`Request: ${method} ${url}`);

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject({ status: res.statusCode, body: data });
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
        console.log('Fetching /targets...');
        const targets = await request('/targets');
        console.log(`✅ Success! Found ${targets.length} targets.`);
        if (targets.length > 0) {
            console.log('Sample:', targets[0]);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

test();
