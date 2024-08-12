import mongoose from "mongoose";

const subSchema = new mongoose.Schema({
    submissionID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true,
      },
      assignmentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
      },
      studentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
      },
      fileURL: {
        type: mongoose.Schema.Types.String,
        required: true,
      },
      submittedAt: {
        type: mongoose.Schema.Types.Date,
        default: Date.now,
      },
      grade: {
        type: mongoose.Schema.Types.Number,
        min: 0,
        max: 100,
      },
      feedback: {
        type: mongoose.Schema.Types.String,
      },
      compressed: {
        type: mongoose.Schema.Types.Boolean,
        default: false,
      },
      compressionDetails: {
        type: mongoose.Schema.Types.String,
      }
});

export const Submission = mongoose.model('Submission', subSchema);