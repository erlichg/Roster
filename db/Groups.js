const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    }
});
const Groups = mongoose.model("Group", GroupSchema);

module.exports = Groups;
