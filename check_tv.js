const https = require('https');

const options = {
    hostname: 'www.textverified.com',
    port: 443,
    path: '/api/v2/targets',
    method: 'GET',
    headers: {
        'User-Agent': 'Mozilla/5.0'
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        // console.log(d.toString()); // Don't print body to avoid clutter
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
