import React from "react";
import io from "socket.io-client";
import Router from "next/router";
import Head from "next/head";

import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";

import Lobby from "./Lobby";
import Draft from "./Draft";
import DraftBuilder from "./DraftBuilder";
import ProfileItem from "./ProfileItem";

const defaultHeroes = [
  { name: "Anka" },
  { name: "Adagio" },
  { name: "Alpha" },
  { name: "Ardan" },
  { name: "Baptiste" },
  { name: "Baron" },
  { name: "Blackfeather" },
  { name: "Catherine" },
  { name: "Celeste" },
  { name: "Churnwalker" },
  { name: "Flicker" },
  { name: "Fortress" },
  { name: "Glaive" },
  { name: "Grace" },
  { name: "Grumpjaw" },
  { name: "Gwen" },
  { name: "Idris" },
  { name: "Joule" },
  { name: "Kensei" },
  { name: "Kestrel" },
  { name: "Kinetic" },
  { name: "Koshka" },
  { name: "Krul" },
  { name: "Lance" },
  { name: "Lorelai" },
  { name: "Lyra" },
  { name: "Malene" },
  { name: "Ozo" },
  { name: "Petal" },
  { name: "Phinn" },
  { name: "Reim" },
  { name: "Reza" },
  { name: "Ringo" },
  { name: "Rona" },
  { name: "Samuel" },
  { name: "SAW" },
  { name: "Skaarf" },
  { name: "Skye" },
  { name: "Taka" },
  { name: "Tony" },
  { name: "Varya" },
  { name: "Vox" }
];

const draftProfiles = [
  {
    name: "Vainglory Premiere League",
    banTime: 30000,
    pickTime: 30000,
    bonusTime: 60000,
    sequence: [
      { team: 0, action: "ban" },
      { team: 1, action: "ban" },
      { team: 0, action: "pick" },
      { team: 1, action: "pick" },
      { team: 1, action: "pick" },
      { team: 0, action: "pick" },
      { team: 1, action: "ban" },
      { team: 0, action: "ban" },
      { team: 1, action: "pick" },
      { team: 0, action: "pick" },
      { team: 0, action: "pick" },
      { team: 1, action: "pick" },
      { team: 0, action: "ban" },
      { team: 1, action: "ban" },
      { team: 0, action: "pick" },
      { team: 1, action: "pick" }
    ],
    heroes: defaultHeroes,
    customStyle: { background: "HSLA(36, 96%, 62%, 1.00)" },
    innerStyle: {
      background:
        'url("/static/img/draft/profiles/vpl-c.png") no-repeat center',
      backgroundSize: "contain",
      width: "100%",
      height: "100%"
    }
  },
  {
    name: "Vainglory.eu Brawl Masters",
    banTime: 30000,
    pickTime: 30000,
    bonusTime: 30000,
    sequence: [
      { team: 0, action: "ban" },
      { team: 1, action: "ban" },
      { team: 0, action: "pick" },
      { team: 1, action: "pick" },
      { team: 1, action: "ban" },
      { team: 0, action: "ban" },
      { team: 1, action: "pick" },
      { team: 0, action: "pick" }
    ],
    heroes: defaultHeroes,
    customStyle: {
      background:
        'url("/static/img/draft/profiles/brawl-masters-bg.jpg") no-repeat bottom center',
      backgroundSize: "cover"
    },
    innerStyle: {
      background:
        'url("/static/img/draft/profiles/brawl-masters-c.png") no-repeat center',
      backgroundSize: "contain",
      width: "100%",
      height: "100%"
    }
  },
  {
    name: "Vainglory 5v5 / 10 Bans",
    banTime: 30000,
    pickTime: 30000,
    bonusTime: 60000,
    sequence: [
      { team: 0, action: "ban" },
      { team: 1, action: "ban" },
      { team: 0, action: "ban" },
      { team: 1, action: "ban" },
      { team: 0, action: "ban" },
      { team: 1, action: "ban" },
      { team: 0, action: "pick" },
      { team: 1, action: "pick" },
      { team: 1, action: "pick" },
      { team: 0, action: "pick" },
      { team: 0, action: "pick" },
      { team: 1, action: "pick" },
      { team: 1, action: "ban" },
      { team: 0, action: "ban" },
      { team: 1, action: "ban" },
      { team: 0, action: "ban" },
      { team: 1, action: "pick" },
      { team: 0, action: "pick" },
      { team: 0, action: "pick" },
      { team: 1, action: "pick" }
    ],
    heroes: defaultHeroes,
    customStyle: {
      background: "linear-gradient(to right, #0575e6, #021b79)"
    }
  }
];

const SharingLink = ({ lobby, roomID, teamID }) => {
  if (lobby) {
    const link = `${window.location.protocol}//${
      window.location.host
    }/draft/${encodeURIComponent(roomID)}/${teamID}`;
    return (
      <React.Fragment>
        <CopyToClipboard
          text={link}
          onCopy={() => {
            toast.info("Copied to clipboard.", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 1500,
              closeButton: false,
              hideProgressBar: true
            });
          }}
        >
          <input
            type="text"
            className="link"
            value={link}
            onClick={e => e.target.select()}
            readOnly
          />
        </CopyToClipboard>
        <style jsx>
          {`
            .link {
              appearance: none;
              margin: auto;
              box-sizing: border-box;
              font-size: 16px;
              border: 1px solid hsla(0, 0%, 0%, 0.2);
              border-radius: 35px;
              width: 100%;
              padding: 5px 15px;
              height: 32px;
              cursor: default;
              cursor: copy;
            }
            .link:focus {
              outline: none;
            }
          `}
        </style>
      </React.Fragment>
    );
  }
  return null;
};

class Host extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      blueSockets: new Set(),
      redSockets: new Set(),
      spectatorSockets: new Set(),
      spectator: true,

      blueState: 0,
      redState: 0,
      hostState: 1,

      choosingProfile: false,
      userProfiles: [],
      selectedProfileIndex: undefined,

      draftSequence: draftProfiles[0].sequence,
      heroes: draftProfiles[0].heroes,
      matchName: "",
      blueName: "Blue Team",
      redName: "Red Team",
      waitingTime: 5000,
      banTime: draftProfiles[0].banTime,
      pickTime: draftProfiles[0].pickTime,
      bonusTime: draftProfiles[0].bonusTime,

      draftLaunched: false,
      draftedHeroes: [],
      timeLeft: new Date(),
      redBonusLeft: 0,
      blueBonusLeft: 0
    };
  }
  componentDidMount() {
    this.socket = io("/draft");
    this.socket.on("connect", () => {
      this.setState({ roomID: this.socket.id });
    });
    this.socket.on("verify", data => {
      if (data.keys.roomID === this.state.roomID) {
        if (data.keys.teamID === this.props.blueID) {
          this.setState(
            prevState => ({
              blueState: this.state.draftLaunched ? 2 : 1,
              blueSockets: new Set([
                ...prevState.blueSockets,
                data.keys.socketID
              ])
            }),
            () =>
              this.socket.emit("data transfer", this.stateWithKeys({ team: 0 }))
          );
        } else if (data.keys.teamID === this.props.redID) {
          this.setState(
            prevState => ({
              redState: this.state.draftLaunched ? 2 : 1,
              redSockets: new Set([...prevState.redSockets, data.keys.socketID])
            }),
            () =>
              this.socket.emit("data transfer", this.stateWithKeys({ team: 1 }))
          );
        } else if (data.keys.teamID) {
          this.socket.emit(
            "data transfer",
            this.stateWithKeys({
              failed: "Wrong link.",
              recipientID: data.keys.socketID
            })
          );
        } else {
          this.setState(
            prevState => ({
              spectatorSockets: new Set([
                ...prevState.spectatorSockets,
                data.keys.socketID
              ])
            }),
            () =>
              this.socket.emit(
                "data transfer",
                this.stateWithKeys({
                  spectator: true,
                  recipientID: data.keys.socketID
                })
              )
          );
        }
      } else {
        this.socket.emit(
          "data transfer",
          this.stateWithKeys({ failed: true, recipientID: data.keys.socketID })
        );
      }
    });

    this.socket.on("host update", data => {
      if (
        data.keys.teamID === this.props.blueID ||
        data.keys.teamID === this.props.redID
      ) {
        console.log(
          new Date().getTime(),
          new Date(this.state.timeLeft).getTime(),
          this.state.waitingTime
        );
        if (data.state.redState || data.state.blueState) {
          this.setState(data.state, () => {
            this.socket.emit("data transfer", this.stateWithKeys());
            if (this.state.redState === 2 && this.state.blueState === 2) {
              toast.success("Both teams are ready!", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2500,
                closeButton: false,
                hideProgressBar: true
              });
            }
          });
        } else if (
          this.state.draftedHeroes.length > 0 ||
          (this.state.draftedHeroes.length === 0 &&
            new Date().getTime() >=
              new Date(this.state.timeLeft).getTime() -
                (this.state.draftSequence[0].action === "pick"
                  ? this.state.pickTime
                  : this.state.banTime))
        ) {
          this.setState(
            prevState => {
              const draftPositionIndex = prevState.draftedHeroes.length;
              if (
                data.state.draftedHeroes &&
                data.state.draftedHeroes.length ===
                  prevState.draftSequence.length
              ) {
                return {
                  ...data.state,
                  draftFinished: true
                };
              } else if (
                data.state.draftedHeroes &&
                data.state.draftedHeroes.length > prevState.draftSequence.length
              ) {
                return null;
              }

              const teamTurn = prevState.draftSequence[draftPositionIndex].team;
              const requestFromTeam =
                data.keys.teamID === this.props.blueID ? 0 : 1;
              if (teamTurn === requestFromTeam) {
                const sideBonusLeft = teamTurn
                  ? "redBonusLeft"
                  : "blueBonusLeft";
                const draftActionTime =
                  prevState.draftSequence[draftPositionIndex].action === "pick"
                    ? prevState.pickTime
                    : prevState.banTime;
                const timeUsed =
                  new Date().getTime() -
                  (new Date(prevState.timeLeft).getTime() - draftActionTime);
                const bonusTimeLeft =
                  timeUsed > draftActionTime
                    ? draftActionTime + prevState[sideBonusLeft] - timeUsed
                    : prevState[sideBonusLeft];

                const nextDraftAction =
                  prevState.draftSequence[draftPositionIndex + 1].action;
                const nextTimeLeft =
                  nextDraftAction === "pick"
                    ? new Date(new Date().getTime() + prevState.pickTime + 400)
                    : new Date(new Date().getTime() + prevState.banTime + 400);

                return {
                  ...data.state,
                  timeLeft: nextTimeLeft,
                  [sideBonusLeft]: bonusTimeLeft
                };
              }
              return null;
            },
            () => this.socket.emit("data transfer", this.stateWithKeys())
          );
        }
      } else {
        this.socket.emit(
          "data transfer",
          this.stateWithKeys({
            failed: "Wrong session.",
            recipientID: data.keys.socketID
          })
        );
      }
    });

    this.socket.on("socket disconnected", socketID => {
      this.setState(prevState => {
        const newState = Object.assign({}, prevState);
        if (newState.blueSockets.delete(socketID)) {
          if (!newState.blueSockets.size) {
            newState.blueState = 0;
          }
          this.socket.emit("data transfer", {
            state: { blueState: 0 },
            keys: { recipientID: prevState.roomID }
          });
          return {
            blueSockets: newState.blueSockets,
            blueState: newState.blueState
          };
        } else if (newState.redSockets.delete(socketID)) {
          if (!newState.redSockets.size) {
            newState.redState = 0;
          }
          this.socket.emit("data transfer", {
            state: { redState: 0 },
            keys: { recipientID: prevState.roomID }
          });
          return {
            redSockets: newState.redSockets,
            redState: newState.redState
          };
        } else if (newState.spectatorSockets.delete(socketID)) {
          return {
            spectatorSockets: newState.spectatorSockets
          };
        }
        return null;
      });
    });

    this.socket.on("disconnect", () => {
      toast.error("Connection lost.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 4500,
        closeButton: false,
        hideProgressBar: true,
        onOpen: () => Router.replace("/draft")
      });
    });

    const LSUserProfiles = window.localStorage.getItem("userProfiles");
    if (LSUserProfiles) {
      try {
        const parsed = JSON.parse(LSUserProfiles);
        this.setState({
          userProfiles: parsed
        });
      } catch (err) {
        console.error(err);
      }
    }

    const LSLastSelectedProfile = window.localStorage.getItem(
      "lastSelectedProfile"
    );
    if (LSLastSelectedProfile) {
      try {
        const parsed_lastSelected = JSON.parse(LSLastSelectedProfile);
        this.setState(prevState => {
          if (
            parsed_lastSelected <
            [...draftProfiles, ...prevState.userProfiles].length
          ) {
            return;
            {
              selectedProfileIndex: parsed_lastSelected;
            }
          }
          return { selectedProfileIndex: 0 };
        });
      } catch (err) {
        console.error(err);
        this.setState({
          selectedProfileIndex: 0
        });
      }
    } else {
      this.setState({
        selectedProfileIndex: 0
      });
    }
  }
  componentWillUnmount() {
    this.socket.close();
  }
  stateWithKeys = data => {
    const keys = data || {};
    const {
      blueSockets,
      redSockets,
      spectatorSockets,
      spectator,
      ...sharedState
    } = this.state;
    const newState = keys.failed
      ? { state: null }
      : {
          state: sharedState
        };
    return Object.assign({}, newState, {
      keys: {
        recipientID: this.state.roomID,
        ...keys
      }
    });
  };
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  handleSelect = index => {
    window.localStorage.setItem("lastSelectedProfile", index);
    this.setState(prevState => {
      const profiles = [
        ...draftProfiles.slice(),
        ...prevState.userProfiles.slice()
      ];
      return {
        choosingProfile: false,
        selectedProfileIndex: index,
        banTime: profiles[index].banTime,
        pickTime: profiles[index].pickTime,
        bonusTime: profiles[index].bonusTime,
        draftSequence: profiles[index].sequence,
        heroes: profiles[index].heroes
      };
    });
  };
  addNewProfile = profile => {
    this.setState(prevState => {
      const sliced = prevState.userProfiles.slice();
      sliced.push(profile);

      window.localStorage.setItem(
        "lastSelectedProfile",
        draftProfiles.length - 1 + sliced.length
      );
      window.localStorage.setItem("userProfiles", JSON.stringify(sliced));
      return {
        userProfiles: sliced,
        choosingProfile: false,
        selectedProfileIndex: draftProfiles.length - 1 + sliced.length,
        banTime: profile.banTime,
        pickTime: profile.pickTime,
        bonusTime: profile.bonusTime,
        draftSequence: profile.sequence,
        heroes: profile.heroes
      };
    });
  };
  removeUserProfile = index => {
    this.setState(prevState => {
      const sliced = prevState.userProfiles.slice();
      sliced.splice(index, 1);

      window.localStorage.setItem("userProfiles", JSON.stringify(sliced));
      return {
        userProfiles: sliced
      };
    });
  };
  generateLinks = event => {
    event.preventDefault();
    this.setState({ lobby: true });
  };
  startDraft = event => {
    event.preventDefault();

    const draftPositionIndex = this.state.draftedHeroes.length;
    const draftAction = this.state.draftSequence[draftPositionIndex].action;
    const timeLeft =
      draftAction === "pick"
        ? new Date(
            new Date().getTime() +
              this.state.pickTime +
              this.state.waitingTime +
              400
          )
        : new Date(
            new Date().getTime() +
              this.state.banTime +
              this.state.waitingTime +
              400
          );
    this.setState(
      {
        hostState: 2,
        draftLaunched: true,
        timeLeft,
        blueBonusLeft: this.state.bonusTime,
        redBonusLeft: this.state.bonusTime
      },
      () => this.socket.emit("data transfer", this.stateWithKeys())
    );
  };
  render() {
    const profiles = [...draftProfiles, ...this.state.userProfiles];
    if (this.state.choosingProfile) {
      return (
        <DraftBuilder
          defaultProfiles={draftProfiles}
          userProfiles={this.state.userProfiles}
          defaultHeroes={this.state.heroes}
          handleSelect={this.handleSelect}
          addNewProfile={this.addNewProfile}
          removeUserProfile={this.removeUserProfile}
        />
      );
    } else if (this.state.draftLaunched) {
      return <Draft {...this.state} />;
    }
    return (
      <Lobby>
        <Head>
          <title>
            {!this.state.matchName
              ? "VAIN.ZONE Draft Tool"
              : this.state.matchName}
          </title>
        </Head>
        <React.Fragment>
          <img
            src="/static/img/draft/VAINZONE-logo-darkbg.png"
            alt="Draft Logo"
            style={{ height: "100px", margin: "auto", display: "block" }}
          />
          <h1>{this.state.matchName || "VAIN.ZONE Draft"}</h1>
          <form>
            <input
              type="text"
              className="names"
              name="matchName"
              placeholder="Match Name"
              onChange={this.handleChange}
              readOnly={this.state.lobby}
            />
            <div className="panel">
              <input
                type="text"
                className="names"
                name="blueName"
                placeholder="Blue Team"
                onChange={this.handleChange}
                readOnly={this.state.lobby}
              />
              {this.state.lobby && (
                <React.Fragment>
                  <div className="indicatorText">
                    <span
                      style={{
                        backgroundColor: ["red", "orange", "green"][
                          this.state.blueState
                        ],
                        boxShadow: `0 0 1px 1px ${
                          ["red", "orange", "green"][this.state.blueState]
                        }`
                      }}
                      className="indicator"
                    />
                    {
                      ["Team Offline", "In Lobby", "Ready"][
                        this.state.blueState
                      ]
                    }
                  </div>
                </React.Fragment>
              )}
            </div>
            <SharingLink
              lobby={this.state.lobby}
              roomID={this.state.roomID}
              teamID={this.props.blueID}
            />
            <div className="panel">
              <input
                type="text"
                className="names"
                name="redName"
                placeholder="Red Team"
                onChange={this.handleChange}
                readOnly={this.state.lobby}
              />
              {this.state.lobby && (
                <React.Fragment>
                  <div className="indicatorText">
                    <span
                      style={{
                        backgroundColor: ["red", "orange", "green"][
                          this.state.redState
                        ],
                        boxShadow: `0 0 1px 1px ${
                          ["red", "orange", "green"][this.state.redState]
                        }`
                      }}
                      className="indicator"
                    />
                    {["Team Offline", "In Lobby", "Ready"][this.state.redState]}
                  </div>
                </React.Fragment>
              )}
            </div>
            <SharingLink
              lobby={this.state.lobby}
              roomID={this.state.roomID}
              teamID={this.props.redID}
            />
            {this.state.lobby && <span className="names">Spectators</span>}
            <SharingLink
              lobby={this.state.lobby}
              roomID={this.state.roomID}
              teamID=""
            />
            <span
              className="names"
              style={{
                border: 0,
                textAlign: "center",
                width: "100%",
                boxSizing: "border-box",
                marginLeft: 0
              }}
            >
              Draft Profile
            </span>
            <div
              style={{
                textAlign: "center",
                width: "100%",
                boxSizing: "border-box"
              }}
            >
              {profiles[this.state.selectedProfileIndex] && (
                <ProfileItem
                  outerStyle={{
                    ...profiles[this.state.selectedProfileIndex].customStyle,
                    transform: this.state.lobby ? "scale(1)" : null,
                    cursor: this.state.lobby ? "default" : null,
                    opacity: this.state.lobby ? "1" : null,
                    boxSizing: "border-box",
                    boxShadow: this.state.lobby ? "none" : null
                  }}
                  innerStyle={
                    profiles[this.state.selectedProfileIndex].innerStyle
                  }
                  text={profiles[this.state.selectedProfileIndex].name}
                  action={() =>
                    this.setState(prevState => {
                      if (!this.state.lobby) return { choosingProfile: true };
                      return null;
                    })
                  }
                />
              )}
            </div>
            {this.state.roomID && (
              <input
                id="submit_button"
                type="submit"
                value={this.state.lobby ? "Start Draft" : "Generate Links"}
                disabled={
                  this.state.lobby &&
                  (this.state.blueState < 2 || this.state.redState < 2)
                }
                onClick={
                  this.state.lobby ? this.startDraft : this.generateLinks
                }
              />
            )}
            {this.state.lobby && (
              <div style={{ textAlign: "center" }}>
                <a
                  href="/draft"
                  style={{
                    fontSize: "0.8rem",
                    color: "hsla(0, 0%, 65%, 1)"
                  }}
                >
                  Reset
                </a>
              </div>
            )}
          </form>
        </React.Fragment>
        <style jsx>
          {`
            input {
              appearance: none;
              border: 0;
              margin: auto;
              box-sizing: border-box;
              background: transparent;
              color: white;
            }
            input::placeholder {
              color: hsla(0, 0%, 70%, 1);
            }
            .names {
              display: inline-block;
              font-size: 16px;
              font-weight: bold;
              padding: 10px 5px;
              margin: 10px 10px 0px 10px;
              border-bottom: ${this.state.lobby
                ? "0"
                : "1px solid hsla(0, 0%, 75%, 1)"};
              ${this.state.lobby
                ? "width: calc(100% - 20px - 110px)"
                : "width: calc(100% - 20px)"};
              ${this.state.lobby ? "cursor: default" : ""};
              box-sizing: border-box;
            }
            .names[name="matchName"] {
              width: calc(100% - 20px);
            }
            .names:focus,
            .names:hover {
              border-bottom: ${this.state.lobby
                ? "0"
                : "1px solid hsla(0, 0%, 100%, 1)"};
            }
            .indicatorText {
              float: right;
              margin-top: 23px;
              font-weight: bold;
              font-size: 0.7rem;
              line-height: 1rem;
              text-transform: uppercase;
            }
            .indicator {
              float: right;
              margin: 0 10px;
              margin-top: 3px;
              display: inline-block;
              width: 9px;
              height: 9px;
              border-radius: 50%;
              box-sizing: border-box;
            }
            @media (max-width: 632px) {
              .names {
                margin-right: 0;
                margin-left: 0;
                width: ${this.state.lobby
                  ? "calc(100% - 110px - 5px)"
                  : "100%"};
              }
              .names[name="matchName"] {
                width: 100%;
              }
              .indicatorText {
                width: 110px;
              }
            }
            input:focus {
              outline: none;
            }
            #submit_button {
              width: 100%;
              margin-top: 25px;
              height: 48px;
              text-align: center;
              color: white;
              text-transform: uppercase;
              font-weight: bold;
              background-image: linear-gradient(
                45deg,
                #fbc2eb 0%,
                #a6c1ee 51%,
                #fbc2eb 100%
              );
              background-position: right center;
              background-size: 200% auto;
              cursor: pointer;
              border-radius: 25px;
              box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
              transition: 0.5s;
            }
            #submit_button:hover {
              background-position: left center;
              font-size: 14px;
            }
            #submit_button:disabled {
              background: lightgrey;
              font-size: 11px;
              cursor: default;
            }
          `}
        </style>
      </Lobby>
    );
  }
}

export default Host;
