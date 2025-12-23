const https = require('https');

const data = JSON.stringify({
    event: 'payment.success',
    data: {
        reference: 'TEST-REF-' + Date.now(),
        amount: 100,
        customer: { email: 'test@example.com' }
    }
});

const options = {
    hostname: 'www.acctwave.com',
    port: 443,
    path: '/api/pocketfi/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Sending test webhook to https://${options.hostname}${options.path}...`);

const req = https.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
