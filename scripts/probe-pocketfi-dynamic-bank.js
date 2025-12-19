require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://api.pocketfi.ng/api/v1/virtual-accounts/create';
const KEY = process.env.POCKETFI_API_KEY || process.env.POCKETFI_SECRET_KEY;
const BUS_ID = 29663;

const LOG_FILE = 'probe_dynamic_bank.txt';

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
    fs.writeFileSync(LOG_FILE, 'Started Dynamic Bank Probe\n');
    const ref = `DB-${Date.now()}`;

    // Test 1: Dynamic + Kuda (090267)
    await probe('Dynamic + Kuda', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        type: "dynamic",
        businessId: BUS_ID,
        bank: "090267",
        reference: ref + 'A', tx_ref: ref + 'A'
    });

    // Test 2: Dynamic + Wema (000017)
    await probe('Dynamic + Wema', {
        first_name: "Test", last_name: "Probe", email: "probe@wema.com", phone: "08012345678",
        type: "dynamic",
        businessId: BUS_ID,
        bank: "000017",
        reference: ref + 'B', tx_ref: ref + 'B'
    });

    // Test 3: Static + Wema (000017) - Maybe just the bank was the issue?
    await probe('Static + Wema', {
        first_name: "Test", last_name: "Probe", email: "probe@wema.com", phone: "08012345678",
        type: "static",
        businessId: BUS_ID,
        bank: "000017",
        reference: ref + 'C', tx_ref: ref + 'C'
    });
}

run();
