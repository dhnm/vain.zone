const mongoose = require("mongoose");

const matchSchema = mongoose.Schema({
	id: { type: String, unique: true },
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

module.exports = mongoose.model("matches", matchSchema);
