const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const API_KEY = env['TEXTVERIFIED_API_KEY'];
const EMAIL = env['TEXTVERIFIED_EMAIL'];

console.log('API_KEY:', API_KEY ? 'Present' : 'Missing');
console.log('EMAIL:', EMAIL);

if (!API_KEY || !EMAIL) {
    console.error('Missing credentials');
    process.exit(1);
}

const BASE_HOST = 'www.textverified.com';
const BASE_PATH = '/api/pub/v2';

function request(method, endpoint, headers, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_HOST,
            path: BASE_PATH + endpoint,
            method: method,
            headers: headers
        };

        console.log(`Requesting: ${method} ${options.hostname}${options.path}`);

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Response Status: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    console.log('Raw Body:', data.substring(0, 200));
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request Error:', e);
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    try {
        // 1. Auth
        console.log('--- AUTHENTICATING ---');
        const authRes = await request('POST', '/auth', {
            'X-API-KEY': API_KEY,
            'X-API-USERNAME': EMAIL,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });

        if (authRes.status !== 200) {
            console.error('Auth Failed:', authRes.data);
            return;
        }

        const token = authRes.data.token || authRes.data.bearer_token;
        console.log('Token received');

        // 2. Get Services
        console.log('--- FETCHING SERVICES ---');
        const servicesRes = await request('GET', '/services?reservationType=verification&numberType=mobile', {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        });

        if (servicesRes.status !== 200) {
            console.error('Services Fetch Failed:', servicesRes.data);
        } else {
            const count = Array.isArray(servicesRes.data) ? servicesRes.data.length : 0;
            console.log(`Services fetched successfully. Count: ${count}`);
            if (count > 0) console.log('First Service:', servicesRes.data[0]);
        }

    } catch (e) {
        console.error('Script Error:', e);
    }
}

run();
