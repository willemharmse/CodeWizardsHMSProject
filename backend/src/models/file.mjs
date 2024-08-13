import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    fileID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true,
      },
      fileName: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
      },
      filePath: {
        type: mongoose.Schema.Types.String,
        required: true,
      },
      fileURL: {
        type: mongoose.String,
        required: true,
      },
      uploadedByUserID: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'User',
        required: true
      },
      associatedWith: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Submission',
        required: true
      }
});

export const File = mongoose.model('File', subSchema);