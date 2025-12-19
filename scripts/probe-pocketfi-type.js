require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://api.pocketfi.ng/api/v1/virtual-accounts/create';
const KEY = process.env.POCKETFI_API_KEY || process.env.POCKETFI_SECRET_KEY;
const BUS_ID = 29663; // Verified valid ID

const LOG_FILE = 'probe_type_test.txt';

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
    fs.writeFileSync(LOG_FILE, 'Started Type Probe\n');
    const ref = `TYPE-${Date.now()}`;

    // Test 1: Dynamic Account (No Bank Code required?)
    await probe('Dynamic Account', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        type: "dynamic",
        businessId: BUS_ID,
        reference: ref + 'A', tx_ref: ref + 'A'
    });

    // Test 2: Static with different bank (if known? trying dummy for error)
    await probe('Static Invalid Bank', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        type: "static",
        businessId: BUS_ID,
        bank: "000000",
        reference: ref + 'B', tx_ref: ref + 'B'
    });
}

run();
