
const axios = require('axios'); // Need to install axios or use fetch in node 18+
const fs = require('fs');
const path = require('path');

async function run() {
    // 1. Load Env
    let apiKey = '';
    let email = '';
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const tokenMatch = envContent.match(/TEXTVERIFIED_API_KEY=(.*)/);
    if (tokenMatch) apiKey = tokenMatch[1].trim();

    const emailMatch = envContent.match(/TEXTVERIFIED_EMAIL=(.*)/);
    if (emailMatch) email = emailMatch[1].trim();

    if (!apiKey || !email) {
        console.error('Missing credentials');
        return;
    }

    console.log('Authenticating...');
    const authRes = await fetch('https://www.textverified.com/api/pub/v2/auth', {
        method: 'POST',
        headers: {
            'X-API-KEY': apiKey,
            'X-API-USERNAME': email,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    if (!authRes.ok) {
        console.error('Auth Failed:', authRes.status, await authRes.text());
        return;
    }

    const authData = await authRes.json();
    const token = authData.bearer_token;
    console.log('Got Bearer Token.');

    // 2. Fetch SMS
    // URL from log 
    const smsUrl = "https://www.textverified.com/api/pub/v2/sms?ReservationId=lr_01KDTX07ACSW3KYR7K3S40SCCC";
    console.log('Fetching SMS...');

    const smsRes = await fetch(smsUrl, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });

    const body = await smsRes.json();
    console.log('SMS BODY:', JSON.stringify(body, null, 2));
}

run();
