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
    description: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
});

export const Course = mongoose.model("Course", courseSchema);

