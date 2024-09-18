import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
      fileName: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
      },
      fileURL: {
        type: mongoose.Schema.Types.String,
        required: true,
      },
      uploadedByUserID: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'User',
        required: true,
        default: () => new mongoose.Types.ObjectId()
      },
      associatedWith: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Submission',
        required: true,
        default: () => new mongoose.Types.ObjectId()
      }
});

export const File = mongoose.model('File', fileSchema);