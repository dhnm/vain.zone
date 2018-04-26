import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Router from 'next/router';

import Layout from './../../../components/ExtensionLayout';
import MainView from './MainView';
import ErrorLayout from './ErrorView';

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
      selectedMatch: 0,
      TLData: props.TLData,
      telemetryLoading: false,
      appLoading: false,
    };
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.converter = this.converter.bind(this);
    this.setSelectedMatch = this.setSelectedMatch.bind(this);
    this.appLoadingOn = this.appLoadingOn.bind(this);
  }
  componentDidMount() {
    Router.onRouteChangeStart = () =>
      this.setState({ telemetryLoading: true, appLoading: true });
    // Router.onRouteChangeComplete = () => console.log("Complete");
    Router.onRouteChangeError = () =>
      this.setState({ telemetryLoading: false, appLoading: false });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      sidebarVisible: false,
      selectedMatch: 0,
      TLData: nextProps.TLData,
      telemetryLoading: false,
      appLoading: false,
    });
  }
  setSelectedMatch = (index) => {
    this.toggleSidebar();
    this.setState({ telemetryLoading: true });
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
          telemetryLoading: false,
        });
      })
      .catch((err) => {
        that.setState({ telemetryLoading: false });
        // alert('Error retrieving telemetry data.');
        console.log(err);
      });
  };
  appLoadingOn = () => {
    this.setState({ appLoading: true });
  };
  toggleSidebar = () => {
    this.setState({ sidebarVisible: !this.state.sidebarVisible });
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
    humanGameMode: () =>
      ({
        '5v5_pvp_ranked': ['5v5 Ranked', false, '5v5ranked'],
        '5v5_pvp_casual': ['5v5 Casual', false, '5v5casual'],
        private_party_draft_match_5v5: ['5v5 Private Draft', true, '5v5ranked'],
        private_party_vg_5v5: [
          "Sovereign's Rise Private Blind",
          true,
          '5v5casual',
        ],
        ranked: ['3v3 Ranked', false, 'ranked'],
        private_party_draft_match: ['3v3 Private Draft', true, 'ranked'],
        casual: ['3v3 Casual', false, 'casual'],
        private: ['Halcyon Fold Private Blind', true, 'casual'],
        casual_aral: ['Battle Royale', false, 'br'],
        private_party_aral_match: ['Private Battle Royale', true, 'br'],
        blitz_pvp_ranked: ['Blitz', false, 'blitz'],
        private_party_blitz_match: ['Private Blitz', true, 'blitz'],
        blitz_rounds_pvp_casual: ['Onslaught', false, 'onslaught'],
        private_party_blitz_rounds_match: [
          'Private Onslaught',
          true,
          'onslaught',
        ],
      }[data.gameMode][0]),
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
        toggleSidebar={this.toggleSidebar}
        converter={this.converter}
        setSelectedMatch={this.setSelectedMatch}
        selectedMatch={this.state.selectedMatch}
        TLData={this.state.TLData}
        telemetryLoading={this.state.telemetryLoading}
        extension={this.props.extension}
        appLoading={this.state.appLoading}
        appLoadingOn={this.appLoadingOn}
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
