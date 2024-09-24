import mongoose, { Schema } from "mongoose";

const StudentSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coursesEnrolled: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
        default: [],
    }],
    enrollmentYear: {
        type: Number,
        required: true,
    }
});

export const Student = mongoose.model('Student', StudentSchema);