
const https = require('https');
require('dotenv').config({ path: '.env' });

const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = process.env.NCWALLET_PIN;

if (!API_KEY) {
    console.error("Missing NCWALLET_API_KEY in .env");
    process.exit(1);
}

// Endpoint identified by browser agent
const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/service/id/data',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${API_KEY}`,
        'trnx_pin': PIN || ''
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            if (res.statusCode !== 200) {
                console.error(`API Error: ${res.statusCode}`);
                console.error(data);
                return;
            }
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.error("Error parsing response:", e);
            console.log("Raw response:", data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
