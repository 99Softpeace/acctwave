const https = require('https');
require('dotenv').config();

const API_KEY = process.env.TEXTVERIFIED_API_KEY;
const API_USER = process.env.TEXTVERIFIED_EMAIL;

// Try V1 Authentication & Targets
function getV1Targets() {
    return new Promise((resolve, reject) => {
        // V1 uses Basic Auth or specific headers? 
        // Docs (Recalled): V1 uses 'Authorization: Basic base64(user:key)'? 
        // Or 'X-API-KEY'?
        // Let's try the same auth headers first, but V1 endpoint.
        // Actually V1 usually is 'Basic' auth.

        const auth = 'Basic ' + Buffer.from(API_USER + ':' + API_KEY).toString('base64');

        const req = https.request('https://www.textverified.com/api/pub/v1/targets', {
            method: 'GET',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = ''; res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    console.log("V1 Status:", res.statusCode);
                    if (res.statusCode === 200) {
                        const json = JSON.parse(data);
                        console.log("V1 Targets Count:", json.length);
                        if (json.length > 0) console.log("Sample:", json[0]);
                        resolve(json);
                    } else {
                        console.log("V1 Error:", data.substring(0, 500));
                        resolve(null);
                    }
                } catch (e) { reject(e); }
            });
        });
        req.end();
    });
}

(async () => {
    await getV1Targets();
})();
