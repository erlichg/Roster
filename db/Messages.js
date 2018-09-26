const mongoose = require("mongoose");

const MessagesSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subject: {
        type: String,
        default: ""
    },
    body: {
        type: String,
        default: ""
    },
    read: {
        type: Boolean,
        default: false
    }
});
const Messages = mongoose.model("Message", MessagesSchema);

module.exports = Messages;
