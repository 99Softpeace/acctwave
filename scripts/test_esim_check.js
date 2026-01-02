// Native fetch in Node 18+
require('dotenv').config({ path: '.env.local' });
if (!process.env.SMSPOOL_API_KEY) require('dotenv').config({ path: '.env' });

const API_KEY = process.env.SMSPOOL_API_KEY;
const BASE_URL = 'https://api.smspool.net';
// ID from dump: mf3XGICImwdnZLxU8OLx
const TEST_ID = 'mf3XGICImwdnZLxU8OLx';

async function testEsimCheck() {
    console.log(`Testing /esim/check for ID: ${TEST_ID}...`);
    try {
        // Try /esim/check
        const urlToCheck = `${BASE_URL}/esim/check`;
        const params = new URLSearchParams();
        params.append('key', API_KEY);
        // "view esim profile" might mean checking status?
        // or check status parameters
        params.append('orderid', TEST_ID); // common param name

        const res = await fetch(urlToCheck, {
            method: 'POST',
            body: params
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text.substring(0, 1000));

        // Try GET just in case (some docs imply GET for status)
        console.log('\nTesting GET /esim/check...');
        const urlGet = `${urlToCheck}?key=${API_KEY}&orderid=${TEST_ID}`;
        const resGet = await fetch(urlGet);
        console.log('Status:', resGet.status);
        const textGet = await resGet.text();
        console.log('Response:', textGet.substring(0, 1000));

    } catch (e) {
        console.error('Error:', e);
    }
}

testEsimCheck();
