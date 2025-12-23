const https = require('https');

// The user's live domain
const HOSTNAME = 'www.acctwave.com';
const PATH = '/api/pocketfi/webhook';

console.log(`Testing Remote Webhook at: https://${HOSTNAME}${PATH}`);

const payload = JSON.stringify({
    event: 'payment.success',
    data: {
        reference: 'SIMULATED-DVA-DEPOSIT-' + Date.now(),
        amount: 500,
        destination_account_number: '3394221183', // Real DVA Number for 404peaceolowosagba@gmail.com
        payment_type: 'bank_transfer'
    }
});

const options = {
    hostname: HOSTNAME,
    path: PATH,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    }
};

const req = https.request(options, (res) => {
    console.log(`Response Status: ${res.statusCode} ${res.statusMessage}`);

    let data = '';
    res.on('data', chunk => data += chunk);

    res.on('end', () => {
        console.log('Response Body:', data);
    });
});

req.on('error', (e) => {
    console.error('CONNECTION ERROR:', e.message);
});

req.write(payload);
req.end();
