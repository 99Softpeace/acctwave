require('dotenv').config();
const axios = require('axios');

async function testApiKeyCamel() {
    console.log('--- PocketFi API Key + camelCase Debug Script ---');

    const apiKey = process.env.POCKETFI_API_KEY; // The one we switched to
    console.log('Using API Key:', apiKey ? apiKey.substring(0, 8) + '...' : 'NONE');

    const libPayload = {
        first_name: "DebugCamel",
        last_name: "TesterLib",
        phone: "08012345681",
        email: "debug.camel.lib@example.com",
        businessId: process.env.POCKETFI_BUSINESS_ID || "29663", // camelCase
        bank: "paga"
    };

    console.log('Payload:', JSON.stringify(libPayload, null, 2));

    try {
        const url = 'https://api.pocketfi.ng/api/v1/virtual-accounts/create';

        const response = await axios.post(url, libPayload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`, // API Key
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

testApiKeyCamel();
