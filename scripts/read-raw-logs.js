
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const debugLogSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const DebugLog = mongoose.models.DebugLog || mongoose.model('DebugLog', debugLogSchema);

async function readRaw() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected. Fetching last 5 raw logs...');

        const logs = await DebugLog.find({}).sort({ _id: -1 }).limit(5);

        console.log(`Found ${logs.length} logs.`);
        logs.forEach(log => {
            console.log(`[${log.createdAt}] Source: ${log.source} | Msg: ${log.message}`);
            if (log.metadata) console.log(JSON.stringify(log.metadata, null, 2));
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

readRaw();
