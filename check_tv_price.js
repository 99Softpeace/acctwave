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

function checkTarget(token, serviceName) {
    return new Promise((resolve, reject) => {
        // Try to get info for a specific service (using serviceName as ID? or is there a target lookup?)
        // V2 Docs imply we can query targets? Let's try to find how to get price.
        // Trying GET /services/{id} or similar?
        console.log(`Checking service: ${serviceName}`);

        // Strategy 1: Check if there is a specific endpoint for detail
        // Docs (Recalled): /services usually just lists them.
        // Maybe POST /verifications with 'test' or something? No, that buys.

        // Let's try fetching the service list again and see if ANY item has cost, or if I missed it.
        // Or maybe Query Param?

        // Also checking headers.
        const req = https.request(`https://www.textverified.com/api/pub/v2/services?reservationType=renewable&numberType=mobile`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let data = ''; res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const list = JSON.parse(data);
                    const item = list.find(s => s.serviceName === serviceName || s.name === serviceName);
                    console.log("Service Item Found:", item);
                    resolve(item);
                } catch (e) { reject(e); }
            });
        });
        req.end();
    });
}

(async () => {
    try {
        const token = await getToken();
        console.log("Got token.");
        await checkTarget(token, 'whatsapp');
    } catch (e) { console.error(e); }
})();
