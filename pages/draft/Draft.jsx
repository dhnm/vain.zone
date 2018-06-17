import React from "react";
import Head from "next/head";

import io from "socket.io-client";
import axios from "axios";
import Router from "next/router";

import { toast } from "react-toastify";
import ProgressiveImage from "react-progressive-image";

const HeroPick = ({ hero }) => {
  const src =
    hero.img || `/static/img/heroes/170-jpg/${hero.name.toLowerCase()}.jpg`;
  const placeholder =
    hero.img || `/static/img/heroes/placeholder/${hero.name.toLowerCase()}.jpg`;
  return (
    <ProgressiveImage src={placeholder} placeholder={placeholder}>
      {progressiveSrc => <img src={progressiveSrc} alt={hero.name} />}
    </ProgressiveImage>
  );
};

class Draft extends React.Component {
  static async getInitialProps({ query }) {
    return query;
  }
  state = { timeLeft: 0, heroSearchPhrase: "", lastKnownScrollPosition: 0 };
  componentDidMount() {
    this.setState({ windowWidth: window.screen.width });
    window.addEventListener("resize", () =>
      this.setState({ windowWidth: window.screen.width })
    );
    let lastKnownScrollPosition = 0;
    let ticking = false;
    window.addEventListener("scroll", () => {
      lastKnownScrollPosition = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.setState({ lastKnownScrollPosition });
          ticking = false;
        });
        ticking = true;
      }
    });

    this.socket = io();

    const timeoutTime =
      new Date(this.props.timeLeft).getTime() -
      (this.props.draftSequence[0].action === "pick"
        ? this.props.pickTime
        : this.props.banTime) -
      new Date().getTime() +
      50;

    setTimeout(() => {
      toast.success("Draft has started.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
        closeButton: false,
        hideProgressBar: true
      });

      if (
        this.props.team ===
        this.props.draftSequence[this.props.draftedHeroes.length].team
      ) {
        toast.info("Your turn.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 1500,
          closeButton: true,
          hideProgressBar: true
        });
      }
    }, Math.max(timeoutTime, 0));

    const intervalID = setInterval(() => {
      const draftPositionIndex = this.props.draftedHeroes.length;
      const teamTurn = this.props.draftSequence[draftPositionIndex].team;

      const waitingTimeLeft =
        draftPositionIndex === 0
          ? new Date(this.props.timeLeft).getTime() -
            (this.props.draftSequence[0].action === "pick"
              ? this.props.pickTime
              : this.props.banTime) -
            new Date().getTime()
          : -1;

      const sideBonus = teamTurn ? "redBonus" : "blueBonus";

      const timeLeft =
        new Date(this.props.timeLeft).getTime() - new Date().getTime();

      if (timeLeft >= 0) {
        this.setState({
          timeLeft,
          waitingTimeLeft
        });
      } else if (typeof this.state[sideBonus] === "undefined") {
        console.log(
          "new time left",
          new Date(this.props.timeLeft).getTime() +
            this.props[`${sideBonus}Left`] -
            new Date().getTime()
        );
        this.setState({
          timeLeft: 0,
          [sideBonus]: new Date(
            new Date(this.props.timeLeft).getTime() +
              this.props[`${sideBonus}Left`]
          ),
          [`${sideBonus}Left`]:
            new Date(this.props.timeLeft).getTime() +
            this.props[`${sideBonus}Left`] -
            new Date().getTime(),
          waitingTimeLeft
        });
      } else {
        this.setState(prevState => ({
          [`${sideBonus}Left`]:
            new Date(prevState[sideBonus]).getTime() - new Date().getTime(),
          waitingTimeLeft
        }));
      }
    }, 1000);

    setTimeout(() => {
      this.setState({ animated: true });
    }, 1000);

    this.setState({ intervalID });
  }
  draftFinishedToast = null;
  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
      setTimeout(() => {
        this.setState({ animated: true });
      }, 1000);
      if (this.props.draftFinished) {
        clearInterval(this.state.intervalID);
        if (!toast.isActive(this.draftFinishedToast)) {
          this.draftFinishedToast = toast.success(
            "Draft finished. Good luck in match!",
            {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000,
              closeButton: false,
              hideProgressBar: true
            }
          );
        }
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

      if (this.props.blueBonusLeft !== this.state.blueBonusLeft) {
        this.setState({
          blueBonus: undefined,
          blueBonusLeft: this.props.blueBonusLeft
        });
      }
      if (this.props.redBonusLeft !== this.state.redBonusLeft) {
        this.setState({
          redBonus: undefined,
          redBonusLeft: this.props.redBonusLeft
        });
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
      ? hero.img || `/static/img/heroes/170-jpg/${hero.name.toLowerCase()}.jpg`
      : this.props.draftedHeroes.length === draftPositionIndex
        ? e.team ? colors.red : colors.blue
        : colors.black;
    const placeholder = drafted
      ? hero.img ||
        `/static/img/heroes/placeholder/${hero.name.toLowerCase()}.jpg`
      : src;
    return (
      <li key={`draftPosition${draftPositionIndex}`}>
        <ProgressiveImage src={src} placeholder={placeholder}>
          {(progressiveSrc, loading) => (
            <img
              style={{
                filter: loading ? "blur(0.14vw)" : "blur(0)",
                transform: loading ? "scale(1.04)" : "scale(1)",
                transition: "500ms linear"
              }}
              src={progressiveSrc}
              alt={hero ? hero.name : "Empty draft slot"}
            />
          )}
        </ProgressiveImage>
        <span id="draft_sequence_number">{draftPositionIndex + 1}</span>
        <style jsx>
          {`
            li {
              list-style: none;
              position: relative;
              display: inline-block;
              overflow: hidden;
              margin: 2px 0;
              padding: 0;
              width: ${e.action === "pick" ? "60%" : "40%"};
              float: ${e.action === "pick"
                ? ["right", "left"][e.team]
                : ["left", "right"][e.team]};
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
              border-color: ${e.team
                ? "hsla(0, 100%, 50%, 1)"
                : "hsla(206, 100%, 48%, 1)"};
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
                e.team ? "hsla(360, 100%, 34%, 1)" : "hsla(207, 100%, 31%, 1)"
              } /*hsla(0, 0%, 100%, 0.65)*/;
              z-index: 0;`
                : ""};
            }

            #draft_sequence_number {
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
        this.state.timeLeft /
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

    const fixedHUDScreenHeight =
      446.578 / 320 * (this.state.windowWidth ? this.state.windowWidth : 1000);
    const lastKnownScrollPosition = this.state.lastKnownScrollPosition;
    const stickyScreenHeight = Math.min(
      675 / 1024 * (this.state.windowWidth ? this.state.windowWidth : 1024),
      675
    );
    console.log(stickyScreenHeight);
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
        <h1 className="phone_header">{this.props.matchName}</h1>
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
                  stroke="hsla(206, 100%, 48%, 1)"
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
                      ? "hsla(0, 100%, 27%, 1)"
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
                  stroke={
                    this.state.waitingTimeLeft > 0
                      ? "#f77a52"
                      : "hsla(280, 100%, 64%, 1)"
                  }
                  strokeWidth="15"
                  strokeDasharray={2 * Math.PI * 42.5}
                  strokeDashoffset={2 * Math.PI * 42.5 * (1 - purPercent)}
                  style={
                    this.state.animated
                      ? { transition: "stroke-dashoffset 1000ms linear" }
                      : {}
                  }
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
                    : this.state.waitingTimeLeft > 0
                      ? Math.round(this.state.waitingTimeLeft / 1000)
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
                  stroke="hsla(360, 100%, 50%, 1)"
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
                      ? "hsla(0, 100%, 27%, 1)"
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
                      .team === this.props.team &&
                    this.state.waitingTimeLeft <= 0
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
                src="/static/img/draft/VAINZONE-logo-darkbg.png"
                alt="Draft Logo"
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
                    `/static/img/heroes/170-jpg/${hero.name.toLowerCase()}.jpg`;
                  const placeholder =
                    hero.img ||
                    `/static/img/heroes/placeholder/${hero.name.toLowerCase()}.jpg`;

                  return (
                    <li key={hero.name}>
                      <ProgressiveImage src={src} placeholder={placeholder}>
                        {(progressiveSrc, loading) => (
                          <input
                            type="image"
                            name="hero"
                            src={progressiveSrc}
                            style={{
                              backgroundImage: `url('${progressiveSrc}')`,
                              backgroundSize: "cover",
                              filter: loading ? "blur(0.14vw)" : "blur(0)",
                              transform: loading ? "scale(1.04)" : "scale(1)",
                              transition: "500ms linear"
                            }}
                            id={hero.name}
                            alt={hero.name}
                            disabled={this.props.draftedHeroes.includes(
                              hero.name
                            )}
                            onClick={e => {
                              e.preventDefault();

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

                                this.setState({
                                  heroSearchPhrase: "",
                                  animated: false
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
                        )}
                      </ProgressiveImage>
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
            display: block;
            /*background-image: url("/static/img/draft/bg.jpg");
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;*/
            background-color: hsla(195, 46%, 10%, 1);
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%239C92AC' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E");
            position: relative;
          }
          img,
          input[type="image"] {
            color: hsla(0, 0%, 94%, 1);
          }
        `}</style>
        <style jsx>
          {`
            #draft_wrapper {
              overflow: overlay;
              color: hsla(0, 0%, 94%, 1);
              margin: 0 auto;
              padding: 2%;
              max-width: 1024px;
              box-sizing: border-box;
            }
            #central h1 {
              margin-bottom: 5%;
            }
            .phone_header {
              display: none;
            }
            #left,
            #right {
              position: relative;
              min-height: 1px;
              display: inline-block;
              width: 20%;
              margin: 0;
              float: left;
            }
            #central {
              display: inline-block;
              width: 60%;
              margin: 0;
              float: left;
            }
            #draft_wrapper > div > div {
              width: calc(94%);
              overflow: hidden;
              margin: 4% auto;
              padding: calc(10px + 0.75%) calc(5px + 2px + 2.25%);
              box-sizing: border-box;
              border-radius: 40px;
              box-shadow: 0px 1px 10px 1px hsla(0, 0%, 90%, 0.4);
              background-color: hsla(201, 33%, 15%, 1);
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
            #heroes li input[type="image"] {
              position: relative;
              vertical-align: middle;
              cursor: pointer;
              outline: none;
              appearance: none;
              border: 5px inset hsla(0, 0%, 100%, 0.5);
              border-radius: 30px;
              padding: 0;
              box-sizing: border-box;
              object-fit: cover;
              object-position: center center;
              width: 73px;
              height: 73px;
              transition: 0.5s cubic-bezier(0.25, 0.01, 0.31, 2);
              z-index: 1;
            }
            /*#heroes li input[type="image"]:hover {
              transform: scale(1.1);
              z-index: 2;
            }*/
            #heroes li input[type="image"]:disabled {
              transform: scale(1);
              opacity: 0.4;
              cursor: default;
            }
            #input_panel input[type="text"] {
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
              #left,
              #right {
                width: 14.5%;
              }
              #central {
                width: 71%;
              }
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
              .phone_header {
                display: block;
              }
              #draft_wrapper > div > .draft_items {
                margin-top: 0;
              }
              #draft_wrapper #timers {
                margin-top: 0;
                padding-left: 5px;
                padding-right: 5px;
              }
              #timers #team_names {
                margin: 0;
              }
              .timer {
                max-width: 27%;
              }
              #team_names > span {
                max-width: 27%;
              }
              .timer svg {
                height: 1px;
                width: 100%;
                overflow: visible;
                padding-bottom: 100%;
              }
              #input_panel input[type="text"] {
                margin-left: 8px;
                margin-right: 8px;
                width: calc(100% - 16px);
              }
              #heroes li button {
                border-width: 3px;
                width: 68px;
                height: 68px;
              }
            }
            @media (max-width: 767px) and (min-width: 584px) {
              #left,
              #right {
                width: 14%;
              }
              #central {
                width: 72%;
              }
              .draft_items ul {
                padding: 14px;
              }
            }
          `}
        </style>
        <style jsx>
          {`
            @media (min-width: 768px) and (min-height: ${stickyScreenHeight}px) {
              #draft_wrapper {
                max-height: 100vh;
                width: 100vw;
                box-sizing: border-box;
              }
              #left,
              #right,
              #timers {
                position: sticky;
                top: 2vw;
                transition: 600ms cubic-bezier(0.25, 0.01, 0.31, 1.8);
                z-index: 1000;
              }
              #timers {
                top: 3px;
              }
              ::-webkit-scrollbar {
                width: 0px; /* remove scrollbar space */
                background: transparent;
              }
            }
            @media only screen and (max-width: 583px) and (min-height: ${fixedHUDScreenHeight}px) and (orientation: portrait) {
              #central h1 {
                display: block;
                margin-top: calc(0.25 * 72vw + 2rem + 3%);
              }
              #central #timers {
                position: fixed;
                top: 0;
                height: calc(0.25 * 72vw + 2.5rem);
                width: 72%;
                margin: 0;
                margin-bottom: 5%;
                padding: 5px;
                box-sizing: border-box;
                z-index: 1000;
              }
              .timer {
                max-width: 25%;
                /*height: calc(0.25 * 72vw);*/
              }
              #team_names > span {
                font-size: 0.75rem;
                max-width: 25%;
              }
              .timer svg {
                display: block;
              }
              .phone_header {
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
