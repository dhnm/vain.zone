import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar, Menu, Button, Icon } from 'semantic-ui-react';

import MatchCard from './MatchCard';

const propTypes = {
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  converter: PropTypes.func.isRequired,
  setSelectedMatch: PropTypes.func.isRequired,
};

export default function MatchesSidebar({
  matches,
  sidebarVisible,
  toggleSidebar,
  converter,
  setSelectedMatch,
}) {
  return (
    <Sidebar
      as={Menu}
      animation="push"
      direction="right"
      width="wide"
      visible={sidebarVisible}
      icon="labeled"
      style={{ maxWidth: '100vw' }}
      //inverted
      vertical
    >
      <Menu.Item
        style={{ padding: '10px', paddingBottom: '5px', textAlign: 'left' }}
        onClick={toggleSidebar}
        icon={false}
      >
        {/* <Button onClick={toggleSidebar} style={{ width: '100%' }}> */}
        <div style={{ lineHeight: '2.4rem', fontSize: '1.2rem' }}>
          <Icon name="chevron left" />Back
        </div>
        {/* </Button> */}
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
    </Sidebar>
  );
}

MatchesSidebar.propTypes = propTypes;
