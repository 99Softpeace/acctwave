const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.TEXTVERIFIED_API_KEY;
const username = process.env.TEXTVERIFIED_EMAIL;

if (!apiKey || !username) {
    console.error('Missing API_KEY or EMAIL in .env');
    process.exit(1);
}

// Subagent findings:
// URL: https://www.textverified.com/api/pub/v2/auth
// Method: POST
// Headers: X-API-KEY, X-API-USERNAME

const options = {
    hostname: 'www.textverified.com',
    port: 443,
    path: '/api/pub/v2/auth', // Trying /api/pub/v2
    method: 'POST',
    headers: {
        'X-API-KEY': apiKey,
        'X-API-USERNAME': username,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
    }
};

console.log(`Testing POST ${options.hostname}${options.path}...`);
console.log(`User: ${username}`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        console.log(`Body: ${data.substring(0, 500)}`);
    });
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
});

req.end();
