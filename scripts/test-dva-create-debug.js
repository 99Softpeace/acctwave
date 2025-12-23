const fs = require('fs');
const path = require('path');
const https = require('https');

// Load env
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

const envPath = path.join(process.cwd(), '.env');
const localEnvPath = path.join(process.cwd(), '.env.local');
let envConfig = { ...parseEnv(envPath), ...parseEnv(localEnvPath) };

const API_KEY = envConfig.POCKETFI_API_KEY || process.env.POCKETFI_API_KEY;
const SECRET_KEY = envConfig.POCKETFI_SECRET_KEY || process.env.POCKETFI_SECRET_KEY;

// Prefer the one the user said is the secret key (API_KEY in this case, but let's test both if possible or just the configured one)
const TARGET_KEY = API_KEY;

console.log(`Debug: Using Key starting with: ${TARGET_KEY ? TARGET_KEY.substring(0, 5) : 'NONE'}...`);

if (!TARGET_KEY) {
    console.error('No API Key found.');
    process.exit(1);
}

const payload = JSON.stringify({
    first_name: "Debug",
    last_name: "Tester",
    phone: "08012345678",
    email: `debug_test_${Date.now()}@example.com`,
    businessId: "29663", // Hardcoded from logs or logic
    bank: "paga"
});

const options = {
    hostname: 'api.pocketfi.ng',
    path: '/api/v1/virtual-accounts/create',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${TARGET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': payload.length
    }
};

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:');
        console.log(data);
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(payload);
req.end();
