const https = require('https');
require('dotenv').config();

const API_KEY = process.env.TEXTVERIFIED_API_KEY;
const API_USER = process.env.TEXTVERIFIED_EMAIL;

if (!API_KEY || !API_USER) {
    console.error("Missing credentials");
    process.exit(1);
}

// 1. Get Token
function getToken() {
    return new Promise((resolve, reject) => {
        const req = https.request('https://www.textverified.com/api/pub/v2/auth', {
            method: 'POST',
            headers: {
                'X-API-KEY': API_KEY,
                'X-API-USERNAME': API_USER,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.token || json.bearer_token);
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

function getServices(token) {
    return new Promise((resolve, reject) => {
        const req = https.request('https://www.textverified.com/api/pub/v2/services?reservationType=verification&numberType=mobile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

(async () => {
    try {
        console.log("Getting token...");
        const token = await getToken();
        console.log("Got token.");
        console.log("Fetching services...");
        const services = await getServices(token);
        console.log(`Total items: ${services.length}`);

        const terms = ['whatsapp', 'what', 'facebook', 'meta'];
        terms.forEach(term => {
            const matches = services.filter(s =>
                (s.serviceName && s.serviceName.toLowerCase().includes(term)) ||
                (s.name && s.name.toLowerCase().includes(term))
            );
            console.log(`Containing '${term}': ${matches.length}`);
            if (matches.length > 0 && matches.length < 10) console.log(matches.map(s => s.serviceName));
            else if (matches.length >= 10) console.log(matches.slice(0, 3).map(s => s.serviceName));
        });
    } catch (e) {
        console.error(e);
    }
})();
