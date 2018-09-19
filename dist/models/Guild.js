"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const guildSchema = new mongoose_1.Schema({
    name: { type: String, unique: true, required: true },
    region: { type: String, required: true },
    tag: { type: String, required: true },
    contact: { type: String, required: false },
    key: { type: String, required: true, sparse: true },
    members: [{ type: String, required: true }]
});
exports.Guild = mongoose_1.model("guild", guildSchema);
//# sourceMappingURL=Guild.js.map