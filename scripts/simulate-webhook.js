require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000/api/pocketfi/webhook'; // Local dev server
const SECRET = process.env.WEBHOOK_SIGNING_SECRET || 'your_webhook_secret'; // Fallback if empty in dev
// Note: In a real scenario, you need to ensure WEBHOOK_SIGNING_SECRET is set in .env and matches here.

async function run() {
    // 1. Define a Reference that purportedly exists (or we skip the db check here and just see if the webhook accepts it)
    // To make this robust, we should ideally CREATE a pending transaction first via the API, then verify it.
    // BUT, that requires a session. 
    // New Strategy: We will simulate a webhook for a reference. The webhook code will fail to find the transaction 
    // if we don't assume one exists. 
    // However, the webhook ALSO supports "Dedicated Virtual Account" fallback. 
    // Let's try to hit the webhook with a random reference. The logs will tell us "User not found" or "Transaction not found".
    // 
    // BETTER: Use the "initialize" endpoint to create a real pending transaction first? 
    // We can't easily do that without a user session cookie.

    // SO: We will just test that the webhook receives the payload and signature correctly.
    // If the server logs print "[PocketFi Webhook] Verified Payload", we know the plumbing works.

    console.log('--- Simulating PocketFi Webhook ---');

    const payload = {
        event: 'payment.success',
        data: {
            reference: 'SIM-TEST-' + Date.now(),
            amount: '5000',
            currency: 'NGN',
            customer: {
                email: 'test@example.com'
            }
        }
    };

    const rawBody = JSON.stringify(payload);

    // Generate Signature
    // If WEBHOOK_SIGNING_SECRET is missing in .env, this test will fail on the server side 
    // (unless server also lacks it, but code checks for it).
    if (!process.env.WEBHOOK_SIGNING_SECRET) {
        console.warn('⚠️ WEBHOOK_SIGNING_SECRET not found in local process.env. Ensure .env has it.');
    }

    const signature = crypto.createHmac('sha512', process.env.WEBHOOK_SIGNING_SECRET || '')
        .update(rawBody)
        .digest('hex');

    console.log(`Sending Webhook to ${BASE_URL}...`);
    console.log(`Ref: ${payload.data.reference}`);
    console.log(`Signature: ${signature.substring(0, 10)}...`);

    try {
        const res = await axios.post(BASE_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-pocketfi-signature': signature
            }
        });
        console.log(`✅ RESPONSE: ${res.status}`);
        console.log(res.data);
    } catch (e) {
        if (e.response) {
            console.log(`❌ FAILED: ${e.response.status}`);
            console.log(e.response.data);
        } else {
            console.log(`❌ ERROR: ${e.message}`);
        }
    }
}

run();
