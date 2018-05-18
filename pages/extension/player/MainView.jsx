import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import {
  Sidebar,
  Segment,
  Button,
  Icon,
  Label,
  Message,
} from 'semantic-ui-react';
import axios from 'axios';
import html2canvas from 'html2canvas';

import MatchesSidebar from './MatchesSidebar';
import InputPanel from './InputPanel';
import PlayerDetailView from './PlayerDetailView';
import MatchDetailView from './MatchDetailView';

const propTypes = {
  extension: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  playerID: PropTypes.string.isRequired,
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  converter: PropTypes.func.isRequired,
  selectedMatch: PropTypes.number.isRequired,
  setSelectedMatch: PropTypes.func.isRequired,
  appLoading: PropTypes.bool.isRequired,
  TLData: PropTypes.object.isRequired,
  telemetryLoading: PropTypes.bool.isRequired,
};

export default class MainView extends React.Component {
  static identifyExtensionUser() {
    const genericUsername = 'L3oN';
    return new Promise((resolve, reject) => {
      window.MessengerExtensions.getContext(
        '617200295335676',
        (threadContext) => {
          const { psid } = threadContext;
          axios({
            method: 'get',
            url: '/api/botuser',
            params: {
              psid,
            },
          })
            .then((res) => res.data)
            .then((user) => {
              if (user.currentUser) {
                // window.document.getElementById("FBButton").style.display = "inline-block";
                if (user.defaultIGN) {
                  resolve(user.defaultIGN);
                } else {
                  resolve(genericUsername);
                }
              } else {
                reject(new Error('User has not yet interacted with the bot.'));
              }
            })
            .catch((err) => {
              console.log('err', err);
              resolve(genericUsername);
            });
        },
        (err) => {
          console.log("Couldn't get context:", err);
          resolve(genericUsername);
        },
      );
    });
  }
  static generateImage(elementId) {
    html2canvas(window.document.getElementById(elementId), {
      backgroundColor: null,
    })
      .then((canvas) => {
        const imgBase64 = canvas.toDataURL('image/png');
        const imageData = window.atob(imgBase64.split(',')[1]);
        const arraybuffer = new ArrayBuffer(imageData.length);
        const view = new Uint8Array(arraybuffer);
        for (let i = 0; i < imageData.length; i += 1) {
          view[i] = imageData.charCodeAt(i);
        }
        return new window.Blob([view], { type: 'image/png' });
      })
      .then((blob) => {
        const formData = new window.FormData();
        formData.append('blob', blob, {
          filename: 'image.png',
        });
        return new Promise((resolve, reject) => {
          axios({
            method: 'post',
            url: '/api/fbattachment',
            data: formData,
            // headers: formData.getHeaders(), maybe works only on server-side
          })
            .then((res) => res.data)
            .then((resJson) => {
              if (resJson.error) {
                return Promise.reject(new Error('Error uploading to FB'));
              }
              console.log(resJson);
              return resolve(resJson.attachmentId);
            })
            .catch((err) => {
              window.document.getElementById(
                'debugConsole',
              ).value += `\nerror uploading image ${err}`;
              reject(err);
            });
        });
      })
      .then((attachmentId) => {
        const message = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'media',
              elements: [
                {
                  media_type: 'image',
                  attachment_id: attachmentId,
                  buttons: [
                    {
                      type: 'web_url',
                      webview_share_button: 'hide',
                      url: window.location.href,
                      title: 'Open',
                      webview_height_ratio: 'full',
                      messenger_extensions: true,
                    },
                  ],
                },
              ],
            },
          },
        };
        window.MessengerExtensions.beginShareFlow(
          (/* share_response */) => {
            // Modal => Sent (?)
            // User dismissed without error, but did they share the message?
            // if (share_response.is_sent) {
            //   // The user actually did share.
            //   // Perhaps close the window w/ requestCloseBrowser().
            //   MessengerExtensions.requestCloseBrowser(
            //     function success() {
            //       console.log("vebview closed");
            //     },
            //     function error(err) {
            //       window.document.getElementById("debugConsole").value += "\n" + err;
            //     }
            //   );
            // } else {
            //   window.document.getElementById("debugConsole").value += "\nNeodesláno";
            //   // handle not send here
            // }
          },
          (errorCode, errorMessage) => {
            window.document.getElementById(
              'debugConsole',
            ).value += `\nError opening share window: ${errorCode} ${errorMessage}`;
            // alert(
            //   'Error! Please contact the developers.' +
            //     errorCode +
            //     ' ' +
            //     errorMessage,
            // );
            // handle error in ui here
          },
          message,
          'broadcast',
        );
      })
      .catch((err) => {
        window.document.getElementById(
          'debugConsole',
        ).value += `\nError L ${err}`;
        // alert('Error! Please notify the developers. ' + err);
      });
  }
  //   constructor(props) {
  //     super(props);
  //     MainView.identifyExtensionUser = MainView.identifyExtensionUser.bind(this);
  //     MainView.generateImage = MainView.generateImage.bind(this);
  //   }
  componentDidMount() {
    const FBLoaded = () => {
      if (this.props.extension) {
        MainView.identifyExtensionUser()
          .then((IGN) => {
            Router.replace(
              `/extension/player?error=false&extension=false&IGN=${IGN}`,
              `/extension/player/${IGN}`,
            );
          })
          .catch(() => {
            try {
              window.location.replace('https://m.me/VAIN.ZONE');
            } catch (e) {
              window.location = 'https://m.me/VAIN.ZONE';
            }
          });
      }
    };
    window.extAsyncInit = FBLoaded.bind(this);
    // Load the SDK asynchronously
    (function messenger(d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      const js = d.createElement(s);
      js.id = id;
      js.src = '//connect.facebook.com/en_US/messenger.Extensions.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(window.document, 'script', 'Messenger');
  }
  render() {
    if (this.props.extension) {
      return (
        <Message icon>
          <Icon name="circle notched" loading />
          <Message.Content>
            <Message.Header>Just one second</Message.Header>
            <p>We are fetching data for you.</p>
          </Message.Content>
        </Message>
      );
    }
    return (
      <Sidebar.Pushable style={{ minHeight: '100vh' }}>
        <MatchesSidebar
          data={this.props.data}
          playerName={this.props.data.player.name}
          playerID={this.props.data.player.playerID}
          matches={this.props.data.matches}
          sidebarVisible={this.props.sidebarVisible}
          toggleSidebar={this.props.toggleSidebar}
          converter={this.props.converter}
          setSelectedMatch={this.props.setSelectedMatch}
        />
        <Sidebar.Pusher dimmed={this.props.sidebarVisible}>
          <Segment basic>
            <InputPanel appLoading={this.props.appLoading} />
            {/* <Message warning>
              <strong>Alpha disclaimer:</strong> Only EU is supported right now.
              We will support other regions soon.
            </Message> */}
            <PlayerDetailView player={this.props.data.player} />
            <Button.Group attached="bottom" style={{ overflow: 'hidden' }}>
              <Button
                onClick={() => MainView.generateImage('playerDetailView')}
              >
                <Icon name="send" />Send Profile{' '}
                <Label color="blue">Beta</Label>
              </Button>
              <Button onClick={this.props.toggleSidebar}>
                <Icon name="sidebar" /> Matches
              </Button>
            </Button.Group>
            <textarea
              id="debugConsole"
              style={{
                width: '100%',
                height: '120px',
                display: 'none',
              }}
              value="Debugging"
              readOnly
            />
            <MatchDetailView
              match={this.props.data.matches[this.props.selectedMatch]}
              converter={this.props.converter}
              TLData={this.props.TLData}
              telemetryLoading={this.props.telemetryLoading}
            />
            <Button
              onClick={() => MainView.generateImage('matchDetailView')}
              attached="bottom"
            >
              <Icon name="send" />Send Match <Label color="blue">Beta</Label>
            </Button>
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}

MainView.propTypes = propTypes;
