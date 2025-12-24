import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    balance: {
        type: Number,
        default: 0,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true,
    },
    api_key: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined values to not conflict
    },
    virtualAccount: {
        bankName: String,
        accountNumber: String,
        accountName: String,
    },
    isSuspended: {
        type: Boolean,
        default: false,
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true,
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    referralBalance: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
