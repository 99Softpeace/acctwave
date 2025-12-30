const https = require('https');
require('dotenv').config();

const API_KEY = process.env.TEXTVERIFIED_API_KEY;
const API_USER = process.env.TEXTVERIFIED_EMAIL;

if (!API_KEY || !API_USER) {
    console.error("Missing credentials");
    process.exit(1);
}

function getToken() {
    return new Promise((resolve, reject) => {
        const req = https.request('https://www.textverified.com/api/pub/v2/auth', {
            method: 'POST',
            headers: { 'X-API-KEY': API_KEY, 'X-API-USERNAME': API_USER, 'Content-Type': 'application/json' }
        }, (res) => {
            let data = ''; res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data).token); } catch (e) { reject(e); } });
        });
        req.end();
    });
}

function checkEndpoint(token, path) {
    return new Promise((resolve, reject) => {
        console.log(`Checking ${path}...`);
        const req = https.request(`https://www.textverified.com${path}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let data = ''; res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (Array.isArray(json) && json.length > 0) {
                        console.log(`[${path}] First item:`, json[0]);
                        // Check for 'cost', 'price', 'amount'
                    } else {
                        console.log(`[${path}] Response:`, data.substring(0, 500));
                    }
                    resolve(json);
                } catch (e) {
                    console.log(`[${path}] Raw:`, data.substring(0, 500));
                    resolve(data);
                }
            });
        });
        req.end();
    });
}

(async () => {
    try {
        const token = await getToken();
        console.log("Got token.");

        await checkEndpoint(token, '/api/pub/v2/targets');
        await checkEndpoint(token, '/api/pub/v2/services/1'); // Try ID
        await checkEndpoint(token, '/api/pub/v2/services/whatsapp'); // Try Name

    } catch (e) { console.error(e); }
})();
