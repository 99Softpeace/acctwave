require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://api.pocketfi.ng/api/v1/virtual-accounts/create';
const KEY = process.env.POCKETFI_API_KEY || process.env.POCKETFI_SECRET_KEY;
const ENV_BUS_ID = process.env.POCKETFI_BUSINESS_ID; // 29663
const KEY_PREFIX_ID = KEY ? KEY.split('|')[0] : null; // 10543

const LOG_FILE = 'probe_id_test.txt';

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
    fs.writeFileSync(LOG_FILE, 'Started ID Probe\n');
    log(`Env Bus ID: ${ENV_BUS_ID}`);
    log(`Key Prefix ID: ${KEY_PREFIX_ID}`);

    const ref = `IDTEST-${Date.now()}`;

    // Test 1: Env ID (Number) - Baseline
    await probe('Env ID (Number)', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        type: "static", businessId: Number(ENV_BUS_ID), bank: "090267", reference: ref + 'A', tx_ref: ref + 'A'
    });

    // Test 2: Key Prefix ID (Number)
    if (KEY_PREFIX_ID && KEY_PREFIX_ID !== ENV_BUS_ID) {
        await probe('Key Prefix ID (Number)', {
            first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
            type: "static", businessId: Number(KEY_PREFIX_ID), bank: "090267", reference: ref + 'B', tx_ref: ref + 'B'
        });
    }

    // Test 3: Env ID (String)
    await probe('Env ID (String)', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        type: "static", businessId: String(ENV_BUS_ID), bank: "090267", reference: ref + 'C', tx_ref: ref + 'C'
    });
}

run();
