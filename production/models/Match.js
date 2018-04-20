"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const matchSchema = new mongoose_1.Schema({
    matchID: { type: String, unique: true },
    createdAt: Date,
    duration: Number,
    gameMode: String,
    patchVersion: String,
    shardId: String,
    endGameReason: String,
    spectators: [{ id: String, name: String }],
    rosters: [
        {
            acesEarned: Number,
            gold: Number,
            heroKills: Number,
            krakenCaptures: Number,
            side: String,
            turretKills: Number,
            turretsRemaining: Number,
            won: Boolean,
            participants: [
                {
                    actor: String,
                    skillTier: Number,
                    assists: Number,
                    crystalMineCaptures: Number,
                    deaths: Number,
                    farm: Number,
                    firstAfkTime: Number,
                    gold: Number,
                    goldMineCaptures: Number,
                    items: [String],
                    jungleKills: Number,
                    kills: Number,
                    krakenCaptures: Number,
                    nonJungleMinionKills: Number,
                    skinKey: String,
                    wentAfk: Boolean,
                    player: { id: String, name: String }
                }
            ]
        }
    ],
    telemetryURL: String
});
exports.Match = mongoose_1.model("matches", matchSchema);
//# sourceMappingURL=Match.js.map