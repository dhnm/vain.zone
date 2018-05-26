import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Router from 'next/router';

import Layout from './../../../components/ExtensionLayout';
import MainView from './MainView';
import ErrorLayout from './ErrorView';

import { gameModeDict } from './../../../modules/functions/constants';

const propTypes = {
  data: PropTypes.object,
  TLData: PropTypes.object,
  error: PropTypes.bool.isRequired,
  errorMessage: PropTypes.any,
  extension: PropTypes.bool,
};

const defaultProps = {
  data: null,
  TLData: null,
  errorMessage: null,
  extension: null,
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
        createdAt: '',
        gameMode: '',
      },
      filterFailed: false,
      selectedMatch: 0,
      TLData: props.TLData,
      appLoading: false,
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
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      sidebarVisible: false,
      filters: {
        page: 1,
        createdAt: '',
        gameMode: '',
      },
      filterFailed: false,
      selectedMatch: 0,
      TLData: nextProps.TLData,
      appLoading: false,
    });
  }
  setSelectedMatch = (index) => {
    this.showSidebar(false);
    this.setState({ appLoading: true });
    const that = this;
    axios({
      method: 'get',
      url: '/api/telemetry',
      params: {
        match: this.state.data.matches[index],
      },
    })
      .then((res) => res.data)
      .then((processedTelemetry) => {
        that.setState({
          selectedMatch: index,
          TLData: processedTelemetry,
          appLoading: false,
        });
      })
      .catch((err) => {
        that.setState({ appLoading: false });
        // alert('Error retrieving telemetry data.');
        console.log(err);
      });
  };
  applyFilter = (modifiedValues) => {
    this.setState(
      (prevState) => ({
        filters: {
          ...prevState.filters,
          ...modifiedValues,
        },
        filterFailed: false,
        appLoading: true,
      }),
      () => {
        axios({
          method: 'get',
          url: '/api/applyfilter',
          params: {
            player: this.state.data.player.name,
            shardId: this.state.data.player.shardId,
            filters: this.state.filters,
          },
        })
          .then((res) => res.data)
          .then((newMatches) => {
            const data = Object.assign({}, this.state.data);

            if (this.state.filters.page > 1) {
              data.matches.push(...newMatches);
            } else {
              data.matches = newMatches.slice();
            }

            this.setState({
              data,
              appLoading: false,
              scrollPosition: window.scrollY,
            });
          })
          .catch((err) => {
            const data = Object.assign({}, this.state.data);
            if (this.state.filters.page === 1) {
              data.matches = [];
            }
            console.log(window.scrollY);
            this.setState(
              () => ({
                appLoading: false,
                filterFailed: true,
                data,
              }),
              () => {
                this.setState({ scrollPosition: window.scrollY });
              },
            );
            console.error(err);
          });
      },
    );
  };
  appLoadingOn = () => {
    this.setState({ appLoading: true });
  };
  showSidebar = (sidebarVisible) => {
    this.setState(
      () => ({
        sidebarVisible,
        scrollPosition: window.scrollY,
      }),
      () => {
        if (sidebarVisible) {
          window.document.body.style.overflowY = 'hidden';
        } else {
          window.document.body.style.overflowY = 'auto';
        }
      },
    );
  };

  converter = (data) => ({
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
            };
          }
        }
      }

      throw new Error("Couldn't find player in the match.");
    },
    shortMatchConclusion: () => {
      if (data.shortMatchConclusion || data.shortMatchConclusion === 'true') {
        return {
          shortMatchConclusion: 'WON',
          matchConclusionColors: ['#0c5', 'green'],
        };
      }
      return {
        shortMatchConclusion: 'LOST',
        matchConclusionColors: ['#ff5757', 'red'],
      };
    },
    longMatchConclusion: () => {
      if (data.rosterWon === true || data.rosterWon === 'true') {
        return {
          longMatchConclusion: 'VICTORY',
          matchConclusionColors: ['#0c5', 'green'],
        };
      } else if (data.endGameReason === 'victory') {
        return {
          longMatchConclusion: 'DEFEAT',
          matchConclusionColors: ['#ff5757', 'red'],
        };
      }
      return {
        longMatchConclusion: 'SURRENDER',
        matchConclusionColors: ['#fc0', 'yellow'],
      };
    },
    humanGameMode: () => gameModeDict[data.gameMode][0],
    humanDuration: () => {
      let time = `${Math.floor(data.duration / 60)}:${data.duration % 60}`;
      time = time.split(':');
      if (time[0].length < 2) time[0] = `0${time[0]}`;
      if (time[1].length < 2) time[1] = `0${time[1]}`;
      return time.join(':');
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
            data.rosters[rosterIndex].participants[participantIndex].gold,
          );
          farmArray.push(
            data.rosters[rosterIndex].participants[participantIndex].farm,
          );
        }
      }
      return {
        maxGold: Math.max(...goldArray),
        maxFarm: Math.max(...farmArray),
      };
    },
  });
  render() {
    if (this.props.error) {
      console.log('errorMessage', this.props.errorMessage);
      return (
        <ErrorLayout
          appLoading={this.state.appLoading}
          appLoadingOn={this.appLoadingOn}
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
      />
    );
  }
}

Extension.propTypes = propTypes;
Extension.defaultProps = defaultProps;

function App(props) {
  return (
    <Layout>
      <Extension {...props} />
    </Layout>
  );
}

export default App;

App.getInitialProps = async function getInitialProps(context) {
  try {
    const { query } = context;

    let urlPath = 'https://test.vainglory.eu';
    if (process.env.NODE_ENV !== 'production') {
      urlPath = 'http://localhost:3000';
    }

    if (!JSON.parse(query.error)) {
      if (!JSON.parse(query.extension)) {
        const requestMatches = await axios({
          method: 'get',
          url: `${urlPath}/api/matches`,
          params: {
            IGN: query.IGN,
          },
        });
        const data = await requestMatches.data;

        if (data.error) {
          console.log(JSON.stringify(data));
          return {
            data: null,
            TLData: null,
            extension: false,
            error: true,
          };
        }
        const requestProcessedTelemetry = await axios({
          method: 'get',
          url: `${urlPath}/api/telemetry`,
          params: {
            match: data.matches[0],
          },
        });
        const processedTelemetry = await requestProcessedTelemetry.data;
        return {
          data,
          TLData: processedTelemetry,
          extension: false,
          error: false,
        };
      }
      return {
        data: null,
        TLData: null,
        extension: true,
        error: false,
      };
    }
    return {
      data: null,
      TLData: null,
      extension: false,
      error: true,
      errorMessage: query.errorMessage,
    };
  } catch (err) {
    return {
      data: null,
      TLData: null,
      extension: false,
      error: true,
      errorMessage: err,
    };
  }
};
