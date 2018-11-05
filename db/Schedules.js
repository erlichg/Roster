const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    date: {
        type: Date
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
