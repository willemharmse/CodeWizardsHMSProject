import mongoose from "mongoose"

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
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        default: []
    }]

});

export const Assignment = mongoose.model("Assigment", assignmentSchema);