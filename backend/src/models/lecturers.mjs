import mongoose, { Schema } from "mongoose";

const LecturerSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coursesTaught: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
        default: [],
    }],
    department: {
        type: String,
        required: true,
    }
});

export const Lecturer = mongoose.model('Lecturer', LecturerSchema);