require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

const VirtualNumberSchema = new mongoose.Schema({
    externalId: String,
    number: String,
    provider: String,
    status: String,
    createdAt: Date,
    updatedAt: Date
}, { strict: false });

const VirtualNumber = mongoose.models.VirtualNumber || mongoose.model('VirtualNumber', VirtualNumberSchema);

async function findRecentTVNumbers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find recent numbers that look like TextVerified (provider='TV' or 'textverified' or externalId starts with TV)
        const numbers = await VirtualNumber.find({
            $or: [
                { provider: 'TV' },
                { provider: 'textverified' },
                { externalId: /^TV:/ }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(5);

        console.log(`Found ${numbers.length} recent TextVerified numbers:`);
        numbers.forEach(n => {
            console.log(`- ID: ${n.externalId} | Num: ${n.number} | Status: ${n.status} | Time: ${n.createdAt}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

findRecentTVNumbers();
