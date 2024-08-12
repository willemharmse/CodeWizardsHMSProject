import mongoose from "mongoose";

const subSchema = new mongoose.Schema({
    submissionID: {
        type: Schema.Types.ObjectId,
        required: true,
        auto: true,
      },
      assignmentID: {
        type: Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
      },
      studentID: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
      },
      fileURL: {
        type: String,
        required: true,
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      grade: {
        type: Number,
        min: 0,
        max: 100,
      },
      feedback: {
        type: String,
      },
      compressed: {
        type: Boolean,
        default: false,
      },
      compressionDetails: {
        type: String,
      }
});

export const Submission = mongoose.model('Submission', subSchema);