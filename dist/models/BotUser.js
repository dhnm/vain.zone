"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const botUserSchema = new mongoose_1.Schema({
    defaultIGN: String,
    psid: { type: String, unique: true, required: true },
    playerID: String,
    shardId: String
});
exports.BotUser = mongoose_1.model("bot_users", botUserSchema);
//# sourceMappingURL=BotUser.js.map