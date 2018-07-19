import React from "react";
import PropTypes from "prop-types";
import Router from "next/router";
import {
  Sidebar,
  Segment,
  Button,
  Icon,
  Label,
  Message
} from "semantic-ui-react";
import axios from "axios";
import html2canvas from "html2canvas";

import MatchesSidebar from "./MatchesSidebar";
import InputPanel from "./InputPanel";
import PlayerDetailView from "./PlayerDetailView";
import MatchDetailView from "./MatchDetailView";

const propTypes = {
  extension: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  sidebarVisible: PropTypes.bool.isRequired,
  showSidebar: PropTypes.func.isRequired,
  converter: PropTypes.func.isRequired,
  selectedMatch: PropTypes.number.isRequired,
  setSelectedMatch: PropTypes.func.isRequired,
  appLoading: PropTypes.bool.isRequired,
  TLData: PropTypes.object.isRequired,
  applyFilter: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  filterFailed: PropTypes.bool.isRequired,
  scrollPosition: PropTypes.number.isRequired,
  sendLoading: PropTypes.bool.isRequired,
  toggleSendLoading: PropTypes.func.isRequired
};

export default class MainView extends React.Component {
  static identifyExtensionUser() {
    const genericUsername = "L3oN";
    return new Promise((resolve, reject) => {
      window.MessengerExtensions.getContext(
        "617200295335676",
        threadContext => {
          const { psid } = threadContext;
          axios({
            method: "get",
            url: "/api/botuser",
            params: {
              psid
            }
          })
            .then(res => res.data)
            .then(user => {
              if (user.currentUser) {
                // window.document.getElementById("FBButton").style.display = "inline-block";
                if (user.defaultIGN) {
                  resolve(user.defaultIGN);
                } else {
                  resolve(genericUsername);
                }
              } else {
                reject(new Error("User has not yet interacted with the bot."));
              }
            })
            .catch(err => {
              console.log("err", err);
              resolve(genericUsername);
            });
        },
        err => {
          console.log("Couldn't get context:", err);
          resolve(genericUsername);
        }
      );
    });
  }
  static generateImage(element, isMatch) {
    html2canvas(element, {
      backgroundColor: null
    })
      .then(canvas => {
        const imgBase64 = canvas.toDataURL("image/png");

        const imageData = window.atob(imgBase64.split(",")[1]);
        const arraybuffer = new ArrayBuffer(imageData.length);
        const view = new Uint8Array(arraybuffer);
        for (let i = 0; i < imageData.length; i += 1) {
          view[i] = imageData.charCodeAt(i);
        }
        return new window.Blob([view], { type: "image/png" });
      })
      .then(blob => {
        const formData = new window.FormData();
        formData.append("blob", blob, {
          filename: "image.png"
        });
        return new Promise((resolve, reject) => {
          axios({
            method: "post",
            url: "/api/fbattachment",
            data: formData
            // headers: formData.getHeaders(), maybe works only on server-side
          })
            .then(res => res.data)
            .then(resJson => {
              if (resJson.error) {
                return Promise.reject(new Error("Error uploading to FB"));
              }
              console.log(resJson);
              return resolve(resJson.attachmentId);
            })
            .catch(err => {
              window.document.getElementById(
                "debugConsole"
              ).value += `\nerror uploading image ${err}`;
              reject(err);
            });
        });
      })
      .then(attachmentId => {
        const url = isMatch
          ? `https://vain.zone/extension/player/${
              this.props.data.player.name
            }/${this.props.selectedMatch.matchID}`
          : window.location.href;
        console.log(url);
        return;
        const message = {
          attachment: {
            type: "template",
            payload: {
              template_type: "media",
              elements: [
                {
                  media_type: "image",
                  attachment_id: attachmentId,
                  buttons: [
                    {
                      type: "web_url",
                      webview_share_button: "hide",
                      url,
                      title: "Open",
                      webview_height_ratio: "full",
                      messenger_extensions: true
                    }
                  ]
                }
              ]
            }
          }
        };
        window.MessengerExtensions.beginShareFlow(
          (/* share_response */) => {
            this.props.toggleSendLoading(false);
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
            this.props.toggleSendLoading(true);

            window.document.getElementById(
              "debugConsole"
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
          "broadcast"
        );
      })
      .catch(err => {
        this.props.toggleSendLoading(true);

        window.document.getElementById(
          "debugConsole"
        ).value += `\nError L ${err}`;
        // alert('Error! Please notify the developers. ' + err);
      });
  }
  constructor(props) {
    super(props);
    MainView.identifyExtensionUser = MainView.identifyExtensionUser.bind(this);
    MainView.generateImage = MainView.generateImage.bind(this);
    this.saveNameInLocalStorage = this.saveNameInLocalStorage.bind(this);
  }
  componentDidMount() {
    const FBLoaded = () => {
      if (this.props.extension) {
        MainView.identifyExtensionUser()
          .then(IGN => {
            Router.replace(
              `/extension/player?error=false&extension=false&IGN=${IGN}`,
              `/extension/player/${IGN}`
            );
          })
          .catch(() => {
            try {
              window.location.replace("https://m.me/VAIN.ZONE");
            } catch (e) {
              window.location = "https://m.me/VAIN.ZONE";
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
      js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(window.document, "script", "Messenger");

    this.saveNameInLocalStorage();
  }
  componentDidUpdate(prevProps) {
    if (!this.props.extension) {
      if (prevProps.data) {
        if (prevProps.data.player.name !== this.props.data.player.name) {
          this.saveNameInLocalStorage();
        }
      } else {
        this.saveNameInLocalStorage();
      }
    }
  }
  saveNameInLocalStorage() {
    if (!this.props.extension) {
      if (window.localStorage) {
        const fromStorage = window.localStorage.getItem("favorites");
        const favorites = fromStorage ? JSON.parse(fromStorage) : [];
        const existingIndex = favorites.findIndex(
          e => e.name === this.props.data.player.name
        );

        if (existingIndex > -1) {
          favorites[existingIndex].count += 1;
        } else {
          favorites.push({ name: this.props.data.player.name, count: 1 });
        }

        window.localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    }
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
      <Sidebar.Pushable style={{ minHeight: "100vh" }}>
        <MatchesSidebar
          data={this.props.data}
          playerName={this.props.data.player.name}
          playerID={this.props.data.player.playerID}
          matches={this.props.data.matches}
          sidebarVisible={this.props.sidebarVisible}
          showSidebar={this.props.showSidebar}
          converter={this.props.converter}
          selectedMatchID={this.props.selectedMatch.matchID}
          setSelectedMatch={this.props.setSelectedMatch}
          applyFilter={this.props.applyFilter}
          filters={this.props.filters}
          filterFailed={this.props.filterFailed}
          scrollPosition={this.props.scrollPosition}
          appLoading={this.props.appLoading}
        />
        <Sidebar.Pusher dimmed={this.props.sidebarVisible}>
          <Segment basic>
            <InputPanel appLoading={this.props.appLoading} />
            {/* <Message warning>
              <strong>Alpha disclaimer:</strong> Only EU is supported right now.
              We will support other regions soon.
            </Message> */}
            <PlayerDetailView
              player={this.props.data.player}
              childRef={c => {
                this.playerDetailView = c;
              }}
            />
            <Button.Group attached="bottom" style={{ overflow: "hidden" }}>
              <Button
                onClick={() => {
                  this.props.toggleSendLoading(true);
                  MainView.generateImage(this.playerDetailView, false);
                }}
                loading={this.props.sendLoading}
                disabled={this.props.sendLoading}
              >
                <Label color="blue">
                  <Icon name="send" />Share in Chat
                </Label>
              </Button>
              <Button
                onClick={() => {
                  this.props.showSidebar(true);
                }}
              >
                <Icon name="sidebar" /> Matches
              </Button>
            </Button.Group>
            <textarea
              id="debugConsole"
              style={{
                width: "100%",
                height: "120px",
                display: "none"
              }}
              value="Debugging"
              readOnly
            />
            {(() => {
              if (this.props.selectedMatch) {
                return (
                  <React.Fragment>
                    <MatchDetailView
                      match={this.props.selectedMatch}
                      converter={this.props.converter}
                      TLData={this.props.TLData}
                      appLoading={this.props.appLoading}
                      childRef={c => {
                        this.matchDetailView = c;
                      }}
                    />
                    <Button
                      onClick={() => {
                        this.props.toggleSendLoading(true);
                        MainView.generateImage(this.matchDetailView, true);
                      }}
                      loading={this.props.sendLoading}
                      disabled={this.props.sendLoading}
                      attached="bottom"
                    >
                      <Label color="blue">
                        <Icon name="send" />Share in Chat
                      </Label>
                    </Button>
                  </React.Fragment>
                );
              }
              return <React.Fragment />;
            })()}
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}

MainView.propTypes = propTypes;
