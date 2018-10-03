const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: "",
        unique: true
    },
    groups: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
        default: []
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    location: {
        type: String,
        enum: ["Israel", "US", "China"],
        default: "Israel"
    }
});
const Users = mongoose.model("User", UserSchema);

module.exports = Users;
