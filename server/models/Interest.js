const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: 500
    },
    isRead: {
        type: Boolean,
        default: false
    },
    respondedAt: Date,
    expiresAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
interestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
interestSchema.index({ toUser: 1, status: 1 });
interestSchema.index({ fromUser: 1, status: 1 });
interestSchema.index({ status: 1, createdAt: 1 });

// Prevent duplicate interests
interestSchema.pre('save', async function (next) {
    if (this.isNew) {
        const existingInterest = await this.constructor.findOne({
            $or: [
                { fromUser: this.fromUser, toUser: this.toUser },
                { fromUser: this.toUser, toUser: this.fromUser }
            ]
        });

        if (existingInterest) {
            return next(new Error('Interest already exists between these users'));
        }
    }
    next();
});

module.exports = mongoose.model('Interest', interestSchema); 