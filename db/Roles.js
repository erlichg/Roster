const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
    name: String
});
const Roles = mongoose.model("Role", RoleSchema);

module.exports = Roles;
