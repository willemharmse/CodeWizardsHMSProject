import mongoose from "mongoose";

const assignSchema = new mongoose.Schema({
    assignmentID:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        auto: true
    },
    courseID:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'Course'
    },
    title:
    {
        type: mongoose.Schema.Types.String
    },
    description:
    {
        type: mongoose.Schema.Types.String
    },
    dueDate:
    {
        type: mongoose.Schema.Types.Date
    },
    file:
    {
        type: mongoose.Schema.Types.String
    }, 
    submissions: [{
        type: Schema.Types.ObjectId,  // Array of references to Submission models
        ref: 'Submission',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
    
AssignmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export const Assignment = mongoose.model('Assignment', AssignmentSchema);