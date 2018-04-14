const mongoose = require("mongoose");

const playerSchema = mongoose.Schema({
	exists: Boolean,
	retrieval: { type: Date, default: Date.now },
	id: { type: String, unique: true },
	name: { type: String, unique: true },
	shardId: String,
	createdAt: Date,
	patchVersion: String,
	played_aral: Number,
	played_blitz: Number,
	played_casual: Number,
	played_ranked: Number,
	played_casual_5v5: Number,
	guildTag: String,
	karmaLevel: Number,
	level: Number,
	rank_3v3: Number,
	rank_blitz: Number,
	skillTier: Number,
	wins: Number,
	matchRefs: [{ type: String, ref: "matches" }]
});

module.exports = mongoose.model("players", playerSchema);
