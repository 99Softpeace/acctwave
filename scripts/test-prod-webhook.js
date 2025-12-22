// Test production webhook endpoint
const https = require('https');

const payload = JSON.stringify({
    event: 'transfer.success',
    data: {
        reference: `TEST-${Date.now()}`,
        amount: 100,
        destination_account_number: '1234567890',
        account_number: '0987654321'
    }
});

const options = {
    hostname: 'acctwave.com',
    port: 443,
    path: '/api/pocketfi/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    }
};

console.log('Sending POST to https://acctwave.com/api/pocketfi/webhook');
console.log('Payload:', payload);

const req = https.request(options, (res) => {
    console.log(`\nStatus: ${res.statusCode} ${res.statusMessage}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Response Body:', data);

        if (res.statusCode === 200) {
            console.log('\n✅ SUCCESS! Webhook endpoint is working.');
        } else if (res.statusCode === 403) {
            console.log('\n❌ FORBIDDEN - Signature verification failed.');
        } else if (res.statusCode === 500) {
            console.log('\n❌ SERVER ERROR - Check Vercel logs.');
        } else {
            console.log(`\n⚠️ Unexpected status: ${res.statusCode}`);
        }
    });
});

req.on('error', (e) => {
    console.error('Request failed:', e.message);
});

req.write(payload);
req.end();
