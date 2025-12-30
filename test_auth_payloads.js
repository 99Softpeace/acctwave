const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const email = process.env.TEXTVERIFIED_EMAIL;
const apiKey = process.env.TEXTVERIFIED_API_KEY;

if (!email || !apiKey) {
    console.error('Missing credentials in .env');
    process.exit(1);
}

const payloads = [
    { email: email, key: apiKey },
    { email: email, api_key: apiKey },
    { username: email, key: apiKey },
    { username: email, password: apiKey }, // Sometimes key is treated as password
    { id: email, secret: apiKey }
];

function testPayload(payload, index) {
    // ... existing logic ...
}

function testBasicAuth(method) {
    const authString = Buffer.from(`${email}:${apiKey}`).toString('base64');
    const options = {
        hostname: 'www.textverified.com',
        port: 443,
        path: '/api/v2/authentication',
        method: method,
        headers: {
            'Authorization': `Basic ${authString}`,
            'User-Agent': 'Mozilla/5.0'
        }
    };

    console.log(`Test Basic Auth ${method}: Sending...`);

    const req = https.request(options, (res) => {
        console.log(`Test Basic Auth ${method} Status: ${res.statusCode}`);
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
            console.log(`Test Basic Auth ${method} Body: ${body.substring(0, 200)}...`);
        });
    });

    req.on('error', (e) => {
        console.error(`Test Basic Auth ${method} Error: ${e.message}`);
    });

    req.end();
}

payloads.forEach((p, i) => setTimeout(() => testPayload(p, i), i * 1000));
setTimeout(() => testBasicAuth('POST'), payloads.length * 1000 + 1000);
setTimeout(() => testBasicAuth('GET'), payloads.length * 1000 + 2000);
