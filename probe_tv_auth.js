const https = require('https');

const options = {
    hostname: 'www.textverified.com',
    port: 443,
    path: '/api/v2/authentication',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
    }
};

console.log(`Probing POST ${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        console.log('BODY:', d.toString());
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
