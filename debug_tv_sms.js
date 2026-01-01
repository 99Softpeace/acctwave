
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env for Bearer token
let bearerToken = '';
try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/TEXTVERIFIED_API_KEY=(.*)/);
    if (match) bearerToken = match[1].trim();
} catch (e) {
    console.error('Failed to read .env', e);
    process.exit(1);
}

// The URL from the log
const url = "https://www.textverified.com/api/pub/v2/sms?ReservationId=lr_01KDTX07ACSW3KYR7K3S40SCCC";

const options = {
    headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json'
    }
};

console.log(`Fetching: ${url}`);

https.get(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Body:', data);
        try {
            const json = JSON.parse(data);
            console.log('Parsed:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Raw body (not json):', data);
        }
    });
}).on('error', (e) => {
    console.error(e);
});
