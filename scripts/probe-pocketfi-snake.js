require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://api.pocketfi.ng/api/v1/virtual-accounts/create';
const KEY = process.env.POCKETFI_API_KEY || process.env.POCKETFI_SECRET_KEY;
const BUS_ID = process.env.POCKETFI_BUSINESS_ID;

const LOG_FILE = 'probe_snake_output.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function probe(label, payload) {
    log(`\n--- Testing: ${label} ---`);
    log(`Payload: ${JSON.stringify(payload)}`);
    try {
        const res = await axios.post(BASE_URL, payload, {
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
    fs.writeFileSync(LOG_FILE, 'Started Probe\n');
    const ref = `SNAKE-${Date.now()}`;

    // Variation 1: business_id (snake_case)
    await probe('Snake Case business_id', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        type: "static",
        business_id: BUS_ID, // Snake case
        bank: "090267",
        reference: ref + 'A', tx_ref: ref + 'A'
    });

    // Variation 2: business_id (snake string) + businessId (camel)
    await probe('Both Cases', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        type: "static",
        business_id: String(BUS_ID),
        businessId: String(BUS_ID),
        bank: "090267",
        reference: ref + 'B', tx_ref: ref + 'B'
    });
}

run();
