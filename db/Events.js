const mongoose = require("mongoose");

const EventsSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        default: "Vacation"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});
const Events = mongoose.model("Event", EventsSchema);

module.exports = Events;
