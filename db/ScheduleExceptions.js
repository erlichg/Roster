const mongoose = require("mongoose");

const ScheduleExceptionSchema = new mongoose.Schema({
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
const ScheduleExceptionss = mongoose.model(
    "ScheduleException",
    ScheduleExceptionSchema
);

module.exports = ScheduleExceptionss;
