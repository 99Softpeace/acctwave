require('dotenv').config({ path: '.env' });
const axios = require('axios');

async function testCreateAccount() {
    console.log('--- PocketFi Direct Debug Script ---');

    // 1. Check Env Vars - PRIORITIZE API KEY AS BEARER TOKEN
    const secretKey = process.env.POCKETFI_API_KEY || process.env.POCKETFI_SECRET_KEY;
    const businessId = process.env.POCKETFI_BUSINESS_ID;

    console.log('Auth Token Present:', !!secretKey);
    console.log('Token Start:', secretKey ? secretKey.substring(0, 8) + '...' : 'NONE');
    console.log('Business ID:', businessId);

    if (!secretKey || !businessId) {
        console.error('ERROR: Missing Env Vars (POCKETFI_API_KEY or POCKETFI_BUSINESS_ID)');
        return;
    }

    // 2. Prepare Payload
    const txRef = `DEBUG-${Date.now()}`;
    const payload = {
        first_name: "Debug",
        last_name: "Tester",
        email: "debug.tester@example.com",
        phone: "08012345678",
        type: "static",
        businessId: Number(businessId), // Try sending as number
        bank: "090267", // CBN Code for Kuda
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
