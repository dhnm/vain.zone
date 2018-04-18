const mongoose = require("mongoose");

const botUserSchema = mongoose.Schema({
    defaultIGN: String,
    psid: { type: String, unique: true, required: true }
});

module.exports = mongoose.model("bot_users", botUserSchema);
