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
let secretKey = envConfig.POCKETFI_SECRET_KEY;

const variations = [
    // format: [baseUrl, path]
    ['https://api.pocketfi.ng/api/v1', '/accounts/create_dedicated_account'], // Documented
    ['https://api.pocketfi.ng/api/v1', '/accounts/create-dedicated-account'], // Dashes
    ['https://api.pocketfi.ng/api/v1', '/create_dedicated_account'], // Root
    ['https://api.pocketfi.ng/api/v1', '/accounts/dedicated'],
    ['https://api.pocketfi.ng/v1', '/accounts/create_dedicated_account'], // No /api
    ['https://api.pocketfi.ng', '/api/v1/accounts/create_dedicated_account'], // Full path on root
    ['https://api.pocketfi.ng', '/accounts/create_dedicated_account'], // No api/v1
    // Common alternatives
    ['https://api.pocketfi.ng/api/v1', '/virtual-accounts'],
    ['https://api.pocketfi.ng/api/v1', '/accounts/virtual'],
    ['https://api.pocketfi.ng/api/v1', '/accounts/create']
];

async function probe() {
    let output = "Starting Exhaustive Probe...\n";
    for (const [base, endpoint] of variations) {
        const url = `${base}${endpoint}`;
        try {
            output += `Trying: ${url}\n`;
            const response = await axios.post(url, {
                firstname: "Test", lastname: "Probe", email: "probe@test.com", phone: "08012345678"
            }, {
                headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/json' }
            });
            output += `✅ SUCCESS [${response.status}] found at: ${url}\n`;
            output += 'Use this URL!\n';
            fs.writeFileSync('probe_exact_output.txt', output, 'utf8');
            return;
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    output += `❌ 404 Not Found at ${url}\n`;
                } else if (error.response.status === 401) {
                    output += `⚠️ 401 Unauthenticated at: ${url} (ROUTE EXISTS!)\n`;
                } else {
                    output += `⚠️ STATUS ${error.response.status} at: ${url} (ROUTE EXISTS!)\n`;
                    output += JSON.stringify(error.response.data) + '\n';
                }
            } else {
                output += `❌ Network Error: ${error.message}\n`;
            }
        }
    }
    output += "Probe finished.\n";
    fs.writeFileSync('probe_exact_output.txt', output, 'utf8');
}

probe();
