require('dotenv').config();

console.log('--- Key Check ---');
const pk = process.env.POCKETFI_API_KEY;
const sk = process.env.POCKETFI_SECRET_KEY;
const bid = process.env.POCKETFI_BUSINESS_ID;

console.log('POCKETFI_API_KEY:', pk ? pk.substring(0, 10) + '...' : 'MISSING');
console.log('POCKETFI_SECRET_KEY:', sk ? sk.substring(0, 10) + '...' : 'MISSING');
console.log('POCKETFI_BUSINESS_ID:', bid || 'MISSING');

if (pk === sk && pk) {
    console.warn('WARNING: API Key and Secret Key are IDENTICAL!');
}
