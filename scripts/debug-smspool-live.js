require('dotenv').config();
const API_KEY = process.env.SMSPOOL_API_KEY;
const BASE_URL = 'https://api.smspool.net';
const fs = require('fs');

async function request(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('key', API_KEY);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

    const res = await fetch(url);
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return { error: 'Invalid JSON', raw: text };
    }
}

async function run() {
    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    // Broader search: RU is often cheap.
    const countries = ['0', '1', '6', '16', '73', '2']; // RU, US, DE, UK, NL, KZ
    let target = null;

    log('Searching 6 countries for ANY service under $0.80...');

    for (const c of countries) {
        log(`Checking Country ${c}...`);
        const services = await request('/service/retrieve_all', { country: c });

        if (!Array.isArray(services)) {
            log('Error fetching services: ' + JSON.stringify(services));
            continue;
        }

        // Find strictly cheapest in this country
        // Normalize price fields
        const valid = services
            .map(s => ({ ...s, _price: parseFloat(s.cost || s.rate || s.price || 999) }))
            .filter(s => s._price < 0.80 && s._price > 0.01); // Min 0.01 to avoid weird bugs

        if (valid.length > 0) {
            valid.sort((a, b) => a._price - b._price);
            target = { ...valid[0], country: c };
            log(`Found candidate: ${target.name} ($${target._price}) in ${c}`);
            break; // Stop at first valid cheap one
        }
    }

    if (!target) {
        log('FAILED: No cheap services found anywhere.');
        fs.writeFileSync('debug-smspool-fail.txt', output);
        return;
    }

    // Purchase
    log(`\nBUYING: ${target.name} (ID: ${target.ID}) in Country ${target.country}...`);
    const order = await request('/purchase/sms', { country: target.country, service: target.ID });

    log('ORDER RESPONSE:');
    log(JSON.stringify(order, null, 2));

    if (order.success === 0 || !order.order_id) {
        log('Purchase failed.');
    } else {
        const id = order.order_id;
        log(`\nSUCCESS! Order ID: ${id}`);
        log('Sleeping 2s...');
        await new Promise(r => setTimeout(r, 2000));

        log(`Checking Status for ${id}...`);
        const check = await request('/check/sms', { orderid: id });

        log('CHECK RESPONSE (RAW JSON):');
        log(JSON.stringify(check, null, 2)); // THIS IS WHAT WE NEED

        // Cancel immediately to save funds
        log('\nCancelling order...');
        const cancel = await request('/cancel/sms', { orderid: id });
        log('Cancel Response: ' + JSON.stringify(cancel));
    }

    fs.writeFileSync('debug-smspool-live.txt', output);
    console.log('\nReport saved to debug-smspool-live.txt');
}

run();
