
require('dotenv').config({ path: '.env' });
console.log("API_KEY:", process.env.NCWALLET_API_KEY ? "Loaded (" + process.env.NCWALLET_API_KEY.length + " chars)" : "MISSING");
console.log("PIN:", process.env.NCWALLET_PIN ? "Loaded (" + process.env.NCWALLET_PIN.length + " chars)" : "MISSING");
console.log("PIN Value (masked):", process.env.NCWALLET_PIN ? process.env.NCWALLET_PIN.replace(/./g, '*') : "NULL");
