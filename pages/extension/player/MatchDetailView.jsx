import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Segment, Label, Grid, Image } from 'semantic-ui-react';
import * as moment from 'moment';

import ParticipantCard from './ParticipantCard';

const propTypes = {
  converter: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  TLData: PropTypes.object.isRequired,
  telemetryLoading: PropTypes.bool.isRequired,
};

export default function MatchDetailView({
  converter,
  match,
  TLData,
  telemetryLoading,
}) {
  const maxParticipantValues = converter({
    rosters: match.rosters,
  }).getMaxParticipantValues();
  const { playerInTheMatch } = converter({
    rosters: match.rosters,
  }).identifyPlayerInTheMatch();
  return (
    <Segment
      id="matchDetailView"
      style={{
        paddingTop: '1.6rem',
        paddingLeft: '0.5em',
        paddingRight: '0.5em',
      }}
      attached="top"
    >
      <Label attached="top">
        <div
          style={{
            marginBottom: '2px',
            padding: 0,
            textAlign: 'center',
          }}
        >
          {converter({ gameMode: match.gameMode })
            .humanGameMode()
            .toUpperCase()}
        </div>
        {`${converter({
          duration: match.duration,
        }).humanDuration()}min`}
        <span style={{ float: 'right' }}>
          {moment(match.createdAt).fromNow()}
        </span>
      </Label>
      <Segment basic style={{ padding: 0, textAlign: 'center' }}>
        <Label
          color={
            converter({
              rosterWon: match.rosters[0].won,
              endGameReason: match.endGameReason,
            }).longMatchConclusion().matchConclusionColors[1]
          }
          style={{
            width: '90px',
            textAlign: 'center',
            float: 'left',
          }}
        >
          {
            converter({
              rosterWon: match.rosters[0].won,
              endGameReason: match.endGameReason,
            }).longMatchConclusion().longMatchConclusion
          }
        </Label>
        <div
          style={{
            display: 'inline-block',
            margin: 'auto',
            fontSize: '1.4rem',
            fontWeight: 'bold',
            marginTop: '3px',
            width: '75px',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {match.rosters[0].heroKills} ⚔️{match.rosters[1].heroKills}
        </div>
        <Label
          color={
            converter({
              rosterWon: match.rosters[1].won,
              endGameReason: match.endGameReason,
            }).longMatchConclusion().matchConclusionColors[1]
          }
          style={{
            float: 'right',
            width: '90px',
            textAlign: 'center',
          }}
        >
          {
            converter({
              rosterWon: match.rosters[1].won,
              endGameReason: match.endGameReason,
            }).longMatchConclusion().longMatchConclusion
          }
        </Label>
        <Grid columns={2} style={{ clear: 'both' }}>
          <Grid.Row style={{ padding: '0.4rem 0 0 0' }}>
            <Grid.Column textAlign="left">
              <span role="img" aria-label="Team Gold">
                💰
              </span>&zwj;{match.rosters[0].gold}{' '}
              <span role="img" aria-label="Total Aces">
                🃏
              </span>&zwj;{match.rosters[0].acesEarned}{' '}
              <span role="img" aria-label="Legendary Creature Captures">
                🐲
              </span>&zwj;{match.rosters[0].krakenCaptures}{' '}
              <span role="img" aria-label="Turrets Taken">
                🗼
              </span>&zwj;{match.rosters[0].turretKills}
              <br />
              {TLData.banData.rosters[0].map((b) => (
                <Label image style={{ margin: '0.2rem 0' }}>
                  <Image src={`/static/img/heroes/c/${b.toLowerCase()}.jpg`} />BAN
                </Label>
              ))}
            </Grid.Column>
            <Grid.Column textAlign="right" style={{}}>
              <span role="img" aria-label="Team Gold">
                💰
              </span>&zwj;{match.rosters[1].gold}{' '}
              <span role="img" aria-label="Total Aces">
                🃏
              </span>&zwj;{match.rosters[1].acesEarned}{' '}
              <span role="img" aria-label="Legendary Creature Captures">
                🐲
              </span>&zwj;{match.rosters[1].krakenCaptures}{' '}
              <span role="img" aria-label="Turrets Taken">
                🗼
              </span>&zwj;{match.rosters[1].turretKills}
              <br />
              {TLData.banData.rosters[1].map((b) => (
                <Label image style={{ margin: '0.2rem 0' }}>
                  <Image src={`/static/img/heroes/c/${b.toLowerCase()}.jpg`} />BAN
                </Label>
              ))}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row
            style={{
              paddingTop: '0.1rem',
              paddingBottom: '0',
            }}
          >
            <Grid.Column textAlign="left" style={{ paddingRight: '0.1em' }}>
              {match.rosters[0].participants.map((participant, index) => (
                <ParticipantCard
                  playerInTheMatch={playerInTheMatch}
                  matchDuration={match.duration}
                  participant={participant}
                  gameMode={match.gameMode}
                  maxParticipantValues={maxParticipantValues}
                  side="left"
                  key={index}
                  telemetryLoading={telemetryLoading}
                  damage={TLData.damageData.rosters[0][participant.actor]}
                  highestDamage={TLData.damageData.highest}
                />
              ))}
            </Grid.Column>
            <Grid.Column textAlign="right" style={{ paddingLeft: '0.1em' }}>
              {match.rosters[1].participants.map((participant, index) => (
                <ParticipantCard
                  playerInTheMatch={playerInTheMatch}
                  matchDuration={match.duration}
                  participant={participant}
                  gameMode={match.gameMode}
                  maxParticipantValues={maxParticipantValues}
                  side="right"
                  key={index}
                  telemetryLoading={telemetryLoading}
                  damage={TLData.damageData.rosters[1][participant.actor]}
                  highestDamage={TLData.damageData.highest}
                />
              ))}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ padding: '0 0.4em 0.1rem 0.4em' }}>
            <Grid.Column width={16}>
              {match.spectators.map((spectator) => (
                <Link
                  prefetch
                  href={`$/extension/player?error=false&extension=false&IGN=${
                    spectator.name
                  }`}
                  as={`/extension/player/${spectator.name}`}
                >
                  <Label
                    as="a"
                    style={{ margin: '0.2rem 0' }}
                    content={spectator.name}
                    detail="Spectator"
                  />
                </Link>
              ))}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Segment>
  );
}

MatchDetailView.propTypes = propTypes;
