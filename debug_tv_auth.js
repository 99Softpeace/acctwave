const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const email = process.env.TEXTVERIFIED_EMAIL;
const apiKey = process.env.TEXTVERIFIED_API_KEY;

function debugRequest(name, method, path, headers, bodyObj) {
    const bodyStr = bodyObj ? JSON.stringify(bodyObj) : '';
    const options = {
        hostname: 'www.textverified.com',
        port: 443,
        path: path,
        method: method,
        headers: {
            'User-Agent': 'Mozilla/5.0',
            ...headers
        }
    };
    if (bodyStr) {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = bodyStr.length;
    }

    console.log(`[${name}] ${method} ${path}`);

    const req = https.request(options, (res) => {
        console.log(`[${name}] Status: ${res.statusCode}`);
        if (res.statusCode === 302 || res.statusCode === 301) {
            console.log(`[${name}] Location: ${res.headers.location}`);
        }

        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
            console.log(`[${name}] Body: ${data.substring(0, 500)}`); // Print valid substring
        });
    });

    req.on('error', e => console.error(`[${name}] Error: ${e.message}`));

    if (bodyStr) req.write(bodyStr);
    req.end();
}

// 1. Check if current API Key works as Bearer (Simple Auth)
debugRequest('SimpleAuth', 'GET', '/api/v2/targets', { 'Authorization': `Bearer ${apiKey}` });

// 2. Check Basic Auth on Authentication Endpoint
const basicAuth = Buffer.from(`${email}:${apiKey}`).toString('base64');
debugRequest('BasicAuth', 'POST', '/api/v2/authentication', { 'Authorization': `Basic ${basicAuth}` });

// 3. Check JSON Payload on Authentication Endpoint
debugRequest('JsonAuth', 'POST', '/api/v2/authentication', {}, { email: email, key: apiKey });
debugRequest('JsonAuth2', 'POST', '/api/v2/authentication', {}, { username: email, password: apiKey });
