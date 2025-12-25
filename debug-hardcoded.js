
require('dotenv').config({ path: '.env' });
const https = require('https');

// Read directly to avoid accidental trimming issues in code (though .trim() is usually good)
const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = process.env.NCWALLET_PIN;

if (!API_KEY || !PIN) {
    console.error("CRITICAL: Keys missing from .env");
    process.exit(1);
}

// 1. Check IP
function checkIP() {
    return new Promise(resolve => {
        https.get('https://api.ipify.org?format=json', (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`\nYour Public IP: ${json.ip}`);
                    console.log("(Ensure this IP is allowed or the Allowlist is BLANK in Dashboard)\n");
                    resolve();
                } catch (e) { resolve(); }
            });
        }).on('error', () => resolve());
    });
}

// 2. Run Request
async function run() {
    await checkIP();

    console.log(`Using Key: ${API_KEY.substring(0, 10)}... (Length: ${API_KEY.length})`);
    console.log(`Using PIN: ${PIN} (Length: ${PIN.length})`);

    // Check for weird invisible chars
    const pinCodes = [];
    for (let i = 0; i < PIN.length; i++) pinCodes.push(PIN.charCodeAt(i));
    console.log(`PIN Char Codes: [${pinCodes.join(', ')}] (Should be strictly numbers like 48-57)`);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${API_KEY}`,
        'trnx_pin': PIN
    };

    const options = {
        hostname: 'ncwallet.africa',
        path: '/api/v1/user', // Using /user as it requires PIN
        method: 'POST',
        headers: headers
    };

    console.log("Sending Request to /api/v1/user...");
    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`\nHTTP Status: ${res.statusCode}`);
            console.log(`Response Body: ${data}`);

            if (data.includes("Invalid")) {
                console.log("\nCONCLUSION: The API explicitly rejected this PIN/Key combination.");
            }
        });
    });

    req.on('error', e => console.error(e));
    req.write('{}');
    req.end();
}

run();
