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
              list-style: none;
              position: relative;
              display: inline-block;
              overflow: hidden;
              margin: 2px 0;
              padding: 0;
              width: ${e.action === "pick" ? "100%" : "70%"};
              overflow: auto;
            }
            li:last-child {
              margin-bottom: 0;
            }
            img {
              display: block;
              margin: auto;
              border: 4px inset;
              ${this.props.draftedHeroes.length + 1 === draftPositionIndex
                ? "border: 4px dashed;"
                : ""} filter: ${e.action === "pick" ||
                this.props.draftedHeroes.length <= draftPositionIndex
                  ? "none"
                  : "grayscale(75%)"};
              border-color: ${e.team ? "red" : "#008AF4"};
              box-sizing: border-box;
              width: 100%;
              border-radius: ${e.action === "pick" ? "38%" : "50%"};
              transition: 0.5s cubic-bezier(0.25, 0.01, 0.31, 2.5);
            }
            li:after {
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
              text-align: center;
              font-weight: bold;
              font-family: "Montserrat", sans-serif;
              z-index: 1;

              /*left: calc(50% - 0.5px);*/
              top: calc(50% - 1px);
              transform: translate(0, -50%);
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

              padding: 2px;

              left: 0px;
              bottom: 0px;
              width: 16px;
              height: 16px;
              line-height: 16px;
              font-size: 0.85rem;
              border-radius: 50%;
              background-color: white`
                : ""};
            }
            @media (max-width: 767px) {
              li {
                width: 100%;
                margin: 1px 0;
              }
              img {
                width: ${e.action === "pick" ? "100%" : "82%"};
                border-radius: ${e.action === "pick" ? "16px" : "50%"};
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
      <div id="draft_wrapper">
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
        <h1 className="mobileHeader">{this.props.matchName}</h1>
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
                  stroke="hsla(0, 0%, 96%, 0.2)"
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
                      : "hsla(0, 0%, 96%, 1.0)"
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
                  stroke="hsla(0, 0%, 96%, 0.2)"
                  strokeWidth="15"
                />
                <circle
                  transform="rotate(-90 50 50)"
                  cx="50"
                  cy="50"
                  r="42.5"
                  fill="none"
                  stroke="#C145FF"
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
                  fill="hsla(0, 0%, 96%, 1.0)"
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
                  stroke="hsla(0, 0%, 96%, 0.2)"
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
                      : "hsla(0, 0%, 96%, 1.0)"
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
            <div
              style={{
                boxShadow: "none",
                textAlign: "center",
                background: "none"
              }}
            >
              <img
                src="/static/img/draft/logo.png"
                alt="NACL Logo"
                style={{ maxWidth: "100%" }}
              />
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
        <style global jsx>{`
          body {
            /*background-image: url("/static/img/draft/bg.jpg");
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;*/
            background-color: #0e2026;
          }
        `}</style>
        <style jsx>
          {`
            #draft_wrapper {
              overflow: overlay;
              color: #f0f0f0;
              margin: 2% auto;
              padding: 30px 20px;
              max-width: 1024px;
            }
            #central h1 {
              margin-bottom: 5%;
            }
            .mobileHeader {
              display: none;
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
            #draft_wrapper > div > div {
              width: calc(94%);
              overflow: hidden;
              margin: 4% auto;
              padding: calc(25px + 0.75%) calc(15px + 2px + 2.25%);
              box-sizing: border-box;
              border-radius: 40px;
              box-shadow: 0px 1px 10px 1px hsla(0, 0%, 90%, 0.4);
              background-color: #1a2b34;
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
            .draft_items {
              margin: 0;
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
              border: 5px inset hsla(0, 0%, 100%, 0.5);
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
              border-radius: 30px;
              appearance: none;
              border: 0;
              margin: auto;
              box-sizing: border-box;
              font-size: 21px;

              width: 100%;
              margin-bottom: 15px;
              padding: 10px 25px;
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
              #draft_wrapper,
              #draft_wrapper > div > div {
                padding: 0;
                margin-left: 0;
                margin-right: 0;
                width: 100%;
                border-radius: 0;
                box-shadow: none;
              }
              #central h1 {
                display: none;
              }
              .mobileHeader {
                display: block;
              }
              #draft_wrapper #timers {
                padding-left: 5px;
                padding-right: 5px;
              }
              #timers #team_names {
                margin: 0;
              }
              .timer {
                max-width: 28%;
              }
              .timer svg {
                height: 1px;
                width: 100%;
                overflow: visible;
                padding-bottom: 100%;
              }
              #team_names > span {
                max-width: 28%;
              }
              #input_panel input {
                margin-left: 8px;
                margin-right: 8px;
                width: calc(100% - 16px);
              }
              #heroes li button {
                border-width: 3px;
                width: 68px;
              }
            }
            @media only screen and (max-width: 486px) and (min-height: 538px) and (orientation: portrait) {
              #central h1 {
                display: block;
              }
              .mobileHeader {
                display: none;
              }
              #left,
              #right {
                position: fixed;
              }
              #central {
                margin-left: 14%;
              }
            }
          `}
        </style>
      </div>
    );
  }
}

export default Draft;
