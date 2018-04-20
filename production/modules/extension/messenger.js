"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const BotUser_1 = require("./../../models/BotUser");
const getData_1 = require("./../functions/getData");
const axios_1 = require("axios");
exports.default = router;
// Webhook validation
router.get("/webhook", (req, res) => {
    if (req.query["hub.mode"] === "subscribe" &&
        req.query["hub.verify_token"] === "vgeuverify") {
        console.log("Validating webhook");
        res.status(200).send(req.query["hub.challenge"]);
    }
    else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});
// Message processing
router.post("/webhook", (req, res) => {
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
    console.log(JSON.stringify(message));
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
            getPlayerInfo(input, userID);
        }
        else if ((msgArray.length == 2 || msgArray.length == 3) &&
            msgArray[1].toUpperCase() == "LM") {
            getPlayerInfo(msgArray[0], userID);
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
const getPlayerInfo = (input, userID) => {
    //   const now = new Date();
    //   const nowMinus: number = now.setDate(now.getDate() - 14);
    //   const borderdate = new Date(nowMinus).toJSON();
    getData_1.default(input)
        .then((data) => {
        if (!data.player)
            throw new Error("Invalid player #invp");
        const player = data.player;
        const playerData = {};
        playerData.name = input;
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
        playerData.karma = karma;
        playerData.level = player.level;
        playerData.casual = player.played_casual;
        playerData.casual_5v5 = player.played_casual_5v5;
        playerData.ranked_5v5 = player.played_ranked_5v5;
        playerData.ranked = player.played_ranked;
        playerData.blitz = player.played_blitz;
        const tier = player.skillTier / 3 + 1;
        const colorNumber = player.skillTier % 3;
        let color = "B";
        switch (colorNumber) {
            case 0:
                color = "B";
                break;
            case 1:
                color = "S";
                break;
            default:
                color = "G";
        }
        playerData.wins = player.wins;
        playerData.tier = tier + color;
        playerData.rankPoints = player.rank_3v3;
        playerData.rankPoints_5v5 = player.rank_5v5;
        playerData.guildTag = player.guildTag;
        sendPlayerInfo(userID, playerData);
    })
        .catch(err => {
        console.log(err);
        sendSystemMessage(userID, "Something went wrong :(\n\n1) Please check the spelling and capitalisation of the nick.\n\n2) If the player hasn't played this mode for a long time, we don't have data for them.\n\n3) Maybe the player has changed their nick?\n\n4) There might be also an issue on SEMC side (developers of Vainglory). You can try again later.\n" +
            err);
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
        getPlayerInfo(payload[1], userID);
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
    setTimeout(callback, 1000);
};
const sendMyData = (userID) => {
    findOrCreateUser(userID)
        .then(user => {
        if (user.defaultIGN) {
            getPlayerInfo(user.defaultIGN, userID);
        }
        else {
            const messageData = {
                messaging_type: "RESPONSE",
                recipient: { id: userID },
                message: {
                    text: 'You can set your default nick by sending it and clicking on "Save"'
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
                text: "An error has occured, please contact the devlopers. " + err
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
        'You can access this extension from any of your personal or group chats by clicking on the "(+)" sign in the bottom left corner. (You cannot do it here, you must switch to another chat.)',
        "We will not recognize the nick if it has an incorrect spelling and/or capitalisation.",
        "Type a player's nick and send the message for the player's statistics.\nFor example:\nL3oN\nESQuire\nPalmatoro\netc.",
        "If you set a default nick, the extension will always show your latest match instead of L3oN's ;)"
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
const sendPlayerInfo = (userID, data) => {
    var messageData = {
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
                            title: data.tier + " " + data.name + " [" + data.guildTag + "]",
                            subtitle: data.karma + "\nLevel: " + data.level
                        },
                        {
                            title: "Ranked Games Played",
                            subtitle: data.ranked +
                                "× 3v3 Rankeds\n" +
                                data.blitz +
                                "× 3v3 Blitz Rankeds"
                        },
                        {
                            title: "Casual Games Played",
                            subtitle: data.casual +
                                "× 3v3 Casuals\n" +
                                data.casual_5v5 +
                                "× 5v5 Casuals"
                        },
                        {
                            title: "Statistics",
                            subtitle: "3v3/5v5 Rank points: " +
                                data.rankPoints.toFixed(0) +
                                "/" +
                                data.rankPoints_5v5.toFixed(0) +
                                "\nTotal wins: " +
                                data.wins
                        }
                    ],
                    buttons: [
                        {
                            type: "web_url",
                            url: "https://test.vainglory.eu/extension/player/" + data.name,
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
                                    payload: "set " + data.name
                                }
                            ]
                        }
                    }
                }
            };
            setTimeout(function () {
                callSendAPI(saveIGN);
            }, 250);
        }
    })
        .catch(err => {
        var messageData = {
            messaging_type: "RESPONSE",
            recipient: { id: userID },
            message: {
                text: "An error has occured, please contact the developers. " + err
            }
        };
        callSendAPI(messageData);
    });
};
const setIGN = (nick, userID) => {
    findOrCreateUser(userID)
        .then(user => {
        if (nick == "del") {
            user.defaultIGN = undefined;
            sendTextMessage(userID, "Deleted. You can set your default IGN again anytime. Just type it and hit send.");
        }
        else {
            user.defaultIGN = nick;
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
            access_token: "EAAIxVyRb1vwBAHhU8w9UNT7G5mv9CR7oPra44BXAHS6PwVkf7OOwR5bKZCCXbZB0l2IJ01b7HxonqYrtUyg9d7w2ykbW5dlhZCbkZCxRxThgJQ9nZAhHHwBTH8CxPhyl2ftVi8UNv36EwLKPyOpDtuKmhDQgfoaNclpMjxf1ZCoAZDZD"
        },
        data: messageData,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        }
    })
        .then((fbRes) => {
        if (fbRes.status == 200) {
            console.log("Successfully sent message with id %s to recipient %s", fbRes.data.message_id, fbRes.data.recipient_id);
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
                text: "Welcome to Vainglory Messenger Extension. See your Vainglory match statistics and quickly share them with your friends! Tap on the button below and then type in your In-Game Nickname."
            }
            /*{
                  locale: "en_US",
                  text: "Hi!"
              }*/
        ],
        home_url: {
            url: "https://test.vainglory.eu/extension",
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
            "https://vain.zone"
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
                                payload: "set " + "del"
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
            access_token: "EAAIxVyRb1vwBAHhU8w9UNT7G5mv9CR7oPra44BXAHS6PwVkf7OOwR5bKZCCXbZB0l2IJ01b7HxonqYrtUyg9d7w2ykbW5dlhZCbkZCxRxThgJQ9nZAhHHwBTH8CxPhyl2ftVi8UNv36EwLKPyOpDtuKmhDQgfoaNclpMjxf1ZCoAZDZD"
        },
        data: info,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
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
        throw new Error(err);
    });
};
//getProfile();
router.get("/updateprofile", (req, res) => {
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