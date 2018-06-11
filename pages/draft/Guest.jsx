import React from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Router from 'next/router';
import Head from 'next/head';

import { CopyToClipboard } from 'react-copy-to-clipboard'; // add spectator link?
import { toast } from 'react-toastify';

import Lobby from './Lobby';
import Draft from './Draft';

class Guest extends React.Component {
  state = { lobby: true };
  componentDidMount() {
    this.socket = io();

    this.socket.on('connect', () => {
      this.socket.emit('verify', {
        keys: {
          socketID: this.socket.id,
          roomID: this.props.roomID,
          teamID: this.props.teamID,
          recipientID: this.props.roomID,
        },
      });
    });

    this.socket.on('data transfer', (data) => {
      console.log('here', data);
      if (data.keys.failed) {
        const tid = toast.error('Wrong link or expired draft session.', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2500,
          closeButton: false,
          hideProgressBar: true,
          onOpen: () => Router.replace('/draft'),
        });
      } else {
        this.setState((prevState) => {
          if (data.keys.spectator) {
            return { ...data.state, spectator: data.keys.spectator };
          }
          if (typeof prevState.team === 'number') {
            return data.state;
          }
          return { ...data.state, team: data.keys.team };
        });
      }
    });

    this.socket.on('socket disconnected', (socketID) => {
      if (socketID === this.props.roomID) {
        toast.error('Draft Host disconnected. Draft has been terminated.', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
          closeButton: false,
          hideProgressBar: true,
          onOpen: () => Router.replace('/draft'),
        });
      }
    });

    this.socket.on('disconnect', () => {
      this.setState(
        !this.state.spectator
          ? this.state.team
            ? { redState: 0 }
            : { blueState: 0 }
          : null,
      );
      toast.error('Disconnected from room.', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3500,
        closeButton: false,
        hideProgressBar: true,
      });
    });

    this.socket.on('reconnect', () => {
      this.socket.emit('verify', {
        keys: {
          socketID: this.socket.id,
          roomID: this.props.roomID,
          teamID: this.props.teamID,
          recipientID: this.props.roomID,
        },
      });
      toast.info('Reconnecting.', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
        closeButton: false,
        hideProgressBar: true,
      });
    });
  }
  componentWillUnmount() {
    this.socket.close();
  }
  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };
  handleSubmit = () => {
    this.socket.emit('host update', {
      state: !this.state.spectator
        ? this.state.team
          ? { redState: 2 }
          : { blueState: 2 }
        : null,
      keys: {
        teamID: this.props.teamID,
        recipientID: this.props.roomID,
      },
    });
  };
  render() {
    if (this.state.draftStarted) {
      return (
        <Draft
          {...this.state}
          urlPath={this.props.urlPath}
          emit={(state) =>
            this.socket.emit('host update', {
              state,
              keys: {
                teamID: this.props.teamID,
                recipientID: this.props.roomID,
              },
            })
          }
        />
      );
    } else if (this.state.draftSequence) {
      console.log(this.state, this.props);
      return (
        <Lobby>
          <Head>
            <title>
              {this.state.matchName
                ? `Lobby | ${this.state.matchName}`
                : 'Lobby | NACL Draft'}
            </title>
          </Head>
          <img
            src="/static/img/draft/logo.png"
            alt="NACL Logo"
            style={{ height: '100px', margin: 'auto', display: 'block' }}
          />
          <header>
            <h1>
              {!this.state.spectator ? (
                this.state.team ? (
                  this.state.redName
                ) : (
                  this.state.blueName
                )
              ) : (
                <React.Fragment>
                  {this.state.blueName}
                  <br />
                  <small>VS</small>
                  <br />
                  {this.state.redName}
                </React.Fragment>
              )}
            </h1>
            <p>{this.state.matchName}</p>
          </header>
          <input
            id="submit_button"
            type="button"
            value={
              this.state.spectator ||
              this.state[this.state.team ? 'redState' : 'blueState'] === 2
                ? 'Waiting for Draft'
                : 'Ready?'
            }
            style={
              this.state.spectator ||
              this.state[this.state.team ? 'redState' : 'blueState'] === 2
                ? {
                    boxShadow: 'none',
                    background: 'white',
                    color: '#aaa',
                    //border: '2px solid #aaa',
                    cursor: 'default',
                    fontSize: 'initial',
                  }
                : {}
            }
            disabled={
              this.state.spectator ||
              this.state[this.state.team ? 'redState' : 'blueState'] === 2
            }
            onClick={this.handleSubmit}
          />
          <table width="100%">
            <thead>
              <tr>
                <th colSpan="2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{this.state.blueName}</td>
                <td>
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
                  <div className="indicatorText">
                    {
                      ['Not Connected', 'In Lobby', 'Ready'][
                        this.state.blueState
                      ]
                    }
                  </div>
                </td>
              </tr>
              <tr>
                <td>{this.state.redName}</td>
                <td>
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
                  <div className="indicatorText">
                    {
                      ['Not Connected', 'In Lobby', 'Ready'][
                        this.state.redState
                      ]
                    }
                  </div>
                </td>
              </tr>
              <tr>
                <td>Draft Host</td>
                <td>
                  <span
                    style={{
                      backgroundColor: ['red', 'orange', 'green'][
                        this.state.hostState
                      ],
                      boxShadow: `0 0 1px 1px ${
                        ['red', 'orange', 'green'][this.state.hostState]
                      }`,
                    }}
                    className="indicator"
                  />
                  <div className="indicatorText">
                    {
                      ['Disconnected', 'Waiting', 'Started Draft'][
                        this.state.hostState
                      ]
                    }
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table width="100%">
            <thead>
              <tr>
                <th colSpan="2">Configuration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Players</td>
                <td>
                  {
                    this.state.draftSequence.filter(
                      (e) => (e.action === 'pick') & (e.team === 0),
                    ).length
                  }v{
                    this.state.draftSequence.filter(
                      (e) => (e.action === 'pick') & (e.team === 1),
                    ).length
                  }
                </td>
              </tr>
              <tr>
                <td>Bans</td>
                <td>
                  {
                    this.state.draftSequence.filter((e) => e.action === 'ban')
                      .length
                  }{' '}
                </td>
              </tr>
              <tr>
                <td>Available Heroes</td>
                <td>{this.state.heroes.length} </td>
              </tr>
              <tr>
                <td>Ban Time</td>
                <td>{this.state.banTime / 1000}s</td>
              </tr>
              <tr>
                <td>Pick Time</td>
                <td>{this.state.pickTime / 1000}s</td>
              </tr>
              <tr>
                <td>Bonus Time</td>
                <td>{this.state.bonusTime / 1000}s</td>
              </tr>
            </tbody>
          </table>
          <style jsx>
            {`
              header h1 {
                margin-bottom: 0;
              }
              header p {
                margin-top: 5px;
              }
              input {
                appearance: none;
                border: 0;
                margin: auto;
                box-sizing: border-box;
              }
              input:focus {
                outline: none;
              }
              #submit_button {
                width: 100%;
                height: 48px;
                margin-top: 20px;
                margin-bottom: 10px;
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
                box-shadow: 0 0 20px hsla(0, 0%, 83%, 1);
                transition: 0.5s;
              }
              #submit_button:hover {
                background-position: left center;
                font-size: 14px;
              }
              .indicator {
                float: left;
                margin-right: 10px;
                margin-top: 3px;
                display: inline-block;
                width: 9px;
                height: 9px;
                border-radius: 50%;
              }
              .indicatorText {
                font-weight: bold;
                font-size: 0.7rem;
                text-transform: uppercase;
                vertical-align: middle;
              }
              table {
                margin-top: 20px;
                padding: 0 15px;
                font-size: 0.8rem;
              }
              thead {
                text-transform: uppercase;
                font-size: 0.8rem;
              }
              td:nth-child(1) {
                width: 50%;
                text-align: right;
                padding-right: 5px;
              }
              td:nth-child(2) {
                padding-left: 5px;
              }
            `}
          </style>
        </Lobby>
      );
    }
    return null;
  }
}

export default Guest;
