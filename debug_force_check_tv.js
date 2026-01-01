
const { TextVerified } = require('./src/lib/textverified');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Mock process.env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

// ID from user
const targetId = "lr_01KDTYP75BGENVDBSPN03566BG";

async function run() {
    console.log('--- START DEBUG ---');
    try {
        console.log(`Checking ID: ${targetId}`);
        const check = await TextVerified.getVerification(targetId);
        console.log('Main Response:', JSON.stringify(check, null, 2));

        if (check.sms) {
            console.log('SMS Field Type:', typeof check.sms);
            if (typeof check.sms === 'object' && check.sms.href) {
                console.log('Found HREF:', check.sms.href);
                const relative = check.sms.href.replace('https://www.textverified.com/api/pub/v2', '');
                console.log('Relative Path:', relative);

                try {
                    const smsDetails = await TextVerified.request(relative);
                    console.log('SMS DETAILS:', JSON.stringify(smsDetails, null, 2));
                } catch (e) {
                    console.error('Failed to follow link:', e.message);
                }
            } else {
                console.log('SMS is not an object with href (or is string).');
            }
        } else {
            console.log('SMS field is null/undefined.');
        }

    } catch (e) {
        console.error('CRITICAL ERROR:', e);
    }
    console.log('--- END DEBUG ---');
}

// Monkey-patch fetch for node 18 environment if needed, though Next.js has it. 
// Assuming running with 'node' which might need fetch polyfill if old version, but user environment seems recent.
run();
