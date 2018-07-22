"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const axios_1 = require("axios");
const Match_1 = require("./../../models/Match");
const constants_1 = require("./../functions/constants");
exports.default = router;
router.get('/', (req, res) => {
    const filters = JSON.parse(req.query.filters);
    const createdAt = filters.createdAt ? new Date(filters.createdAt) : '';
    if (createdAt) {
        createdAt.setMilliseconds(createdAt.getMilliseconds() - 1);
    }
    axios_1.default({
        method: 'get',
        url: `https://api.dc01.gamelockerapp.com/shards/${req.query.shardId}/matches`,
        params: {
            'filter[createdAt-end]': createdAt,
            'page[limit]': 12,
            sort: '-createdAt',
            'filter[playerNames]': req.query.player,
            'filter[gameMode]': filters.gameMode,
        },
        headers: {
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'User-Agent': 'js/vainglory',
            Authorization: constants_1.filterApiKey,
            'X-TITLE-ID': 'semc-vainglory',
            Accept: 'application/vnd.api+json',
        },
        responseType: 'json',
    })
        .then((response) => {
        return response.data;
    })
        .then((matches) => {
        if (matches) {
            if (matches.data.length == 0) {
                throw new Error('No matches found.');
            }
            return formatMatches(matches);
        }
        else {
            throw new Error('Error retrieving matches: ' + JSON.stringify(matches.errors));
        }
    })
        .then((formattedMatches) => {
        res.status(200).json(formattedMatches);
    })
        .catch((error) => {
        console.error(error);
        res.status(404).end();
    });
});
function formatMatches(matches) {
    const formattedMatches = [];
    matches.data.forEach((match) => {
        const telemetryAssetId = match.relationships.assets.data[0]
            ? match.relationships.assets.data[0].id
            : undefined;
        const findTelemetry = matches.included.find((e) => e.id === telemetryAssetId);
        const telemetryURL = findTelemetry
            ? findTelemetry.attributes.URL
            : undefined;
        const customMatchDataModel = {
            matchID: match.id,
            createdAt: new Date(match.attributes.createdAt),
            duration: match.attributes.duration,
            gameMode: match.attributes.gameMode,
            patchVersion: match.attributes.patchVersion,
            shardId: match.attributes.shardId,
            endGameReason: match.attributes.stats.endGameReason,
            spectators: new Array(),
            rosters: new Array(),
            telemetryURL,
        };
        for (let spectatorIndex = 0; spectatorIndex < match.relationships.spectators.data.length; spectatorIndex++) {
            const spectatorParticipant = matches.included.find((e) => e.id === match.relationships.spectators.data[spectatorIndex].id);
            const spectatorPlayer = matches.included.find((e) => e.id === spectatorParticipant.relationships.player.data.id);
            customMatchDataModel.spectators.push({
                id: spectatorPlayer.id,
                name: spectatorPlayer.attributes.name,
            });
        }
        for (let rosterIndex = 0; rosterIndex < match.relationships.rosters.data.length; rosterIndex++) {
            const roster = matches.included.find((e) => e.id === match.relationships.rosters.data[rosterIndex].id);
            const customRosterDataModel = {
                acesEarned: roster.attributes.stats.acesEarned,
                gold: roster.attributes.stats.gold,
                heroKills: roster.attributes.stats.heroKills,
                krakenCaptures: roster.attributes.stats.krakenCaptures,
                side: roster.attributes.stats.side,
                turretKills: roster.attributes.stats.turretKills,
                turretsRemaining: roster.attributes.stats.turretsRemaining,
                won: JSON.parse(roster.attributes.won),
                participants: new Array(),
            };
            for (let participantIndex = 0; participantIndex < roster.relationships.participants.data.length; participantIndex++) {
                const participant = matches.included.find((e) => e.id ===
                    roster.relationships.participants.data[participantIndex].id);
                const player = matches.included.find((e) => e.id === participant.relationships.player.data.id);
                const customParticipantDataModel = {
                    actor: participant.attributes.actor.substring(1, participant.attributes.actor.length - 1),
                    skillTier: participant.attributes.stats.skillTier,
                    assists: participant.attributes.stats.assists,
                    crystalMineCaptures: participant.attributes.stats.crystalMineCaptures,
                    deaths: participant.attributes.stats.deaths,
                    farm: participant.attributes.stats.farm,
                    firstAfkTime: participant.attributes.stats.firstAfkTime,
                    gold: participant.attributes.stats.gold,
                    goldMineCaptures: participant.attributes.stats.goldMineCaptures,
                    items: participant.attributes.stats.items,
                    jungleKills: participant.attributes.stats.jungleKills,
                    kills: participant.attributes.stats.kills,
                    krakenCaptures: participant.attributes.stats.krakenCaptures,
                    nonJungleMinionKills: participant.attributes.stats.nonJungleMinionKills,
                    skinKey: participant.attributes.stats.skinKey,
                    wentAfk: participant.attributes.stats.wentAfk,
                    player: {
                        id: player.id,
                        name: player.attributes.name,
                    },
                };
                customRosterDataModel.participants.push(customParticipantDataModel);
            }
            customMatchDataModel.rosters.push(customRosterDataModel);
        }
        if (telemetryAssetId !== undefined) {
            formattedMatches.push(new Match_1.Match(customMatchDataModel));
        }
    });
    return formattedMatches;
}
//# sourceMappingURL=applyfilter.js.map