import React from 'react';
import io from 'socket.io-client';
import Router from 'next/router';
import Head from 'next/head';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';

import Lobby from './Lobby';
import Draft from './Draft';

const SharingLink = ({ lobby, roomID, teamID }) => {
  if (lobby) {
    const link = `${window.location.protocol}//${
      window.location.host
    }/draft/${roomID}/${teamID}`;
    return (
      <React.Fragment>
        <CopyToClipboard
          text={link}
          onCopy={() => {
            toast.info('Copied to clipboard.', {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 1500,
              closeButton: false,
              hideProgressBar: true,
            });
          }}
        >
          <input
            type="text"
            className="link"
            value={link}
            onClick={(e) => e.target.select()}
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
              border-radius: 40px;
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
  state = {
    blueSockets: new Set(),
    redSockets: new Set(),
    spectatorSockets: new Set(),

    blueState: 0,
    redState: 0,
    hostState: 1,

    draftSequence: [
      { action: 'ban', team: 0 },
      { action: 'ban', team: 0 },
      { action: 'ban', team: 0 },
      { action: 'ban', team: 1 },
      { action: 'ban', team: 1 },
      { action: 'ban', team: 1 },
      { action: 'pick', team: 0 },
      { action: 'pick', team: 0 },
      { action: 'pick', team: 0 },
      { action: 'pick', team: 0 },
      { action: 'pick', team: 0 },
      { action: 'pick', team: 1 },
      { action: 'pick', team: 1 },
      { action: 'pick', team: 1 },
      { action: 'pick', team: 1 },
      { action: 'pick', team: 1 },
    ],
    heroes: [
      {
        name: 'Ringo',
        img: '',
      },
      { name: 'Adagio' },
      { name: 'Baptiste' },
      { name: 'Alpha' },
      { name: 'Blackfeather' },
      { name: 'Taka' },
      { name: 'Vox' },
      { name: 'Koshka' },
      { name: 'Reza' },
      { name: 'Grace' },
      { name: 'Lyra' },
      { name: 'Varya' },
      { name: 'Kensei' },
      { name: 'Tony' },
      { name: 'Malene' },
      { name: 'Phinn' },
      { name: 'Catherine' },
    ],
    matchName: 'NACL Draft Match',
    blueName: 'Blue Team',
    redName: 'Red Team',
    banTime: 10000,
    pickTime: 15000,
    bonusTime: 30000,

    draftStarted: false,
    draftedHeroes: [],
    timeLeft: 0,
    redBonusLeft: 0,
    blueBonusLeft: 0,
  };
  componentDidMount() {
    this.socket = io();
    this.socket.on('connect', () => {
      this.setState({ roomID: this.socket.id });
    });
    this.socket.on('verify', (data) => {
      if (data.keys.roomID === this.state.roomID) {
        if (data.keys.teamID === this.props.blueID) {
          this.setState(
            (prevState) => {
              return {
                blueState: this.state.draftStarted ? 2 : 1,
                blueSockets: new Set([
                  ...prevState.blueSockets,
                  data.keys.socketID,
                ]),
              };
            },
            () =>
              this.socket.emit(
                'data transfer',
                this.stateWithKeys({ team: 0 }),
              ),
          );
        } else if (data.keys.teamID === this.props.redID) {
          this.setState(
            (prevState) => {
              return {
                redState: this.state.draftStarted ? 2 : 1,
                redSockets: new Set([
                  ...prevState.redSockets,
                  data.keys.socketID,
                ]),
              };
            },
            () =>
              this.socket.emit(
                'data transfer',
                this.stateWithKeys({ team: 1 }),
              ),
          );
        } else if (data.keys.teamID) {
          console.log(data.keys);
          this.socket.emit(
            'data transfer',
            this.stateWithKeys({
              failed: 'Wrong link.',
              recipientID: data.keys.socketID,
            }),
          );
        } else {
          this.setState(
            (prevState) => {
              return {
                spectatorSockets: new Set([
                  ...prevState.spectatorSockets,
                  data.keys.socketID,
                ]),
              };
            },
            () =>
              this.socket.emit(
                'data transfer',
                this.stateWithKeys({
                  spectator: true,
                  recipientID: data.keys.socketID,
                }),
              ),
          );
        }
      } else {
        this.socket.emit(
          'data transfer',
          this.stateWithKeys({ failed: true, recipientID: data.keys.socketID }),
        );
      }
    });

    this.socket.on('host update', (data) => {
      if (
        data.keys.teamID === this.props.blueID ||
        data.keys.teamID === this.props.redID
      ) {
        if (data.state.redState || data.state.blueState) {
          this.setState(data.state, () => {
            this.socket.emit('data transfer', this.stateWithKeys());
            if (this.state.redState === 2 && this.state.blueState === 2) {
              toast.success('Both teams are ready!', {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2500,
                closeButton: false,
                hideProgressBar: true,
              });
            }
          });
        } else {
          this.setState(
            (prevState) => {
              const draftPositionIndex = prevState.draftedHeroes.length;
              const teamTurn = prevState.draftSequence[draftPositionIndex].team;
              const requestFromTeam =
                data.keys.teamID === this.props.blueID ? 0 : 1;
              if (teamTurn === requestFromTeam) {
                const sideBonusLeft = teamTurn
                  ? 'redBonusLeft'
                  : 'blueBonusLeft';
                const draftActionTime =
                  prevState.draftSequence[draftPositionIndex].action === 'pick'
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
                  nextDraftAction === 'pick'
                    ? new Date(new Date().getTime() + prevState.pickTime + 400)
                    : new Date(new Date().getTime() + prevState.banTime + 400);

                return {
                  ...data.state,
                  timeLeft: nextTimeLeft,
                  [sideBonusLeft]: bonusTimeLeft,
                };
              }
              return null;
            },
            () => this.socket.emit('data transfer', this.stateWithKeys()),
          );
        }
      } else {
        this.socket.emit(
          'data transfer',
          this.stateWithKeys({
            failed: 'Wrong session.',
            recipientID: data.keys.socketID,
          }),
        );
      }
    });

    this.socket.on('socket disconnected', (socketID) => {
      this.setState((prevState) => {
        const newState = Object.assign({}, prevState);
        if (newState.blueSockets.delete(socketID)) {
          if (!newState.blueSockets.size) {
            newState.blueState = 0;
          }
          this.socket.emit('data transfer', {
            state: { blueState: 0 },
            keys: { recipientID: prevState.roomID },
          });
          return {
            blueSockets: newState.blueSockets,
            blueState: newState.blueState,
          };
        } else if (newState.redSockets.delete(socketID)) {
          if (!newState.redSockets.size) {
            newState.redState = 0;
          }
          this.socket.emit('data transfer', {
            state: { redState: 0 },
            keys: { recipientID: prevState.roomID },
          });
          return {
            redSockets: newState.redSockets,
            redState: newState.redState,
          };
        } else if (newState.spectatorSockets.delete(socketID)) {
          return {
            spectatorSockets: newState.spectatorSockets,
          };
        }
        return null;
      });
    });

    this.socket.on('disconnect', () => {
      toast.error('Connection lost.', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 4500,
        closeButton: false,
        hideProgressBar: true,
        onOpen: () => Router.replace('/draft'),
      });
    });
  }
  componentWillUnmount() {
    this.socket.close();
  }
  stateWithKeys = (data) => {
    const keys = data || {};
    const {
      blueSockets,
      redSockets,
      spectatorSockets,
      ...sharedState
    } = this.state;
    const newState = keys.failed
      ? { state: null }
      : {
          state: sharedState,
        };
    return Object.assign({}, newState, {
      keys: {
        recipientID: this.state.roomID,
        ...keys,
      },
    });
  };
  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  generateLinks = (event) => {
    event.preventDefault();
    this.setState({ lobby: true });
  };
  startDraft = (event) => {
    event.preventDefault();

    const draftPositionIndex = this.state.draftedHeroes.length;
    const draftAction = this.state.draftSequence[draftPositionIndex].action;
    const timeLeft =
      draftAction === 'pick'
        ? new Date(new Date().getTime() + this.state.pickTime + 400)
        : new Date(new Date().getTime() + this.state.banTime + 400);
    this.setState(
      {
        hostState: 2,
        draftStarted: true,
        timeLeft,
        blueBonusLeft: this.state.bonusTime,
        redBonusLeft: this.state.bonusTime,
      },
      () => this.socket.emit('data transfer', this.stateWithKeys()),
    );
  };
  render() {
    if (this.state.draftStarted) {
      return <Draft {...this.state} urlPath={this.props.urlPath} />;
    }
    return (
      <Lobby>
        <Head>
          <title>{this.state.matchName || 'NACL Draft Tool'}</title>
        </Head>
        <React.Fragment>
          <img
            src="/static/img/draft/logo.png"
            alt="NACL Logo"
            style={{ height: '100px', margin: 'auto', display: 'block' }}
          />
          <h1>NACL Draft Tool</h1>
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
                        backgroundColor: ['red', 'orange', 'green'][
                          this.state.blueState
                        ],
                        boxShadow: `0 0 1px 1px ${
                          ['red', 'orange', 'green'][this.state.blueState]
                        }`,
                      }}
                      className="indicator"
                    />
                    {['Offline', 'In Lobby', 'Ready'][this.state.blueState]}
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
                        backgroundColor: ['red', 'orange', 'green'][
                          this.state.redState
                        ],
                        boxShadow: `0 0 1px 1px ${
                          ['red', 'orange', 'green'][this.state.redState]
                        }`,
                      }}
                      className="indicator"
                    />
                    {['Offline', 'In Lobby', 'Ready'][this.state.redState]}
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
            {this.state.roomID && (
              <input
                id="submit_button"
                type="submit"
                value={this.state.lobby ? 'Start Draft' : 'Generate Links'}
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
              <div style={{ textAlign: 'center' }}>
                <a
                  href="/draft"
                  style={{
                    fontSize: '0.8rem',
                    color: 'grey',
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
                ? '0'
                : '1px solid hsla(0, 0%, 75%, 1)'};
              width: ${this.state.lobby ? 'initial' : 'calc(100% - 30px)'};
              ${this.state.lobby ? 'cursor: default;' : ''};
              box-sizing: border-box;
            }
            .names:focus,
            .names:hover {
              border-bottom: ${this.state.lobby
                ? '0'
                : '1px solid hsla(0, 0%, 30%, 1)'};
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
            .indicatorText {
              float: right;
              margin-top: 23px;
              font-weight: bold;
              font-size: 0.7rem;
              line-height: 1rem;
              text-transform: uppercase;
            }
            @media (max-width: 632px) {
              .names {
                max-width: calc(66% - 20px);
              }
              .names[name='matchName'] {
                max-width: 100%;
              }
              .indicatorText {
                max-width: calc(33% - 10px);
              }
            }
            input:focus {
              outline: none;
            }
            #submit_button {
              width: 100%;
              margin-top: 40px;
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
              box-shadow: 0 0 20px #eee;
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
