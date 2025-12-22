require('dotenv').config();
const mongoose = require('mongoose');

// Define Schema locally to avoid import issues
const DebugLogSchema = new mongoose.Schema({
    source: String,
    type: String,
    message: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
});
const DebugLog = mongoose.models.DebugLog || mongoose.model('DebugLog', DebugLogSchema);

async function readLogs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB. Fetching last 5 logs...');

        const logs = await DebugLog.find().sort({ createdAt: -1 }).limit(50);

        if (logs.length === 0) {
            console.log('No logs found.');
        } else {
            logs.forEach(log => {
                console.log('------------------------------------------------');
                console.log(`[${log.createdAt.toISOString()}] ${log.source} (${log.type})`);
                console.log(`Message: ${log.message}`);
                console.log('Metadata:', JSON.stringify(log.metadata, null, 2));
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

readLogs();
