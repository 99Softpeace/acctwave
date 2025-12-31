const https = require('https');
require('dotenv').config();

const API_KEY = process.env.TEXTVERIFIED_API_KEY;
const API_USER = process.env.TEXTVERIFIED_EMAIL;

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
        console.log(`Fetching Services...`);
        const req = https.request('https://www.textverified.com/api/pub/v2/services?reservationType=verification&numberType=mobile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let data = ''; res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (Array.isArray(json)) {
                        const whatsapp = json.find(s => (s.name || s.serviceName || '').toLowerCase().includes('whatsapp'));
                        console.log("Raw WhatsApp Object:", JSON.stringify(whatsapp, null, 2));
                        console.log("First Item Object:", JSON.stringify(json[0], null, 2));
                    } else {
                        console.log("Not an array:", data.substring(0, 500));
                    }
                    resolve();
                } catch (e) { console.error(e); resolve(); }
            });
        });
        req.end();
    });
}

(async () => {
    try {
        const token = await getToken();
        await getServices(token);
    } catch (e) { console.error(e); }
})();
