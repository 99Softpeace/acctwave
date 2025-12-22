// Debug script using native fetch (Node 18+)
const crypto = require('crypto');
require('dotenv').config();

// CONFIG
const WEBHOOK_URL = 'http://localhost:3000/api/pf_notify';
const SECRET = process.env.WEBHOOK_SIGNING_SECRET;
const TEST_ACCOUNT_NUMBER = '9876543210'; // We will attempt to use this, or update manually

if (!SECRET) {
    console.error('ERROR: WEBHOOK_SIGNING_SECRET not found in .env');
    process.exit(1);
}

// Payload simulating a transfer success
const payload = {
    event: 'transfer.success', // or just implict from structure
    // Emulating the structure from the logs
    order: {
        amount: "500.00",
        settlement_amount: 498.2,
        fee: 1.8,
        description: "Test Transfer via Script"
    },
    transaction: {
        reference: `PFI|TEST-${Date.now()}`
    },
    account_number: "1934847251", // Example account
    customer: {
        id: 123,
        email: "test@example.com"
    }
};

const rawBody = JSON.stringify(payload);

// Generate Signature
const signature = crypto.createHmac('sha512', SECRET)
    .update(rawBody)
    .digest('hex');

console.log('--- Config ---');
console.log(`URL: ${WEBHOOK_URL}`);
console.log(`Secret (First 5): ${SECRET.substring(0, 5)}...`);
console.log(`Generated Signature: ${signature.substring(0, 10)}...`);
console.log('--- Payload ---');
console.log(rawBody);

async function sendWebhook() {
    try {
        const res = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-pocketfi-signature': signature
            },
            body: rawBody
        });

        console.log('--- Response ---');
        console.log(`Status: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log(`Body: ${text}`);

        if (res.status !== 200) {
            console.log('\n❌ Webhook Failed. Check server terminal for verification errors.');
        } else {
            console.log('\n✅ Webhook Accepted (200 OK). Check DB to see if balance updated.');
        }

    } catch (err) {
        console.error('Request failed:', err.message);
    }
}

sendWebhook();
