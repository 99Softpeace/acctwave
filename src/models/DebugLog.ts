import mongoose from 'mongoose';

const DebugLogSchema = new mongoose.Schema({
    source: { type: String, required: true }, // e.g., 'pocketfi-webhook', 'pocketfi-init'
    type: { type: String, default: 'info' }, // 'info', 'error', 'request', 'response'
    message: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now, expires: '7d' } // Auto-delete after 7 days
});

export default mongoose.models.DebugLog || mongoose.model('DebugLog', DebugLogSchema);
