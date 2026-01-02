import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    reference: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed', 'cancelled'],
        default: 'pending',
    },
    payment_method: {
        type: String,
        default: 'manual',
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'order', 'bonus', 'commission'],
        default: 'deposit',
    },
    category: {
        type: String,
    },
    description: {
        type: String,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Force recompilation in dev to apply schema changes
if (process.env.NODE_ENV === 'development' && mongoose.models.Transaction) {
    delete mongoose.models.Transaction;
}

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
export default Transaction;
