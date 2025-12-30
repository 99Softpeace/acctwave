const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const email = process.env.TEXTVERIFIED_EMAIL;
const apiKey = process.env.TEXTVERIFIED_API_KEY;

function check(host, path, method, headers, payload) {
    const options = {
        hostname: host,
        port: 443,
        path: path,
        method: method,
        headers: {
            'User-Agent': 'Mozilla/5.0',
            ...headers
        }
    };

    const bodyStr = payload ? JSON.stringify(payload) : '';
    if (bodyStr) {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = bodyStr.length;
    }

    const req = https.request(options, (res) => {
        console.log(`[${host}${path}] ${method} -> ${res.statusCode}`);
        if (res.statusCode >= 300 && res.statusCode < 400) {
            console.log(`   Location: ${res.headers.location}`);
        }
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
            if (data.includes('Access denied') || data.includes('Cloudflare') || data.includes('challenge')) {
                console.log('   Body: BLOCKED (Cloudflare/Challenge detected)');
            } else if (data.includes('<html')) {
                console.log('   Body: HTML Page (Title: ' + (data.match(/<title>(.*?)<\/title>/) || [''])[1] + ')');
            } else {
                console.log('   Body: ' + data.substring(0, 100));
            }
        });
    });

    req.on('error', e => console.error(`   Error: ${e.message}`));
    if (bodyStr) req.write(bodyStr);
    req.end();
}

// Test WWW
check('www.textverified.com', '/api/v2/targets', 'GET', { 'Authorization': `Bearer ${apiKey}` });
check('www.textverified.com', '/api/v2/authentication', 'POST', { 'Authorization': `Basic ${Buffer.from(email + ':' + apiKey).toString('base64')}` });
check('www.textverified.com', '/api/v2/authentication', 'POST', {}, { email, key: apiKey });

// Test API subdomains?
check('api.textverified.com', '/v2/targets', 'GET', { 'Authorization': `Bearer ${apiKey}` });
