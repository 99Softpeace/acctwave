const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(process.cwd(), '.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed || {};
const MONGODB_URI = process.env.MONGODB_URI || envConfig.MONGODB_URI;

const DebugLogSchema = new mongoose.Schema({
    source: { type: String, required: true },
    type: { type: String, default: 'info' },
    message: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
});

const DebugLog = mongoose.models.DebugLog || mongoose.model('DebugLog', DebugLogSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB. Fetching last 5 logs...');

        const logs = await DebugLog.find({ source: 'pocketfi-webhook' })
            .sort({ createdAt: -1 })
            .limit(5);

        logs.forEach(log => {
            console.log(`[${log.createdAt.toISOString()}] ${log.type.toUpperCase()}: ${log.message}`);
            if (log.metadata) {
                console.log(JSON.stringify(log.metadata, null, 2));
            }
            console.log('---');
        });

        if (logs.length === 0) {
            console.log('No PocketFi Logs found.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
