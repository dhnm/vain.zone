import React from "react";
import PropTypes from "prop-types";
import { Dimmer, Loader, Image, Grid, Progress, Card } from "semantic-ui-react";
import Link from "next/link";

const propTypes = {
  matchDuration: PropTypes.number.isRequired,
  participant: PropTypes.object.isRequired,
  side: PropTypes.string.isRequired,
  maxParticipantValues: PropTypes.object.isRequired,
  appLoading: PropTypes.bool.isRequired,
  highestDamage: PropTypes.number.isRequired,
  damage: PropTypes.number.isRequired,
  playerInTheMatch: PropTypes.object.isRequired,
  gameMode: PropTypes.string.isRequired,
  processedSkillTier: PropTypes.object.isRequired
};

export default function ParticipantCard({
  matchDuration,
  participant,
  side,
  maxParticipantValues,
  appLoading,
  highestDamage,
  damage,
  playerInTheMatch,
  gameMode,
  processedSkillTier
}) {
  const items = participant.items.slice();
  items.splice(0, 2);
  for (let i = 0; i < 6; i += 1) {
    if (!items[i]) {
      items.push("empty");
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
  let cardBg = `linear-gradient(${
    { left: "135deg", right: "225deg" }[side]
  }, hsla(0, 0%, 83%, 0.2), hsla(0, 0%, 83%, 0.05), hsla(0, 0%, 83%, 0.1))`;
  if (participant.player.id === playerInTheMatch.player.id) {
    cardBg = `linear-gradient(${
      { left: "135deg", right: "225deg" }[side]
    }, hsla(0, 0%, 83%, 0.2), hsla(0, 0%, 83%, 0.26), hsla(0, 0%, 83%, 0.2))`;
  }

  let afkFilter = "";
  let afkTextDecoration = "";
  if (participant.wentAfk) {
    afkFilter = "grayscale(100%)";
    afkTextDecoration = "line-through";
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
        as="a"
        // fluid
        style={{
          color: "initial",
          margin: "3px 1px 3px 0",
          background: cardBg
        }}
      >
        <Dimmer active={appLoading}>
          <Loader />
        </Dimmer>
        <Card.Content style={{ padding: "4px", color: "hsla(0, 0%, 100%, 1)" }}>
          <Image
            size="mini"
            src={`/static/img/heroes/c/${participant.actor.toLowerCase()}.jpg`}
            style={{ borderRadius: "25%", margin: "0 2px", filter: afkFilter }}
            floated={side}
          />
          <Image
            size="mini"
            src={`/static/img/rank/c/${processedSkillTier.number}${
              processedSkillTier.color
            }.png`}
            style={{ margin: "0 -6px", padding: "-5px" }}
            floated={{ left: "right", right: "left" }[side]}
          />
          <strong
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "1.05rem",
              display: "block",
              whiteSpace: "nowrap",
              textDecoration: afkTextDecoration
            }}
          >
            {participant.player.name}
          </strong>
          <div style={{ fontSize: "0.88rem" }}>
            {participant.kills}/{participant.deaths}/{participant.assists}{" "}
            <em style={{ fontSize: "0.75rem" }}>
              {`(${kdaPerTenMinutes.toFixed(1)})`}
            </em>
            {/* <span
              style={{
                float: { right: 'left', left: 'right' }[side],
              }}
            >
              {`(${kdaPerTenMinutes.toFixed(1)})`}
            </span> */}
          </div>
          <Grid style={{ margin: 0, marginBottom: "2px" }} columns={6}>
            <Grid.Row style={{ padding: 0 }}>
              {items.map((item, index) => (
                <Grid.Column
                  key={index}
                  style={{
                    padding: 0,
                    textAlign: "center"
                  }}
                >
                  <Image
                    fluid
                    src={`/static/img/items/c/${item
                      .replace(/ /g, "-")
                      .toLowerCase()}.png`}
                    style={{
                      maxWidth: "3.5rem",
                      margin: "0"
                    }}
                  />
                </Grid.Column>
              ))}
            </Grid.Row>
          </Grid>
          <div
            style={{
              marginTop: "1px",
              marginBottom: "-4px"
            }}
          >
            <Progress
              value={participant.gold}
              total={maxParticipantValues.maxGold}
              size="small"
              color="yellow"
            />
            <div className="progressLabelWrapper">
              <span className="progressLabel">Gold/min</span>{" "}
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
              <span className="progressLabel">CS/min</span>{" "}
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
              <span className="progressLabel">DPS</span>{" "}
              <span className="progressLabelValue">
                {(damage / (matchDuration / 60) / 60).toFixed(2)}
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
