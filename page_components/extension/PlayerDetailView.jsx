import React from "react";
import PropTypes from "prop-types";
import { Segment, Image, Grid, Card, Label } from "semantic-ui-react";

import SkillTierPopup from "./SkillTierPopup";

const propTypes = {
  player: PropTypes.object.isRequired,
  childRef: PropTypes.func.isRequired,
  screenCategory: PropTypes.string.isRequired,
  browserView: PropTypes.bool.isRequired
};

export default function PlayerDetailView({
  player,
  childRef,
  screenCategory,
  browserView
}) {
  let experienceHours =
    (player.played_casual_5v5 * 25 +
      player.played_aral * 10 +
      player.played_blitz * 5 +
      player.played_casual * 18 +
      player.played_ranked * 20) /
    60;

  const [major, minor] = player.patchVersion.split(".");
  if (parseInt(major) > 3 || (parseInt(major) === 3 && parseInt(minor) > 2)) {
    experienceHours += (player.played_ranked_5v5 * 28) / 60;
  }

  const addictivenessRatingDict = {
    0: "",
    20: "There’s a new sheriff in town.",
    40: "Lacks match practice.",
    80: "This is quite fun.",
    120: "Promising star.",
    160: "I’m just getting started.",
    240: "Remember, eating gives you the strength to keep on playing.",
    320: "Better order another takeaway pizza.",
    400: "Mildly addicted.",
    480: "No-one can accuse me of lacking commitment.",
    560: "I am now a Vainglory expert.",
    640: "Congratulations from everyone at VAIN.ZONE. We didn't actually think you'd make it this far.",
    720: "I think I should include Vainglory in my CV.",
    880: "Time to change underwear.",
    1040: "Turning your underwear inside out saves on washing.",
    1200: "Just one more game I promise.",
    1360: "Real Vainglorious don't need food.",
    1520: "I can give up this game whenever I like. I just don't want to yet...",
    1780: "Sleeping is for sissies.",
    1940: "Remember to call for another sickday.",
    2100: "It's not really addictive - I just can’t stop playing.",
    2420: "Repetitive Hand Injury anyone?",
    2740: "This is my life and I do what I want with it.",
    3060: "Your friendships have now expired.",
    3380: "It's been a while since I had any human contact.",
    3700: "What are humans?",
    4340: "Let's waste another 6 months of my life.",
    4980: "Super Evil Overlord",
    8766: "More than a year worth of time spent in the game? Check ✔️",
    9406: "Vainglory Royalty"
  };
  // Don't neglect your loved ones for Vainglory.
  const addictivenessRatingDictKeys = Object.keys(addictivenessRatingDict)
    .map(e => parseInt(e, 10))
    .sort((a, b) => a - b);
  let addictivenessRating = "";
  for (let i = 0; i < addictivenessRatingDictKeys.length; i += 1) {
    if (
      experienceHours >=
      addictivenessRatingDictKeys[addictivenessRatingDictKeys.length - 1]
    ) {
      addictivenessRating =
        addictivenessRatingDict[
          addictivenessRatingDictKeys[addictivenessRatingDictKeys.length - 1]
        ];
      break;
    } else if (
      experienceHours >= addictivenessRatingDictKeys[i] &&
      experienceHours < addictivenessRatingDictKeys[i + 1]
    ) {
      addictivenessRating =
        addictivenessRatingDict[addictivenessRatingDictKeys[i]];
      break;
    }
  }
  return (
    <div ref={childRef}>
      <Segment
        basic
        attached={screenCategory === "wide" && browserView ? false : "top"}
        style={{
          padding: 0,
          margin: "0",
          boxSizing: "border-box",
          width: "100%"
        }}
      >
        <Card fluid id="playerDetailView">
          <Card.Content>
            <SkillTierPopup rankPoints={player.rank_blitz} mode="BRAWL" />
            <SkillTierPopup rankPoints={player.rank_3v3} mode="3v3" />
            {(() => {
              const [major, minor] = player.patchVersion.split(".");
              if (
                parseInt(major) > 3 ||
                (parseInt(major) === 3 && parseInt(minor) > 2)
              ) {
                return (
                  <SkillTierPopup rankPoints={player.rank_5v5} mode="5v5" />
                );
              }
              return <span />;
            })()}
            <Card.Header style={{ fontSize: "1.2rem" }}>
              {player.name}
            </Card.Header>
            <Card.Meta>{`Level: ${player.level}`}</Card.Meta>
            <Label content={player.shardId.toUpperCase()} />
            {(() => {
              if (player.guildTag) return <Label content={player.guildTag} />;
              return <span />;
            })()}
            <Image
              style={{ height: "30px" }}
              spaced
              src={`/static/img/karma/c/${player.karmaLevel}.png`}
            />
            <Grid columns={2} style={{ marginTop: 0 }}>
              <Grid.Row style={{ paddingBottom: 0 }}>
                <Grid.Column width={16} style={{ textAlign: "center" }}>
                  Played in total
                  <h2 style={{ margin: 0, fontSize: "1.4rem" }}>
                    {experienceHours.toFixed(0)} hours
                  </h2>
                  <em>“{addictivenessRating}”</em>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column style={{ fontSize: "0.96rem" }}>
                  3v3 Ranked:
                  <div style={{ float: "right" }}>{player.played_ranked}×</div>
                  <br />
                  {(() => {
                    const [major, minor] = player.patchVersion.split(".");
                    if (
                      parseInt(major) > 3 ||
                      (parseInt(major) === 3 && parseInt(minor) > 2)
                    ) {
                      return (
                        <React.Fragment>
                          5v5 Ranked:
                          <div
                            style={{
                              float: "right"
                            }}
                          >
                            {player.played_ranked_5v5}×
                          </div>
                          <br />
                        </React.Fragment>
                      );
                    }
                    return <div style={{ display: "none" }} />;
                  })()}
                  Blitz:
                  <div style={{ float: "right" }}>{player.played_blitz}×</div>
                </Grid.Column>
                <Grid.Column style={{ fontSize: "0.96rem" }}>
                  3v3 Casual:
                  <div style={{ float: "right" }}>{player.played_casual}×</div>
                  <br />
                  5v5 Casual:
                  <div style={{ float: "right" }}>
                    {player.played_casual_5v5}×
                  </div>
                  <br />
                  B. Royale:
                  <div style={{ float: "right" }}>{player.played_aral}×</div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Card.Content>
        </Card>
      </Segment>
    </div>
  );
}

PlayerDetailView.propTypes = propTypes;
