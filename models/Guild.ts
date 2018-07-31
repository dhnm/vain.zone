import { Schema, model, Document } from "mongoose";

const guildSchema = new Schema({
	name: { type: String, unique: true, required: true },
	tag: { type: String, required: true },
	contact: { type: String, required: false },
	key: { type: String, required: true, sparse: true },
	members: [String]
});

export type IGuild = Document & {
	name: string;
	tag: string;
	contact?: string;
	key?: string;
	members: [string];
};

export const Guild = model<IGuild>("guild", guildSchema);
