const https = require('https');

const payload = JSON.stringify({
    order: {
        amount: "1000.00",
        settlement_amount: 990,
        fee: 10,
        description: "Second Deposit Test"
    },
    transaction: {
        reference: "PFI|TEST_SECOND_DEPOSIT_v1"
    },
    account_number: "3394221183",
    customer: {
        id: 15512,
        email: "404peaceolowosagba@gmail.com"
    }
});

console.log('Sending Second Deposit Payload:', payload);

const options = {
    hostname: 'www.acctwave.com',
    path: '/api/pocketfi/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    }
};

const req = https.request(options, (res) => {
    console.log(`Response Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Response Body:', data));
});

req.on('error', (e) => console.error('Request Error:', e));

req.write(payload);
req.end();
