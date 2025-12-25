
require('dotenv').config({ path: '.env' });
const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = "2171";
const https = require('https');

function test(label, authHeader) {
    const options = {
        hostname: 'ncwallet.africa',
        path: '/api/v1/user',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
            'trnx_pin': PIN
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            const isSuccess = data.includes("success") && !data.includes("error");
            console.log(`\n[${label}] Status: ${res.statusCode}`);
            console.log(`Success?: ${isSuccess}`);
            if (!isSuccess) console.log(`Error Snippet: ${data.substring(0, 100)}...`);
        });
    });
    req.write('{}');
    req.end();
}

console.log(`Testing Space with PIN: ${PIN}`);

test("No Space", `nc_afr_apikey${API_KEY}`);
test("With Space", `nc_afr_apikey ${API_KEY}`);
