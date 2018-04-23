import React from 'react';
import PropTypes from 'prop-types';
import { Card, Image, Grid, Label } from 'semantic-ui-react';
import * as moment from 'moment';

const propTypes = {
  match: PropTypes.object.isRequired,
  playerInTheMatch: PropTypes.object.isRequired,
  playerInTheMatchWon: PropTypes.bool.isRequired,
  converter: PropTypes.func.isRequired,
};

export default function MatchCard({
  match,
  playerInTheMatch,
  playerInTheMatchWon,
  converter,
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
    <Card color={matchConclusionColors[1]} link fluid>
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
          {humanGameMode.toUpperCase()}
        </Card.Header>
        <Card.Meta>
          {moment(match.createdAt).fromNow()} | {humanDuration}min game
        </Card.Meta>
      </Card.Content>
      <Card.Content style={{ color: 'black' }}>
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column style={{ margin: 'auto', padding: '0 0.5rem' }}>
              <div style={{ margin: 'auto' }}>
                {match.rosters[0].participants.map((participant, index) => (
                  <Image
                    avatar
                    src={`/static/img/heroes/c/${participant.actor.toLowerCase()}.jpg`}
                    style={{
                      borderRadius: '25%',
                      width: '22px',
                      height: '22px',
                      margin: '1px',
                    }}
                    key={index}
                  />
                ))}
                <br />
                vs<br />
                {match.rosters[1].participants.map((participant, index) => (
                  <Image
                    avatar
                    src={`/static/img/heroes/c/${participant.actor.toLowerCase()}.jpg`}
                    style={{
                      borderRadius: '25%',
                      width: '22px',
                      height: '22px',
                      margin: '1px',
                    }}
                    key={index}
                  />
                ))}
              </div>
            </Grid.Column>
            <Grid.Column
              style={{
                textAlign: 'center',
                margin: 'auto',
                padding: '0 0.5rem',
              }}
            >
              <div style={{ margin: 'auto' }}>
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
    </Card>
  );
}

MatchCard.propTypes = propTypes;
