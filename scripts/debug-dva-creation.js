require('dotenv').config({ path: '.env' });

const POCKETFI_API_KEY = process.env.POCKETFI_API_KEY;
// IMPORTANT: Use the URL from src/lib/pocketfi.ts
const BASE_URL = 'https://api.pocketfi.ng/api/v1';

async function testCreateAccount() {
    if (!POCKETFI_API_KEY) {
        console.error('ERROR: POCKETFI_API_KEY is missing in .env');
        return;
    }

    const businessId = process.env.POCKETFI_BUSINESS_ID || POCKETFI_API_KEY.split('|')[0];
    console.log(`Using Business ID: ${businessId}`);

    const payload = {
        first_name: "Test",
        last_name: "User",
        phone: "08012345678",
        email: "test_dva_debug@example.com",
        businessId: businessId,
        bank: "paga"
    };

    console.log('Sending Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`${BASE_URL}/virtual-accounts/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${POCKETFI_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`Response Status: ${response.status}`);
        const data = await response.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Network Error:', error);
    }
}

testCreateAccount();
