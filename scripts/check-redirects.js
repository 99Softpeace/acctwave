const https = require('https');
const http = require('http');

const variants = [
    'https://acctwave.com/api/pocketfi/webhook',
    'https://acctwave.com/api/pocketfi/webhook/',
    'https://www.acctwave.com/api/pocketfi/webhook',
    'http://acctwave.com/api/pocketfi/webhook',
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(url, { method: 'POST' }, (res) => {
            resolve({ url, status: res.statusCode, location: res.headers.location });
        });
        req.on('error', () => resolve({ url, status: 'ERROR' }));
        req.end();
    });
}

async function run() {
    console.log('--- Checking Redirects ---');
    for (const url of variants) {
        const start = Date.now();
        const res = await checkUrl(url);
        console.log(`[${res.status}] ${url}`);
        if (res.location) console.log(`    -> Redirects to: ${res.location}`);
    }
    console.log('--------------------------');
}

run();
