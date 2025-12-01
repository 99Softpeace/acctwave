import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Define Schema Inline
const OrderSchema = new mongoose.Schema({
    service_name: String,
    link: String,
    quantity: Number,
    charge: Number,
    status: String,
    external_order_id: Number,
    createdAt: Date
}, { strict: false });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

async function checkOrder() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected to MongoDB.');

        const order = await Order.findOne().sort({ createdAt: -1 });

        if (order) {
            console.log('\n--- LATEST ORDER ---');
            console.log(`Service: ${order.service_name}`);
            console.log(`Link: ${order.link}`);
            console.log(`Quantity: ${order.quantity}`);
            console.log(`Charge: ₦${order.charge}`);
            console.log(`Status: ${order.status}`);
            console.log(`Order ID: ${order.external_order_id}`);
            console.log('--------------------\n');
        } else {
            console.log('\nNo orders found in the database.\n');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error checking order:', error);
        process.exit(1);
    }
}

checkOrder();
