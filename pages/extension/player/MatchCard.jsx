import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  Image,
  Grid,
  Label,
  Menu,
  Dimmer,
  Loader
} from "semantic-ui-react";
import * as moment from "moment";

import VZIcon from "./../../../components/Icon";
import { ICONS } from "./../../../modules/functions/constants";

const propTypes = {
  match: PropTypes.object.isRequired,
  playerInTheMatch: PropTypes.object.isRequired,
  playerInTheMatchWon: PropTypes.bool.isRequired,
  playerInTheMatchTeam: PropTypes.number.isRequired,
  converter: PropTypes.func.isRequired,
  setSelectedMatch: PropTypes.func.isRequired,
  matchIndex: PropTypes.number.isRequired,
  matchCardsLoading: PropTypes.bool.isRequired,
  selectedMatchID: PropTypes.string.isRequired
};

export default function MatchCard({
  match,
  playerInTheMatch,
  playerInTheMatchWon,
  playerInTheMatchTeam,
  converter,
  setSelectedMatch,
  matchIndex,
  matchCardsLoading,
  selectedMatchID
}) {
  const { shortMatchConclusion, matchConclusionColors } = converter({
    shortMatchConclusion: playerInTheMatchWon
  }).shortMatchConclusion();
  const humanGameMode = converter({
    gameMode: match.gameMode
  }).humanGameMode();
  const humanDuration = converter({
    duration: match.duration
  }).humanDuration();
  const items = playerInTheMatch.items.slice();
  items.splice(0, 2);

  for (let i = 0; i < 6; i += 1) {
    if (!items[i]) {
      items.push("empty");
    }
  }

  const KDAs = match.rosters.map(roster =>
    roster.participants.map(participant => {
      let KDAScore =
        (participant.kills + participant.assists * 0.6) /
        ((participant.deaths + 1) / participant.kills + 1);
      if (participant.kills === 0) {
        KDAScore = participant.assists * 0.75 / (participant.deaths + 1);
      }
      return {
        name: participant.player.name,
        KDAScore
      };
    })
  );
  const highestKDA = KDAs.reduce(
    (accu, currVa) =>
      Math.max(
        accu,
        currVa.reduce((accu2, currVa2) => Math.max(accu2, currVa2.KDAScore), 0)
      ),
    0
  );
  return (
    <Menu.Item
      // style={{ padding: '10px', paddingBottom: '5px' }}
      onClick={e => {
        e.preventDefault();
        setSelectedMatch(matchIndex);
      }}
      as={Card}
      color={matchConclusionColors[1]}
      link
      fluid
      style={{
        background:
          match.matchID === selectedMatchID
            ? "hsla(0, 0%, 10%, 0.6)"
            : "hsla(0, 0%, 10%, 1)",
        backgroundSize: "cover",
        backgroundPositionY: "40%",
        color: "hsla(0, 0%, 90%, 1)"
      }}
    >
      <Dimmer active={matchCardsLoading} inverted>
        <Loader />
      </Dimmer>
      <Card.Content style={{ padding: "4px" }}>
        <Image
          size="tiny"
          src={`/static/img/heroes/c/${playerInTheMatch.actor.toLowerCase()}.jpg`}
          style={{
            borderRadius: "25%",
            marginBottom: 0,
            border: "1px solid hsla(0, 0%, 100%, 0.25"
          }}
          floated="right"
        />
        <Card.Meta
          style={{
            marginBottom: "12px",
            textAlign: "left",
            lineHeight: "18px"
          }}
        >
          <Label
            color={matchConclusionColors[1]}
            style={{
              verticalAlign: "middle",
              padding: "2px 4px",
              fontSize: "0.8rem"
            }}
            horizontal
          >
            {shortMatchConclusion.toUpperCase()}
          </Label>
          <Label
            style={{
              verticalAlign: "middle",
              padding: "2px 4px",
              fontWeight: "normal",
              fontSize: "0.8rem"
            }}
          >
            {humanDuration}min
          </Label>
          <Label
            style={{
              verticalAlign: "middle",
              padding: "2px 4px",
              fontWeight: "normal",
              fontSize: "0.8rem"
            }}
          >
            {moment(match.createdAt).fromNow()}
          </Label>
        </Card.Meta>
        <Card.Header style={{ textAlign: "left" }}>
          <span
            style={{
              fontStyle: "italic",
              fontSize: "1.25rem"
              // color: matchConclusionColors[1],
            }}
          >
            {humanGameMode.toUpperCase()}
          </span>
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: "normal",
              marginTop: "2px",
              lineHeight: "1.15rem"
            }}
          >
            {playerInTheMatch.kills} / {playerInTheMatch.deaths} /{" "}
            {playerInTheMatch.assists}
            <br />
            <VZIcon icon={ICONS.coin} color="white" size={10} />&zwj;{(
              playerInTheMatch.gold / 1000
            ).toFixed(1)}k
            <span style={{ display: "inline-block", width: "10px" }} />
            <VZIcon
              icon={ICONS.creepscore}
              color="white"
              size={10}
            />&zwj;{playerInTheMatch.farm.toFixed(0)}
            <span style={{ display: "inline-block", width: "10px" }} />
            {KDAs[playerInTheMatchTeam].find(
              e => e.name === playerInTheMatch.player.name
            ).KDAScore === highestKDA && (
              <Label color="teal" style={{ padding: "4px 6px" }}>
                MVP
              </Label>
            )}
          </div>
        </Card.Header>
      </Card.Content>
      <Card.Content style={{ padding: "11px" }}>
        <Grid columns="equal">
          <Grid.Row style={{ paddingBottom: "5px", paddingTop: "6px" }}>
            <Grid.Column
              style={{ margin: "auto", padding: "0 0.5rem" }}
              width={11}
            >
              <div
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  width: "50%",
                  overflow: "hidden"
                }}
              >
                {match.rosters[0].participants.map((participant, index) => {
                  let afkFilter = "";
                  let afkTextDecoration = "";
                  if (participant.wentAfk) {
                    afkFilter = "grayscale(100%)";
                    afkTextDecoration = "line-through";
                  }

                  return (
                    <div
                      style={{
                        display: "block",
                        float: "left"
                      }}
                      key={index}
                    >
                      <Image
                        avatar
                        src={`/static/img/heroes/c/${participant.actor.toLowerCase()}.jpg`}
                        style={{
                          borderRadius: "25%",
                          border: "1px solid hsla(0, 0%, 100%, 0.25)",
                          width: "22px",
                          height: "22px",
                          margin: "1px",
                          float: "left",
                          filter: afkFilter
                        }}
                        key={index}
                      />{" "}
                      <div
                        style={{
                          display: "block",
                          overflow: "hidden",
                          lineHeight: "24px",
                          fontSize: "0.85em",
                          whiteSpace: "nowrap",
                          textDecoration: afkTextDecoration
                        }}
                      >
                        {(() => {
                          if (
                            participant.player.name !==
                            playerInTheMatch.player.name
                          ) {
                            return (
                              <React.Fragment>
                                {participant.player.name}
                              </React.Fragment>
                            );
                          }
                          return <strong>{participant.player.name}</strong>;
                        })()}
                        {/*<div
                                                  style={{
                                                    position: "absolute",
                                                    top: `${index * 24}px`,
                                                    left: 0,
                                                    display: "block",
                                                    width: "50%",
                                                    height: "24px",
                                                    background:
                                                      "linear-gradient(to right, transparent 80%, hsla(0, 0%, 0%, 0.2))"
                                                  }}
                                                />*/}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  display: "inline-block",
                  width: "50%",
                  verticalAlign: "middle"
                }}
              >
                {match.rosters[1].participants.map((participant, index) => {
                  let afkFilter = "";
                  let afkTextDecoration = "";
                  if (participant.wentAfk) {
                    afkFilter = "grayscale(100%)";
                    afkTextDecoration = "line-through";
                  }

                  return (
                    <div
                      style={{
                        display: "block",
                        float: "right",
                        width: "100%"
                      }}
                    >
                      <Image
                        avatar
                        src={`/static/img/heroes/c/${participant.actor.toLowerCase()}.jpg`}
                        style={{
                          borderRadius: "25%",
                          border: "1px solid hsla(0, 0%, 100%, 0.25)",
                          width: "22px",
                          height: "22px",
                          margin: "1px",
                          float: "right",
                          filter: afkFilter
                        }}
                        key={index}
                      />
                      <div
                        style={{
                          display: "block",
                          overflow: "hidden",
                          lineHeight: "24px",
                          fontSize: "0.85em",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                          textDecoration: afkTextDecoration
                        }}
                      >
                        {(() => {
                          if (
                            participant.player.name !==
                            playerInTheMatch.player.name
                          ) {
                            return (
                              <React.Fragment>
                                {participant.player.name}
                              </React.Fragment>
                            );
                          }
                          return <strong>{participant.player.name}</strong>;
                        })()}{" "}
                        <div
                          style={{
                            position: "absolute",
                            top: `${index * 24}px`,
                            left: "50%",
                            display: "block",
                            width: "calc(50% - 24px - 6px)",
                            height: "24px",
                            background:
                              "linear-gradient(to right, transparent 80%, hsla(0, 0%, 0%, 0.2))"
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
                textAlign: "center",
                margin: "auto",
                padding: "0 0.2rem",
                paddingBottom: "3px"
              }}
            >
              <div style={{ margin: "auto" }}>
                <div
                  style={{
                    marginTop: "3px",
                    textAlign: "right",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {items.map((item, index) => (
                    <React.Fragment>
                      <Image
                        avatar
                        src={`/static/img/items/c/${item
                          .replace(/ /g, "-")
                          .toLowerCase()}.png`}
                        style={{
                          width: "35px",
                          height: "35px",
                          margin: 0,
                          margin: "1px 1px 0 1px"
                        }}
                        key={index}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Card.Content>
    </Menu.Item>
  );
}

MatchCard.propTypes = propTypes;
