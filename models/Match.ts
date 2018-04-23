import { Schema, model, Document } from "mongoose";

const matchSchema = new Schema({
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

export type IMatch = Document & {
    matchID: string;
    createdAt: Date;
    duration: number;
    gameMode: string;
    patchVersion: string;
    shardId: string;
    endGameReason: string;
    spectators: { id: string; name: string }[];
    rosters: {
        acesEarned: number;
        gold: number;
        heroKills: number;
        krakenCaptures: number;
        side: string;
        turretKills: number;
        turretsRemaining: number;
        won: boolean;
        participants: {
            actor: string;
            skillTier?: number; // patch 3.2
            assists: number;
            crystalMineCaptures: number;
            deaths: number;
            farm: number;
            firstAfkTime: number;
            gold: number;
            goldMineCaptures: number;
            items: string[];
            jungleKills: number;
            kills: number;
            krakenCaptures: number;
            nonJungleMinionKills: number;
            skinKey: string;
            wentAfk: boolean;
            player: { id: string; name: string };
        }[];
    }[];
    telemetryURL: string;
};

export const Match = model<IMatch>("matches", matchSchema);