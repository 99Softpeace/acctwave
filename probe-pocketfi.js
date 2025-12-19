const axios = require('axios');
const path = require('path');
const fs = require('fs');

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

const SECRET_KEY = envConfig.POCKETFI_SECRET_KEY;
const BASE_URL = (envConfig.POCKETFI_API_BASE_URL || 'https://api.pocketfi.ng/api/v1').replace(/\/$/, '');

if (!SECRET_KEY) {
    console.error('❌ POCKETFI_SECRET_KEY not found!');
    process.exit(1);
}

console.log(`Using Base URL: ${BASE_URL}`);

const endpointsToTest = [
    '/accounts/create',
    '/accounts',
    '/create-dedicated-account',
    '/virtual-account/create',
    '/wallet/create-virtual',
    '/checkout/request',       // Legacy endpoint check
    '/api/checkout/request'    // Variation
];

async function probe() {
    let output = `Probe Results (${new Date().toISOString()})\n`;
    output += `Base URL (Configured): ${BASE_URL}\n\n`;

    // Test the configured base URL + endpoints
    for (const endpoint of endpointsToTest) {
        const url = `${BASE_URL}${endpoint}`;
        output += await testUrl(url);
    }

    // Test hardcoded generic variations in case Base URL is wrong
    const hardcodedBases = [
        'https://api.pocketfi.ng/api/v1',
        'https://api.pocketfi.ng/v1',
        'https://api.pocketfi.ng'
    ];

    output += '\n--- Testing Hardcoded Base URLs ---\n';

    for (const base of hardcodedBases) {
        for (const endpoint of endpointsToTest) {
            const url = `${base}${endpoint}`.replace(/([^:]\/)\/+/g, "$1"); // Dedupe slashes
            output += await testUrl(url);
        }
    }

    fs.writeFileSync('probe_output_utf8.txt', output, 'utf8');
    console.log('Probe complete. Results written to probe_output_utf8.txt');
}

async function testUrl(url) {
    let result = '';
    console.log(`Testing: ${url}`);
    try {
        const response = await axios.post(url, {}, {
            headers: {
                'Authorization': `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        result = `✅ ${url}: STATUS ${response.status} (Success!)\n`;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                result = `❌ ${url}: 404 Not Found\n`;
            } else {
                result = `✅ ${url}: STATUS ${error.response.status} (Route Exists!)\nData: ${JSON.stringify(error.response.data)}\n`;
            }
        } else {
            result = `❌ ${url}: Network Error - ${error.message}\n`;
        }
    }
    return result;
}

probe();
