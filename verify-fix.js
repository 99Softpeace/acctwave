
require('dotenv').config({ path: '.env' });
const https = require('https');

// Simulate the corruption fix by splitting/trimming
let apiKey = (process.env.NCWALLET_API_KEY || '').trim();
let pin = (process.env.NCWALLET_PIN || '').trim();

// If PIN is super long, it's likely merged with something else
if (pin.length > 4) {
    console.log(`Detected corrupted PIN (${pin.length} chars). Attempting to extract first 4 chars.`);
    pin = pin.substring(0, 4);
}

// Fallback to hardcoded if env is totally borked, just to test the API interaction
const HARD_PIN = "2171";
if (pin !== HARD_PIN) {
    console.log(`Env PIN '${pin}' does not match Hardcoded '${HARD_PIN}'. Using Hardcoded for safety test.`);
    pin = HARD_PIN;
}

console.log(`Using API_KEY: ${apiKey.substring(0, 10)}... (Length: ${apiKey.length})`);
console.log(`Using PIN: ${pin} (Length: ${pin.length})`);

const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${apiKey}`,
        'trnx_pin': pin
    }
};

console.log("Testing POST /user with Trimmed/Fixed Credentials...");

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${data}`);
    });
});

req.write(JSON.stringify({}));
req.end();
