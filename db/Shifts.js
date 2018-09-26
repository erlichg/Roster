const mongoose = require("mongoose");

const ShiftSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
        unique: true
    },
    days: {
        type: [Number]
    },
    enabled: {
        type: Boolean,
        default: true
    },
    color: {
        type: String,
        default: "#fff"
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    weight: {
        type: Number,
        default: 1
    }
});
const Shifts = mongoose.model("Shift", ShiftSchema);

module.exports = Shifts;
