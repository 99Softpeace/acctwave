require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://api.pocketfi.ng/api/v1';
const KEY = process.env.POCKETFI_API_KEY || process.env.POCKETFI_SECRET_KEY;
const ENV_BUS_ID = process.env.POCKETFI_BUSINESS_ID;
const SCREENSHOT_BUS_ID = "29492";

const LOG_FILE = 'probe_support_test.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function probe(endpoint, label, payload) {
    log(`\n--- Testing ${label} (${endpoint}) ---`);
    log(`Payload: ${JSON.stringify(payload)}`);
    try {
        const res = await axios.post(`${BASE_URL}${endpoint}`, payload, {
            headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }
        });
        log(`✅ SUCCESS: ${res.status}`);
        log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        if (e.response) {
            log(`❌ FAILED: ${e.response.status}`);
            log('Msg: ' + (e.response.data?.message || JSON.stringify(e.response.data)));
            if (e.response.data.errors) {
                log('Errors: ' + JSON.stringify(e.response.data.errors));
            }
        } else {
            log(`❌ ERROR: ${e.message}`);
        }
    }
}

async function run() {
    fs.writeFileSync(LOG_FILE, 'Started Support Probe\n');
    const ref = `SUP-${Date.now()}`;

    // 1. Test CHECKOUT with snake_case (matches screenshot)
    // This verifies if 'business_id' is the correct key naming convention for the API generally.
    await probe('/checkout/request', 'Checkout (Screenshot Style)', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "09065903789",
        business_id: String(ENV_BUS_ID), // Try env ID first
        amount: "100",
        redirect_link: "https://example.com"
    });

    // 2. Test CHECKOUT with Screenshot ID
    await probe('/checkout/request', 'Checkout (Screenshot ID)', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "09065903789",
        business_id: SCREENSHOT_BUS_ID,
        amount: "100",
        redirect_link: "https://example.com"
    });

    // 3. Test VIRTUAL ACCOUNT with Screenshot ID and snake_case
    // If checkout works with snake_case, this should theoretically work too if the endpoint supports it.
    await probe('/virtual-accounts/create', 'Virtual Account (Screenshot details)', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "09065903789",
        type: "static",
        business_id: SCREENSHOT_BUS_ID,
        bank: "090267",
        reference: ref, tx_ref: ref
    });
}

run();
