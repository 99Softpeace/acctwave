require('dotenv').config();

const pk = process.env.POCKETFI_API_KEY || '';
const sk = process.env.POCKETFI_SECRET_KEY || '';

console.log('--- Key Prefix Check ---');
console.log(`Public Key Prefix: ${pk.substring(0, 8)}`);
console.log(`Secret Key Prefix: ${sk.substring(0, 8)}`);

if (pk.includes('live') && sk.includes('test')) {
    console.log('❌ MISMATCH: Public is LIVE, Secret is TEST');
} else if (pk.includes('test') && sk.includes('live')) {
    console.log('❌ MISMATCH: Public is TEST, Secret is LIVE');
} else if (!pk.includes('_') || !sk.includes('_')) {
    console.log('⚠️ WARNING: Keys might be malformed (missing underscore)');
} else {
    console.log('✅ MATCH: Environments appear consistent');
}
