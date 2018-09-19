import { Schema, model, Document } from "mongoose";

const playerSchema = new Schema({
  exists: Boolean,
  playerID: { type: String, required: true, unique: true },
  name: { type: String, unique: true, sparse: true },
  IGNHistory: [String],
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

type czSk = {
  retrieval?: Date;
  of_month?: number;
  first_of_month?: number;
};

export type IPlayer = Document & {
  exists: boolean;
  playerID: string;
  name: string | null;
  IGNHistory?: string[];
  shardId: string;
  createdAt: Date;
  patchVersion: string;
  played_aral: number;
  played_blitz: number;
  played_casual: number;
  played_ranked: number;
  played_casual_5v5: number;
  played_ranked_5v5?: number; // patch 3.2
  guildTag: string;
  karmaLevel: number;
  level: number;
  rank_3v3: number;
  rank_5v5?: number;
  rank_blitz: number;
  skillTier: number;
  wins: number;
  czSk: czSk;
};

export const Player = model<IPlayer>("players", playerSchema);
