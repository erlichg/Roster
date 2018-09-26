const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    week: {
        type: Number
    },
    year: {
        type: Number
    },
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shift"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});
const Schedules = mongoose.model("Schedule", ScheduleSchema);

module.exports = Schedules;
