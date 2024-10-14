import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username:{ 
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
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

