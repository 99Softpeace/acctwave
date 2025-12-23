const https = require('https');

const payload = JSON.stringify({
    order: {
        amount: "100.00",
        settlement_amount: 99.1,
        fee: 0.9,
        description: "3394221183 received 100.00 from PEACE AYOMIDE OLOWOSAGBA"
    },
    transaction: {
        reference: "PFI|100004251223133518148301707449"
    },
    account_number: "3394221183", // The correct account number
    customer: {
        id: 15512,
        email: "404peaceolowosagba@gmail.com"
    }
});

console.log('Sending DVA Payload:', payload);

const options = {
    hostname: 'www.acctwave.com',
    path: '/api/pocketfi/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
        // No signature needed as verification is disabled in debug mode
    }
};

const req = https.request(options, (res) => {
    console.log(`Response Status: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', data);
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.write(payload);
req.end();
