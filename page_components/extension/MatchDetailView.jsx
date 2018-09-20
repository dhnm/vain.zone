import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import {
  Segment,
  Label,
  Grid,
  Image,
  Button,
  Icon,
  Message
} from "semantic-ui-react";
import * as moment from "moment";

import VZIcon from "./../Icon";
import { ICONS } from "./../../functions/constants";
import ParticipantCard from "./ParticipantCard";

import skillTierCalculator from "./../../functions/skillTierCalculator";

const TeamStatPropTypes = {
  icon: PropTypes.string.isRequired,
  stat: PropTypes.string.isRequired
};

function TeamStat({ icon, stat }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0 2px",
        margin: "1px 1px 1px 1px",
        fontSize: "0.9rem"
      }}
    >
      <VZIcon icon={icon} color="white" size={11 * 0.9} />&zwj;{stat}
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
  browserView: PropTypes.bool.isRequired,
  toggleSendLoading: PropTypes.func.isRequired,
  generateImage: PropTypes.func.isRequired,
  sendLoading: PropTypes.bool.isRequired
};

export default function MatchDetailView({
  converter,
  match,
  TLData,
  appLoading,
  childRef,
  screenCategory,
  browserView,
  toggleSendLoading,
  generateImage,
  sendLoading,
  MatchesButton
}) {
  const maxParticipantValues = converter({
    rosters: match.rosters
  }).getMaxParticipantValues();
  const { playerInTheMatch, playerInTheMatchTeam } = converter({
    rosters: match.rosters
  }).identifyPlayerInTheMatch();

  const blueSkillTiers = match.rosters[0].participants.reduce(
    (accu, currVa) => {
      accu.push(TLData.singleMatchData[currVa.player.name].rankPoints);
      return accu;
    },
    []
  );
  const redSkillTiers = match.rosters[1].participants.reduce((accu, currVa) => {
    accu.push(TLData.singleMatchData[currVa.player.name].rankPoints);
    return accu;
  }, []);
  const highestBlueST = skillTierCalculator(Math.max(...blueSkillTiers));
  const lowestBlueST = skillTierCalculator(Math.min(...blueSkillTiers));
  const highestRedST = skillTierCalculator(Math.max(...redSkillTiers));
  const lowestRedST = skillTierCalculator(Math.min(...redSkillTiers));
  const processedAverageSkillTiers = [
    skillTierCalculator(
      blueSkillTiers.reduce((a, b) => a + b) / blueSkillTiers.length
    ),
    skillTierCalculator(
      redSkillTiers.reduce((a, b) => a + b) / redSkillTiers.length
    )
  ];

  const draftOrder = TLData.draftOrder.map((sides, i) => [
    ...new Set(
      sides
        .map(actor =>
          match.rosters[i].participants.find(p => p.actor === actor)
        )
        .filter(e => e)
    )
  ]);
  // console.log(draftOrder);
  // console.log(TLData.gameplayRoles);

  if (
    TLData.gameplayRoles.mode === "5v5" ||
    TLData.gameplayRoles.mode === "3v3"
  ) {
    for (let side in draftOrder) {
      draftOrder[side].sort((a, b) => {
        const aRole = TLData.gameplayRoles.roles[side][a.actor];
        const bRole = TLData.gameplayRoles.roles[side][b.actor];
        if (aRole === "4:captain" && bRole === "4:captain") {
          if (a.farm > b.farm) {
            return -1;
          } else if (a.farm < b.farm) {
            return 1;
          }
          return 0;
        }
        if (aRole === "4:captain") {
          return 1;
        }
        if (bRole === "4:captain") {
          return -1;
        }
        if (!aRole && !bRole) {
          if (a.jungleKills > b.jungleKills) {
            return 1;
          }
          if (a.jungleKills < b.jungleKills) {
            return -1;
          }
          return 0;
        }
        if (!aRole) {
          return 1;
        }
        if (!bRole) {
          return -1;
        }
        if (aRole < bRole) {
          return -1;
        }
        if (aRole > bRole) {
          return 1;
        }
        return 0;
      });
    }
  }

  const KDAs = draftOrder.map(sides =>
    sides.map(participant => {
      return (
        participant.kills /
          ((participant.deaths + 2) / (participant.kills + 1) + 1) +
        participant.assists /
          ((participant.deaths + 3) / (participant.assists + 1) + 1) *
          0.6
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
    <div
      style={{
        margin: "auto"
      }}
    >
      {(TLData.gameplayRoles.mode === "5v5" ||
        TLData.gameplayRoles.mode === "3v3") && (
        <Message color="blue" icon>
          <Icon name="warning circle" />
          <Message.Content>
            Advanced Role Detection (carry/jungle/support/etc.) is in alpha.
            Please report to us if you see something wrong.{" "}
            <a
              target="_blank"
              href="https://discord.gg/wDYKFaS"
              style={{ color: "HSLA(206, 66%, 57%, 1.00)" }}
            >
              We are on Discord.
            </a>
          </Message.Content>
        </Message>
      )}
      <div ref={childRef}>
        <Segment
          id="matchDetailView"
          style={{
            display: "block",
            paddingTop: "1.6rem",
            paddingLeft: "0.5em",
            paddingRight: "0.5em",
            marginBottom: 0
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
                padding: "5px",
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
                fontSize: "1.2rem",
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
                padding: "5px",
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
              <Grid.Row
                style={{ padding: "0.2rem 0 0 0", lineHeight: "0.93rem" }}
              >
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
                              marginBottom: "1px",
                              marginTop: "1px",
                              filter: "grayscale(40%)",
                              width: "24px",
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
                  {!browserView && (
                    <React.Fragment>
                      <br />
                      <Label style={{ padding: "2px 6px", fontSize: "0.8rem" }}>
                        Avg. rank{" "}
                        <Image
                          avatar
                          src={`/static/img/rank/c/${
                            processedAverageSkillTiers[0].number
                          }${processedAverageSkillTiers[0].color}.png`}
                        />
                        {Math.round(processedAverageSkillTiers[0].value)}
                      </Label>
                    </React.Fragment>
                  )}
                </Grid.Column>
                <Grid.Column textAlign="right">
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
                              marginBottom: "1px",
                              marginTop: "1px",
                              filter: "grayscale(40%)",
                              width: "24px",
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
                  {!browserView && (
                    <React.Fragment>
                      <br />
                      <Label style={{ padding: "2px 6px", fontSize: "0.8rem" }}>
                        Avg. rank{" "}
                        <Image
                          avatar
                          src={`/static/img/rank/c/${
                            processedAverageSkillTiers[1].number
                          }${processedAverageSkillTiers[1].color}.png`}
                        />
                        {Math.round(processedAverageSkillTiers[1].value)}
                      </Label>
                    </React.Fragment>
                  )}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row
                style={{
                  paddingTop: "0",
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
                          TLData.damagesData.rosters[sideIndex][
                            participant.actor
                          ]
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
                          TLData.singleMatchData[participant.player.name]
                            .guildTag
                        }
                        browserView={browserView}
                        roleDetectionOn={TLData.gameplayRoles.mode}
                        gameplayRole={
                          TLData.gameplayRoles.mode
                            ? TLData.gameplayRoles.roles[sideIndex][
                                participant.actor
                              ]
                            : undefined
                        }
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

      <Button
        onClick={() => {
          toggleSendLoading(true);
          generateImage("match", true);
        }}
        loading={sendLoading}
        disabled={sendLoading}
        attached="bottom"
        style={{
          display: browserView ? "none" : null
        }}
      >
        <Label color="blue">
          <Icon name="send" />Share in Chat
        </Label>
      </Button>

      {MatchesButton}
      <Segment
        style={{
          marginTop: "15px"
        }}
      >
        <Label attached="top">Match-Making Quality</Label>
        <div style={{ textAlign: "center" }}>Average Ranks</div>
        <Grid columns="equal">
          <Grid.Column>
            <div
              style={{
                fontSize: "0.85rem",
                lineHeight: "0.9rem",
                color: "hsla(0, 100%, 100%, 0.8",
                fontStyle: "italic",
                justifyContent: "flex-end",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                textAlign: "right"
              }}
            >
              {processedAverageSkillTiers[0].name} ({
                processedAverageSkillTiers[0].number
              }
              {processedAverageSkillTiers[0].shortColor}){" "}
              <Image
                style={{ width: "40px", display: "inline-block" }}
                src={`/static/img/rank/c/${
                  processedAverageSkillTiers[0].number
                }${processedAverageSkillTiers[0].color}.png`}
              />
            </div>
          </Grid.Column>
          <Grid.Column>
            <div
              style={{
                fontSize: "0.85rem",
                lineHeight: "0.9rem",
                color: "hsla(0, 100%, 100%, 0.8",
                fontStyle: "italic",
                textAlign: "left",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Image
                style={{ width: "40px", display: "inline-block" }}
                src={`/static/img/rank/c/${
                  processedAverageSkillTiers[1].number
                }${processedAverageSkillTiers[1].color}.png`}
              />{" "}
              {processedAverageSkillTiers[1].name} ({
                processedAverageSkillTiers[1].number
              }
              {processedAverageSkillTiers[1].shortColor})
            </div>
          </Grid.Column>
        </Grid>
        <div style={{ textAlign: "center" }}>Highest Ranks</div>
        <Grid columns="equal">
          <Grid.Column>
            <div
              style={{
                fontSize: "0.85rem",
                lineHeight: "0.9rem",
                color: "hsla(0, 100%, 100%, 0.8",
                fontStyle: "italic",
                justifyContent: "flex-end",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                textAlign: "right"
              }}
            >
              {highestBlueST.name} ({highestBlueST.number}
              {highestBlueST.shortColor}){" "}
              <Image
                style={{ width: "40px", display: "inline-block" }}
                src={`/static/img/rank/c/${highestBlueST.number}${
                  highestBlueST.color
                }.png`}
              />
            </div>
          </Grid.Column>
          <Grid.Column>
            <div
              style={{
                fontSize: "0.85rem",
                lineHeight: "0.9rem",
                color: "hsla(0, 100%, 100%, 0.8",
                fontStyle: "italic",
                textAlign: "left",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Image
                style={{ width: "40px", display: "inline-block" }}
                src={`/static/img/rank/c/${highestRedST.number}${
                  highestRedST.color
                }.png`}
              />{" "}
              {highestRedST.name} ({highestRedST.number}
              {highestRedST.shortColor})
            </div>
          </Grid.Column>
        </Grid>
        <div style={{ textAlign: "center" }}>Lowest Ranks</div>
        <Grid columns="equal">
          <Grid.Column>
            <div
              style={{
                fontSize: "0.85rem",
                lineHeight: "0.9rem",
                color: "hsla(0, 100%, 100%, 0.8",
                fontStyle: "italic",
                justifyContent: "flex-end",
                display: "flex",
                alignItems: "center",
                textAlign: "right"
              }}
            >
              {lowestBlueST.name} ({lowestBlueST.number}
              {lowestBlueST.shortColor}){" "}
              <Image
                style={{ width: "40px", display: "inline-block" }}
                src={`/static/img/rank/c/${lowestBlueST.number}${
                  lowestBlueST.color
                }.png`}
              />
            </div>
          </Grid.Column>
          <Grid.Column>
            <div
              style={{
                fontSize: "0.85rem",
                lineHeight: "0.9rem",
                color: "hsla(0, 100%, 100%, 0.8",
                fontStyle: "italic",
                textAlign: "left",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Image
                style={{ width: "40px", display: "inline-block" }}
                src={`/static/img/rank/c/${lowestRedST.number}${
                  lowestRedST.color
                }.png`}
              />&nbsp;
              {lowestRedST.name} ({lowestRedST.number}
              {lowestRedST.shortColor})
            </div>
          </Grid.Column>
        </Grid>
      </Segment>
      <Segment
        style={{
          marginTop: "15px",
          display: "none"
        }}
      >
        <Label attached="top">Andromeda Extremely Serious Awards</Label>
        <div>
          <p style={{ textAlign: "center", fontStyle: "italic" }}>
            'Stats you won't see on stream...'
          </p>
          <p style={{ textAlign: "center" }}>Announcement Soon</p>
        </div>
      </Segment>
      <Segment
        style={{
          marginTop: "17px"
        }}
      >
        More analysis coming soon.{" "}
        <a target="_blank" href="https://discord.gg/wDYKFaS">
          Send us your suggestions
        </a>!
      </Segment>
    </div>
  );
}

MatchDetailView.propTypes = propTypes;
