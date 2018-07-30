const mongoose = require("mongoose");
const _ = require("lodash");

const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];
const workDays = weekDays.slice(0, 5);
const weekendDays = weekDays.slice(6, 7);

const ShiftSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
        unique: true
    },
    days: {
        type: [Number]
    }
});
ShiftSchema.methods.type = function type() {
    if (this.days.length === 0) {
        return "Empty";
    }
    if (this.days.length === 7) {
        return "Week";
    }
    if (_.isEqual(this.days, workDays)) {
        return "Midweek";
    }
    if (_.isEqual(this.days, weekendDays)) {
        return "Weekend";
    }
    return "Custom";
};
const Shifts = mongoose.model("Shift", ShiftSchema);

module.exports = Shifts;
