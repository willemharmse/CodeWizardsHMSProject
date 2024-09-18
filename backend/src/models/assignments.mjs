import mongoose, { mongo } from "mongoose"

const assignmentSchema = new mongoose.Schema({
    title: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    description: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    dueDate: {
        type: mongoose.Schema.Types.Date,
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }
});

export const Assignment = mongoose.model("Assigment", assignmentSchema);