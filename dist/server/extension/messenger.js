"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("next/config");
const { serverRuntimeConfig } = config_1.default();
const express_1 = require("express");
const router = express_1.Router();
const BotUser_1 = require("./../../models/BotUser");
const Player_1 = require("./../../models/Player");
const getData_1 = require("./../../functions/getData");
const skillTierCalculator_1 = require("./../../functions/skillTierCalculator");
const axios_1 = require("axios");
exports.default = router;
// Webhook validation
router
    .route("/webhook")
    .get((req, res) => {
    if (req.query["hub.mode"] === "subscribe" &&
        req.query["hub.verify_token"] ===
            serverRuntimeConfig.fbMessengerVerifyToken) {
        console.log("Validating webhook");
        res.status(200).send(req.query["hub.challenge"]);
    }
    else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
})
    // Message processing
    .post((req, res) => {
    var data = req.body;
    // Make sure this is a page subscription
    if (data.object === "page") {
        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach((entry) => {
            //   var pageID = entry.id;
            //   var timeOfEvent = entry.time;
            // Iterate over each messaging event
            entry.messaging.forEach((event) => {
                findOrCreateUser(event.sender.id).catch(err => {
                    console.log(err);
                });
                if (event.message) {
                    setTyping(event, receivedMessage);
                }
                else if (event.postback) {
                    setTyping(event, receivedPostback);
                }
                else {
                    console.log("Webhook received unknown event: ", event);
                }
            });
        });
        // Assume all went well.
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200);
    }
    else {
        res.sendStatus(400);
    }
});
// Incoming events handling
const receivedMessage = (event) => {
    var userID = event.sender.id;
    var pageID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;
    console.log("Received message for user %d and page %d at %d with message:", userID, pageID, timeOfMessage);
    console.log(message);
    //   var messageID = message.mid;
    var messageText = message.text;
    var messageAttachments = message.attachments;
    if (messageText) {
        // If we receive a text message, check to see if it matches a keyword
        // and send back the template.
        var msgArray = messageText.split(" ");
        if (msgArray.length == 1 && msgArray[0].toLowerCase() == "help") {
            sendInstructions(userID);
        }
        else if (msgArray.length == 1) {
            var input = msgArray[0];
            getPlayerInfo({ IGN: input, userID });
        }
        else if ((msgArray.length == 2 || msgArray.length == 3) &&
            msgArray[1].toUpperCase() == "LM") {
            getPlayerInfo({ IGN: msgArray[0], userID });
            //getMatchResults(msgArray, userID);
        }
        else {
            sendSystemMessage(userID, "I don't understand your message. Maybe try to read the Manual?");
        }
    }
    else if (messageAttachments) {
        sendTextMessage(userID, "(y)");
    }
};
const getPlayerInfo = (params) => {
    //   const now = new Date();
    //   const nowMinus: number = now.setDate(now.getDate() - 14);
    //   const borderdate = new Date(nowMinus).toJSON();
    getData_1.default({ IGN: params.IGN, playerID: params.playerID, messenger: true })
        .then((data) => {
        if (!data.player)
            throw new Error("Invalid player #invp");
        sendPlayerInfo(params.userID, data.player);
    })
        .catch(err => {
        console.error("messenger err", err);
        if (err && typeof err.message === "string") {
            if (err.message.indexOf("404") > -1) {
                sendSystemMessage(params.userID, "Player not found :(\n\n- Please check the spelling and capitalisation of the nick.\n\n- Maybe the player has changed their nick?\n");
                if (params.IGN) {
                    Player_1.Player.find({ IGNHistory: params.IGN, name: { $exists: true } })
                        .exec()
                        .then(players => {
                        if (players && players.length) {
                            if (players.length === 1) {
                                callSendAPI({
                                    messaging_type: "RESPONSE",
                                    recipient: {
                                        id: params.userID
                                    },
                                    message: {
                                        attachment: {
                                            type: "template",
                                            payload: {
                                                template_type: "button",
                                                text: `${players[0].name} was previously known as ${params.IGN}. Maybe you wanted to search ${players[0].name} instead?`,
                                                buttons: [
                                                    {
                                                        title: "Search",
                                                        type: "postback",
                                                        payload: `playerdetails ${players[0].name}`
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                });
                            }
                            else {
                                sendTextMessage(params.userID, `The following players were previously known as ${params.IGN}. Maybe you wanted to search one of them?\n\n${players
                                    .map(p => p.name)
                                    .join("\n")}`);
                            }
                        }
                    })
                        .catch(err => console.error(err));
                }
            }
            else if (err.message.indexOf("veryold") > -1) {
                sendTextMessage(params.userID, "Long time no see :(\n\nThe player hasn't played Vainglory for a long time. We don't have data for them.\n");
            }
            else {
                sendTextMessage(params.userID, "Something went wrong.\n\nThere is probably an issue with SEMC (developers of Vainglory), try again later.\n");
            }
        }
        else {
            sendTextMessage(params.userID, "2 Something went wrong.\n\nThere is probably an issue with SEMC (developers of Vainglory), try again later..\n");
        }
    });
};
const receivedPostback = (event) => {
    var userID = event.sender.id;
    var pageID = event.recipient.id;
    var timeOfPostback = event.timestamp;
    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;
    console.log("Received postback for user %d and page %d with payload '%s' " + "at %d", userID, pageID, payload, timeOfPostback);
    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
    payload = payload.split(" ");
    if (payload[0] == "playerdetails") {
        getPlayerInfo({ IGN: payload[1], userID });
    }
    else if (payload[0] == "mystats") {
        sendMyData(userID);
    }
    else if (payload[0] == "help") {
        sendInstructions(userID);
    }
    else if (payload.length == 2 && payload[0] == "set") {
        setIGN(payload[1], userID);
    }
    else {
        sendSystemMessage(userID, 'Welcome to Messenger Extension for Vainglory.\n\nClick on "Usage Manual" right below this message for instructions on how to use this extension.');
    }
};
const findOrCreateUser = (psid) => {
    return BotUser_1.BotUser.findOne({ psid: psid })
        .exec()
        .then(user => {
        if (user) {
            return Promise.resolve(user);
        }
        else {
            const newUser = new BotUser_1.BotUser({ psid: psid });
            return newUser
                .save()
                .then(savedUser => {
                return Promise.resolve(savedUser);
            })
                .catch(err => Promise.reject(err));
        }
    });
};
//////////////////////////
// Sending helpers
//////////////////////////
const setTyping = (event, callback) => {
    var messageData = {
        messaging_type: "RESPONSE",
        recipient: {
            id: event.sender.id
        },
        sender_action: "typing_on"
    };
    callSendAPI(messageData);
    setTimeout(() => {
        callback(event);
    }, 1000);
};
const sendMyData = (userID) => {
    findOrCreateUser(userID)
        .then(user => {
        if (user.defaultIGN) {
            getPlayerInfo({ playerID: user.playerID, userID });
        }
        else {
            const messageData = {
                messaging_type: "RESPONSE",
                recipient: { id: userID },
                message: {
                    text: 'You can set your default nick by sending it here and clicking on "Save" button that comes afterwards.'
                }
            };
            callSendAPI(messageData);
        }
    })
        .catch(err => {
        const messageData = {
            messaging_type: "RESPONSE",
            recipient: { id: userID },
            message: {
                text: "An error has occured, please contact the developers. " + err
            }
        };
        callSendAPI(messageData);
    });
};
const sendTextMessage = (userID, messageText) => {
    const messageData = {
        messaging_type: "RESPONSE",
        recipient: {
            id: userID
        },
        message: {
            text: messageText
        }
    };
    callSendAPI(messageData);
};
// const sendHyacinth = userID => {
//     var messageData = {
//         messaging_type: "RESPONSE",
//         recipient: {
//             id: userID
//         },
//         message: {
//             attachment: {
//                 type: "template",
//                 payload: {
//                     template_type: "list",
//                     top_element_style: "compact",
//                     elements: [
//                         {
//                             title: "Final results",
//                             subtitle: "",
//                             image_url:
//                                 "https://x.vainglory.eu/hyacinth/hotlink-ok/hyacinth-final.png",
//                             buttons: [
//                                 {
//                                     messenger_extensions: true,
//                                     type: "web_url",
//                                     url:
//                                         "https://x.vainglory.eu/hyacinth/hotlink-ok/hyacinth-final.png",
//                                     title: "Show",
//                                     webview_height_ratio: "tall"
//                                 }
//                             ]
//                         },
//                         {
//                             title: "The Winner",
//                             subtitle: "",
//                             image_url:
//                                 "https://x.vainglory.eu/hyacinth/hotlink-ok/winners.png",
//                             buttons: [
//                                 {
//                                     type: "web_url",
//                                     messenger_extensions: true,
//                                     url:
//                                         "https://x.vainglory.eu/hyacinth/hotlink-ok/winners.png",
//                                     title: "Show",
//                                     webview_height_ratio: "compact"
//                                 }
//                             ]
//                         },
//                         {
//                             title: "Final Week VI",
//                             subtitle: "Bracket",
//                             image_url:
//                                 "https://x.vainglory.eu/hyacinth/hotlink-ok/week6.png",
//                             buttons: [
//                                 {
//                                     type: "web_url",
//                                     messenger_extensions: true,
//                                     url:
//                                         "https://x.vainglory.eu/hyacinth/hotlink-ok/week6.png",
//                                     title: "Show",
//                                     webview_height_ratio: "compact"
//                                 }
//                             ]
//                         }
//                     ]
//                 }
//             }
//         }
//     };
//     callSendAPI(messageData);
// };
const sendInstructions = (userID) => {
    const instructions = [
        'You can access this app from any of your personal or group chats by clicking on the "(+)" sign in the bottom left corner (on the phone). (You cannot do it here, you must switch to another chat.)',
        "We will not recognize the nick if it has an incorrect spelling and/or capitalisation.",
        "Type a player's nick and send the message to display the player's statistics.\nFor example:\nL3oN\nFlashX\nPalmatoro\netc.",
        "If you set a default nick, the app will remember it and it will always display your stats when you open the app."
    ];
    for (let i = 0; i < instructions.length; i++) {
        (function (index) {
            setTimeout(function () {
                sendTextMessage(userID, instructions[index]);
            }, 250 * index);
        })(i);
    }
};
const sendSystemMessage = (userID, message) => {
    var messageData = {
        messaging_type: "RESPONSE",
        recipient: {
            id: userID
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: message,
                    buttons: [
                        {
                            title: "Usage Manual",
                            type: "postback",
                            payload: "help"
                        }
                    ]
                }
            }
        }
    };
    callSendAPI(messageData);
};
const sendPlayerInfo = (userID, player) => {
    let rankPointsText = "";
    if (player.rank_5v5) {
        rankPointsText = `3v3 / 5v5 Rank Points: ${Math.floor(player.rank_3v3)} / ${Math.floor(player.rank_5v5)}`;
    }
    else {
        rankPointsText = `3v3 Rank points: ${Math.floor(player.rank_3v3)}`;
    }
    let rankedGamesPlayedText = "";
    if (player.played_ranked_5v5) {
        rankedGamesPlayedText = `${player.played_ranked}× Ranked 3v3\n${player.played_ranked_5v5}× Ranked 5v5`;
    }
    else {
        rankedGamesPlayedText = `${player.played_ranked}× Ranked 3v3\n${player.played_blitz}× Ranked Blitz`;
    }
    let tier = "";
    if (player.rank_5v5) {
        const processed3v3 = skillTierCalculator_1.default(player.rank_3v3);
        const processed5v5 = skillTierCalculator_1.default(player.rank_5v5);
        tier = `(${processed3v3.number}${processed3v3.shortColor}/${processed5v5.number}${processed5v5.shortColor})`;
    }
    else {
        const processed3v3 = skillTierCalculator_1.default(player.rank_3v3);
        tier = `(${processed3v3.number}${processed3v3.shortColor})`;
    }
    const karmaNumber = player.karmaLevel;
    let karma = "Good Karma";
    switch (karmaNumber) {
        case 1:
            karma = "Good Karma";
            break;
        case 2:
            karma = "Great Karma :)";
            break;
        default:
            karma = "Bad Karma :(";
    }
    const messageData = {
        messaging_type: "RESPONSE",
        recipient: {
            id: userID
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "list",
                    top_element_style: "compact",
                    elements: [
                        {
                            title: tier + " " + player.name + " [" + player.guildTag + "]",
                            subtitle: karma + "\nLevel: " + player.level
                        },
                        {
                            title: "Ranked Games Played",
                            subtitle: rankedGamesPlayedText
                        },
                        {
                            title: "Casual Games Played",
                            subtitle: player.played_casual +
                                "× Casual 3v3\n" +
                                player.played_casual_5v5 +
                                "× Casual 5v5"
                        },
                        {
                            title: "Statistics",
                            subtitle: rankPointsText + "\nLifetime wins: " + player.wins
                        }
                    ],
                    buttons: [
                        {
                            type: "web_url",
                            url: `https://vz.vainglory.eu/extension/player/${player.name}?playerID=${player.playerID}`,
                            title: "See more",
                            webview_height_ratio: "full",
                            webview_share_button: "hide",
                            messenger_extensions: true
                        }
                    ]
                }
            }
        }
    };
    callSendAPI(messageData);
    findOrCreateUser(userID)
        .then(user => {
        if (user.defaultIGN) {
            return;
        }
        else {
            const saveIGN = {
                messaging_type: "RESPONSE",
                recipient: { id: userID },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "button",
                            text: "Save as default nick?",
                            buttons: [
                                {
                                    title: "Save",
                                    type: "postback",
                                    payload: `set ${player.name},,,${player.playerID},,,${player.shardId}`
                                }
                            ]
                        }
                    }
                }
            };
            setTimeout(function () {
                callSendAPI(saveIGN);
            }, 350);
        }
    })
        .catch(err => {
        var messageData = {
            messaging_type: "RESPONSE",
            recipient: { id: userID },
            message: {
                text: "An error has occured, please contact the developers. " +
                    err.message
            }
        };
        callSendAPI(messageData);
    });
};
const setIGN = (instructions, userID) => {
    findOrCreateUser(userID)
        .then(user => {
        if (instructions == "VAINZONE_ACTION_DELETE_DEFAULT_NICK") {
            user.defaultIGN = undefined;
            user.playerID = undefined;
            user.shardId = undefined;
            user
                .save()
                .then(() => {
                sendTextMessage(userID, "Deleted. You can set your default IGN again anytime. Just type it and hit send.");
            })
                .catch(err => Promise.reject(err));
        }
        else {
            const newSaveData = instructions.split(",,,");
            if (newSaveData.length !== 3) {
                return Promise.reject(new Error("Save data has suspicious length."));
            }
            user.defaultIGN = newSaveData[0];
            user.playerID = newSaveData[1];
            user.shardId = newSaveData[2];
            user
                .save()
                .then(() => {
                sendTextMessage(userID, "Saved. Now the extension will always show your last match when you open it.");
            })
                .catch(err => Promise.reject(err));
        }
    })
        .catch(err => {
        sendTextMessage(userID, "An error has occured with the previous request. Please contact the developers. " +
            err);
    });
};
const callSendAPI = (messageData) => {
    axios_1.default({
        method: "post",
        url: "https://graph.facebook.com/v2.6/me/messages",
        params: {
            access_token: serverRuntimeConfig.fbMessengerAccessToken
        },
        data: messageData,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        }
    })
        .then(fbRes => {
        if (fbRes.status == 200) {
            console.log("Successfully sent message with id %s to recipient %s", fbRes.data.message_id, fbRes.data.recipient_id);
            try {
                console.log(JSON.stringify(messageData));
            }
            catch (e) {
                console.error(e);
            }
        }
        else {
            console.error(fbRes.status);
            throw new Error("Bad status code #bscfbm");
        }
    })
        .catch(err => {
        console.error("Unable to send message with error:", err);
    });
};
const updateInfo = () => {
    const info = {
        get_started: {
            payload: "Welcome message"
        },
        greeting: [
            {
                locale: "default",
                text: "Welcome to Vainglory Messenger Extension! Tap on the button below and then type in your In-Game Nickname to see your stats." // must be lte 160 characters
            }
            /*{
                  locale: "en_US",
                  text: "Hi!"
              }*/
        ],
        home_url: {
            url: "https://vz.vainglory.eu/extension",
            webview_height_ratio: "tall",
            webview_share_button: "hide",
            in_test: false
        },
        whitelisted_domains: [
            "https://vainglory.eu",
            "https://forum.vainglory.eu",
            "https://x.vainglory.eu",
            "http://localhost:3000",
            "https://test.vainglory.eu",
            "https://vain.zone",
            "http://obscure-meadow-82712.herokuapp.com",
            "https://vz.vainglory.eu"
        ],
        persistent_menu: [
            {
                locale: "default",
                composer_input_disabled: false,
                call_to_actions: [
                    {
                        title: "My Statistics",
                        type: "postback",
                        payload: "mystats"
                    },
                    {
                        title: "More",
                        type: "nested",
                        call_to_actions: [
                            {
                                title: "Usage Manual",
                                type: "postback",
                                payload: "help"
                            },
                            {
                                type: "postback",
                                title: "Delete default nick",
                                payload: "set " + "VAINZONE_ACTION_DELETE_DEFAULT_NICK"
                            }
                        ]
                    }
                ]
            }
        ]
    };
    return axios_1.default({
        method: "post",
        url: "https://graph.facebook.com/v2.6/me/messenger_profile",
        params: {
            access_token: serverRuntimeConfig.fbMessengerAccessToken
        },
        data: info,
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then((fbRes) => {
        if (fbRes.status == 200) {
            console.log("Successfuly updated:", fbRes.data);
        }
        else {
            throw new Error(fbRes.status.toString());
        }
    })
        .catch(err => {
        if (err.response) {
            console.error(err.response.status);
            console.error(err.response.data);
        }
        throw new Error(err);
    });
};
//getProfile();
router.get("/updateprofile", (_req, res) => {
    updateInfo()
        .then(() => {
        res.sendStatus(200);
    })
        .catch(err => {
        console.error("Unable to update msg profile with error:", err);
        res.status(500).send(err);
    });
});
//# sourceMappingURL=messenger.js.map