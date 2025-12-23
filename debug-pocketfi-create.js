require('dotenv').config({ path: '.env' });
const axios = require('axios');

async function testCreateAccount() {
    console.log('--- PocketFi Direct Debug Script ---');

    // 1. Check Env Vars - TRY PUBLIC KEY
    const secretKey = process.env.POCKETFI_API_KEY; // TRY PUBLIC KEY
    const businessId = process.env.POCKETFI_BUSINESS_ID;

    console.log('Secret Key (Auth):', secretKey ? secretKey.substring(0, 8) + '...' : 'NONE');
    console.log('Business ID:', businessId);

    if (!secretKey) {
        console.error('ERROR: Missing POCKETFI_SECRET_KEY (Required for DVA creation)');
        return;
    }

    // 2. Prepare Payload
    const txRef = `DEBUG-${Date.now()}`;
    const payload = {
        first_name: "Debug",
        last_name: "Tester",
        email: "debug.tester@example.com",
        phone: "08012345678",
        businessId: businessId || "29663", // Fallback to known ID if missing
        bank: "paga",
        reference: txRef,
        tx_ref: txRef
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const url = 'https://api.pocketfi.ng/api/v1/virtual-accounts/create';
        console.log('Requesting URL:', url);

        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('SUCCESS!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('FAILED!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testCreateAccount();
