import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    courseID: [{
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        required: true,
        unique: true,
    }],
    courseName:{ 
        type: mongoose.Schema.Types.String,
        required: true,
    },
    courseCode: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    lecturerID:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecturer',
        required: true,
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    }],
    assignments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Assignment',
        required: true,
    }],
    description: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
});

export const User = mongoose.model("Course", courseSchema);

