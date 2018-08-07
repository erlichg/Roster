const mongoose = require("mongoose");
const constraints = require("../userConstraints");

const constraintSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: Object.keys(constraints)
    },
    value: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    }
});

// const Constraints = mongoose.model("Constraint", constraintSchema);

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
    },
    constraints: {
        type: [
            {
                type: constraintSchema
            }
        ],
        default: []
    }
});
const Users = mongoose.model("User", UserSchema);

module.exports = Users;
