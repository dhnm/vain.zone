import React from "react";
import PropTypes from "prop-types";
import {
  Dimmer,
  Loader,
  Image,
  Grid,
  Progress,
  Card,
  Label
} from "semantic-ui-react";
import Link from "next/link";

import VZIcon from "./../Icon";
import { ICONS } from "./../../functions/constants";

const propTypes = {
  matchDuration: PropTypes.number.isRequired,
  participant: PropTypes.object.isRequired,
  side: PropTypes.string.isRequired,
  //participantValues: PropTypes.object.isRequired,
  appLoading: PropTypes.bool.isRequired,
  highestDamage: PropTypes.number.isRequired,
  highestTowersDamage: PropTypes.number.isRequired,
  damage: PropTypes.number.isRequired,
  towersDamage: PropTypes.number.isRequired,
  playerInTheMatch: PropTypes.object.isRequired,
  gameMode: PropTypes.string.isRequired,
  processedSkillTier: PropTypes.object.isRequired,
  KDA: PropTypes.number.isRequired,
  highestKDA: PropTypes.number.isRequired,
  guildTag: PropTypes.string.isRequired,
  browserView: PropTypes.bool.isRequired,
  roleDetectionOn: PropTypes.bool.isRequired,
  gameplayRole: PropTypes.string
};

export default function ParticipantCard({
  matchDuration,
  participant,
  side,
  //participantValues,
  appLoading,
  highestDamage,
  highestTowersDamage,
  damage,
  towersDamage,
  playerInTheMatch,
  gameMode,
  processedSkillTier,
  KDA,
  highestKDA,
  guildTag,
  browserView,
  gloryGuide,
  roleDetectionOn,
  gameplayRole
}) {
  const items = participant.items.slice();
  items.splice(0, 2);
  for (let i = 0; i < 6; i += 1) {
    if (!items[i]) {
      items.push("empty");
    }
  }

  let cardBg = `linear-gradient(${
    { left: "135deg", right: "225deg" }[side]
  }, hsla(0, 0%, 83%, 0.2), hsla(0, 0%, 83%, 0.05), hsla(0, 0%, 83%, 0.1))`;
  if (participant.player.playerID === playerInTheMatch.player.playerID) {
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

  const uiFontColor = gloryGuide === "light" ? "black" : "white";

  return <Card style={{ color: "initial", margin: "2px 1px 2px 0", background: cardBg, boxShadow: "none" } // fluid
      }>
      <Dimmer active={appLoading} inverted={gloryGuide === "light"}>
        <Loader />
      </Dimmer>
      <Card.Content style={{ padding: "1px 3px 3px 2px", color: "hsla(0, 0%, 100%, 1)" }}>
        {(roleDetectionOn === "5v5" || roleDetectionOn === "3v3") && <svg style={{ display: "inline-block", padding: "2px 0", float: side }} width="29px" height="29px" viewBox="0 0 1024 1024">
            <path style={{ fill: gloryGuide === "light" ? "hsl(0, 15%, 13%)" : "hsl(178, 2%, 89%)" }} d={gameplayRole ? ICONS[gameplayRole.split(":")[1]] : ICONS.carry} />
          </svg>}
        {roleDetectionOn === "brawl" && <React.Fragment>
            <Image src={gameplayRole && gameplayRole.rarity ? `/static/img/talents/c/${participant.actor}_${gameplayRole.rarity}.png` : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="} style={{ filter: afkFilter, margin: "0", marginRight: side === "left" ? "5px" : null, marginLeft: side === "right" ? "5px" : null, boxSizing: "border-box", height: "29px", zIndex: 100, borderRadius: "50%" }} floated={side} />
            <div style={{ position: "absolute", right: side === "right" ? "2px" : null, zIndex: 200, height: "29px", display: "flex", alignItems: "flex-end", fontSize: "0.7rem", lineHeight: "0.75rem", color: uiFontColor }}>
              {gameplayRole && gameplayRole.level}
            </div>
          </React.Fragment>}
        <Image src={`/static/img/heroes/c/${participant.actor.toLowerCase()}.jpg`} style={{ borderRadius: "25%", margin: roleDetectionOn ? `0 ${{ left: "1px", right: "-15px" }[side]} 0 ${{ left: "-15px", right: "1px" }[side]}` : "0 2px", filter: afkFilter, border: "1px solid hsla(0, 0%, 100%, 0.25)", boxSizing: "border-box", height: "29px" }} floated={side} />
        {/*<div
            style={{
              position: "absolute",
              [`${{ left: "right", right: "left" }[side]}`]: {
                left: "3px",
                right: "2px"
              }[side],
              top: "26px",
              fontSize: "0.8rem",
              zIndex: "1000",
              display: appLoading ? "none" : null,
              width: "25px",
              textAlign: "center"
            }}
          >
            {Math.floor(processedSkillTier.value)}
          </div>*/}
        <Image src={`/static/img/rank/c/${processedSkillTier.number}${processedSkillTier.color}.png`} style={{ margin: "0 -6px", padding: "-5px", height: "31px" }} floated={{ left: "right", right: "left" }[side]} />
        <Link prefetch href={`/extension/player?${browserView ? "browserView=true&" : ""}${gloryGuide ? `setting=gloryguide&ui=${gloryGuide}&` : ""}error=false&extension=false&playerID=${participant.player.playerID}`} as={`${browserView ? "" : "/extension"}/player/${participant.player.name}${gloryGuide ? `?setting=gloryguide&ui=${gloryGuide}` : ""}`}>
          <strong style={{ overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.95rem", display: "block", whiteSpace: "nowrap", textDecoration: afkTextDecoration, marginTop: "-1px", marginBottom: "-6px" }}>
            <a>{participant.player.name}</a>
          </strong>
        </Link>
        {KDA === highestKDA && <React.Fragment>
            <Label color="teal" style={{ fontSize: "0.72rem", color: "white", fontWeight: "normal", padding: "2px 2px", marginLeft: 0, marginRight: 0 }}>
              MVP
            </Label>
            &nbsp;
          </React.Fragment>}
        {guildTag ? <Label style={{ fontSize: "0.72rem", color: uiFontColor, fontWeight: "normal", padding: "2px 2px", marginLeft: "-1px", marginRight: "-1px" }}>
            {guildTag}
          </Label> : <React.Fragment>&nbsp;</React.Fragment>}
        <div style={{ fontSize: "0.8rem", display: "flex", justifyContent: "space-between", margin: "0 2px", marginTop: "0px", lineHeight: "0.85rem", color: uiFontColor }}>
          <span>
            <strong>
              {participant.kills}/{participant.deaths}/{participant.assists}
            </strong>
          </span>
          <span>
            <VZIcon icon={ICONS.coin} color={uiFontColor} size={8} />
            {(participant.gold / 1000).toFixed(1)}k
          </span>
          <span>
            <VZIcon icon={ICONS.creepscore} color={uiFontColor} size={8} />
            {participant.farm.toFixed(0)}
          </span>
        </div>
        <Grid style={{ margin: 0, marginBottom: "0px" }} columns={6}>
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
                    margin: "0",
                    padding: "0 1.5px",
                    opacity: item === "empty" ? "0.1" : "1"
                  }}
                />
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>
        <div style={{ marginTop: "2px", marginBottom: "-2px" }}>
          {/* <Progress
              value={participant.gold}
              total={participantValues.maxGold}
              size="small"
              color="yellow"
              style={{minWidth: 0}}
            />
            <div className="progressLabelWrapper">
              <span className="progressLabel">Gold/min</span>{" "}
              <span className="progressLabelValue">
                {(participant.gold / (matchDuration / 60)).toFixed(0)}
              </span>
            </div>
            <Progress
              value={participant.farm}
              total={participantValues.maxFarm}
              size="small"
              color="teal"
              style={{minWidth: 0}}
            />
            <div className="progressLabelWrapper">
              <span className="progressLabel">CS/min</span>{" "}
              <span className="progressLabelValue">
                {(participant.farm / (matchDuration / 60)).toFixed(2)}
              </span>
            </div>*/}
          <Progress value={damage || 0} total={highestDamage || 0} size="small" color="red" style={{ height: "10px", overflow: "hidden" }} inverted={gloryGuide === "light"} />
          <div className="progressLabelWrapper">
            <span className="progressLabel">Dmg to Heroes</span> <span className="progressLabelValue">
              {damage ? damage.toFixed(0) : 0}
            </span>
          </div>
          <Progress value={towersDamage || 0} total={highestTowersDamage || 0} size="small" color="orange" style={{ height: "10px", overflow: "hidden" }} inverted={gloryGuide === "light"} />
          <div className="progressLabelWrapper">
            <span className="progressLabel">Dmg to Structures</span> <span className="progressLabelValue">
              {towersDamage ? towersDamage.toFixed(0) : 0}
            </span>
          </div>
        </div>
      </Card.Content>
      <style jsx global>
        {`
          .ui.progress {
            margin: 0 0 2px 0 !important;
            position: relative;
            z-index: 0;
          }
          .ui.progress .bar {
            min-width: 0;
          }`}
      </style>
      <style jsx>
        {`
          .progressLabelWrapper {
            font-size: 0.75rem;
            font-weight: 600;
            position: absolute;
            width: 100%;
            margin-top: -16px;
            z-index: 1;
            clear: both;
          }

          .progressLabel {
            display: inline-block;
            vertical-align: top;
            margin-left: 1px;
            float: left;
            ${gloryGuide === "light" ? "color: black;" : ""}
          }

          .progressLabelValue {
            display: inline-block;
            vertical-align: top;
            float: right;
            margin-right: 10px;
            ${gloryGuide === "light" ? "color: black;" : ""}
          }`}
      </style>
    </Card>;
}

ParticipantCard.propTypes = propTypes;
