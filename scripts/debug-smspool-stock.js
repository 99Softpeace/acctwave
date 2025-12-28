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

    // Try finding "Discord" or "Telegram" in RU (0) or UK (16)
    const targets = [
        { country: '0', name: 'Discord' },
        { country: '0', name: 'Telegram' },
        { country: '16', name: 'Discord' }, // UK usually has stock
        { country: '16', name: 'Telegram' },
        { country: '1', name: 'Discord' } // US
    ];

    let orderId = null;

    for (const t of targets) {
        log(`\nChecking ${t.name} in Country ${t.country}...`);

        // 1. Find Service ID
        const services = await request('/service/retrieve_all', { country: t.country });
        if (!Array.isArray(services)) continue;

        const service = services.find(s => s.name.toLowerCase().includes(t.name.toLowerCase()));
        if (!service) {
            log('Service not found in list.');
            continue;
        }
        log(`Found Service ID: ${service.ID}`);

        // 2. Check Price
        const priceRes = await request('/request/price', { country: t.country, service: service.ID });
        const price = parseFloat(priceRes.high_price || priceRes.rate || priceRes.price || 999);
        log(`Price: $${price} (Success Rate: ${priceRes.success_rate}%)`);

        if (price > 0.80) {
            log('Too expensive.');
            continue;
        }

        if (priceRes.success_rate < 10) {
            log('Low success rate, skipping.');
            continue;
        }

        // 3. Buy
        log(`Buying...`);
        const order = await request('/purchase/sms', { country: t.country, service: service.ID });
        log('ORDER RESPONSE: ' + JSON.stringify(order));

        if (order.success === 1 && order.order_id) {
            orderId = order.order_id;
            log(`SUCCESS! Order ID: ${orderId}`);
            break;
        } else {
            log('Failed: ' + (order.message || 'Unknown error'));
        }
    }

    if (orderId) {
        log('Sleeping 2s...');
        await new Promise(r => setTimeout(r, 2000));

        log(`Checking Status for ${orderId}...`);
        const check = await request('/sms/check', { orderid: orderId });

        log('\n--- CHECK RESPONSE RAW JSON ---');
        log(JSON.stringify(check, null, 2));
        log('-------------------------------\n');

        log('Cancelling...');
        await request('/cancel/sms', { orderid: orderId });

        log('Sleeping 2s...');
        await new Promise(r => setTimeout(r, 2000));

        log(`Checking Status (Post-Cancel) for ${orderId}...`);
        const check2 = await request('/sms/check', { orderid: orderId });
        log('POST-CANCEL RESPONSE: ' + JSON.stringify(check2, null, 2));
    } else {
        log('Could not purchase any service.');
    }

    fs.writeFileSync('debug-smspool-live.txt', output);
    console.log('Saved to debug-smspool-live.txt');
}

run();
