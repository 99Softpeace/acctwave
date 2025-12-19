require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://api.pocketfi.ng/api/v1';
const KEY = process.env.POCKETFI_API_KEY || process.env.POCKETFI_SECRET_KEY;
const BUS_ID = process.env.POCKETFI_BUSINESS_ID;

async function probe(endpoint, payload, name) {
    console.log(`\n--- Probing ${name}: ${endpoint} ---`);
    try {
        const res = await axios.post(`${BASE_URL}${endpoint}`, payload, {
            headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' }
        });
        console.log(`✅ ${name} SUCCESS: ${res.status}`);
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        if (e.response) {
            console.log(`❌ ${name} FAILED: ${e.response.status}`);
            console.log('Msg:', e.response.data?.message || JSON.stringify(e.response.data));
        } else {
            console.log(`❌ ${name} ERROR: ${e.message}`);
        }
    }
}

async function run() {
    const ref = `TEST-${Date.now()}`;
    const payloadStatic = {
        first_name: "Test", last_name: "Probe", email: "probe@test.com", phone: "08012345678",
        type: "static", businessId: Number(BUS_ID), bank: "090267", reference: ref, tx_ref: ref
    };

    const payloadSimple = {
        firstname: "Test", lastname: "Probe", email: "probe@test.com", phone: "08012345678",
        bvn: ""
    };

    await probe('/virtual-accounts/create', payloadStatic, 'Virtual-Accounts (Static Payload)');
    await probe('/accounts/create', payloadSimple, 'Accounts (Simple Payload)');
    await probe('/accounts/create', payloadStatic, 'Accounts (Static Payload)');
}

run();
