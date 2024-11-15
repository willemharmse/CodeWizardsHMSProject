import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema({
    recipientUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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

export const Notification = mongoose.model('Notification',NotificationSchema);