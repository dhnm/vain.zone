import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Router from "next/router";
import Head from "next/head";

import MainView from "./MainView";
import MessageLayout from "./MessageView";

import { gameModeDict } from "./../../../modules/functions/constants";

const propTypes = {
  data: PropTypes.object,
  TLData: PropTypes.object,
  error: PropTypes.bool.isRequired,
  errorMessage: PropTypes.any,
  extension: PropTypes.bool
};

const defaultProps = {
  data: null,
  TLData: null,
  errorMessage: null,
  extension: null
};

class Extension extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      sidebarVisible: false,
      scrollPosition: 0,
      filters: {
        page: 1,
        createdAt: "",
        gameMode: ""
      },
      filterFailed: false,
      selectedMatch:
        props.selectedMatch ||
        (props.data
          ? props.data.matches ? props.data.matches[0] : undefined
          : undefined),
      TLData: props.TLData,
      appLoading: false,
      sendLoading: false
    };
    this.showSidebar = this.showSidebar.bind(this);
    this.converter = this.converter.bind(this);
    this.setSelectedMatch = this.setSelectedMatch.bind(this);
    this.appLoadingOn = this.appLoadingOn.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
  }
  componentDidMount() {
    Router.onRouteChangeStart = () => this.setState({ appLoading: true });
    // Router.onRouteChangeComplete = () => console.log("Complete");
    Router.onRouteChangeError = () => this.setState({ appLoading: false });

    const scrollWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
    if (scrollWidth >= 1024) {
      this.setState({ screenCategory: "wide" });
    } else if (scrollWidth >= 768) {
      this.setState({ screenCategory: "tablet" });
    } else {
      this.setState({ screenCategory: "phone" });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const scrollWidth = Math.max(
          document.body.scrollWidth,
          document.documentElement.scrollWidth,
          document.body.offsetWidth,
          document.documentElement.offsetWidth,
          document.documentElement.clientWidth
        );
        this.setState(prevState => {
          if (scrollWidth >= 1024 && prevState.screenCategory !== "wide") {
            return { screenCategory: "wide" };
          } else if (
            scrollWidth >= 768 &&
            scrollWidth < 1024 &&
            prevState.screenCategory !== "tablet"
          ) {
            return { screenCategory: "tablet" };
          } else if (
            scrollWidth < 768 &&
            prevState.screenCategory !== "phone"
          ) {
            return { screenCategory: "phone" };
          }
          return null;
        });
      }, 250);
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.TLData) {
      this.setState({
        data: nextProps.data,
        sidebarVisible: false,
        filters: {
          page: 1,
          createdAt: "",
          gameMode: ""
        },
        filterFailed: false,
        selectedMatch: nextProps.data
          ? nextProps.data.matches ? nextProps.data.matches[0] : undefined
          : undefined,
        TLData: nextProps.TLData,
        appLoading: false
      });
    } else if (nextProps.error) {
      this.setState({
        appLoading: false
      });
    }
  }
  setSelectedMatch = index => {
    this.showSidebar(false);
    const selectedMatchID = this.state.selectedMatch
      ? this.state.selectedMatch.matchID
      : undefined;
    if (this.state.data.matches[index].matchID !== selectedMatchID) {
      this.setState({ appLoading: true });
      const that = this;
      axios({
        method: "get",
        url: "/api/telemetry",
        params: {
          match: this.state.data.matches[index]
        }
      })
        .then(res => res.data)
        .then(processedTelemetry => {
          that.setState({
            selectedMatch: this.state.data.matches[index],
            TLData: processedTelemetry,
            appLoading: false
          });
        })
        .catch(err => {
          that.setState({ appLoading: false });
          // alert('Error retrieving telemetry data.');
          console.log(err);
        });
    }
  };

  toggleSendLoading = newState => {
    this.setState({ sendLoading: newState });
  };
  applyFilter = modifiedValues => {
    if (
      JSON.stringify({ ...this.state.filters, ...modifiedValues }) !==
      JSON.stringify(this.state.filters)
    ) {
      this.setState(
        prevState => ({
          filters: {
            ...prevState.filters,
            ...modifiedValues
          },
          filterFailed: false,
          appLoading: true
        }),
        () => {
          axios({
            method: "get",
            url: "/api/applyfilter",
            params: {
              player: this.state.data.player.name,
              shardId: this.state.data.player.shardId,
              filters: this.state.filters
            }
          })
            .then(res => res.data)
            .then(newMatches => {
              if (!newMatches || !newMatches.length) {
                throw new Error(newMatches);
              }

              const data = Object.assign({}, this.state.data);

              if (this.state.filters.page > 1) {
                data.matches.push(...newMatches);
              } else {
                data.matches = newMatches.slice();
              }

              this.setState({
                data,
                appLoading: false,
                scrollPosition: window.scrollY
              });
            })
            .catch(err => {
              const data = Object.assign({}, this.state.data);
              if (this.state.filters.page === 1) {
                data.matches = [];
              }
              console.log(window.scrollY);
              this.setState(
                () => ({
                  appLoading: false,
                  filterFailed: true,
                  data
                }),
                () => {
                  this.setState({ scrollPosition: window.scrollY });
                }
              );
              console.error(err);
            });
        }
      );
    }
  };
  appLoadingOn = () => {
    this.setState({ appLoading: true });
  };
  showSidebar = sidebarVisible => {
    this.setState(
      () => ({
        sidebarVisible,
        scrollPosition: window.scrollY
      }),
      () => {
        if (sidebarVisible) {
          window.document.body.style.overflowY = "hidden";
        } else {
          window.document.body.style.overflowY = "auto";
        }
      }
    );
  };

  converter = data => ({
    identifyPlayerInTheMatch: () => {
      for (
        let rosterIndex = 0;
        rosterIndex < data.rosters.length;
        rosterIndex += 1
      ) {
        for (
          let participantIndex = 0;
          participantIndex < data.rosters[rosterIndex].participants.length;
          participantIndex += 1
        ) {
          if (
            data.rosters[rosterIndex].participants[participantIndex].player
              .id === this.state.data.player.playerID
          ) {
            return {
              playerInTheMatch:
                data.rosters[rosterIndex].participants[participantIndex],
              playerInTheMatchWon: data.rosters[rosterIndex].won,
              playerInTheMatchTeam: rosterIndex
            };
          }
        }
      }

      throw new Error("Couldn't find player in the match.");
    },
    shortMatchConclusion: () => {
      if (data.shortMatchConclusion || data.shortMatchConclusion === "true") {
        return {
          shortMatchConclusion: "WON",
          matchConclusionColors: ["#0c5", "green"]
        };
      }
      return {
        shortMatchConclusion: "LOST",
        matchConclusionColors: ["#ff5757", "red"]
      };
    },
    longMatchConclusion: () => {
      if (data.rosterWon === true || data.rosterWon === "true") {
        return {
          longMatchConclusion: "VICTORY",
          matchConclusionColors: ["#0c5", "green"]
        };
      } else if (data.endGameReason === "victory") {
        return {
          longMatchConclusion: "DEFEAT",
          matchConclusionColors: ["#ff5757", "red"]
        };
      }
      return {
        longMatchConclusion: "SURRENDER",
        matchConclusionColors: ["#fc0", "yellow"]
      };
    },
    humanGameMode: () => gameModeDict[data.gameMode][0],
    humanDuration: () => {
      let time = `${Math.floor(data.duration / 60)}:${data.duration % 60}`;
      time = time.split(":");
      if (time[0].length < 2) time[0] = `0${time[0]}`;
      if (time[1].length < 2) time[1] = `0${time[1]}`;
      return time.join(":");
    },
    getMaxParticipantValues: () => {
      const goldArray = [];
      const farmArray = [];
      for (
        let rosterIndex = 0;
        rosterIndex < data.rosters.length;
        rosterIndex += 1
      ) {
        for (
          let participantIndex = 0;
          participantIndex < data.rosters[rosterIndex].participants.length;
          participantIndex += 1
        ) {
          goldArray.push(
            data.rosters[rosterIndex].participants[participantIndex].gold
          );
          farmArray.push(
            data.rosters[rosterIndex].participants[participantIndex].farm
          );
        }
      }
      return {
        maxGold: Math.max(...goldArray),
        maxFarm: Math.max(...farmArray)
      };
    }
  });
  render() {
    if (this.props.error) {
      let errorType;
      if (
        this.props.errorMessage &&
        typeof this.props.errorMessage.error === "string"
      ) {
        if (this.props.errorMessage.error.indexOf("veryold") > -1) {
          errorType = "veryold";
        } else if (this.props.errorMessage.error.indexOf("404") > -1) {
          errorType = "404";
        } else {
          errorType = "SEMC";
          console.error(this.props.errorMessage);
        }
      }
      return (
        <MessageLayout
          appLoading={this.state.appLoading}
          appLoadingOn={this.appLoadingOn}
          browserView={this.props.browserView}
          errorType={errorType}
        />
      );
    }
    return (
      <MainView
        data={this.state.data}
        sidebarVisible={this.state.sidebarVisible}
        showSidebar={this.showSidebar}
        converter={this.converter}
        setSelectedMatch={this.setSelectedMatch}
        selectedMatch={this.state.selectedMatch}
        TLData={this.state.TLData}
        extension={this.props.extension}
        appLoading={this.state.appLoading}
        appLoadingOn={this.appLoadingOn}
        applyFilter={this.applyFilter}
        filters={this.state.filters}
        filterFailed={this.state.filterFailed}
        scrollPosition={this.state.scrollPosition}
        sendLoading={this.state.sendLoading}
        toggleSendLoading={this.toggleSendLoading}
        browserView={this.props.browserView}
        screenCategory={this.state.screenCategory}
      />
    );
  }
}

Extension.propTypes = propTypes;
Extension.defaultProps = defaultProps;

function App(props) {
  return (
    <div id="container">
      <Head>
        <title>VAIN.ZONE</title>
        <link
          rel="stylesheet"
          href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
        />
        <link rel="stylesheet" href="/static/css/semantic.slate.min.css" />

        <meta property="fb:app_id" content="617200295335676" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="VAIN.ZONE for Vainglory" />
        <meta
          property="og:description"
          content="Tools and Statistics for Vainglory players!"
        />
        <meta property="og:url" content="https://vain.zone/" />
        <meta
          property="og:image"
          content="https://vain.zone/static/img/og-VAINZONE-logo.png"
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="480" />
        <meta property="og:image:alt" content="VAIN.ZONE" />
      </Head>
      <Extension {...props} />
      <style jsx global>
        {`
          body {
            background-color: black !important;

            background-image: linear-gradient(
                hsla(0, 0%, 0%, 0.7),
                hsla(0, 0%, 0%, 0.6),
                hsla(0, 0%, 0%, 0.8),
                hsla(227, 32%, 9%, 0.9),
                hsla(227, 32%, 9%, 1)
              ),
              url("/static/img/bg.jpg") !important;
            background-repeat: no-repeat;
            background-position: center center;
            background-attachment: fixed;
            background-size: cover;

            min-height: 100vh;
          }
        `}
      </style>
      <style jsx>
        {`
          #container {
            min-height: 100vh;
            margin: auto;
            max-width: 1280px;
          }
          @media (min-width: 768px) and (max-width: 1023px) {
            #container {
              max-width: 768px;
            }
          }
          @media (max-width: 767px) {
            #container {
              max-width: 414px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;

App.getInitialProps = async function getInitialProps({ query }) {
  try {
    let urlPath = "https://vain.zone";
    if (process.env.NODE_ENV !== "production") {
      urlPath = "http://localhost:3000";
    }

    if (!query.error || query.error === "false") {
      if (!query.extension || query.extension === "false") {
        if (!query.IGN) {
          return { error: true, browserView: true };
        }
        const requestMatches = await axios({
          method: "get",
          url: `${urlPath}/api/matches`,
          params: {
            IGN: query.IGN
          }
        });
        const data = await requestMatches.data;

        if (data.error) {
          return {
            data: null,
            TLData: null,
            extension: false,
            error: true,
            errorMessage: data.errorMessage
          };
        }
        if (query.matchData) {
          return {
            data,
            selectedMatch: query.matchData.match,
            TLData: query.matchData.TLData,
            extension: false,
            error: false,
            browserView: query.browserView
          };
        }

        if (!data.matches[0]) {
          return {
            data,
            TLData: processedTelemetry,
            extension: false,
            error: false,
            browserView: query.browserView
          };
        }

        const requestProcessedTelemetry = await axios({
          method: "get",
          url: `${urlPath}/api/telemetry`,
          params: {
            match: data.matches[0]
          }
        });
        const processedTelemetry = await requestProcessedTelemetry.data;

        return {
          data,
          TLData: processedTelemetry,
          extension: false,
          error: false,
          browserView: query.browserView
        };
      }
      return {
        data: null,
        TLData: null,
        extension: true,
        error: false
      };
    }
    return {
      data: null,
      TLData: null,
      extension: false,
      error: true,
      errorMessage: query.errorMessage
    };
  } catch (err) {
    return {
      data: null,
      TLData: null,
      extension: false,
      error: true,
      errorMessage: err
    };
  }
};
