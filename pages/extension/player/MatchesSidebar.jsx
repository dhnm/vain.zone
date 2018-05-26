import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar, Menu, Button, Icon, Dropdown } from 'semantic-ui-react';

import MatchCard from './MatchCard';

const propTypes = {
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  sidebarVisible: PropTypes.bool.isRequired,
  showSidebar: PropTypes.func.isRequired,
  converter: PropTypes.func.isRequired,
  setSelectedMatch: PropTypes.func.isRequired,
  applyFilter: PropTypes.func.isRequired,
  scrollPosition: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  filterFailed: PropTypes.bool.isRequired,
  appLoading: PropTypes.bool.isRequired,
  selectedMode: PropTypes.string.isRequired,
  handleSelect: PropTypes.func.isRequired,
};

function MatchesSidebar({
  matches,
  sidebarVisible,
  showSidebar,
  converter,
  setSelectedMatch,
  applyFilter,
  scrollPosition,
  filters,
  filterFailed,
  appLoading,
  selectedMode,
  handleSelect,
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
      // inverted
      vertical
    >
      <Menu.Item
        style={{ padding: '10px', paddingBottom: '5px', textAlign: 'center' }}
        icon={false}
      >
        <Button
          onClick={() => {
            showSidebar(false);
          }}
          style={{
            verticalAlign: 'top',
            width: 'calc(50% - 4px)',
            height: '55px',
            fontSize: '1.05rem',
            // background: 'transparent',
            // border: '1px solid hsla(0, 0%, 0%, 0.53)',
          }}
        >
          <Icon name="chevron left" />Back
        </Button>
        <Dropdown
          text={selectedMode}
          icon="filter"
          floating
          labeled
          button
          className="icon black"
          style={{
            verticalAlign: 'top',
            width: 'calc(50% - 4px)',
            height: '55px',
            fontSize: '1.05rem',
            border: '1px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          loading={appLoading}
        >
          <Dropdown.Menu>
            <Dropdown.Item
              text="All modes"
              value=""
              onClick={handleSelect}
              active={selectedMode === ''}
            />
            <Dropdown.Header content="Sovereign's Rise" />
            <Dropdown.Item
              text="5v5 Ranked"
              value="5v5_pvp_ranked"
              onClick={handleSelect}
              active={selectedMode === '5v5_pvp_ranked'}
            />
            <Dropdown.Item
              text="5v5 Casual"
              value="5v5_pvp_casual"
              onClick={handleSelect}
              active={selectedMode === '5v5_pvp_casual'}
            />
            <Dropdown.Item
              text="5v5 Private Draft"
              value="private_party_draft_match_5v5"
              onClick={handleSelect}
              active={selectedMode === 'private_party_draft_match_5v5'}
            />
            <Dropdown.Item
              text="SR Private Blind"
              value="private_party_vg_5v5"
              onClick={handleSelect}
              active={selectedMode === 'private_party_vg_5v5'}
            />
            <Dropdown.Divider />
            <Dropdown.Header content="Halcyon Fold" />
            <Dropdown.Item
              text="3v3 Ranked"
              value="ranked"
              onClick={handleSelect}
              active={selectedMode === 'ranked'}
            />
            <Dropdown.Item
              text="3v3 Casual"
              value="casual"
              onClick={handleSelect}
              active={selectedMode === 'casual'}
            />
            <Dropdown.Item
              text="3v3 Private Draft"
              value="private_party_draft_match"
              onClick={handleSelect}
              active={selectedMode === 'private_party_draft_match'}
            />
            <Dropdown.Item
              text="HF Private Blind"
              value="private"
              onClick={handleSelect}
              active={selectedMode === 'private'}
            />
            <Dropdown.Divider />
            <Dropdown.Header content="BRAWL" />
            <Dropdown.Item
              text="Battle Royale"
              value="casual_aral"
              onClick={handleSelect}
              active={selectedMode === 'casual_aral'}
            />
            <Dropdown.Item
              text="Blitz"
              value="blitz_pvp_ranked"
              onClick={handleSelect}
              active={selectedMode === 'blitz_pvp_ranked'}
            />
            <Dropdown.Item
              text="Private B. Royale"
              value="private_party_aral_match"
              onClick={handleSelect}
              active={selectedMode === 'private_party_aral_match'}
            />
            <Dropdown.Item
              text="Private Blitz"
              value="private_party_blitz_match"
              onClick={handleSelect}
              active={selectedMode === 'private_party_blitz_match'}
            />
          </Dropdown.Menu>
        </Dropdown>
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
        style={
          {
            // display: 'none',
          }
        }
      >
        <Button
          style={{
            width: '100%',
            // background: 'transparent',
            // border: '1px solid hsla(0, 0%, 0%, 0.53)',
          }}
          onClick={() => {
            applyFilter({
              page: filters.page + 1,
              createdAt: matches[matches.length - 1].createdAt,
            });
          }}
          loading={appLoading}
          disabled={appLoading || filterFailed || matches.length % 12 !== 0}
        >
          <div style={{ lineHeight: '2.4rem', fontSize: '1.2rem' }}>
            {(() => {
              if (matches.length % 12 !== 0 || filterFailed) {
                return 'Nothing here.';
              }
              return 'Show more matches...';
            })()}
          </div>
        </Button>
      </Menu.Item>
    </Sidebar>
  );
}

const exportedPropTypes = {
  applyFilter: PropTypes.func.isRequired,
};

export default class ExportedMatchesSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMode: 'All modes',
    };
  }
  componentDidMount() {
    console.log('mounted');
  }
  componentWillUnmount() {
    console.log('will unmount');
  }
  handleSelect = (_, optionProps) => {
    this.setState({ selectedMode: optionProps.text });
    this.props.applyFilter({
      gameMode: optionProps.value,
      page: 1,
      createdAt: '',
    });
  };
  render() {
    return (
      <MatchesSidebar
        {...this.props}
        selectedMode={this.state.selectedMode}
        handleSelect={this.handleSelect}
      />
    );
  }
}

MatchesSidebar.propTypes = propTypes;
ExportedMatchesSidebar.propTypes = exportedPropTypes;
