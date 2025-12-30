const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI missing');
    process.exit(1);
}

console.log('Connecting to MongoDB...');
// console.log('URI:', uri); // Be careful not to expose password in logs if possible, or verify it securely

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
})
    .then(() => {
        console.log('MongoDB Connected Successfully!');
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB Connection Failed:', err);
        process.exit(1);
    });
