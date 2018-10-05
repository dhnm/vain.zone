"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const playerSchema = new mongoose_1.Schema({
    exists: Boolean,
    playerID: { type: String, unique: true, sparse: true },
    oldPlayerID: String,
    name: { type: String, unique: true, sparse: true },
    IGNHistory: { type: [String], default: [] },
    shardId: String,
    createdAt: Date,
    patchVersion: String,
    played_aral: Number,
    played_blitz: Number,
    played_casual: Number,
    played_ranked: Number,
    played_casual_5v5: Number,
    played_ranked_5v5: Number,
    guildTag: String,
    karmaLevel: Number,
    level: Number,
    rank_3v3: Number,
    rank_5v5: Number,
    rank_blitz: Number,
    skillTier: Number,
    wins: Number,
    czSk: {
        retrieval: Date,
        of_month: Number,
        first_of_month: Number
    }
});
exports.Player = mongoose_1.model("players", playerSchema);
//# sourceMappingURL=Player.js.map