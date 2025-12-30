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

function getServices(token) {
    return new Promise((resolve, reject) => {
        const req = https.request('https://www.textverified.com/api/pub/v2/services?reservationType=verification&numberType=mobile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let data = ''; res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
        });
        req.end();
    });
}

(async () => {
    try {
        const token = await getToken();
        console.log("Got token.");
        const services = await getServices(token);
        console.log(`Total: ${services.length}`);

        const names = services.map(s => s.serviceName || s.name);
        const unique = new Set(names);
        console.log(`Unique: ${unique.size}`);

        if (unique.size !== services.length) {
            console.log("DUPLICATES FOUND!");
            const counts = {};
            names.forEach(n => counts[n] = (counts[n] || 0) + 1);
            Object.entries(counts).filter(([n, c]) => c > 1).slice(0, 10).forEach(([n, c]) => console.log(`${n}: ${c}`));
        } else {
            console.log("No duplicates.");
        }
    } catch (e) { console.error(e); }
})();
