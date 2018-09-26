const mongoose = require("mongoose");
const userConstraints = require("../userConstraints").constraints(undefined);

const ConstraintSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: Object.keys(userConstraints)
    },
    groups: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
        default: []
    },
    severity: {
        type: String,
        enum: ["Info", "Warning", "Error"],
        default: "Error"
    },
    enabled: {
        type: Boolean,
        default: true
    }
});
const Constraints = mongoose.model("Constraint", ConstraintSchema);

module.exports = Constraints;
