import { Router, Request, Response } from 'express';
const router = Router();

import { BotUser } from './../../models/BotUser';

import getData, { PlayerWithMatches } from './../functions/getData';

import axios, { AxiosResponse } from 'axios';

export default router;

// Webhook validation
router.get('/webhook', (req: Request, res: Response) => {
  if (
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === 'vgeuverify'
  ) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});

// Message processing
router.post('/webhook', (req: Request, res: Response) => {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach((entry: any) => {
      //   var pageID = entry.id;
      //   var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach((event: any) => {
        findOrCreateUser(event.sender.id).catch((err) => {
          console.log(err);
        });

        if (event.message) {
          setTyping(event, receivedMessage);
        } else if (event.postback) {
          setTyping(event, receivedPostback);
        } else {
          console.log('Webhook received unknown event: ', event);
        }
      });
    });

    // Assume all went well.
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

// Incoming events handling
const receivedMessage = (event: any) => {
  var userID = event.sender.id;
  var pageID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log(
    'Received message for user %d and page %d at %d with message:',
    userID,
    pageID,
    timeOfMessage,
  );
  console.log(JSON.stringify(message));

  //   var messageID = message.mid;
  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template.
    var msgArray = messageText.split(' ');

    if (msgArray.length == 1 && msgArray[0].toLowerCase() == 'help') {
      sendInstructions(userID);
    } else if (msgArray.length == 1) {
      var input = msgArray[0];
      getPlayerInfo(input, userID);
    } else if (
      (msgArray.length == 2 || msgArray.length == 3) &&
      msgArray[1].toUpperCase() == 'LM'
    ) {
      getPlayerInfo(msgArray[0], userID);
      //getMatchResults(msgArray, userID);
    } else {
      sendSystemMessage(
        userID,
        "I don't understand your message. Maybe try to read the Manual?",
      );
    }
  } else if (messageAttachments) {
    sendTextMessage(userID, '(y)');
  }
};

const getPlayerInfo = (input: string, userID: string) => {
  //   const now = new Date();
  //   const nowMinus: number = now.setDate(now.getDate() - 14);
  //   const borderdate = new Date(nowMinus).toJSON();

  getData(input)
    .then((data: PlayerWithMatches) => {
      if (!data.player) throw new Error('Invalid player #invp');

      const player = data.player;

      const playerData: any = {};

      playerData.name = input;

      const karmaNumber = player.karmaLevel;
      let karma = 'Good Karma';
      switch (karmaNumber) {
        case 1:
          karma = 'Good Karma';
          break;
        case 2:
          karma = 'Great Karma :)';
          break;
        default:
          karma = 'Bad Karma :(';
      }
      playerData.karma = karma;

      playerData.level = player.level;
      playerData.casual = player.played_casual;
      playerData.casual_5v5 = player.played_casual_5v5;
      playerData.ranked_5v5 = player.played_ranked_5v5;
      playerData.ranked = player.played_ranked;
      playerData.blitz = player.played_blitz;

      playerData.wins = player.wins;

      playerData.rankPoints = player.rank_3v3;

      playerData.rankPoints_5v5 = player.rank_5v5;

      playerData.guildTag = player.guildTag;

      sendPlayerInfo(userID, playerData);
    })
    .catch((err) => {
      console.log(err);
      sendSystemMessage(
        userID,
        "Something went wrong :(\n\n1) Please check the spelling and capitalisation of the nick.\n\n2) If the player hasn't played a match recently, we don't have data for them.\n\n3) Maybe the player has changed their nick?\n\n4) There might be also an issue on SEMC side (developers of Vainglory). You can try again later.\n" +
          err,
      );
    });
};

const receivedPostback = (event: any) => {
  var userID = event.sender.id;
  var pageID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log(
    "Received postback for user %d and page %d with payload '%s' " + 'at %d',
    userID,
    pageID,
    payload,
    timeOfPostback,
  );

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful

  payload = payload.split(' ');

  if (payload[0] == 'playerdetails') {
    getPlayerInfo(payload[1], userID);
  } else if (payload[0] == 'mystats') {
    sendMyData(userID);
  } else if (payload[0] == 'help') {
    sendInstructions(userID);
  } else if (payload.length == 2 && payload[0] == 'set') {
    setIGN(payload[1], userID);
  } else {
    sendSystemMessage(
      userID,
      'Welcome to Messenger Extension for Vainglory.\n\nClick on "Usage Manual" right below this message for instructions on how to use this extension.',
    );
  }
};

const findOrCreateUser = (psid: string) => {
  return BotUser.findOne({ psid: psid })
    .exec()
    .then((user) => {
      if (user) {
        return Promise.resolve(user);
      } else {
        const newUser = new BotUser({ psid: psid });
        return newUser
          .save()
          .then((savedUser) => {
            return Promise.resolve(savedUser);
          })
          .catch((err) => Promise.reject(err));
      }
    });
};

//////////////////////////
// Sending helpers
//////////////////////////
const setTyping = (event: any, callback: Function) => {
  var messageData = {
    messaging_type: 'RESPONSE',
    recipient: {
      id: event.sender.id,
    },
    sender_action: 'typing_on',
  };

  callSendAPI(messageData);

  setTimeout(() => {
    callback(event);
  }, 1000);
};

const sendMyData = (userID: string) => {
  findOrCreateUser(userID)
    .then((user) => {
      if (user.defaultIGN) {
        getPlayerInfo(user.defaultIGN, userID);
      } else {
        const messageData = {
          messaging_type: 'RESPONSE',
          recipient: { id: userID },
          message: {
            text:
              'You can set your default nick by sending it and clicking on "Save"',
          },
        };

        callSendAPI(messageData);
      }
    })
    .catch((err) => {
      const messageData = {
        messaging_type: 'RESPONSE',
        recipient: { id: userID },
        message: {
          text: 'An error has occured, please contact the devlopers. ' + err,
        },
      };

      callSendAPI(messageData);
    });
};

const sendTextMessage = (userID: string, messageText: string) => {
  const messageData = {
    messaging_type: 'RESPONSE',
    recipient: {
      id: userID,
    },
    message: {
      text: messageText,
    },
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

const sendInstructions = (userID: string) => {
  const instructions = [
    'You can access this extension from any of your personal or group chats by clicking on the "(+)" sign in the bottom left corner. (You cannot do it here, you must switch to another chat.)',
    'We will not recognize the nick if it has an incorrect spelling and/or capitalisation.',
    "Type a player's nick and send the message for the player's statistics.\nFor example:\nL3oN\nESQuire\nPalmatoro\netc.",
    "If you set a default nick, the extension will always show your latest match instead of L3oN's ;)",
  ];
  for (let i = 0; i < instructions.length; i++) {
    (function(index) {
      setTimeout(function() {
        sendTextMessage(userID, instructions[index]);
      }, 250 * index);
    })(i);
  }
};

const sendSystemMessage = (userID: string, message: any) => {
  var messageData = {
    messaging_type: 'RESPONSE',
    recipient: {
      id: userID,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: message,
          buttons: [
            {
              title: 'Usage Manual',
              type: 'postback',
              payload: 'help',
            },
          ],
        },
      },
    },
  };

  callSendAPI(messageData);
};

const processRankPoints = (rp_3v3: number | null, rp_5v5: number | null) => {
  let rankPoints = rp_3v3;
  if (rp_5v5) rankPoints = rp_5v5;
  if (rp_5v5 && rp_3v3) rankPoints = Math.max(rp_5v5, rp_3v3);

  const processedRankPoints = ((rawRankPoints) => {
    const rankPointLimits = [
      -1,
      0,
      109,
      218,
      327,
      436,
      545,
      654,
      763,
      872,
      981,
      1090,
      1200,
      1250,
      1300,
      1350,
      1400,
      1467,
      1533,
      1600,
      1667,
      1733,
      1800,
      1867,
      1933,
      2000,
      2134,
      2267,
      2400,
      2600,
      2800,
    ];
    let rankProgress = 0.0;
    for (let i = 1; i < rankPointLimits.length; i++) {
      if (
        rawRankPoints >= rankPointLimits[i - 1] &&
        rawRankPoints < rankPointLimits[i]
      ) {
        rankProgress =
          (rawRankPoints - rankPointLimits[i - 1]) /
          (rankPointLimits[i] - 1 - rankPointLimits[i - 1]);
        return {
          value: rawRankPoints,
          progress: rankProgress * 100,
          skillTier: i - 2,
        };
      }
    }

    return {
      value: rawRankPoints,
      progress: 100,
      skillTier: rankPointLimits.length - 2,
    };
  })(rankPoints);

  const skillTierFormats = ((rawSkillTier) => {
    let tierNumber = Math.floor(rawSkillTier / 3) + 1;
    let tierName = '';
    const colorNumber = rawSkillTier % 3;
    let colorName = '';
    switch (tierNumber) {
      case 1:
        tierName = 'Just Beginning';
        break;
      case 2:
        tierName = 'Getting There';
        break;
      case 3:
        tierName = 'Rock Solid';
        break;
      case 4:
        tierName = 'Worthy Foe';
        break;
      case 5:
        tierName = 'Got Swagger';
        break;
      case 6:
        tierName = 'Credible Threat';
        break;
      case 7:
        tierName = 'The Hotness';
        break;
      case 8:
        tierName = 'Simply Amazing';
        break;
      case 9:
        tierName = 'Pinnacle of Awesome';
        break;
      case 10:
        tierName = 'Vainglorious';
        break;
      default:
        tierNumber = 0;
        tierName = 'Unranked';
    }
    switch (colorNumber) {
      case 0:
        colorName = ' Bronze';
        break;
      case 1:
        colorName = ' Silver';
        break;
      case 2:
        colorName = ' Gold';
        break;
      default:
        colorName = '';
    }
    return {
      number: tierNumber,
      name: tierName,
      color: colorName,
    };
  })(processedRankPoints.skillTier);

  return skillTierFormats;
};

const sendPlayerInfo = (userID: string, data: any) => {
  let rankPointsText = '';
  console.log(data);
  if (data.rankPoints_5v5) {
    rankPointsText =
      '3v3 / 5v5 Rank points: ' +
      data.rankPoints.toFixed(0) +
      ' / ' +
      data.rankPoints_5v5.toFixed(0);
  } else {
    rankPointsText = '3v3 Rank points: ' + data.rankPoints.toFixed(0);
  }

  let rankedGamesPlayedText = '';
  if (data.ranked_5v5) {
    rankedGamesPlayedText =
      data.ranked + '× Ranked 3v3\n' + data.ranked_5v5 + '× Ranked 5v5';
  } else {
    rankedGamesPlayedText =
      data.ranked + '× Ranked 3v3\n' + data.blitz + '× Ranked Blitz';
  }

  let tier = '';
  if (data.rankPoints_5v5) {
    const processed3v3 = processRankPoints(data.rankPoints, null);
    const processed5v5 = processRankPoints(null, data.rankPoints_5v5);
    tier = `(${processed3v3.number}${processed3v3.color}/${
      processed5v5.number
    }${processed5v5.color})`;
  } else {
    const processed3v3 = processRankPoints(data.rankPoints, null);
    tier = `(${processed3v3.number}${processed3v3.color})`;
  }

  const messageData = {
    messaging_type: 'RESPONSE',
    recipient: {
      id: userID,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'list',
          top_element_style: 'compact',
          elements: [
            {
              title: tier + ' ' + data.name + ' [' + data.guildTag + ']',
              subtitle: data.karma + '\nLevel: ' + data.level,
            },
            {
              title: 'Ranked Games Played',
              subtitle: rankedGamesPlayedText,
            },
            {
              title: 'Casual Games Played',
              subtitle:
                data.casual +
                '× Casual 3v3\n' +
                data.casual_5v5 +
                '× Casual 5v5',
            },
            {
              title: 'Statistics',
              subtitle: rankPointsText + '\nLifetime wins: ' + data.wins,
            },
          ],
          buttons: [
            {
              type: 'web_url',
              url: 'https://vain.zone/extension/player/' + data.name,
              title: 'See more',
              webview_height_ratio: 'full',
              webview_share_button: 'hide',
              messenger_extensions: true,
            },
          ],
        },
      },
    },
  };

  callSendAPI(messageData);

  findOrCreateUser(userID)
    .then((user) => {
      if (user.defaultIGN) {
        return;
      } else {
        const saveIGN = {
          messaging_type: 'RESPONSE',
          recipient: { id: userID },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text: 'Save as default nick?',
                buttons: [
                  {
                    title: 'Save',
                    type: 'postback',
                    payload: 'set ' + data.name,
                  },
                ],
              },
            },
          },
        };

        setTimeout(function() {
          callSendAPI(saveIGN);
        }, 350);
      }
    })
    .catch((err) => {
      var messageData = {
        messaging_type: 'RESPONSE',
        recipient: { id: userID },
        message: {
          text: 'An error has occured, please contact the developers. ' + err,
        },
      };

      callSendAPI(messageData);
    });
};

const setIGN = (nick: string, userID: string) => {
  findOrCreateUser(userID)
    .then((user) => {
      if (nick == 'del') {
        user.defaultIGN = undefined;
        user
          .save()
          .then(() => {
            sendTextMessage(
              userID,
              'Deleted. You can set your default IGN again anytime. Just type it and hit send.',
            );
          })
          .catch((err) => Promise.reject(err));
      } else {
        user.defaultIGN = nick;
        user
          .save()
          .then(() => {
            sendTextMessage(
              userID,
              'Saved. Now the extension will always show your last match when you open it.',
            );
          })
          .catch((err) => Promise.reject(err));
      }
    })
    .catch((err) => {
      sendTextMessage(
        userID,
        'An error has occured with the previous request. Please contact the developers. ' +
          err,
      );
    });
};

const callSendAPI = (messageData: any) => {
  axios({
    method: 'post',
    url: 'https://graph.facebook.com/v2.6/me/messages',
    params: {
      access_token:
        'EAAIxVyRb1vwBAHhU8w9UNT7G5mv9CR7oPra44BXAHS6PwVkf7OOwR5bKZCCXbZB0l2IJ01b7HxonqYrtUyg9d7w2ykbW5dlhZCbkZCxRxThgJQ9nZAhHHwBTH8CxPhyl2ftVi8UNv36EwLKPyOpDtuKmhDQgfoaNclpMjxf1ZCoAZDZD',
    },
    data: messageData,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then((fbRes: AxiosResponse<any>) => {
      if (fbRes.status == 200) {
        console.log(
          'Successfully sent message with id %s to recipient %s',
          fbRes.data.message_id,
          fbRes.data.recipient_id,
        );
      } else {
        console.error(fbRes.status);
        throw new Error('Bad status code #bscfbm');
      }
    })
    .catch((err) => {
      console.error('Unable to send message with error:', err);
    });
};

const updateInfo = () => {
  const info = {
    get_started: {
      payload: 'Welcome message',
    },

    greeting: [
      {
        locale: 'default',
        text:
          'Welcome to Vainglory Messenger Extension! Tap on the button below and then type in your In-Game Nickname to see your stats.', // must be lte 160 characters
      },
      /*{
            locale: "en_US",
            text: "Hi!"
        }*/
    ],

    home_url: {
      url: 'https://vain.zone/extension',
      webview_height_ratio: 'tall',
      webview_share_button: 'hide',
      in_test: false,
    },

    whitelisted_domains: [
      'https://vainglory.eu',
      'https://forum.vainglory.eu',
      'https://x.vainglory.eu',
      'http://localhost:3000',
      'https://test.vainglory.eu',
      'https://vain.zone',
    ],

    persistent_menu: [
      {
        locale: 'default',
        composer_input_disabled: false,
        call_to_actions: [
          {
            title: 'My Statistics',
            type: 'postback',
            payload: 'mystats',
          },
          {
            title: 'More',
            type: 'nested',
            call_to_actions: [
              {
                title: 'Usage Manual',
                type: 'postback',
                payload: 'help',
              },
              {
                type: 'postback',
                title: 'Delete default nick',
                payload: 'set ' + 'del',
              },
            ],
          },
        ],
      },
    ],
  };

  return axios({
    method: 'post',
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    params: {
      access_token:
        'EAAIxVyRb1vwBAHhU8w9UNT7G5mv9CR7oPra44BXAHS6PwVkf7OOwR5bKZCCXbZB0l2IJ01b7HxonqYrtUyg9d7w2ykbW5dlhZCbkZCxRxThgJQ9nZAhHHwBTH8CxPhyl2ftVi8UNv36EwLKPyOpDtuKmhDQgfoaNclpMjxf1ZCoAZDZD',
    },
    data: info,
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(
      (fbRes: AxiosResponse<any>): void => {
        if (fbRes.status == 200) {
          console.log('Successfuly updated:', fbRes.data);
        } else {
          throw new Error(fbRes.status.toString());
        }
      },
    )
    .catch((err) => {
      if (err.response) {
        console.error(err.response.status);
        console.error(err.response.data);
      }
      throw new Error(err);
    });
};

//getProfile();

router.get('/updateprofile', (_req: Request, res: Response) => {
  updateInfo()
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error('Unable to update msg profile with error:', err);
      res.status(500).send(err);
    });
});
