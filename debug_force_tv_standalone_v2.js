
const fs = require('fs');
const path = require('path');

// 1. Env Loader
let apiKey = '';
let email = '';
try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const tokenMatch = envContent.match(/TEXTVERIFIED_API_KEY=(.*)/);
    if (tokenMatch) apiKey = tokenMatch[1].trim();
    const emailMatch = envContent.match(/TEXTVERIFIED_EMAIL=(.*)/);
    if (emailMatch) email = emailMatch[1].trim();
} catch (e) {
    console.error('Failed to read .env', e);
}

// 2. Simple Fetch Wrapper
async function request(url, options) {
    console.log(`REQ: ${url}`);
    const res = await fetch(url, options);
    const body = await res.text();
    console.log(`RES STATUS: ${res.status}`);
    return { status: res.status, body };
}

// 3. Auth Logic
async function getToken() {
    console.log('Authenticating...');
    const res = await request('https://www.textverified.com/api/pub/v2/auth', {
        method: 'POST',
        headers: {
            'X-API-KEY': apiKey,
            'X-API-USERNAME': email,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        cache: 'no-store'
    });

    if (res.status !== 200) throw new Error('Auth Failed: ' + res.body);
    const json = JSON.parse(res.body);
    console.log('AUTH RESPONSE KEYS:', Object.keys(json));
    return json.bearer_token || json.simple_token || json.token;
}

// 4. Main Verification Logic
async function run() {
    try {
        const bearer = await getToken();
        console.log('Got Bearer Token.');

        const targetId = "lr_01KDV1A6B3YA3WVBGHZD0T9MXJ"; // UPDATED ID
        console.log(`Checking Verif ID: ${targetId}`);

        const res = await request(`https://www.textverified.com/api/pub/v2/verifications/${targetId}`, {
            headers: { 'Authorization': `Bearer ${bearer}`, 'Accept': 'application/json' }
        });

        console.log('--- MAIN RESPONSE BODY ---');
        console.log(res.body.substring(0, 1000));

        let json;
        try {
            json = JSON.parse(res.body);
        } catch (e) {
            console.error('Failed to parse Main Response JSON');
            return;
        }

        console.log('STATUS:', json.status);
        console.log('CODE FIELD:', json.code);
        console.log('SMS object:', JSON.stringify(json.sms, null, 2));

        if (json.sms && json.sms.href) {
            console.log('--- FOLLOWING HREF ---');
            console.log('HREF:', json.sms.href);

            const smsRes = await request(json.sms.href, {
                headers: { 'Authorization': `Bearer ${bearer}`, 'Accept': 'application/json' }
            });

            console.log('--- SMS DETAIL RESPONSE BODY ---');
            console.log(smsRes.body);
        }

    } catch (e) {
        console.error('ERROR:', e);
    }
}

run();
