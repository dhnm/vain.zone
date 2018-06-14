import React from "react";
import Head from "next/head";

import io from "socket.io-client";
import axios from "axios";
import Router from "next/router";

import { toast } from "react-toastify";

const HeroPick = ({ hero }) => {
  const src = hero.img || `/static/img/heroes/${hero.name.toLowerCase()}.png`;
  return <img src={src} alt={hero.name} />;
};

class Draft extends React.Component {
  static async getInitialProps({ query }) {
    return query;
  }
  state = { timeLeft: 0, heroSearchPhrase: "" };
  componentDidMount() {
    this.socket = io();

    toast.success("Draft has started.", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 2000,
      closeButton: false,
      hideProgressBar: true
    });

    const draftPositionIndex = this.props.draftedHeroes.length;
    const teamTurn = this.props.draftSequence[draftPositionIndex].team;
    if (this.props.team === teamTurn) {
      toast.info("Your turn.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        closeButton: true,
        hideProgressBar: true
      });
    }

    const intervalID = setInterval(() => {
      const draftPositionIndex = this.props.draftedHeroes.length;
      const teamTurn = this.props.draftSequence[draftPositionIndex].team;
      const sideBonus = teamTurn ? "redBonus" : "blueBonus";

      const timeLeft =
        new Date(this.props.timeLeft).getTime() - new Date().getTime();
      if (timeLeft >= 0) {
        this.setState({
          timeLeft
        });
      } else if (typeof this.state[sideBonus] === "undefined") {
        this.setState({
          timeLeft: 0,
          [sideBonus]: new Date(
            new Date(this.props.timeLeft).getTime() +
              this.props[`${sideBonus}Left`]
          ),
          [`${sideBonus}Left`]:
            new Date(this.props.timeLeft).getTime() +
            this.props[`${sideBonus}Left`] -
            new Date().getTime()
        });
      } else {
        this.setState(prevState => ({
          [`${sideBonus}Left`]:
            new Date(prevState[sideBonus]).getTime() - new Date().getTime()
        }));
      }
    }, 1000);

    this.setState({ intervalID });
  }
  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
      if (this.props.draftFinished) {
        clearInterval(this.state.intervalID);
        toast.success("Draft finished. Good luck in match!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
          closeButton: false,
          hideProgressBar: true
        });
      }

      const draftPositionIndex = this.props.draftedHeroes.length;
      const draftSequenceItem = this.props.draftSequence[draftPositionIndex];
      const sideBonus = draftSequenceItem
        ? draftSequenceItem.team ? "redBonus" : "blueBonus"
        : "blueBonus";

      if (
        draftSequenceItem &&
        this.props.team === draftSequenceItem.team &&
        prevProps.draftedHeroes.length !== this.props.draftedHeroes.length
      ) {
        toast.info("Your turn.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 1500,
          closeButton: true,
          hideProgressBar: true
        });
      }

      if (
        new Date(
          new Date(this.props.timeLeft).getTime() +
            this.props[`${sideBonus}Left`]
        ) !== this.state[sideBonus]
      ) {
        this.setState({ [sideBonus]: undefined });
      }
    }
  }
  componentWillUnmount() {
    this.socket.close();
  }
  draftItemCallback = (e, i) => {
    const draftPositionIndex = this.props.draftSequence.indexOf(e);
    const drafted = draftPositionIndex + 1 <= this.props.draftedHeroes.length;
    const hero = this.props.heroes.find(
      h => h.name === this.props.draftedHeroes[draftPositionIndex]
    );

    const colors = {
      black:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      blue:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk6PzyHwAEjAJ+zzya7wAAAABJRU5ErkJggg==",
      red:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8D0HwAFCQICTJNNiQAAAABJRU5ErkJggg=="
    };

    const src = drafted
      ? hero.img || `/static/img/heroes/${hero.name.toLowerCase()}.png`
      : this.props.draftedHeroes.length === draftPositionIndex
        ? e.team ? colors.red : colors.blue
        : colors.black;

    return (
      <li key={`draftPosition${draftPositionIndex}`}>
        <img src={src} alt={hero ? hero.name : "Empty draft slot"} />
        <span id="draftSequenceNumber">{draftPositionIndex + 1}</span>
        <style jsx>
          {`
            li {
              position: relative;
              display: inline-block;
              overflow: hidden;
              margin: 0;
              padding: 0;
              width: ${e.action === "pick" ? "100%" : "70%"};
              overflow: auto;
            }
            img {
              border: ${this.props.draftedHeroes.length === draftPositionIndex
                ? "12px inset"
                : this.props.draftedHeroes.length + 1 === draftPositionIndex
                  ? "4px dashed"
                  : "0"};
              border: 3px inset;
              border-color: ${e.team ? "red" : "#008AF4"};
              box-sizing: border-box;
              width: 100%;
              border-radius: ${e.action === "pick" ? "25px" : "50%"};
              transition: 0.5s cubic-bezier(0.25, 0.01, 0.31, 2.5);
            }
            li:before {
              ${e.action === "ban"
                ? `
              content: '';
              border-radius: 50%;
              width: 7px;
              height: 100%;
              transform: rotate(45deg);
              position: absolute;
              left: 0;
              right: 0;
              top: 0;
              bottom: 0;
              margin: auto;
              background-color: ${
                e.team ? "#AB0001" : "#0059A0"
              } /*hsla(0, 0%, 100%, 0.65)*/;
              z-index: 0;`
                : ""};
            }

            #draftSequenceNumber {
              position: absolute;
              align-items: center;
              justify-content: center;
              display: flex;
              padding: 2px;
              text-align: center;
              font-weight: bold;
              font-family: "Montserrat", sans-serif;
              z-index: 1;

              left: 50%;
              top: 46%;
              transform: translate(-50%, -50%);
              width: 100%;
              height: 100%;
              font-size: 1.5rem;
              color: white;
               {
                /* background-color: red; */
              }
              transition: 0.5s linear;
              box-sizing: border-box;

              ${this.props.draftedHeroes.length > draftPositionIndex
                ? `
              top: initial;
              color: black;
              transform: none;

              left: 0px;
              bottom: 0px;
              width: 16px;
              height: 16px;
              line-height: 16px;
              font-size: 0.85rem;
              background-color: red`
                : ""};
            }
            @media (max-width: 767px) {
              li {
                width: 100%;
              }
              img {
                width: ${e.action === "pick" ? "100%" : "90%"};
                border-radius: ${e.action === "pick" ? "17px" : "50%"};
                border-width: 2px;
                box-sizing: border-box;
              }
            }
          `}
        </style>
      </li>
    );
  };
  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };
  render() {
    let purPercent = 1;
    if (this.props.draftSequence[this.props.draftedHeroes.length]) {
      purPercent =
        (this.state.timeLeft - 800) /
        (this.props.draftSequence[this.props.draftedHeroes.length].action ===
        "pick"
          ? this.props.pickTime
          : this.props.banTime);
      if (purPercent < 0) {
        purPercent = 0;
      }
    } else {
      purPercent = 0;
    }
    const bluePercent =
      (this.state.blueBonusLeft || this.props.blueBonusLeft) /
      this.props.bonusTime;
    const redPercent =
      (this.state.redBonusLeft || this.props.redBonusLeft) /
      this.props.bonusTime;
    return (
      <div id="draftWrapper">
        <Head>
          <title>
            {typeof this.props.team === "number"
              ? this.props.team
                ? `${this.props.redName} in`
                : `${this.props.blueName} in`
              : "Spectating"}{" "}
            {this.props.matchName}
          </title>
        </Head>
        <div id="left">
          <div className="draft_items">
            <ul>
              {this.props.draftSequence
                .filter(e => e.team === 0)
                .map(this.draftItemCallback)}
            </ul>
          </div>
        </div>
        <div id="central">
          <h1>{this.props.matchName}</h1>
          <div id="timers">
            <div className="timer">
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMin slice"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42.5" // cx - strokeWidth/2
                  fill="none"
                  stroke="hsla(0, 0%, 94%, 1.0)"
                  strokeWidth="15"
                />
                <circle
                  transform="rotate(-90 50 50)"
                  cx="50"
                  cy="50"
                  r="42.5"
                  fill="none"
                  stroke="#008AF4"
                  strokeWidth="15"
                  strokeDasharray={2 * Math.PI * 42.5}
                  strokeDashoffset={Math.min(
                    2 * Math.PI * 42.5,
                    2 * Math.PI * 42.5 * (1 - bluePercent)
                  )}
                  style={{ transition: "stroke-dashoffset 1000ms linear" }}
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  alignmentBaseline="central"
                  fontSize="35px"
                  fontWeight="bold"
                  fill={
                    this.state.blueBonusLeft && this.state.blueBonusLeft < 0
                      ? "darkred"
                      : "black"
                  }
                >
                  {Math.ceil(
                    (this.state.blueBonusLeft || this.props.blueBonusLeft) /
                      1000
                  )}
                </text>
              </svg>
            </div>
            <div className="timer">
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMin slice"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42.5"
                  fill="none"
                  stroke="hsla(0, 0%, 94%, 1.0)"
                  strokeWidth="15"
                />
                <circle
                  transform="rotate(-90 50 50)"
                  cx="50"
                  cy="50"
                  r="42.5"
                  fill="none"
                  stroke="#651297"
                  //stroke="#f77a52"
                  strokeWidth="15"
                  strokeDasharray={2 * Math.PI * 42.5}
                  strokeDashoffset={2 * Math.PI * 42.5 * (1 - purPercent)}
                  style={{ transition: "stroke-dashoffset 1000ms linear" }}
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  alignmentBaseline="central"
                  fontSize="35px"
                  fontWeight="bold"
                >
                  {this.props.draftFinished
                    ? "END"
                    : Math.ceil(this.state.timeLeft / 1000)}
                </text>
              </svg>
            </div>
            <div className="timer">
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMin slice"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42.5" // cx - strokeWidth/2
                  fill="none"
                  stroke="hsla(0, 0%, 94%, 1.0)"
                  strokeWidth="15"
                />
                <circle
                  transform="rotate(-90 50 50)"
                  cx="50"
                  cy="50"
                  r="42.5"
                  fill="none"
                  stroke="red"
                  strokeWidth="15"
                  strokeDasharray={2 * Math.PI * 42.5}
                  strokeDashoffset={Math.min(
                    2 * Math.PI * 42.5,
                    2 *
                      Math.PI *
                      42.5 *
                      (1 -
                        (this.state.redBonusLeft || this.props.redBonusLeft) /
                          this.props.bonusTime)
                  )}
                  style={{ transition: "stroke-dashoffset 1000ms linear" }}
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  alignmentBaseline="central"
                  fontSize="35px"
                  fontWeight="bold"
                  fill={
                    this.state.redBonusLeft && this.state.redBonusLeft < 0
                      ? "darkred"
                      : "black"
                  }
                >
                  {Math.ceil(
                    (this.state.redBonusLeft || this.props.redBonusLeft) / 1000
                  )}
                </text>
              </svg>
            </div>
            <div id="team_names">
              <span>{this.props.blueName}</span>
              <span
                style={{
                  display:
                    this.props.draftSequence[this.props.draftedHeroes.length] &&
                    this.props.draftSequence[this.props.draftedHeroes.length]
                      .team === this.props.team
                      ? "initial"
                      : "none",
                  textTransform: "uppercase"
                }}
              >
                Your Turn
              </span>
              <span>{this.props.redName}</span>
            </div>
          </div>
          {this.props.spectator && (
            <div style={{ boxShadow: "none", textAlign: "center" }}>
              <img src="/static/img/draft/logo.png" alt="NACL Logo" />
            </div>
          )}
          <div id="input_panel">
            {!this.props.spectator && (
              <input
                type="text"
                placeholder="Search Hero..."
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                }}
                onChange={e =>
                  this.setState({ heroSearchPhrase: e.target.value })
                }
              />
            )}
            <ul id="heroes">
              {this.props.heroes
                .filter(h =>
                  h.name
                    .toLowerCase()
                    .includes(this.state.heroSearchPhrase.toLowerCase())
                )
                .map(hero => {
                  const src =
                    hero.img ||
                    `/static/img/heroes/${hero.name.toLowerCase()}.png`;
                  return (
                    <li key={hero.name}>
                      <button
                        style={{
                          background: `url('${src}')`,
                          backgroundSize: "cover"
                        }}
                        id={hero.name}
                        disabled={this.props.draftedHeroes.includes(hero.name)}
                        onClick={e => {
                          if (
                            this.props.draftSequence[
                              this.props.draftedHeroes.length
                            ] &&
                            this.props.team ===
                              this.props.draftSequence[
                                this.props.draftedHeroes.length
                              ].team
                          ) {
                            this.props.emit({
                              draftedHeroes: [
                                ...this.props.draftedHeroes,
                                e.target.id
                              ]
                            });
                          } else {
                            toast.error("It's not your turn", {
                              position: toast.POSITION.TOP_CENTER,
                              autoClose: 1000,
                              closeButton: false,
                              hideProgressBar: true
                            });
                          }
                        }}
                      />
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
        <div id="right">
          <div className="draft_items">
            <ul>
              {this.props.draftSequence
                .filter(e => e.team === 1)
                .map(this.draftItemCallback)}
            </ul>
          </div>
        </div>
        <style jsx>
          {`
            h1 {
            }
            #draftWrapper {
              margin: 0 auto;
              padding: 30px 20px;
              max-width: 1024px;
            }
            #left,
            #right {
              display: inline-block;
              width: 14%;
              margin: 0;
              float: left;
            }
            #central {
              display: inline-block;
              width: 72%;
              margin: 0;
              float: left;
            }
            #draftWrapper > div > div {
              width: calc(94%);
              overflow: hidden;
              margin: 0 auto 3% auto;
              padding: calc(25px + 0.75%) calc(15px + 2px + 2.25%);
              box-sizing: border-box;
              border-radius: 40px;
              box-shadow: 0 0 20px hsla(0, 0%, 90%, 1);
              background-color: white;
            }
            #timers {
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
            }
            #timers #team_names {
              width: 100%;
              display: flex;
              justify-content: space-between;
              margin-top: 5px;
              font-size: 0.9rem;
              text-align: center;
              font-weight: bold;
            }
            #team_names > span {
              width: 100px;
            }
            .draft_items ul {
              text-align: center;
              font-size: 0.2rem;
            }
            ul {
              position: relative;
              margin: 0;
              padding: 0;
            }
            #heroes {
              text-align: center;
            }
            #heroes li {
              margin: 1px;
              position: relative;
              display: inline-block;
            }
            #heroes li button {
              color: inherit;
              font: inherit;
              cursor: pointer;
              outline: inherit;
              appearance: none;
              border: 7px solid hsla(0, 0%, 100%, 0.5);
              border-radius: 30px;
              padding: 0;
              box-sizing: border-box;

              width: 73px;
              height: 73px;
              transition: 0.5s cubic-bezier(0.25, 0.01, 0.31, 2);
              z-index: 1;
            }
            #heroes li button:hover {
              transform: scale(1.1);
              z-index: 2;
            }
            #heroes li button:disabled {
              transform: scale(1);
              opacity: 0.4;
              cursor: default;
            }
            #input_panel input {
              appearance: none;
              border: 0;
              margin: auto;
              box-sizing: border-box;
              font-size: 21px;

              width: 100%;
              margin-bottom: 15px;
              padding: 10px 5px;
              border-bottom: 1px solid hsla(0, 0%, 75%, 1);
              box-sizing: border-box;
            }
            input:focus,
            button:focus,
            button:active {
              outline: none;
            }
            #input_panel input:focus,
            #input_panel input:hover {
              border-bottom: 1px solid hsla(0, 0%, 30%, 1);
            }
            @media (max-width: 767px) {
              // #left,
              // #right {
              //   width: 100%;
              // }
              #draftWrapper,
              #draftWrapper > div > div {
                padding: 0;
                margin-left: 0;
                margin-right: 0;
                width: 100%;
                border-radius: 0;
                box-shadow: none;
              }
              #draftWrapper #timers {
                padding-left: 3px;
                padding-right: 3px;
              }
              #timers #team_names {
                margin: 0;
              }
              .timer {
                max-width: 33%;
              }
              .timer svg {
                height: 1px;
                width: 100%;
                overflow: visible;
                padding-bottom: 100%;
              }
              #team_names > span {
                max-width: 33%;
              }
              #heroes li button {
                border-width: 5px;
                width: 68px;
              }
            }
            // @media (max-width: 513px) {
            //   #draftWrapper {
            //     padding: 10px 0;
            //   }
            //   #draftWrapper > div > div {
            //     border-radius: 0;
            //     padding: 10px 10px;
            //     width: 100%;
            //     box-shadow: 0 0 20px hsla(0, 0%, 92%, 1);
            //   }
            // }
          `}
        </style>
      </div>
    );
  }
}

export default Draft;
