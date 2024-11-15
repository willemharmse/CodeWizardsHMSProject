import mongoose from "mongoose";

const subSchema = new mongoose.Schema({
      assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assigment',
        required: true,
        default: () => new mongoose.Types.ObjectId()
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        default: () => new mongoose.Types.ObjectId()
      },
      submittedAt: {
        type: mongoose.Schema.Types.Date,
        default: Date.now,
      },
      grade: {
        type: mongoose.Schema.Types.Number,
        min: 0,
        max: 250,
        default: null
      },
      feedback: {
        type: mongoose.Schema.Types.String,
        default: null
      },
      file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
      }
});

export const Submission = mongoose.model('Submission', subSchema);