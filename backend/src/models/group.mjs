import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema({
    groupID: {
        type: String,
        required: true,
        unique: true,
    },
    groupName: {
        type: String,
        required: true,
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student',
    }],
    lecturerID: {
        type: Schema.Types.ObjectId,
        ref: 'Lecturer',
        required: true,
    },
    courseID: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Group = mongoose.model('Group',GroupSchema);
module.exports = Group;