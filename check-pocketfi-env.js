const fs = require('fs');
const path = require('path');

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

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
const localEnvPath = path.join(process.cwd(), '.env.local');

let envConfig = {};
envConfig = { ...envConfig, ...parseEnv(envPath) };
envConfig = { ...envConfig, ...parseEnv(localEnvPath) };

console.log('--- PocketFi Environment Check (Standalone) ---');
const apiKey = envConfig.POCKETFI_API_KEY || process.env.POCKETFI_API_KEY;
const secretKey = envConfig.POCKETFI_SECRET_KEY || process.env.POCKETFI_SECRET_KEY;
const businessId = envConfig.POCKETFI_BUSINESS_ID || process.env.POCKETFI_BUSINESS_ID;

if (apiKey) {
    console.log('✅ POCKETFI_API_KEY is found (Length: ' + apiKey.length + ')');
    if (apiKey.startsWith('pk_')) {
        console.log('   Key format looks correct (starts with pk_)');
    } else {
        console.warn('   ⚠️ Key might be invalid (does not start with pk_)');
    }
} else {
    console.error('❌ POCKETFI_API_KEY is MISSING in .env files');
}

if (secretKey) {
    console.log('✅ POCKETFI_SECRET_KEY is found (Length: ' + secretKey.length + ')');
    if (secretKey.startsWith('sk_')) {
        console.log('   Key format looks correct (starts with sk_)');
    } else {
        console.warn('   ⚠️ Key might be invalid (does not start with sk_)');
    }
} else {
    console.warn('⚠️ POCKETFI_SECRET_KEY is MISSING. This might be needed for server-to-server calls like creating virtual accounts.');
}

if (businessId) {
    console.log('✅ POCKETFI_BUSINESS_ID is found: ' + businessId);
} else {
    console.log('ℹ️ POCKETFI_BUSINESS_ID not found. Will try to extract from API key if needed.');
}

console.log('----------------------------------');
