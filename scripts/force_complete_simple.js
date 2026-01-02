require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

const VirtualNumberSchema = new mongoose.Schema({
    externalId: String,
    status: String,
    updatedAt: Date
}, { strict: false });

const VirtualNumber = mongoose.models.VirtualNumber || mongoose.model('VirtualNumber', VirtualNumberSchema);

async function forceComplete() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const orderId = '6956d92fa4ca694a52d0aca6';

        const number = await VirtualNumber.findById(orderId);
        if (!number) {
            console.error('Order not found!');
            process.exit(1);
        }

        console.log(`Found Order: ${number._id} | Current Status: ${number.status}`);

        number.status = 'completed';
        number.updatedAt = new Date();

        await number.save();
        console.log('✅ Status updated to: completed');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    }
}

forceComplete();
