import React from "react";
import PropTypes from "prop-types";
import Router from "next/router";
import Link from "next/link";
import Head from "next/head";
import {
  Sidebar,
  Segment,
  Button,
  Icon,
  Label,
  Message,
  Grid,
  Progress,
  Image,
  Tab
} from "semantic-ui-react";
import axios from "axios";
import html2canvas from "html2canvas";
import moment from "moment";

import MatchesSidebar from "./MatchesSidebar";
import InputPanel from "./InputPanel";
import PlayerDetailView from "./PlayerDetailView";
import MatchDetailView from "./MatchDetailView";
import PlayerMeta from "./PlayerMeta";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

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
  toggleSendLoading: PropTypes.func.isRequired,
  browserView: PropTypes.bool.isRequired,
  screenCategory: PropTypes.string.isRequired
};

export default class MainView extends React.Component {
  static identifyExtensionUser() {
    const genericUser = {
      defaultIGN: "L3oN",
      playerID: "a84deea2-c360-11e4-ad12-06eb725f8a76"
    };
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
                if (user.playerID) {
                  resolve(user);
                } else {
                  resolve(genericUser);
                }
              } else {
                reject(new Error("User has not yet interacted with the bot."));
              }
            })
            .catch(err => {
              console.log("err", err);
              resolve(genericUser);
            });
        },
        err => {
          console.log("Couldn't get context:", err);
          resolve(genericUser);
        }
      );
    });
  }
  static generateImage(elementName, isMatch) {
    let element = this.matchDetailView;
    if (elementName === "player") {
      element = this.playerDetailView;
    }
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
          .then(user => {
            Router.replace(
              `/extension/player?error=false&extension=false&playerID=${
                user.playerID
              }`,
              `/extension/player/${user.defaultIGN}`
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
        let searchFavorites = {
          version: publicRuntimeConfig.storageVersion,
          list: []
        };
        if (fromStorage) {
          try {
            const parsed = JSON.parse(fromStorage);
            if (parsed.version == publicRuntimeConfig.storageVersion) {
              searchFavorites = parsed;
            }
          } catch (err) {
            console.error(err);
          }
        }

        const existingIndex = searchFavorites.list.findIndex(
          e => e.id === this.props.data.player.playerID
        );

        if (existingIndex > -1) {
          searchFavorites.list[
            existingIndex
          ].name = this.props.data.player.name;
          searchFavorites.list[existingIndex].count += 1;
        } else {
          searchFavorites.list.push({
            id: this.props.data.player.playerID,
            name: this.props.data.player.name,
            count: 1
          });
        }

        if (this.props.data.player.name) {
          window.localStorage.setItem(
            "favorites",
            JSON.stringify(searchFavorites)
          );
        }
      }
    }
  }
  render() {
    const browserNotGlory = this.props.browserView && !this.props.gloryGuide;

    if (this.props.extension || !this.props.screenCategory) {
      return (
        <Message icon>
          <Icon name="gamepad" loading />
          <Message.Content>
            <Message.Header>Just one second</Message.Header>
            <p>We are fetching data for you.</p>
          </Message.Content>
        </Message>
      );
    }
    return (
      <Sidebar.Pushable style={{ minHeight: "100vh" }}>
        <Head>
          <meta
            property="og:title"
            content={`${this.props.data.player.name}'s VAIN.ZONE`}
          />
          <meta
            property="og:description"
            content="Vainglory Tools and Statistics"
          />
          <meta
            property="og:url"
            content={`https://vain.zone/player/${this.props.data.player.name}`}
          />
        </Head>
        {this.props.screenCategory !== "wide" && (
          <MatchesSidebar
            matches={this.props.data.matches}
            sidebarVisible={this.props.sidebarVisible}
            showSidebar={this.props.showSidebar}
            converter={this.props.converter}
            selectedMatchID={
              this.props.selectedMatch && this.props.selectedMatch.matchID
            }
            setSelectedMatch={this.props.setSelectedMatch}
            applyFilter={this.props.applyFilter}
            scrollPosition={this.props.scrollPosition}
            filters={this.props.filters}
            filterFailed={this.props.filterFailed}
            appLoading={this.props.appLoading}
            screenCategory={this.props.screenCategory}
            gloryGuide={this.props.gloryGuide}
          />
        )}
        <Sidebar.Pusher
          dimmed={this.props.sidebarVisible && !this.props.browserView}
        >
          <Segment basic>
            <Grid>
              <Grid.Column
                style={{
                  paddingLeft: "4px",
                  paddingRight:
                    this.props.screenCategory === "wide" ||
                    this.props.screenCategory === "tablet"
                      ? 0
                      : "4px",
                  maxHeight:
                    this.props.screenCategory === "phone"
                      ? null
                      : "calc(100vh)",
                  overflowY:
                    this.props.screenCategory === "phone" ? null : "scroll",
                  overflowX: "hidden",
                  paddingBottom:
                    this.props.screenCategory === "phone" ? 0 : "10px",
                  paddingTop: "10px"
                }}
                width={
                  this.props.screenCategory === "phone"
                    ? 16
                    : this.props.screenCategory === "tablet"
                    ? 8
                    : 5
                }
              >
                {browserNotGlory && (
                  <Link
                    prefetch
                    href={`/extension/player?browserView=true`}
                    as="/"
                  >
                    <img
                      src="/static/img/draft/VAINZONE-logo-darkbg.png"
                      alt="VAIN.ZONE"
                      style={{
                        width: "50%",
                        display: this.props.browserView ? "block" : "none",
                        margin: "auto",
                        cursor: "pointer"
                      }}
                    />
                  </Link>
                )}
                <InputPanel
                  appLoading={this.props.appLoading}
                  browserView={this.props.browserView}
                  gloryGuide={this.props.gloryGuide}
                />
                {/* <Message warning>
              <strong>Alpha disclaimer:</strong> Only EU is supported right now.
              We will support other regions soon.
            </Message> */}
                <PlayerDetailView
                  player={this.props.data.player}
                  childRef={c => {
                    this.playerDetailView = c;
                  }}
                  screenCategory={this.props.screenCategory}
                  browserView={this.props.browserView}
                />
                {!this.props.browserView && (
                  <Button
                    attached="bottom"
                    onClick={() => {
                      this.props.toggleSendLoading(true);
                      MainView.generateImage("player", false);
                    }}
                    loading={this.props.sendLoading}
                    disabled={this.props.sendLoading}
                    style={{
                      overflow: "hidden",
                      width: "100%"
                    }}
                  >
                    <Label color="blue">
                      <Icon name="send" />
                      Share in Chat
                    </Label>
                  </Button>
                )}
                <PlayerMeta
                  data={this.props.data.player.playerMeta}
                  browserView={this.props.browserView}
                  gloryGuide={this.props.gloryGuide}
                />
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
              </Grid.Column>
              <Grid.Column
                width={
                  this.props.screenCategory === "phone"
                    ? 16
                    : this.props.screenCategory === "tablet"
                    ? 8
                    : 6
                }
                style={{
                  paddingLeft: "4px",
                  paddingRight:
                    this.props.screenCategory === "wide" ? 0 : "4px",
                  paddingBottom: 0,
                  paddingTop: 0
                }}
              >
                <div
                  style={{
                    paddingBottom: "8px",
                    paddingTop: "12px",
                    maxHeight:
                      this.props.screenCategory === "phone" ? null : "100vh",
                    overflowY:
                      this.props.screenCategory === "phone" ? null : "visible",
                    overflowX: "hidden",
                    maxWidth: "414px",
                    margin: "auto"
                  }}
                >
                  <Button
                    size="large"
                    onClick={() => {
                      this.props.showSidebar(true);
                    }}
                    style={{
                      width: "100%",
                      borderRadius: "20px",
                      marginBottom: "10px",
                      display:
                        this.props.screenCategory === "wide" ? "none" : null
                    }}
                  >
                    Select Match&nbsp;&nbsp;
                    <Icon name="chevron right" />
                  </Button>
                  {(() => {
                    if (this.props.selectedMatch) {
                      return (
                        <MatchDetailView
                          match={this.props.selectedMatch}
                          converter={this.props.converter}
                          TLData={this.props.TLData}
                          appLoading={this.props.appLoading}
                          childRef={c => {
                            this.matchDetailView = c;
                          }}
                          screenCategory={this.props.screenCategory}
                          browserView={this.props.browserView}
                          gloryGuide={this.props.gloryGuide}
                          toggleSendLoading={this.props.toggleSendLoading}
                          generateImage={MainView.generateImage}
                          sendLoading={this.props.sendLoading}
                          MatchesButton={
                            <Button
                              size="large"
                              onClick={() => {
                                this.props.showSidebar(true);
                              }}
                              style={{
                                width: "100%",
                                borderRadius: "20px",
                                marginTop: "14px",
                                display:
                                  this.props.screenCategory === "wide"
                                    ? "none"
                                    : null
                              }}
                            >
                              Select Match&nbsp;&nbsp;
                              <Icon name="chevron right" />
                            </Button>
                          }
                        />
                      );
                    }
                    return <React.Fragment />;
                  })()}
                </div>
              </Grid.Column>
              {this.props.screenCategory === "wide" && (
                <Grid.Column
                  width={5}
                  style={{
                    padding: "0 8px",
                    maxHeight: "100vh"
                  }}
                >
                  <MatchesSidebar
                    data={this.props.data}
                    playerName={this.props.data.player.name}
                    playerID={this.props.data.player.playerID}
                    matches={this.props.data.matches}
                    sidebarVisible={true}
                    showSidebar={this.props.showSidebar}
                    converter={this.props.converter}
                    selectedMatchID={
                      this.props.selectedMatch &&
                      this.props.selectedMatch.matchID
                    }
                    setSelectedMatch={this.props.setSelectedMatch}
                    applyFilter={this.props.applyFilter}
                    filters={this.props.filters}
                    filterFailed={this.props.filterFailed}
                    scrollPosition={this.props.scrollPosition}
                    appLoading={this.props.appLoading}
                    screenCategory={this.props.screenCategory}
                    gloryGuide={this.props.gloryGuide}
                  />
                </Grid.Column>
              )}
            </Grid>
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}

MainView.propTypes = propTypes;
