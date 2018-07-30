const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    groups: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
        default: []
    }
});
const Users = mongoose.model("User", UserSchema);

module.exports = Users;
