import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { Segment, Label, Grid, Image } from "semantic-ui-react";
import * as moment from "moment";

import VZIcon from "./../../../components/Icon";
import { ICONS } from "./../../../modules/functions/constants";
import ParticipantCard from "./ParticipantCard";

import skillTierCalculator from "../../../modules/functions/skillTierCalculator";

const TeamStatPropTypes = {
  icon: PropTypes.string.isRequired,
  stat: PropTypes.string.isRequired
};

function TeamStat({ icon, stat }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0 3px",
        margin: "1px 1px 1px 1px",
        fontSize: "1.05rem"
      }}
    >
      <VZIcon icon={icon} color="white" size={11 * 1.05} />&zwj;{stat}
    </span>
  );
}

TeamStat.propTypes = TeamStatPropTypes;

const propTypes = {
  converter: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  TLData: PropTypes.object.isRequired,
  appLoading: PropTypes.bool.isRequired,
  childRef: PropTypes.func.isRequired,
  screenCategory: PropTypes.string.isRequired,
  browserView: PropTypes.bool.isRequired
};

export default function MatchDetailView({
  converter,
  match,
  TLData,
  appLoading,
  childRef,
  screenCategory,
  browserView
}) {
  console.log(match);
  const maxParticipantValues = converter({
    rosters: match.rosters
  }).getMaxParticipantValues();
  const { playerInTheMatch, playerInTheMatchTeam } = converter({
    rosters: match.rosters
  }).identifyPlayerInTheMatch();
  const processedAverageSkillTiers = match.rosters.map((_, i) =>
    skillTierCalculator(
      match.rosters[i].participants.reduce(
        (accu, currVa) =>
          accu + TLData.singleMatchData[currVa.player.name].rankPoints,
        0
      ) / match.rosters[i].participants.length
    )
  );
  const draftOrder = TLData.draftOrder.map((sides, i) => [
    ...new Set(
      sides
        .map(actor =>
          match.rosters[i].participants.find(p => p.actor === actor)
        )
        .filter(e => e)
    )
  ]);
  const KDAs = draftOrder.map(sides =>
    sides.map(participant => {
      if (participant.kills === 0) {
        return participant.assists * 0.75 / (participant.deaths + 1);
      }
      return (
        (participant.kills + participant.assists * 0.6) /
        ((participant.deaths + 1) / participant.kills + 1)
      );
    })
  );
  const highestKDA = KDAs.reduce(
    (accu, currVa) =>
      Math.max(
        accu,
        currVa.reduce((accu2, currVa2) => Math.max(accu2, currVa2), 0)
      ),
    0
  );
  return (
    <div ref={childRef}>
      <Segment
        id="matchDetailView"
        style={{
          display: "block",
          paddingTop: "1.6rem",
          paddingLeft: "0.5em",
          paddingRight: "0.5em"
        }}
        attached={browserView ? false : "top"}
      >
        <Label attached="top">
          <div
            style={{
              marginBottom: "2px",
              padding: 0,
              textAlign: "center"
            }}
          >
            {converter({ gameMode: match.gameMode })
              .humanGameMode()
              .toUpperCase()}
          </div>
          {`${converter({
            duration: match.duration
          }).humanDuration()}min`}
          <span style={{ float: "right" }}>
            {moment(match.createdAt).fromNow()}
          </span>
        </Label>
        <Segment basic style={{ padding: 0, textAlign: "center" }}>
          <Label
            color={
              playerInTheMatchTeam === 0
                ? converter({
                    rosterWon: match.rosters[0].won,
                    endGameReason: match.endGameReason
                  }).longMatchConclusion().matchConclusionColors[1]
                : null
            }
            style={{
              width: "90px",
              textAlign: "center",
              float: "left",
              color:
                playerInTheMatchTeam === 0
                  ? null
                  : converter({
                      rosterWon: match.rosters[0].won,
                      endGameReason: match.endGameReason
                    }).longMatchConclusion().matchConclusionColors[0]
            }}
          >
            {
              converter({
                rosterWon: match.rosters[0].won,
                endGameReason: match.endGameReason
              }).longMatchConclusion().longMatchConclusion
            }
          </Label>
          <div
            style={{
              display: "inline-block",
              margin: "auto",
              fontSize: "1.4rem",
              fontWeight: "bold",
              marginTop: "3px",
              width: "75px",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)"
            }}
          >
            {match.rosters[0].heroKills}{" "}
            <VZIcon icon={ICONS.swords} color="white" size={1.4 * 11} />{" "}
            {match.rosters[1].heroKills}
          </div>
          <Label
            color={
              playerInTheMatchTeam === 1
                ? converter({
                    rosterWon: match.rosters[1].won,
                    endGameReason: match.endGameReason
                  }).longMatchConclusion().matchConclusionColors[1]
                : null
            }
            style={{
              float: "right",
              width: "90px",
              textAlign: "center",
              color:
                playerInTheMatchTeam === 1
                  ? null
                  : converter({
                      rosterWon: match.rosters[1].won,
                      endGameReason: match.endGameReason
                    }).longMatchConclusion().matchConclusionColors[0]
            }}
          >
            {
              converter({
                rosterWon: match.rosters[1].won,
                endGameReason: match.endGameReason
              }).longMatchConclusion().longMatchConclusion
            }
          </Label>
          <Grid columns={2} style={{ clear: "both" }}>
            <Grid.Row style={{ padding: "0.4rem 0 0 0" }}>
              <Grid.Column textAlign="left">
                <TeamStat
                  icon={ICONS.coin}
                  stat={`${(match.rosters[0].gold / 1000).toFixed(1)}k`}
                />
                <TeamStat
                  icon={ICONS.spades}
                  stat={match.rosters[0].acesEarned}
                />
                <TeamStat
                  icon={ICONS.turret}
                  stat={match.rosters[0].turretKills}
                />
                {[
                  "ranked",
                  "private_party_draft_match",
                  "casual",
                  "private"
                ].indexOf(match.gameMode) > -1 && (
                  <TeamStat
                    icon={ICONS.kraken}
                    stat={match.rosters[0].krakenCaptures}
                  />
                )}
                {match.gameMode.indexOf("5v5") > -1 && (
                  <React.Fragment>
                    <br />
                    <TeamStat
                      icon={ICONS.blackclaw}
                      stat={TLData.creatures5v5[0].blackclaw}
                    />
                    <TeamStat
                      icon={ICONS.ghostwing}
                      stat={TLData.creatures5v5[0].ghostwing}
                    />
                  </React.Fragment>
                )}
                {TLData.banData.rosters[0].length ? (
                  <React.Fragment>
                    <br />
                    <TeamStat icon={ICONS.ban} />
                    {TLData.banData.rosters[0].map((b, i) => (
                      <React.Fragment key={`0${b}${i}`}>
                        {<React.Fragment>&nbsp;</React.Fragment>}
                        <Image
                          size="mini"
                          style={{
                            display: "inline-block",
                            borderRadius: "50%",
                            marginBottom: "4px",
                            marginTop: "1px",
                            filter: "grayscale(40%)",
                            width: "32px",
                            border: "1px solid hsla(0, 0%, 100%, 0.25)"
                          }}
                          src={`/static/img/heroes/c/${b.toLowerCase()}.jpg`}
                        />
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ) : (
                  false
                )}
                <br />
                <Label style={{ padding: "2px 6px" }}>
                  Avg. rank{" "}
                  <Image
                    avatar
                    src={`/static/img/rank/c/${
                      processedAverageSkillTiers[0].number
                    }${processedAverageSkillTiers[0].color}.png`}
                  />
                  {Math.round(processedAverageSkillTiers[0].value)}
                </Label>
              </Grid.Column>
              <Grid.Column textAlign="right" style={{}}>
                <TeamStat
                  icon={ICONS.coin}
                  stat={`${(match.rosters[1].gold / 1000).toFixed(1)}k`}
                />
                <TeamStat
                  icon={ICONS.spades}
                  stat={match.rosters[1].acesEarned}
                />
                <TeamStat
                  icon={ICONS.turret}
                  stat={match.rosters[1].turretKills}
                />
                {[
                  "ranked",
                  "private_party_draft_match",
                  "casual",
                  "private"
                ].indexOf(match.gameMode) > -1 && (
                  <TeamStat
                    icon={ICONS.kraken}
                    stat={match.rosters[1].krakenCaptures}
                  />
                )}
                {match.gameMode.indexOf("5v5") > -1 && (
                  <React.Fragment>
                    <br />
                    <TeamStat
                      icon={ICONS.blackclaw}
                      stat={TLData.creatures5v5[1].blackclaw}
                    />
                    <TeamStat
                      icon={ICONS.ghostwing}
                      stat={TLData.creatures5v5[1].ghostwing}
                    />
                  </React.Fragment>
                )}
                {TLData.banData.rosters[1].length ? (
                  <React.Fragment>
                    <br />
                    {TLData.banData.rosters[1].map((b, i) => (
                      <React.Fragment key={`1${b}${i}`}>
                        <Image
                          style={{
                            display: "inline-block",
                            borderRadius: "50%",
                            marginBottom: "4px",
                            marginTop: "1px",
                            filter: "grayscale(40%)",
                            width: "32px",
                            border: "1px solid hsla(0, 0%, 100%, 0.25)"
                          }}
                          src={`/static/img/heroes/c/${b.toLowerCase()}.jpg`}
                        />{" "}
                      </React.Fragment>
                    ))}
                    <TeamStat icon={ICONS.ban} />
                  </React.Fragment>
                ) : (
                  false
                )}
                <br />
                <Label style={{ padding: "2px 6px" }}>
                  Avg. rank{" "}
                  <Image
                    avatar
                    src={`/static/img/rank/c/${
                      processedAverageSkillTiers[1].number
                    }${processedAverageSkillTiers[1].color}.png`}
                  />
                  {Math.round(processedAverageSkillTiers[1].value)}
                </Label>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row
              style={{
                paddingTop: "0.1rem",
                paddingBottom: "0"
              }}
            >
              {draftOrder.map((draftSide, sideIndex) => (
                <Grid.Column
                  textAlign={["left", "right"][sideIndex]}
                  style={{
                    [`padding${["Right", "Left"][sideIndex]}`]: "0.1em"
                  }}
                  key={sideIndex}
                >
                  {draftSide.map((participant, index) => (
                    <ParticipantCard
                      playerInTheMatch={playerInTheMatch}
                      matchDuration={match.duration}
                      participant={participant}
                      gameMode={match.gameMode}
                      maxParticipantValues={maxParticipantValues}
                      side={["left", "right"][sideIndex]}
                      key={`${sideIndex}${index}${participant.player.id}`}
                      appLoading={appLoading}
                      damage={
                        TLData.damagesData.rosters[sideIndex][participant.actor]
                      }
                      towersDamage={
                        TLData.towersDamagesData.rosters[sideIndex][
                          participant.actor
                        ]
                      }
                      highestDamage={TLData.damagesData.highest}
                      highestTowersDamage={TLData.towersDamagesData.highest}
                      processedSkillTier={skillTierCalculator(
                        TLData.singleMatchData[participant.player.name]
                          .rankPoints
                      )}
                      KDA={KDAs[sideIndex][index]}
                      highestKDA={highestKDA}
                      guildTag={
                        TLData.singleMatchData[participant.player.name].guildTag
                      }
                      browserView={browserView}
                    />
                  ))}
                </Grid.Column>
              ))}
            </Grid.Row>
            <Grid.Row style={{ padding: "0 0.4em 0.1rem 0.4em" }}>
              <Grid.Column width={16}>
                {match.spectators.map(spectator => (
                  <Link
                    prefetch
                    href={`/extension/player?${
                      browserView ? "browserView=true&" : ""
                    }error=false&extension=false&IGN=${spectator.name}`}
                    as={`${browserView ? "" : "/extension"}/player/${
                      spectator.name
                    }`}
                  >
                    <Label
                      as="a"
                      style={{ margin: "0.2rem 0" }}
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
    </div>
  );
}

MatchDetailView.propTypes = propTypes;
