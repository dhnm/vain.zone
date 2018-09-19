import { Schema, model, Document } from "mongoose";

const botUserSchema = new Schema({
	defaultIGN: String,
	psid: { type: String, unique: true, required: true },
	playerID: String,
	shardId: String
});

export type IBotUser = Document & {
	defaultIGN?: string;
	psid: string;
	playerID: string;
	shardId: string;
};

export const BotUser = model<IBotUser>("bot_users", botUserSchema);
