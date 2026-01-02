require('dotenv').config();

const TEXTVERIFIED_API_KEY = process.env.TEXTVERIFIED_API_KEY;
const TEXTVERIFIED_EMAIL = process.env.TEXTVERIFIED_EMAIL;

async function check() {
    console.log('Authenticating...');
    const authRes = await fetch('https://www.textverified.com/api/pub/v2/auth', {
        method: 'POST',
        headers: {
            'X-API-KEY': TEXTVERIFIED_API_KEY,
            'X-API-USERNAME': TEXTVERIFIED_EMAIL,
            'Content-Type': 'application/json'
        },
        cache: 'no-store'
    });

    if (!authRes.ok) {
        console.error('Auth Failed:', authRes.status, await authRes.text());
        return;
    }

    const authData = await authRes.json();
    const token = authData.token || authData.bearer_token;
    console.log('Got Token.');

    const tvId = 'lr_01KDXM0QDC5Z4R00RAGR4W1BBW';
    console.log(`Fetching details for: ${tvId}`);

    const res = await fetch(`https://www.textverified.com/api/pub/v2/verifications/${tvId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const raw = await res.json();
    console.log('--- RAW RESPONSE ---');
    console.log(JSON.stringify(raw, null, 2));

    const data = raw.Data || raw;
    if (data.code || data.smsCode) {
        console.log(`\n🎉 FOUND CODE: ${data.code || data.smsCode}`);
    } else {
        console.log('\n❌ NO CODE in response.');
    }
}

check();
