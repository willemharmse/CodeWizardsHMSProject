import mongoose from "mongoose";

const subSchema = new mongoose.Schema({
      assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
        default: () => new mongoose.Types.ObjectId()
      },
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        default: () => new mongoose.Types.ObjectId()
      },
      fileURL: {
        type: mongoose.Schema.Types.String,
        required: true,
        default: ''
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