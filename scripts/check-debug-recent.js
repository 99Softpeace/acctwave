const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(process.cwd(), '.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed || {};
const MONGODB_URI = process.env.MONGODB_URI || envConfig.MONGODB_URI;

const DebugLogSchema = new mongoose.Schema({
    source: String,
    type: String,
    message: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: Date
}, { strict: false });

const DebugLog = mongoose.models.DebugLog || mongoose.model('DebugLog', DebugLogSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB. Fetching recent logs...');

        // Fetch logs from last 2 hours
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        const logs = await DebugLog.find({
            source: 'pocketfi-webhook',
            createdAt: { $gt: twoHoursAgo }
        })
            .sort({ createdAt: -1 })
            .limit(1);

        if (logs.length === 0) {
            console.log('No recent logs found (Last 2 hours).');
        } else {
            logs.forEach(log => {
                console.log('------------------------------------------------');
                console.log(`[${log.createdAt.toISOString()}] ${log.type?.toUpperCase()}: ${log.message}`);

                if (log.metadata) {
                    // console.log(JSON.stringify(log.metadata, null, 2)); // Too noisy
                    if (log.metadata.body) {
                        console.log('FULL BODY:', log.metadata.body);
                    }
                    if (log.metadata.error) {
                        console.log('ERROR:', log.metadata.error);
                    }
                }
            });
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
