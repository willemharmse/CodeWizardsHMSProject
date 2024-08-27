import mongoose from "mongoose"

const adminSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    permissions: [{
        type: mongoose.Schema.Types.String,
        required: true,
    }]
});

export const Admin = mongoose.model("Admin", adminSchema);

