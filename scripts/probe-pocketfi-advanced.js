require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://api.pocketfi.ng/api/v1/virtual-accounts/create';
const KEY = process.env.POCKETFI_API_KEY || process.env.POCKETFI_SECRET_KEY;
const BUS_ID = process.env.POCKETFI_BUSINESS_ID;

async function probe(label, payload) {
    console.log(`\n--- Testing: ${label} ---`);
    try {
        const res = await axios.post(BASE_URL, payload, {
            headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }
        });
        console.log(`✅ SUCCESS: ${res.status}`);
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        if (e.response) {
            console.log(`❌ FAILED: ${e.response.status}`);
            console.log('Msg:', e.response.data?.message || JSON.stringify(e.response.data));
        } else {
            console.log(`❌ ERROR: ${e.message}`);
        }
    }
}

async function run() {
    const ref = `PROBE-${Date.now()}`;

    // Variation 1: BusinessID as String
    await probe('BusinessID String', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        type: "static", businessId: String(BUS_ID), bank: "090267", reference: ref + 'A', tx_ref: ref + 'A'
    });

    // Variation 2: No Bank
    await probe('No Bank', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        type: "static", businessId: Number(BUS_ID), reference: ref + 'B', tx_ref: ref + 'B'
    });

    // Variation 3: Dynamic Account (no type: static)
    await probe('Dynamic Account', {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        businessId: Number(BUS_ID), reference: ref + 'C', tx_ref: ref + 'C'
    });

    // Variation 4: Minimal
    await probe('Minimal', {
        firstname: "Test", lastname: "Probe", email: "probe@test.com", phone: "08012345678",
        bvn: ""
    });
}

run();
