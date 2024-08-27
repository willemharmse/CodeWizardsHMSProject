import mongoose, { Schema } from "mongoose";
import { User } from './user.mjs';

const StudentSchema = new mongoose.Schema({
    user: User.schema,
    coursesEnrolled: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
        default: [],
    }],
    enrollmentYear: {
        type: Number,
        required: true,
    },
    profilePicture: {
        type: String,
        required: false,
    },
    submissions: [{
        type: Schema.Types.ObjectId,
        ref: 'Submission',
        default: [],
    }],
});

export const Student = mongoose.model('Student', StudentSchema);