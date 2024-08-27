import mongoose, { Schema } from "mongoose";
import { User } from "./user.mjs";

const LecturerSchema = new mongoose.Schema({
    user: User.schema,
    coursesTaught: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
        default: [],
    }],
    department: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        required: false,
    }
    
});

export const Lecturer = mongoose.model('Lecturer', LecturerSchema);