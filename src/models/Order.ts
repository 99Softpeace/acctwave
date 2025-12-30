import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['boost', 'rental'],
        default: 'boost',
    },
    service_id: {
        type: String, // Changed to String to support both SMM IDs and DaisySMS IDs
        required: true,
    },
    service_name: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: false, // Optional for rentals
    },
    quantity: {
        type: Number,
        required: false, // Optional for rentals
    },
    charge: {
        type: Number,
        required: true,
    },
    external_order_id: {
        type: String, // Changed to String to support both
        required: true,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    provider: {
        type: String,
        enum: ['textverified', 'smspool', 'daisysms'], // Added daisysms just in case, though we only strictly route TV/SP for now
        required: false,
    },
    // Rental specific fields
    phone: {
        type: String,
    },
    code: {
        type: String,
    },
    expiresAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries by user
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
