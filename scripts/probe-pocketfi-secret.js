require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://api.pocketfi.ng/api/v1/virtual-accounts/create';
// FORCE SECRET KEY
const KEY = process.env.POCKETFI_SECRET_KEY;
const BUS_ID = process.env.POCKETFI_BUSINESS_ID;

const LOG_FILE = 'probe_secret_test.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function probe(label, payload) {
    log(`\n--- Testing ${label} ---`);
    log(`Using Key: ${KEY ? KEY.substring(0, 5) + '...' : 'NONE'}`);
    log(`Payload: ${JSON.stringify(payload)}`);

    if (!KEY) {
        log('❌ SKIPPING: No Secret Key found.');
        return;
    }

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
    fs.writeFileSync(LOG_FILE, 'Started Secret Key Probe\n');
    const ref = `SEC-${Date.now()}`;

    // 1. Secret Key + businessId (camel)
    await probe('Secret Key + businessId (camel)', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "09065903789",
        type: "static",
        businessId: Number(BUS_ID),
        bank: "090267",
        reference: ref + 'A', tx_ref: ref + 'A'
    });

    // 2. Secret Key + business_id (snake) - Just in case
    await probe('Secret Key + business_id (snake)', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "09065903789",
        type: "static",
        business_id: String(BUS_ID),
        bank: "090267",
        reference: ref + 'B', tx_ref: ref + 'B'
    });
}

run();
