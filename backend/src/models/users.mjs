import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    userID: [{
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        required: true,
        unique: true,
    }],
    username:{ 
        type: mongoose.Schema.Types.String,
        required: true,
    },
    password: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    email:{
        type: mongoose.Schema.Types.String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
});

export const User = mongoose.model("User", userSchema);

