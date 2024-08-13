import mongoose, { Schema } from "mongoose";
import { User } from "./user.mjs";

const LecturerSchema = new mongoose.Schema({
    user: User.schema,
    lecturerID: {
        type: String,
        required: true,
        unique: true,
    },
    coursesTaught: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
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

const Lecturer = mongoose.model('Lecturer', LecturerSchema);
module.exports = Lecturer;