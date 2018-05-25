import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar, Menu, Button, Icon } from 'semantic-ui-react';

import MatchCard from './MatchCard';

const propTypes = {
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  sidebarVisible: PropTypes.bool.isRequired,
  showSidebar: PropTypes.func.isRequired,
  converter: PropTypes.func.isRequired,
  setSelectedMatch: PropTypes.func.isRequired,
  loadMoreMatches: PropTypes.func.isRequired,
};

function MatchesSidebar({
  matches,
  sidebarVisible,
  showSidebar,
  converter,
  setSelectedMatch,
  loadMoreMatches,
  scrollPosition,
}) {
  return (
    <Sidebar
      as={Menu}
      animation="scale down"
      direction="right"
      width="wide"
      visible={sidebarVisible}
      icon="labeled"
      style={{
        maxWidth: '100vw',
        maxHeight: '100vh',
        top: `${scrollPosition}px`,
      }}
      //inverted
      vertical
    >
      <Menu.Item
        style={{ padding: '10px', paddingBottom: '5px', textAlign: 'left' }}
        onClick={() => {
          showSidebar(false);
        }}
        icon={false}
      >
        <Button
          onClick={() => {
            showSidebar(false);
          }}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid hsla(0, 0%, 0%, 0.53)',
          }}
        >
          <div style={{ lineHeight: '2.4rem', fontSize: '1.2rem' }}>
            <Icon name="chevron left" />Back
          </div>
        </Button>
        <Button
          onClick={() =>
            console.log('Show with modal: Filter option is coming soon!')
          }
          floated="right"
          disabled
          style={{ display: 'none' }}
        >
          <Icon name="filter" />Filter
        </Button>
      </Menu.Item>
      {matches.map((match, index) => {
        const { playerInTheMatch, playerInTheMatchWon } = converter({
          rosters: match.rosters,
        }).identifyPlayerInTheMatch();
        return (
          <MatchCard
            key={match.matchID}
            match={match}
            playerInTheMatch={playerInTheMatch}
            playerInTheMatchWon={playerInTheMatchWon}
            converter={converter}
            setSelectedMatch={setSelectedMatch}
            index={index}
          />
        );
      })}
      <Menu.Item
        style={{
          display: 'none',
        }}
      >
        <Button
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid hsla(0, 0%, 0%, 0.53)',
          }}
          onClick={loadMoreMatches}
          loading={false}
        >
          <div style={{ lineHeight: '2.4rem', fontSize: '1.2rem' }}>
            Load more matches
          </div>
        </Button>
      </Menu.Item>
    </Sidebar>
  );
}

export default class ExportedMatchesSidebar extends React.Component {
  componentDidMount() {
    console.log('mounted');
  }
  componentWillUnmount() {
    console.log('will unmount');
  }
  render() {
    return <MatchesSidebar {...this.props} />;
  }
}

MatchesSidebar.propTypes = propTypes;
