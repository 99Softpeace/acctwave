const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.TEXTVERIFIED_API_KEY;

const commonHeaders = {
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Referer': 'https://www.textverified.com/verification',
    'Origin': 'https://www.textverified.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
};

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'PostmanRuntime/7.36.0' // Sometimes works dev tools
];

const hosts = [
    'www.textverified.com',
    'api.textverified.com'
];

function testRequest(host, uaName, uaString) {
    return new Promise((resolve) => {
        const options = {
            hostname: host,
            port: 443,
            path: '/api/v2/targets',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`, // specific to Simple Auth just to test connectivity
                'User-Agent': uaString,
                ...commonHeaders
            }
        };

        // Adjust path for api subdomain if needed (often it's just /v2/... without /api)
        if (host === 'api.textverified.com') options.path = '/v2/targets';

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                const isJson = res.headers['content-type']?.includes('application/json');
                const isHtml = data.includes('<html');
                const title = isHtml ? (data.match(/<title>(.*?)<\/title>/) || [])[1] : 'N/A';

                console.log(`[${host}] [${uaName}] -> Status: ${res.statusCode} | JSON: ${isJson} | HTML Title: ${title}`);
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`[${host}] Error: ${e.message}`);
            resolve();
        });
        req.end();
    });
}

async function runTests() {
    console.log('--- Starting Stealth Connectivity Tests ---');
    for (const host of hosts) {
        for (let i = 0; i < userAgents.length; i++) {
            await testRequest(host, `UA-${i}`, userAgents[i]);
            await new Promise(r => setTimeout(r, 1000)); // delay
        }
    }
}

runTests();
