import React from 'react';
import PropTypes from 'prop-types';
import { Card, Image, Grid, Label, Menu } from 'semantic-ui-react';
import * as moment from 'moment';

const propTypes = {
  match: PropTypes.object.isRequired,
  playerInTheMatch: PropTypes.object.isRequired,
  playerInTheMatchWon: PropTypes.bool.isRequired,
  converter: PropTypes.func.isRequired,
  setSelectedMatch: PropTypes.func.isRequired,
};

export default function MatchCard({
  match,
  playerInTheMatch,
  playerInTheMatchWon,
  converter,
  setSelectedMatch,
  index,
}) {
  const { shortMatchConclusion, matchConclusionColors } = converter({
    shortMatchConclusion: playerInTheMatchWon,
  }).shortMatchConclusion();
  const humanGameMode = converter({
    gameMode: match.gameMode,
  }).humanGameMode();
  const humanDuration = converter({
    duration: match.duration,
  }).humanDuration();
  const items = playerInTheMatch.items.slice();
  if (match.gameMode.indexOf('5v5') !== -1) {
    items.splice(0, 2);
  }
  for (let i = 0; i < 6; i += 1) {
    if (!items[i]) {
      items.push('empty');
    }
  }
  let kdaPerTenMinutes =
    (playerInTheMatch.kills + playerInTheMatch.assists) /
    playerInTheMatch.deaths /
    (match.duration / 600);
  if (playerInTheMatch.deaths === 0) {
    kdaPerTenMinutes =
      (playerInTheMatch.kills + playerInTheMatch.assists) /
      (match.duration / 600);
  }
  const goldPerMinute = playerInTheMatch.gold / (match.duration / 60);
  return (
    <Menu.Item
      // style={{ padding: '10px', paddingBottom: '5px' }}
      onClick={(e) => {
        e.preventDefault();
        setSelectedMatch(index);
      }}
      as={Card}
      color={matchConclusionColors[1]}
      link
      fluid
    >
      <Card.Content>
        <Image
          size="mini"
          src={`/static/img/heroes/c/${playerInTheMatch.actor.toLowerCase()}.jpg`}
          style={{ borderRadius: '25%', marginBottom: 0 }}
          floated="right"
        />
        <Card.Header>
          <span>
            <Label
              color={matchConclusionColors[1]}
              style={{ verticalAlign: 'top' }}
              horizontal
            >
              {shortMatchConclusion.toUpperCase()}
            </Label>
          </span>{' '}
          <span
            style={{
              fontStyle: 'italic',
              // color: matchConclusionColors[1],
            }}
          >
            {humanGameMode.toUpperCase()}
          </span>
        </Card.Header>
        <Card.Meta style={{ fontSize: '0.9em', marginTop: '3px' }}>
          {moment(match.createdAt).fromNow()} | {humanDuration}min game
        </Card.Meta>
      </Card.Content>
      <Card.Content>
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column style={{ margin: 'auto', padding: '0 0.5rem' }}>
              <div
                style={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  width: '50%',
                  overflow: 'hidden',
                }}
              >
                {match.rosters[0].participants.map((participant, index) => {
                  let afkFilter = '';
                  let afkTextDecoration = '';
                  if (participant.wentAfk) {
                    afkFilter = 'grayscale(100%)';
                    afkTextDecoration = 'line-through';
                  }

                  return (
                    <div
                      style={{
                        display: 'block',
                        float: 'left',
                      }}
                    >
                      <Image
                        avatar
                        src={`/static/img/heroes/c/${participant.actor.toLowerCase()}.jpg`}
                        style={{
                          borderRadius: '25%',
                          width: '22px',
                          height: '22px',
                          margin: '1px',
                          float: 'left',
                          filter: afkFilter,
                        }}
                        key={index}
                      />{' '}
                      <div
                        style={{
                          display: 'block',
                          overflow: 'hidden',
                          lineHeight: '24px',
                          fontSize: '0.85em',
                          whiteSpace: 'nowrap',
                          textDecoration: afkTextDecoration,
                        }}
                      >
                        {(() => {
                          if (
                            participant.player.name !==
                            playerInTheMatch.player.name
                          ) {
                            return <>{participant.player.name}</>;
                          }
                          return <strong>{participant.player.name}</strong>;
                        })()}
                        <div
                          style={{
                            position: 'absolute',
                            top: `${index * 24}px`,
                            left: 0,
                            display: 'block',
                            width: '50%',
                            height: '24px',
                            background:
                              'linear-gradient(to right, transparent 90%, white)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  width: '50%',
                  verticalAlign: 'middle',
                }}
              >
                {match.rosters[1].participants.map((participant, index) => {
                  let afkFilter = '';
                  let afkTextDecoration = '';
                  if (participant.wentAfk) {
                    afkFilter = 'grayscale(100%)';
                    afkTextDecoration = 'line-through';
                  }

                  return (
                    <div
                      style={{
                        display: 'block',
                        float: 'right',
                        width: '100%',
                      }}
                    >
                      <Image
                        avatar
                        src={`/static/img/heroes/c/${participant.actor.toLowerCase()}.jpg`}
                        style={{
                          borderRadius: '25%',
                          width: '22px',
                          height: '22px',
                          margin: '1px',
                          float: 'right',
                          filter: afkFilter,
                        }}
                        key={index}
                      />
                      <div
                        style={{
                          display: 'block',
                          overflow: 'hidden',
                          lineHeight: '24px',
                          fontSize: '0.85em',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          textDecoration: afkTextDecoration,
                        }}
                      >
                        {(() => {
                          if (
                            participant.player.name !==
                            playerInTheMatch.player.name
                          ) {
                            return <>{participant.player.name}</>;
                          }
                          return <strong>{participant.player.name}</strong>;
                        })()}{' '}
                        <div
                          style={{
                            position: 'absolute',
                            top: `${index * 24}px`,
                            left: '50%',
                            display: 'block',
                            width: 'calc(50% - 24px - 6px)',
                            height: '24px',
                            background:
                              'linear-gradient(to right, transparent 85%, white)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Grid.Column>
            <Grid.Column
              style={{
                textAlign: 'center',
                margin: 'auto',
                padding: '0 0.2rem',
                paddingBottom: '3px',
              }}
            >
              <div style={{ margin: 'auto' }}>
                {playerInTheMatch.kills} / {playerInTheMatch.deaths} /{' '}
                {playerInTheMatch.assists}
                <br />
                <strong>{kdaPerTenMinutes.toFixed(1)}</strong> KDA Score
                <br />
                <strong>{goldPerMinute.toFixed(0)}</strong> Gold/min
                <br />
                {items.map((item, index) => (
                  <Image
                    avatar
                    src={`/static/img/items/c/${item
                      .replace(/ /g, '-')
                      .toLowerCase()}.png`}
                    style={{
                      width: '21px',
                      height: '21px',
                      margin: 0,
                      marginTop: '4px',
                    }}
                    key={index}
                  />
                ))}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Card.Content>
    </Menu.Item>
  );
}

MatchCard.propTypes = propTypes;
