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

        const logs = await DebugLog.find({ source: 'pf_notify' }).sort({ createdAt: -1 }).limit(100);

        if (logs.length === 0) {
            console.log('No logs found.');
        } else {
            logs.forEach(log => {
                const m = log.metadata || {};
                const h = m.headers || {};
                let b = m.body;
                try {
                    if (typeof b === 'string') b = JSON.parse(b);
                } catch (e) { b = {}; }

                console.log(`[${log.createdAt.toISOString()}] MSG: ${log.message}`);
                console.log(`SigHeader: ${h['x-pocketfi-signature'] || h['pocketfi_signature'] || 'MISSING'}`);
                if (b && b.transaction) {
                    console.log(`TxRef: ${b.transaction.reference}`);
                }
                if (b && b.order) {
                    console.log(`Amount: ${b.order.amount}`);
                }
                console.log('---');
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

readLogs();
