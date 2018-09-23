import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Router from "next/router";
import Head from "next/head";

import MainView from "./../page_components/extension/MainView";
import MessageLayout from "./../page_components/extension/MessageView";

import { gameModeDict } from "./../functions/constants";
import skillTierCalculator from "./../functions/skillTierCalculator";

const propTypes = {
  data: PropTypes.object,
  TLData: PropTypes.object,
  error: PropTypes.bool.isRequired,
  errorMessage: PropTypes.any,
  errorData: PropTypes.any,
  query: PropTypes.string,
  extension: PropTypes.bool
};

const defaultProps = {
  data: null,
  TLData: null,
  errorMessage: null,
  errorData: null,
  query: null,
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
              playerID: this.state.data.player.playerID,
              shardId: this.state.data.player.shardId,
              filters: this.state.filters
            }
          })
            .then(response => {
              if (
                !response.data ||
                !response.data.matches ||
                !response.data.matches.length
              ) {
                throw new Error("No matches.");
              }

              const newMatches = response.data.matches;

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
              .playerID === this.state.data.player.playerID
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

      console.error("Couldn't find pIM.");
      return {
        playerInTheMatch: { player: {} }
      };
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
    getParticipantValues: () => {
      const goldArray = [];
      const farmArray = [];
      const skillTiers = [[], []];
      const andromedaAwards = [
        { name: "Feeding Frenzy", values: [], description: "deaths" },
        { name: "Faithful Sidekick", values: [], description: "assists" },
        { name: "Ashamed", values: [], description: "" },
        {
          name: "Drinking Problem",
          values: [],
          description: "flasks consumed"
        },
        {
          name: "Fly, you fools",
          values: [],
          description: "boots activations"
        },
        { name: "Giver of Life", values: [], description: "fountains" },
        { name: "Pumped up", values: [], description: "infusions" },
        { name: "Sweet Tooth", values: [], description: "minion candies" },
        { name: "Visionary", values: [], description: "vision items used" },
        { name: "Underfunded", values: [], description: "gold" },
        { name: "Friend to Minions", values: [], description: "minions killed" }
      ];
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
          const participantRef =
            data.rosters[rosterIndex].participants[participantIndex];
          const playerName = participantRef.player.name;
          goldArray.push(participantRef.gold);
          farmArray.push(participantRef.farm);

          skillTiers[rosterIndex].push(
            this.state.TLData.singleMatchData[playerName].rankPoints
          );

          andromedaAwards[0].values.push({
            name: playerName,
            value: participantRef.deaths
          });
          if (
            participantRef.deaths > 10 &&
            (andromedaAwards[0].referenceValue < participantRef.deaths ||
              !andromedaAwards[0].referenceValue)
          ) {
            andromedaAwards[0].referenceValue = participantRef.deaths;
          }

          andromedaAwards[1].values.push({
            name: playerName,
            value: participantRef.assists
          });
          if (
            participantRef.assists > 12 &&
            (andromedaAwards[1].referenceValue < participantRef.assists ||
              !andromedaAwards[1].referenceValue)
          ) {
            andromedaAwards[1].referenceValue = participantRef.assists;
          }

          if (
            participantRef.items
              .slice(2)
              .every((val, i, arr) => val === arr[0]) &&
            Object.keys(participantRef.itemSells).length >= 3
          ) {
            andromedaAwards[2].values.push({
              name: playerName
            });
          }

          const drunken = participantRef.itemUses["Healing Flask"] || 0;
          andromedaAwards[3].values.push({
            name: playerName,
            value: drunken
          });
          if (
            drunken > 8 &&
            (andromedaAwards[3].referenceValue < drunken ||
              !andromedaAwards[3].referenceValue)
          ) {
            andromedaAwards[3].referenceValue = drunken;
          }

          const bootsActivations = [
            "Sprint Boots",
            "Travel Boots",
            "Journey Boots",
            "War Treads",
            "Halcyon Chargers",
            "Teleport Boots"
          ].reduce((accu, currVa) => {
            return accu + (participantRef.itemUses[currVa] || 0);
          }, 0);
          andromedaAwards[4].values.push({
            name: playerName,
            value: bootsActivations
          });
          if (
            bootsActivations > 8 &&
            (andromedaAwards[4].referenceValue < bootsActivations ||
              !andromedaAwards[4].referenceValue)
          ) {
            andromedaAwards[4].referenceValue = bootsActivations;
          }

          const fountainsGiven =
            participantRef.itemUses["Fountain of Reneewal"] || 0;
          andromedaAwards[5].values.push({
            name: playerName,
            value: fountainsGiven
          });
          if (
            fountainsGiven > 4 &&
            (andromedaAwards[5].referenceValue < fountainsGiven ||
              !andromedaAwards[5].referenceValue)
          ) {
            andromedaAwards[5].referenceValue = fountainsGiven;
          }

          const infused =
            (participantRef.itemUses["Weapon Infusion"] || 0) +
            (participantRef.itemUses["Crystal Infusion"] || 0);
          andromedaAwards[6].values.push({
            name: playerName,
            value: infused
          });
          if (
            infused > 3 &&
            (andromedaAwards[6].referenceValue < infused ||
              !andromedaAwards[6].referenceValue)
          ) {
            andromedaAwards[6].referenceValue = infused;
          }

          const candiesEaten = participantRef.itemUses["Minion Candy"] || 0;
          andromedaAwards[7].values.push({
            name: playerName,
            value: candiesEaten
          });
          if (
            candiesEaten > 0 &&
            (andromedaAwards[7].referenceValue < candiesEaten ||
              !andromedaAwards[7].referenceValue)
          ) {
            andromedaAwards[7].referenceValue = candiesEaten;
          }

          const visionProvided = [
            "Vision Totem",
            "Flare",
            "Scout Trap",
            "Flare Gun",
            "Contraption",
            "Flare Loader",
            "ScoutTuff",
            "SuperScout 2000"
          ].reduce((accu, currVa) => {
            return accu + (participantRef.itemUses[currVa] || 0);
          }, 0);
          andromedaAwards[8].values.push({
            name: playerName,
            value: visionProvided
          });
          if (
            visionProvided > 10 &&
            (andromedaAwards[8].referenceValue < visionProvided ||
              !andromedaAwards[8].referenceValue)
          ) {
            andromedaAwards[8].referenceValue = visionProvided;
          }

          andromedaAwards[9].values.push({
            name: playerName,
            value: participantRef.gold
          });
          if (
            // divide this by game duration
            participantRef.gold < 12000 &&
            (andromedaAwards[9].referenceValue > participantRef.gold ||
              !andromedaAwards[9].referenceValue)
          ) {
            andromedaAwards[9].referenceValue = participantRef.gold;
          }

          andromedaAwards[10].values.push({
            name: playerName,
            value: participantRef.farm
          });
          if (
            participantRef.farm < 10 &&
            (andromedaAwards[10].referenceValue > participantRef.farm ||
              !andromedaAwards[10].referenceValue)
          ) {
            andromedaAwards[10].referenceValue = participantRef.farm;
          }
        }
      }

      if (andromedaAwards[2].values.length > 0) {
        andromedaAwards[2].referenceValue = "sold entire build";
      }
      console.log("aa", andromedaAwards);
      return {
        maxGold: Math.max(...goldArray),
        maxFarm: Math.max(...farmArray),
        skillTiers: [
          {
            max: skillTierCalculator(Math.max(...skillTiers[0])),
            min: skillTierCalculator(Math.min(...skillTiers[0])),
            avg: skillTierCalculator(
              skillTiers[0].reduce((a, b) => a + b) / skillTiers[0].length
            )
          },
          {
            max: skillTierCalculator(Math.max(...skillTiers[1])),
            min: skillTierCalculator(Math.min(...skillTiers[1])),
            avg: skillTierCalculator(
              skillTiers[1].reduce((a, b) => a + b) / skillTiers[1].length
            )
          }
        ],
        andromedaAwards: andromedaAwards
          .filter(aa => typeof aa.referenceValue !== "undefined")
          .slice(0, 3)
      };
    }
  });
  render() {
    if (this.props.error) {
      let errorType;
      if (
        this.props.errorMessage &&
        typeof this.props.errorMessage == "string"
      ) {
        if (this.props.errorMessage == "veryold") {
          errorType = "veryold";
        } else if (this.props.errorMessage == "404") {
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
          errorData={this.props.errorData}
          query={this.props.query}
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
          href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.3/semantic.min.css"
        />
        <link rel="stylesheet" href="/static/css/semantic.slate.min.css" />
        <link rel="stylesheet" href="/static/css/backgroundStyle.css?flush=1" />

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
            min-height: 100vh;
          }
          body {
            font-family: "Open Sans", sans-serif !important;
          }
          header,
          h1,
          h2,
          h3,
          h4 {
            font-family: "Montserrat", sans-serif !important;
            color: #d8d8d8 !important;
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
    console.log("gg8");
    let urlPath = "https://vain.zone";
    if (process.env.NODE_ENV !== "production") {
      urlPath = "http://localhost:3000";
    }
    console.log("gg9");
    if (!query.error || query.error === "false") {
      if (!query.extension || query.extension === "false") {
        if (!query.IGN && !query.playerID) {
          return { error: true, browserView: true };
        }
        console.log("gg10");
        const requestData = await axios({
          method: "get",
          url: `${urlPath}/api/playerdata`,
          params: {
            IGN: query.IGN,
            playerID: query.playerID
          }
        });
        const data = await requestData.data;
        console.log("gg11");
        if (data.error) {
          return {
            data: null,
            TLData: null,
            extension: false,
            error: true,
            errorMessage: data.errorMessage,
            query: query.IGN || query.playerID,
            errorData: data.errorData,
            browserView: query.browserView
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
        console.log("gg12");
        const requestProcessedTelemetry = await axios({
          method: "get",
          url: `${urlPath}/api/telemetry`,
          params: {
            match: data.matches[0]
          }
        });
        const processedTelemetry = await requestProcessedTelemetry.data;
        console.log("gg13");
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
        error: false,
        browserView: false
      };
    }
    return {
      data: null,
      TLData: null,
      extension: false,
      error: true,
      errorMessage: query.errorMessage,
      browserView: query.browserView
    };
  } catch (err) {
    console.log("gg12", err.message);
    return {
      data: null,
      TLData: null,
      extension: false,
      error: true,
      errorMessage: err,
      browserView: query.browserView
    };
  }
};
