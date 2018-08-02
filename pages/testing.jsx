import React from "react";

export default () => (
	<React.Fragment>
		<iframe src="http://localhost:3000" />
		<label>IGN</label>
		<input id="input" type="text" placeholder="Tvůj nick ve hře" />
		<input id="getPlayer" type="button" value="Zobrazit hráče" />
		<input id="getMatch" type="button" value="Poslední hra" />
		<input id="getTelemetry" type="button" value="Telemetrie" />
		<input id="getTeam" type="button" value="Tým" />
		<label>Mód</label>
		<select id="mode">
			<option value="all">Vše</option>
			<option value="5v5casual">5v5 Casual</option>
			<option value="5v5ranked">5v5 Ranked</option>
			<option value="ranked">Ranked</option>
			<option value="casual">Casual</option>
			<option value="br">Battle Royale</option>
			<option value="blitz">Blitz</option>
			<option value="onslaught">Onslaught</option>
		</select>
		<input type="checkbox" name="private" id="private" /> Private
		<br />
		<label>Player:</label>
		<textarea cols="50" rows="20" id="console" />
		<label>Match:</label>
		<textarea cols="50" rows="20" id="console2" />
		<label>Telemetry:</label>
		<textarea cols="50" rows="20" id="console3" />
		<label>Team:</label>
		<textarea cols="50" rows="20" id="console4" />
		<div
			dangerouslySetInnerHTML={{
				__html: `<script type="text/javascript">
        function formatTime(time) {

            time = time.split(":");
            if (time[0].length < 2) time[0] = '0' + time[0];
            if (time[1].length < 2) time[1] = '0' + time[1];

            return time.join(":");

        }

        function formatDate(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear(),
                hours = '' + d.getHours(),
                minutes = '' + d.getMinutes();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            if (hours.length < 2) hours = '0' + hours;
            if (minutes.length < 2) minutes = '0' + minutes;

            return [day, month, year].join('. ') + " " + [hours, minutes].join(':');
        }

        function getEmojiHero(hero) {

            switch (hero) {
                case "*Adagio*":
                    hero = "Adagio";
                    break;
                case "*Lyra*":
                    hero = "Lyra";
                    break;
                case "*Glaive*":
                    hero = "Glaive";
                    break;
                case "*Petal*":
                    hero = "Petal";
                    break;
                case "*Ringo*":
                    hero = "Ringo";
                    break;
                case "*Taka*":
                    hero = "Taka";
                    break;
                case "*Koshka*":
                    hero = "Koshka";
                    break;
                case "*Alpha*":
                    hero = "Alpha";
                    break;
                case "*Celeste*":
                    hero = "Celeste";
                    break;
                case "*Vox*":
                    hero = "Vox";
                    break;
                case "*Fortress*":
                    hero = "Fortress";
                    break;
                case "*Gwen*":
                    hero = "Gwen";
                    break;
                case "*Idris*":
                    hero = "Idris";
                    break;
                case "*Kestrel*":
                    hero = "Kestrel";
                    break;
                case "*Phinn*":
                    hero = "Phinn";
                    break;
                case "*Blackfeather*":
                    hero = "Blackfeather";
                    break;
                case "*Reim*":
                    hero = "Reim";
                    break;
                case "*Ozo*":
                    hero = "Ozo";
                    break;
                case "*Ardan*":
                    hero = "Ardan";
                    break;
                case "*Baptiste*":
                    hero = "Baptiste";
                    break;
                case "*Skye*":
                    hero = "Skye";
                    break;
                case "*Catherine*":
                    hero = "Catherine";
                    break;
                case "*Krul*":
                    hero = "Krul";
                    break;
                case "*Samuel*":
                    hero = "Samuel";
                    break;
                case "*Rona*":
                    hero = "Rona";
                    break;
                case "*Baron*":
                    hero = "Baron";
                    break;
                case "*Flicker*":
                    hero = "Flicker";
                    break;
                case "*Grumpjaw*":
                    hero = "Grumpjaw";
                    break;
                case "*Grace*":
                    hero = "Grace";
                    break;
                case "*Joule*":
                    hero = "Joule";
                    break;
                case "*Lance*":
                    hero = "Lance";
                    break;
                case "*Reza*":
                    hero = "Reza";
                    break;
                case "*SAW*":
                    hero = "SAW";
                    break;
                case "*Skaarf*":
                    hero = "Skaarf";
                    break;
                case "*Churnwalker*":
                    hero = "Churnwalker";
                    break;
                case "*Varya*":
                    hero = "Varya";
                    break;
                default:
                    hero = "Lorelai";
            }

            return hero;

        }

        var getJSON = function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);

            xhr.setRequestHeader('Authorization', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3ZmVlYTMwMC1mMTU3LTAxMzQtYzgzZS0wMjQyYWMxMTAwMDMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNDkwMjA1Njg5LCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiI3ZmViZTNlMC1mMTU3LTAxMzQtYzgzZC0wMjQyYWMxMTAwMDMiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.rQrjRyo54Fdgicbv67pABSuu2zikb5MFa_gsidu0aBs');
            xhr.setRequestHeader('X-TITLE-ID', 'semc-vainglory');
            xhr.setRequestHeader('Accept', 'application/vnd.api+json');

            xhr.responseType = 'json';
            xhr.onload = function () {
                var status = xhr.status;
                if (status == 200) {
                    callback(null, xhr.response);
                } else {
                    console.log(url);
                    callback(status);
                }
            };
            xhr.send();
        };

        var getPlayerData = function (playerName) {

            var borderdate = new Date();
            borderdate = borderdate.setDate(borderdate.getDate() - 14);
            borderdate = new Date(borderdate).toJSON();

            getJSON("https://api.dc01.gamelockerapp.com/shards/eu/players?filter[playerNames]=" + playerName, function (err, response) {

                if (err !== null) {

                    document.getElementById("console").value = 'Někde se stala chyba: ' + err;

                } else if (borderdate > response.data[0].attributes.createdAt) {

                    document.getElementById("console").value = playerName + ' už víc jak 2 týdny nehrál. Nejsou pro něj dostupné statistiky.';

                } else {

                    console.log("playerdata", response.data[0]);

                    var playerData = {};

                    playerData.name = playerName;
                    var stats = response.data[0].attributes.stats;

                    var karma = stats.karmaLevel;
                    switch (karma) {

                        case 1:
                            karma = "Good Karma";
                            break;
                        case 2:
                            karma = "Great Karma :)";
                            break;
                        default:
                            karma = "Bad Karma :(";

                    }
                    playerData.karma = karma;

                    playerData.level = stats.level;
                    playerData.gold = stats.lifetimeGold;
                    playerData.br = stats.gamesPlayed.aral;
                    playerData.blitz = stats.gamesPlayed.blitz;
                    playerData.casual = stats.gamesPlayed.casual;
                    playerData.ranked = stats.gamesPlayed.ranked;

                    var tier = parseInt(stats.skillTier / 3) + 1;
                    var color = stats.skillTier % 3;
                    switch (color) {

                        case 0:
                            color = "B";
                            break;
                        case 1:
                            color = "S";
                            break;
                        default:
                            color = "G";

                    }

                    playerData.wins = stats.wins;

                    playerData.tier = tier + color;

                    playerData.rankPoints = stats.rankPoints;

                    playerData.guildTag = stats.guildTag;

                    document.getElementById("console").value = playerData.tier + "\n";
                    document.getElementById("console").value += playerData.name + "\n";
                    document.getElementById("console").value += playerData.guildTag + "\n";
                    document.getElementById("console").value += playerData.karma + "\n";
                    document.getElementById("console").value += playerData.level + "\n";
                    document.getElementById("console").value += playerData.casual + "\n";
                    document.getElementById("console").value += playerData.ranked + "\n";
                    document.getElementById("console").value += playerData.blitz + "\n";
                    document.getElementById("console").value += playerData.br + "\n";
                    document.getElementById("console").value += playerData.rankPoints.ranked + "\n";
                    document.getElementById("console").value += playerData.wins;

                    document.getElementById("console").value = JSON.stringify(response);

                }

            });

        };

        var getMatchData = function (playerName, mode, isPrivate) {

            var gameMode = "filter[gameMode]=";

            if (!isPrivate) {

                switch (mode) {

                    case "5v5ranked":
                        gameMode += "5v5_pvp_ranked&";
                        break;

                    case "5v5casual":
                        gameMode += "5v5_pvp_casual&";
                        break;

                    case "ranked":
                        gameMode += "ranked&";
                        break;

                    case "casual":
                        gameMode += "casual&";
                        break;

                    case "br":
                        gameMode += "casual_aral&";
                        break;

                    case "blitz":
                        gameMode += "blitz_pvp_ranked&";
                        break;

                    case "onslaught":
                        gameMode += "blitz_rounds_pvp_casual&";
                        break;

                    default:
                        gameMode = "";

                }

            } else {

                switch (mode) {

                    case "5v5ranked":
                        gameMode += "private_party_draft_match_5v5&";
                        break;

                    case "5v5casual":
                        gameMode += "private_party_vg_5v5&";
                        break;

                    case "ranked":
                        gameMode += "private_party_draft_match&";
                        break;

                    case "casual":
                        gameMode += "private&";
                        break;

                    case "br":
                        gameMode += "private_party_aral_match&";
                        break;

                    case "blitz":
                        gameMode += "private_party_blitz_match&";
                        break;

                    case "onslaught":
                        gameMode += "private_party_blitz_rounds_match&";
                        break;

                    default:
                        gameMode = "";

                }

            }

            getJSON("https://api.dc01.gamelockerapp.com/shards/eu/matches?" + gameMode + "page[limit]=1&sort=-createdAt&filter[playerNames]=" + playerName, function (err, response) {

                document.getElementById("console2").value = JSON.stringify(response);

                if (err !== null) {

                    document.getElementById("console2").value = 'Někde se stala chyba: ' + err;

                } else {

                    if (response.data === undefined) {

                        document.getElementById("console2").value = "Někde se stala chyba :(\n1) Zkontroluj nick, zda jsou správně velká a malá písmena apod.\n2) Bot vyhledává pouze EU hráče.\n3) Je možné, že hráč velmi dlouho (nebo vůbec) nehrál daný mód, proto pro něj nejsou dostupná response.";

                    } else {

                        console.log("matchdata", response.data[0]);

                        var data = response.data[0];

                        var duration = data.attributes.duration;
                        var gameMode = data.attributes.gameMode;
                        var endGameReason = data.attributes.stats.endGameReason;
                        var playerId = data.id;
                        var createdAt = data.attributes.createdAt;

                        var included = response.included;

                        var rosters = [];
                        var participants = [];
                        var players = [];
                        var teams = {};

                        var messageData = {
                            "general": { "time": "", "duration": "", "gameMode": "" },
                            "team": [

                                {
                                    "title": "",
                                    "subtitle": "",
                                    "imageUrl": "http://x.vainglory.eu/bot/",

                                    "player": []

                                },

                                {
                                    "title": "",
                                    "subtitle": "",
                                    "imageUrl": "http://x.vainglory.eu/bot/",

                                    "player": []

                                }

                            ]
                        };

                        for (var i in included) {

                            switch (included[i].type) {

                                case "player":
                                    players.push(included[i]);
                                    break;
                                case "participant":
                                    participants.push(included[i]);
                                    break;
                                case "roster":
                                    rosters.push(included[i]);

                            }

                        }

                        for (var j in rosters) {

                            var attributes = rosters[j].attributes;

                            teams[attributes.stats.side] = {};
                            teams[attributes.stats.side].stats = attributes.stats;
                            teams[attributes.stats.side].won = attributes.won;
                            teams[attributes.stats.side].participants = [];

                            for (var k in rosters[j].relationships.participants.data) {

                                var id = rosters[j].relationships.participants.data[k].id;

                                for (var l in players) {

                                    if (participants[l].id == id) {

                                        teams[attributes.stats.side].participants.push(participants[l]);

                                    }

                                }

                            }

                        }

                        var side = ["left/blue", "right/red"];

                        for (var m in teams[side[0]].participants) {

                            var pid = teams[side[0]].participants[m].relationships.player.data.id;

                            for (var n in players) {

                                if (players[n].id == pid) {

                                    teams[side[0]].participants[m].playerData = players[n];

                                }

                            }

                        }
                        for (var o in teams[side[1]].participants) {

                            var plid = teams[side[1]].participants[o].relationships.player.data.id;

                            for (var p in players) {

                                if (players[p].id == plid) {

                                    teams[side[1]].participants[o].playerData = players[p];

                                }

                            }

                        }

                        messageData.general.time += formatDate(createdAt);

                        var durationFormat = parseInt(duration / 60) + ":" + duration % 60;

                        var gameModeDict = {
                            'blitz_pvp_ranked': 'Blitz',
                            'ranked': 'Ranked',
                            'private_party_blitz_match': 'Private Blitz',
                            'casual': 'Casual',
                            'casual_aral': 'Battle Royale',
                            'private': 'Private Casual',
                            'private_party_draft_match': 'Private Ranked',
                            'private_party_aral_match': 'Private Battle Royale',
                            'private_party_blitz_rounds_match': 'Private Onslaught',
                            'blitz_rounds_pvp_casual': 'Onslaught'
                        };

                        messageData.general.duration += formatTime(durationFormat) + " min";
                        if (gameModeDict[gameMode] !== undefined) {
                            messageData.general.gameMode += gameModeDict[gameMode];
                        } else {
                            messageData.general.gameMode += ""; // neznámý mód
                        }

                        //sendTextMessage(senderID, message);

                        messageData.team[0].title += messageData.general.time + "          ";

                        messageData.team[0].title += " " + messageData.general.duration + "\n" + messageData.general.gameMode + " ";

                        messageData.team[1].title += "Tým vpravo ";

                        for (var sideIndex in side) {

                            if (teams[side[sideIndex]].won == "true") {

                                messageData.team[sideIndex].imageUrl += "win.png";
                                messageData.team[sideIndex].title += "🏆\n";

                            } else if (endGameReason !== "surrender") {

                                messageData.team[sideIndex].imageUrl += "defeat.png";
                                messageData.team[sideIndex].title += "🙈\n";

                            } else {

                                messageData.team[sideIndex].imageUrl += "surrender.png";
                                messageData.team[sideIndex].title += "🏳\n";

                            }

                            messageData.team[sideIndex].subtitle += "⚔️" + teams[side[sideIndex]].stats.heroKills + " ";
                            messageData.team[sideIndex].subtitle += "🃏" + teams[side[sideIndex]].stats.acesEarned + " ";
                            messageData.team[sideIndex].subtitle += "💰" + teams[side[sideIndex]].stats.gold + " ";
                            messageData.team[sideIndex].subtitle += "🦑" + teams[side[sideIndex]].stats.krakenCaptures + " ";
                            messageData.team[sideIndex].subtitle += "🗼" + teams[side[sideIndex]].stats.turretsRemaining + "";

                            for (var i in teams[side[sideIndex]].participants) {

                                messageData.team[sideIndex].player[i] = { "name": "", "title": "", "subtitle": "", "imageUrl": "" };

                                var tier = parseInt(teams[side[sideIndex]].participants[i].playerData.attributes.stats.skillTier / 3) + 1;
                                //tier = getEmojiTier(tier);

                                var color = teams[side[sideIndex]].participants[i].playerData.attributes.stats.skillTier % 3;

                                switch (color) {

                                    case 0:
                                        messageData.team[sideIndex].player[i].title += tier + "B ";
                                        break;
                                    case 1:
                                        messageData.team[sideIndex].player[i].title += tier + "S ";
                                        break;
                                    default:
                                        messageData.team[sideIndex].player[i].title += tier + "G ";

                                }
                                messageData.team[sideIndex].player[i].name += teams[side[sideIndex]].participants[i].playerData.attributes.name;
                                messageData.team[sideIndex].player[i].title += teams[side[sideIndex]].participants[i].playerData.attributes.name + "\n";
                                messageData.team[sideIndex].player[i].imageUrl += "http://x.vainglory.eu/bot/avatars/" + getEmojiHero(teams[side[sideIndex]].participants[i].attributes.actor) + ".png";
                                messageData.team[sideIndex].player[i].title += teams[side[sideIndex]].participants[i].attributes.stats.kills + "/";
                                messageData.team[sideIndex].player[i].title += teams[side[sideIndex]].participants[i].attributes.stats.deaths + "/";
                                messageData.team[sideIndex].player[i].title += teams[side[sideIndex]].participants[i].attributes.stats.assists + " • ";
                                messageData.team[sideIndex].player[i].title += "CS " + parseInt(teams[side[sideIndex]].participants[i].attributes.stats.farm);

                            }

                        }

                        //sendTextMessage(senderID, message);

                        /*
    
                        if (teams[side[1]].won == "true") {
    
                            messageData.team[1].imageUrl += "win.png";
                            messageData.team[1].title += "🏆\n";
    
                        } else if (endGameReason !== "surrender") {
    
                            messageData.team[1].imageUrl += "defeat.png";
                            messageData.team[1].title += "🙈\n";
    
                        } else {
    
                            messageData.team[1].imageUrl += "surrender.png";
                            messageData.team[1].title += "🏳\n";
    
                        }
    
                        messageData.team[1].subtitle += "⚔️" + teams[side[1]].stats.heroKills + " ";
                        messageData.team[1].subtitle += "🃏" + teams[side[1]].stats.acesEarned + " ";
                        messageData.team[1].subtitle += "💰" + teams[side[1]].stats.gold + " ";
                        messageData.team[1].subtitle += "🦑" + teams[side[1]].stats.krakenCaptures + " ";
                        messageData.team[1].subtitle += "🗼" + teams[side[1]].stats.turretsRemaining + "";
    
                        for (var i in teams[side[1]].participants) {
    
                            messageData.team[1].player[i] = { "name": "", "title": "", "subtitle": "", "imageUrl": "" };
    
                            var tier = parseInt(teams[side[1]].participants[i].playerData.attributes.stats.skillTier / 3) + 1;
                            //tier = getEmojiTier(tier);
                            var color = teams[side[1]].participants[i].playerData.attributes.stats.skillTier % 3;
                            switch (color) {
    
                                case 0:
                                    messageData.team[1].player[i].title += tier + "B ";
                                    break;
                                case 1:
                                    messageData.team[1].player[i].title += tier + "S ";
                                    break;
                                default:
                                    messageData.team[1].player[i].title += tier + "G ";
    
                            }
                            messageData.team[1].player[i].name += teams[side[1]].participants[i].playerData.attributes.name;
                            messageData.team[1].player[i].title += teams[side[1]].participants[i].playerData.attributes.name + "\n";
                            messageData.team[1].player[i].imageUrl += "http://x.vainglory.eu/bot/avatars/" + getEmojiHero(teams[side[1]].participants[i].attributes.actor) + ".png";
                            messageData.team[1].player[i].title += teams[side[1]].participants[i].attributes.stats.kills + "/";
                            messageData.team[1].player[i].title += teams[side[1]].participants[i].attributes.stats.deaths + "/";
                            messageData.team[1].player[i].title += teams[side[1]].participants[i].attributes.stats.assists + " • ";
                            messageData.team[1].player[i].title += "CS " + parseInt(teams[side[1]].participants[i].attributes.stats.farm);
    
                        }*/

                        document.getElementById("console2").value += JSON.stringify(response);

                    }

                }

            });

        };


        document.getElementById("getPlayer").addEventListener("click", function () {

            var IGN = document.getElementById("input").value;
            document.getElementById("console").value = "Čekej...";

            getPlayerData(IGN);

        });

        document.getElementById("getMatch").addEventListener("click", function () {

            var IGN = document.getElementById("input").value;
            var mode = document.getElementById("mode").value;
            var private = document.getElementById("private").checked;

            document.getElementById("console2").value = "Čekej...";

            getMatchData(IGN, mode, private);

        });

        document.getElementById("getTelemetry").addEventListener("click", function () {
            var url = "https://cdn.gamelockerapp.com/semc-vainglory/eu/2018/06/23/22/01/f3962d2d-7730-11e8-a7c3-0a5864600804-telemetry.json"
            document.getElementById("console3").value = "here"
            getJSON(url, function (err, res) {
                console.log(res);

                var damage = {};

                for (var item in res) {
                    if (res[item].type === "DealDamage") {
                        if (res[item].payload.IsHero === 1) {
                            if (damage[res[item].payload.Actor + res[item].payload.Team]) {
                                damage[res[item].payload.Actor + res[item].payload.Team] += res[item].payload.Dealt
                            } else {
                                damage[res[item].payload.Actor + res[item].payload.Team] = res[item].payload.Dealt
                            }
                        } else {
                            console.log("exception")
                        }
                    }
                }

                document.getElementById("console3").value = JSON.stringify(res);
            })
        })

        document.getElementById("getTeam").addEventListener("click", function () {

            var url = "https://api.dc01.gamelockerapp.com/shards/eu/matches?filter[teamNames]=eSu"

            getJSON(url, function (err, res) {
                document.getElementById("console4").value += JSON.stringify(err);
                document.getElementById("console4").value += JSON.stringify(res);
            })

        });

    </script>`
			}}
		/>
	</React.Fragment>
);
