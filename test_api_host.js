const https = require('https');

function check(host) {
    const options = {
        hostname: host,
        port: 443,
        path: '/v2/targets', // Note: /api/v2/targets on www, maybe /v2/targets on api? or /api/v2?
        // documentation says base url is usually https://www.textverified.com/api/v2
        // let's try path '/api/v2/targets' first
        path: '/api/v2/targets',
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' }
    };

    console.log(`Checking ${host}...`);
    const req = https.request(options, (res) => {
        console.log(`${host} Status: ${res.statusCode}`);
        if (res.statusCode >= 300 && res.statusCode < 400) console.log(`Location: ${res.headers.location}`);
    });
    req.on('error', e => console.error(`${host} Error: ${e.message}`));
    req.end();
}

check('api.textverified.com');
