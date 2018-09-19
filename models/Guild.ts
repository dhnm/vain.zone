import { Schema, model, Document } from "mongoose";

const guildSchema = new Schema({
	name: { type: String, unique: true, required: true },
	region: { type: String, required: true },
	tag: { type: String, required: true },
	contact: { type: String, required: false },
	key: { type: String, required: true, sparse: true },
	members: [{ type: String, required: true }]
});

export type IGuild = Document & {
	name: string;
	region: string;
	tag: string;
	contact?: string;
	key: string;
	members: [string];
};

export const Guild = model<IGuild>("guild", guildSchema);
