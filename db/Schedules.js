const mongoose = require("mongoose");
const moment = require("moment");

const ScheduleSchema = new mongoose.Schema({
    week: {
        type: Number,
        default: moment().week()
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
