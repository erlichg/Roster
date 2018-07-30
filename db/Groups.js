const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
    name: String
});
const Groups = mongoose.model("Group", GroupSchema);

module.exports = Groups;
