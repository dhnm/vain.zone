"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const matchSchema = new mongoose_1.Schema({
    matchID: { type: String, required: true, unique: true },
    createdAt: Date,
    duration: Number,
    gameMode: String,
    patchVersion: String,
    shardId: String,
    endGameReason: String,
    spectators: [{ playerID: String, name: String }],
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
                    kills: Number,
                    assists: Number,
                    deaths: Number,
                    firstAfkTime: Number,
                    gold: Number,
                    items: [String],
                    jungleKills: Number,
                    nonJungleMinionKills: Number,
                    farm: Number,
                    krakenCaptures: Number,
                    skinKey: String,
                    wentAfk: Boolean,
                    player: { playerID: String, name: String }
                }
            ]
        }
    ],
    telemetryURL: String
});
exports.Match = mongoose_1.model("matches", matchSchema);
//# sourceMappingURL=Match.js.map