import { Schema, model, Document } from "mongoose";

const matchSchema = new Schema({
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

export type IMatch = Document & {
    matchID: string;
    createdAt: Date;
    duration: number;
    gameMode: string;
    patchVersion: string;
    shardId: string;
    endGameReason: string;
    spectators: { playerID: string; name: string }[];
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
            kills: number;
            assists: number;
            deaths: number;
            firstAfkTime: number;
            gold: number;
            items: string[];
            jungleKills: number;
            nonJungleMinionKills: number;
            farm: number;
            krakenCaptures: number;
            skinKey: string;
            wentAfk: boolean;
            player: { playerID: string; name: string };
        }[];
    }[];
    telemetryURL: string;
};

export const Match = model<IMatch>("matches", matchSchema);
