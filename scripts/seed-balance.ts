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

// Define Schema Inline to avoid import issues
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    balance: Number,
}, { strict: false }); // strict: false allows updating fields not in this minimal schema

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedBalance() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected.');

        const result = await User.updateMany({}, { $set: { balance: 50000 } });
        console.log(`Updated ${result.modifiedCount} users with ₦50,000 balance.`);

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (error) {
        console.error('Error seeding balance:', error);
        process.exit(1);
    }
}

seedBalance();
