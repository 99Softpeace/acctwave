require('dotenv').config();
const axios = require('axios');

async function testVerify() {
    console.log('--- PocketFi Verify Key Debug Script ---');
    const secretKey = process.env.POCKETFI_SECRET_KEY;
    console.log('Using Secret Key:', secretKey ? secretKey.substring(0, 8) + '...' : 'NONE');

    // Use a reference check
    const ref = 'DEBUG-1766621872979'; // From previous success

    try {
        const url = `https://api.pocketfi.ng/api/v1/transaction/verify/${ref}`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('SUCCESS! Key is valid.');
    } catch (error) {
        if (error.response) {
            console.log('Status:', error.response.status);
            if (error.response.status === 401) {
                console.error('CONFIRMED: Secret Key is INVALID (401)');
            } else {
                console.log('Secret Key MIGHT be valid, got other error:', error.response.status);
            }
        }
    }
}

testVerify();
