import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const TicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        required: [true, 'Please provide a subject'],
        maxlength: [100, 'Subject cannot be more than 100 characters'],
    },
    status: {
        type: String,
        enum: ['Open', 'Answered', 'Closed'],
        default: 'Open',
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
    },
    messages: [MessageSchema],
}, {
    timestamps: true, // Automatically handles createdAt and updatedAt
});

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
