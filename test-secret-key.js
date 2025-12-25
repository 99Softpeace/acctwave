require('dotenv').config();
const axios = require('axios');

async function testCreateAccountSecret() {
    console.log('--- PocketFi Secret Key Debug Script ---');

    const secretKey = process.env.POCKETFI_SECRET_KEY;
    console.log('Using Secret Key:', secretKey ? secretKey.substring(0, 8) + '...' : 'NONE');

    if (!secretKey) {
        console.error('ERROR: Missing POCKETFI_SECRET_KEY');
        return;
    }

    const txRef = `DEBUG-SK-${Date.now()}`;
    const payload = {
        first_name: "DebugSecret",
        last_name: "Tester",
        email: "debug.secret@example.com",
        phone: "08012345678",
        business_id: process.env.POCKETFI_BUSINESS_ID || "29663", // Uses snake_case as per library code ?? Library used snake_case but debug used camelCase?
        // Wait, debug script used businessId (camelCase).
        // Library uses business_id (snake_case).
        // Let's try both or stick to one. The API might support both or one.
        // The successful debug used `businessId`.
        businessId: process.env.POCKETFI_BUSINESS_ID || "29663",
        bank: "paga",
        reference: txRef,
        tx_ref: txRef
    };

    // Actually, let's try to match the library payload EXACTLY to see if THAT fails.
    // Library payload:
    // first_name, last_name, phone, email, business_id, bank

    const libPayload = {
        first_name: "DebugSecret",
        last_name: "TesterLib",
        phone: "08012345679",
        email: "debug.secret.lib@example.com",
        business_id: process.env.POCKETFI_BUSINESS_ID,
        bank: "paga"
    };

    console.log('Payload:', JSON.stringify(libPayload, null, 2));

    try {
        const url = 'https://api.pocketfi.ng/api/v1/virtual-accounts/create';

        const response = await axios.post(url, libPayload, {
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('SUCCESS!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('FAILED with Secret Key!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testCreateAccountSecret();
