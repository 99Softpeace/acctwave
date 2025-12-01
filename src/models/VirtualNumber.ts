import mongoose from 'mongoose';

const VirtualNumberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    service: {
        type: String,
        required: true, // e.g., 'whatsapp', 'telegram'
    },
    serviceName: {
        type: String,
        required: true, // e.g., 'WhatsApp', 'Telegram'
    },
    country: {
        type: String,
        required: true, // e.g., 'usa', 'uk'
    },
    countryName: {
        type: String,
        required: true, // e.g., 'United States', 'United Kingdom'
    },
    number: {
        type: String,
        required: true,
    },
    externalId: {
        type: String,
        required: true, // ID from the provider (mock ID for now)
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled', 'expired'],
        default: 'active',
    },
    smsCode: {
        type: String,
        default: null,
    },
    fullSms: {
        type: String,
        default: null,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

// Index for finding active numbers quickly
VirtualNumberSchema.index({ user: 1, status: 1 });

export default mongoose.models.VirtualNumber || mongoose.model('VirtualNumber', VirtualNumberSchema);
