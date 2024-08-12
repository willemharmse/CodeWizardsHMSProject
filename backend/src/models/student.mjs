import mongoose, { Schema } from "mongoose";

const StudentSchema = new mongoose.Schema({
    studentID: {
        type: String,
        required: true,
        unique: true,
    },
    coursesEnrolled: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
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
    }],
});

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;