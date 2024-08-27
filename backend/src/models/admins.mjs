import mongoose from "mongoose"
import {User} from "./users.mjs"

const adminSchema = new mongoose.Schema({
    user: User.schema,
    permissions: [{
        type: mongoose.Schema.Types.String,
        required: true,
    }]
});

export const Admin = mongoose.model("Admin", adminSchema);

