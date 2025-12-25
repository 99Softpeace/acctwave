
require('dotenv').config({ path: '.env' });

const key = process.env.NCWALLET_API_KEY || '';
const pin = process.env.NCWALLET_PIN || '';

console.log(`Key Length: ${key.length}`);
console.log('Key Char Codes:', key.split('').map(c => c.charCodeAt(0)).join(', '));

console.log(`PIN Length: ${pin.length}`);
console.log('PIN Char Codes:', pin.split('').map(c => c.charCodeAt(0)).join(', '));
