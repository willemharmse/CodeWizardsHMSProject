import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    courseName:{ 
        type: mongoose.Schema.Types.String,
        required: true,
    },
    courseCode: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    lecturers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecturer',
        required: true,
        default: []
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        default: []
    }],
    assignments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Assignment',
        required: true,
        default: []
    }],
    description: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
});

export const Course = mongoose.model("Course", courseSchema);

