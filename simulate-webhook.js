const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Manually parse env
function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const result = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                value = value.replace(/^"|"$/g, '');
            }
            result[key] = value.trim();
        }
    });
    return result;
}

const envConfig = {
    ...parseEnv(path.join(process.cwd(), '.env')),
    ...parseEnv(path.join(process.cwd(), '.env.local'))
};

const SECRET = envConfig.WEBHOOK_SIGNING_SECRET || process.env.WEBHOOK_SIGNING_SECRET;
const PORT = 3000;

if (!SECRET) {
    console.error('❌ Error: WEBHOOK_SIGNING_SECRET not found.');
    process.exit(1);
}

const payload = JSON.stringify({
    event: 'payment.success',
    data: {
        reference: 'TEST-SIM-' + Date.now(),
        account_number: '9999999999',
        amount: 5000,
        sender_bank: 'Test Bank',
        sender_name: 'Test Sender'
    }
});

const signature = crypto.createHmac('sha512', SECRET)
    .update(payload)
    .digest('hex');

const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/pocketfi/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-pocketfi-signature': signature,
        'Content-Length': payload.length
    }
};

console.log('Sending webhook to port ' + PORT + '...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(payload);
req.end();
