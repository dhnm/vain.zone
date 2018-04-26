import React from 'react';
import PropTypes from 'prop-types';
import { Dimmer, Loader, Image, Grid, Progress, Card } from 'semantic-ui-react';
import Link from 'next/link';

const propTypes = {
  matchDuration: PropTypes.number.isRequired,
  participant: PropTypes.object.isRequired,
  side: PropTypes.string.isRequired,
  maxParticipantValues: PropTypes.object.isRequired,
  telemetryLoading: PropTypes.bool.isRequired,
  highestDamage: PropTypes.number.isRequired,
  damage: PropTypes.number.isRequired,
  playerInTheMatch: PropTypes.object.isRequired,
  gameMode: PropTypes.string.isRequired,
};

export default function ParticipantCard({
  matchDuration,
  participant,
  side,
  maxParticipantValues,
  telemetryLoading,
  highestDamage,
  damage,
  playerInTheMatch,
  gameMode,
}) {
  const items = participant.items.slice();
  if (gameMode.indexOf('5v5') !== -1) {
    items.splice(0, 2);
  }
  for (let i = 0; i < 6; i += 1) {
    if (!items[i]) {
      items.push('empty');
    }
  }
  let kdaPerTenMinutes =
    (participant.kills + participant.assists) /
    participant.deaths /
    (matchDuration / 600);
  if (participant.deaths === 0) {
    kdaPerTenMinutes =
      (participant.kills + participant.assists) / (matchDuration / 600);
  }
  let cardBg = 'white';
  if (participant.player.id === playerInTheMatch.player.id) {
    cardBg = '#f6f6f6';
  }
  return (
    <Link
      prefetch
      href={`/extension/player?error=false&extension=false&IGN=${
        participant.player.name
      }`}
      as={`/extension/player/${participant.player.name}`}
    >
      <Card
        link
        fluid
        style={{
          margin: '3px 1px 3px 0',
          color: 'black',
          backgroundColor: cardBg,
        }}
      >
        <Dimmer active={telemetryLoading} inverted>
          <Loader />
        </Dimmer>
        <Card.Content style={{ padding: '4px' }}>
          <Image
            size="mini"
            src={`/static/img/heroes/c/${participant.actor.toLowerCase()}.jpg`}
            style={{ borderRadius: '25%', margin: '0 2px' }}
            floated={side}
          />
          <strong
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '1.1rem',
              display: 'block',
            }}
          >
            {participant.player.name}
          </strong>
          <div style={{ fontSize: '0.9rem' }}>
            {participant.kills}/{participant.deaths}/{participant.assists}{' '}
            <span
              style={{
                float: { right: 'left', left: 'right' }[side],
              }}
            >
              {`(${kdaPerTenMinutes.toFixed(1)})`}
            </span>
          </div>
          <Grid style={{ margin: 0, marginBottom: '2px' }} columns={6}>
            <Grid.Row style={{ padding: 0 }}>
              {items.map((item, index) => (
                <Grid.Column
                  key={index}
                  style={{
                    padding: 0,
                    textAlign: 'center',
                  }}
                >
                  <Image
                    fluid
                    src={`/static/img/items/c/${item
                      .replace(/ /g, '-')
                      .toLowerCase()}.png`}
                    style={{
                      maxWidth: '3.5rem',
                      margin: '0',
                    }}
                  />
                </Grid.Column>
              ))}
            </Grid.Row>
          </Grid>
          <div
            style={{
              marginTop: '1px',
              marginBottom: '-4px',
            }}
          >
            <Progress
              value={participant.gold}
              total={maxParticipantValues.maxGold}
              size="small"
              color="yellow"
            />
            <div className="progressLabelWrapper">
              <span className="progressLabel">Gold/min</span>{' '}
              <span className="progressLabelValue">
                {(participant.gold / (matchDuration / 60)).toFixed(0)}
              </span>
            </div>
            <Progress
              value={participant.farm}
              total={maxParticipantValues.maxFarm}
              size="small"
              color="teal"
            />
            <div className="progressLabelWrapper">
              <span className="progressLabel">CS/min</span>{' '}
              <span className="progressLabelValue">
                {(participant.farm / (matchDuration / 60)).toFixed(2)}
              </span>
            </div>
            <Progress
              value={damage}
              total={highestDamage}
              size="small"
              color="orange"
            />
            <div className="progressLabelWrapper">
              <span className="progressLabel">Dmg/min</span>{' '}
              <span className="progressLabelValue">
                {(damage / (matchDuration / 60)).toFixed(0)}
              </span>
            </div>
          </div>
        </Card.Content>
        <style jsx global>
          {`
            .progress {
              margin: 0 0 2px 0 !important;
              position: relative;
              z-index: 0;
            }
          `}
        </style>
        <style jsx>
          {`
            .progressLabelWrapper {
              font-size: 0.75rem;
              font-weight: bold;
              position: absolute;
              width: 100%;
              margin-top: -17px;
              z-index: 1;
              clear: both;
            }

            .progressLabel {
              display: inline-block;
              vertical-align: top;
              margin-left: 1px;
              float: left;
            }

            .progressLabelValue {
              display: inline-block;
              vertical-align: top;
              float: right;
              margin-right: 10px;
            }
          `}
        </style>
      </Card>
    </Link>
  );
}

ParticipantCard.propTypes = propTypes;
