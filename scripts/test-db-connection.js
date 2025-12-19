const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log('----------------------------------------');
console.log('MongoDB Connection Test');
console.log('----------------------------------------');

if (!uri) {
    console.error('❌ Error: MONGODB_URI is not defined in .env');
    process.exit(1);
}

// Mask the URI for logging
const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
console.log(`Attempting to connect to: ${maskedUri}`);

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Successfully connected to MongoDB!');
        console.log('Your IP address is whitelisted and credentials are correct.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection error:', err.message);
        if (err.message.includes('whitelist')) {
            console.log('\n--> ACTION REQUIRED: This error confirms your IP is not whitelisted.');
            console.log('    Please go to MongoDB Atlas Network Access and add your current IP.');
        }
        process.exit(1);
    });
