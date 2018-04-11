import Layout from "../../components/ExtensionLayout.js";
import Link from "next/link";
import fetch from "isomorphic-unfetch";
import moment from "moment";
import Router from "next/router";
import html2canvas from "html2canvas";

import {
  Form,
  Input,
  Sidebar,
  List,
  Segment,
  Menu,
  Container,
  Card,
  Image,
  Label,
  Popup,
  Progress,
  Grid,
  Button,
  Icon,
  Loader,
  Dimmer
} from "semantic-ui-react";

class InputPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { IGNInput: "", loading: props.appLoading };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleInputChange = event => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    this.setState({
      [event.target.id]: value
    });
  };
  handleSubmit = event => {
    this.props.appLoadingOn();
    event.preventDefault();
    //window.location.href = "/extension/player/" + this.state.IGNInput;

    Router.push(
      "/extension/player?error=false&extension=false&IGN=" +
        this.state.IGNInput,
      "/extension/player/" + this.state.IGNInput,
      { shallow: false }
    );
  };
  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Field>
          <Input
            icon={<Icon name="search" />}
            type="search"
            onChange={this.handleInputChange}
            value={this.state["IGNInput"]}
            id="IGNInput"
            placeholder="In-Game Name"
            required
            loading={this.props.appLoading}
          />
        </Form.Field>
      </Form>
    );
  }
}

const SkillTierPopup = ({ skillTier, rankPoints }) => {
  skillTier = (rawSkillTier => {
    var tierNumber = parseInt(rawSkillTier / 3) + 1;
    var tierName = "";
    const colorNumber = rawSkillTier % 3;
    var colorName = "";

    switch (tierNumber) {
      case 1:
        tierName = "Just Beginning";
        break;
      case 2:
        tierName = "Getting There";
        break;
      case 3:
        tierName = "Rock Solid";
        break;
      case 4:
        tierName = "Worthy Foe";
        break;
      case 5:
        tierName = "Got Swagger";
        break;
      case 6:
        tierName = "Credible Threat";
        break;
      case 7:
        tierName = "The Hotness";
        break;
      case 8:
        tierName = "Simply Amazing";
        break;
      case 9:
        tierName = "Pinnacle of Awesome";
        break;
      case 10:
        tierName = "Vainglorious";
        break;
      default:
        tierNumber = 0;
        tierName = "Unranked";
    }

    switch (colorNumber) {
      case 0:
        colorName = " Bronze";
        break;
      case 1:
        colorName = " Silver";
        break;
      case 2:
        colorName = " Gold";
        break;
      default:
        colorName = "";
    }

    return {
      number: tierNumber,
      name: tierName,
      color: colorName
    };
  })(skillTier);

  rankPoints = (rawRankPoints => {
    const rankPointLimits = [
      0,
      109,
      218,
      327,
      436,
      545,
      654,
      763,
      872,
      981,
      1090,
      1200,
      1250,
      1300,
      1350,
      1400,
      1467,
      1533,
      1600,
      1667,
      1733,
      1800,
      1867,
      1933,
      2000,
      2134,
      2267,
      2400,
      2600,
      2800,
      2825
    ];

    var rankProgress = 0.0;

    for (var i = 1; i < rankPointLimits.length; i++) {
      if (
        rawRankPoints >= rankPointLimits[i - 1] &&
        rawRankPoints < rankPointLimits[i]
      ) {
        rankProgress =
          (rawRankPoints - rankPointLimits[i - 1]) /
          (rankPointLimits[i] - 1 - rankPointLimits[i - 1]);
        break;
      }
    }

    if (rawRankPoints >= rankPointLimits[rankPointLimits.length - 1]) {
      rankProgress = 1;
      return { value: rawRankPoints, progress: rankProgress * 100 };
    }

    return { value: rawRankPoints, progress: rankProgress * 100 };
  })(rankPoints);

  return (
    <Popup
      trigger={
        <Image
          floated="right"
          size="tiny"
          src={`/static/img/rank/c/${
            skillTier.number
          }%20${skillTier.color.trim()}.png`}
          style={{ margin: 0, marginBottom: "-7px" }}
        />
      }
    >
      <Popup.Header>
        {skillTier.name}
        {skillTier.color}
      </Popup.Header>
      <Progress percent={rankPoints.progress} size="tiny">
        {rankPoints.value}
      </Progress>
    </Popup>
  );
};

class PlayerDetailView extends React.Component {
  constructor(props) {
    super(props);
    this.generatePlayerDetailImage = this.generatePlayerDetailImage.bind(this);
  }
  generatePlayerDetailImage = () => {
    html2canvas(document.getElementById("playerDetailView"), {
      backgroundColor: null
    }).then(canvas => {
      var img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");

      document.body.appendChild(img);
    });
  };
  render() {
    const player = this.props.player;
    const experienceHours =
      (player.played_casual_5v5 * 25 +
        player.played_aral * 10 +
        player.played_blitz * 5 +
        player.played_casual * 18 +
        player.played_ranked * 22) /
      60;

    const addictivenessRatingDict = {
      "0": "",
      "20": "There’s a new sheriff in town.",
      "40": "Lacks match practice.",
      "80": "This is quite fun.",
      "120": "Promising star.",
      "160": "I’m just getting started.",
      "240": "Remember, eating gives you the strength to keep on playing.",
      "320": "Better order another takeaway pizza.",
      "400": "Mildly addicted.",
      "480": "No-one can accuse me of lacking commitment.",
      "560": "I am now a Vainglory expert.",
      "640":
        "Congratulations from everyone at VAIN.ZONE. We didn't actually think you'd make it this far.",
      "720": "I think I should include Vainglory in my CV.",
      "880": "Time to change underwear.",
      "1040": "Turning your underwear inside out saves on washing.",
      "1200": "Just one more game I promise.",
      "1360": "Real Vainglorious don't need food.",
      "1520":
        "I can give up this game whenever I like. I just don't want to yet...",
      "1780": "Sleeping is for sissies.",
      "1940": "Remember to call for another sickday.",
      "2100": "It's not really addictive - I just can’t stop playing.",
      "2420": "Repetitive Hand Injury anyone?",
      "2740": "This is my life and I do what I want with it.",
      "3060": "Your friendships have now expired.",
      "3380": "It's been a while since I had any human contact.",
      "3700": "What are humans?",
      "4340": "6 months worth of game time? Check.",
      "4980": "L3oN? Is that you?"
    };
    const addictivenessRatingDictKeys = Object.keys(addictivenessRatingDict)
      .map(e => parseInt(e))
      .sort((a, b) => a - b);
    var addictivenessRating = "";
    for (var i = 0; i < addictivenessRatingDictKeys.length; i++) {
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
      <div>
        <Segment
          basic
          attached="top"
          style={{ padding: 0, margin: "1em 0 0 -1px" }}
        >
          <Card fluid id="playerDetailView">
            <Card.Content>
              <SkillTierPopup
                skillTier={player.skillTier}
                rankPoints={player.rank_3v3}
              />
              <Card.Header>{player.name}</Card.Header>
              <Card.Meta>Level: {player.level}</Card.Meta>
              <Label>{player.guildTag}</Label>
              <Image
                style={{ height: "30px" }}
                spaced
                src={"/static/img/karma/c/" + player.karmaLevel + ".png"}
              />
            </Card.Content>
            <Card.Content>
              <Grid columns={2}>
                <Grid.Row style={{ paddingBottom: 0 }}>
                  <Grid.Column width={16} style={{ textAlign: "center" }}>
                    Experience Level
                    <h2 style={{ margin: 0 }}>
                      {experienceHours.toFixed(0)} hours
                    </h2>
                    <em>“{addictivenessRating}”</em>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    5v5 Casuals:
                    <div style={{ float: "right" }}>
                      {player.played_casual_5v5}×
                    </div>
                    <br />
                    BRAWL Games:
                    <div style={{ float: "right" }}>
                      {player.played_aral + player.played_blitz}×
                    </div>
                  </Grid.Column>
                  <Grid.Column>
                    3v3 Casuals:
                    <div style={{ float: "right" }}>
                      {player.played_casual}×
                    </div>
                    <br />
                    3v3 Rankeds:
                    <div style={{ float: "right" }}>
                      {player.played_ranked}×
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Card.Content>
          </Card>
        </Segment>
        <Button.Group attached="bottom">
          <Button onClick={this.generatePlayerDetailImage} disabled>
            <Icon name="send" />Image <Label color="yellow">Beta</Label>
          </Button>
          <Button onClick={this.props.toggleSidebar}>
            <Icon name="sidebar" /> Matches
          </Button>
        </Button.Group>
      </div>
    );
  }
}

const MatchCard = ({
  match,
  playerInTheMatch,
  playerInTheMatchWon,
  converter
}) => {
  const { shortMatchConclusion, matchConclusionColors } = converter({
    shortMatchConclusion: playerInTheMatchWon
  }).shortMatchConclusion();
  const humanGameMode = converter({ gameMode: match.gameMode }).humanGameMode();
  const humanDuration = converter({ duration: match.duration }).humanDuration();

  var items = playerInTheMatch.items.slice();
  if (match.gameMode.indexOf("5v5") !== -1) {
    items.splice(0, 2);
  }
  for (var i = 0; i < 6; i++) {
    if (!items[i]) {
      items.push("empty");
    }
  }

  var kdaPerTenMinutes =
    (playerInTheMatch.kills + playerInTheMatch.assists) /
    playerInTheMatch.deaths /
    (match.duration / 600);
  if (playerInTheMatch.deaths == 0) {
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
          src={
            "/static/img/heroes/c/" +
            playerInTheMatch.actor.toLowerCase() +
            ".jpg"
          }
          style={{ borderRadius: "25%", marginBottom: 0 }}
          floated="right"
        />
        <Card.Header>
          <span>
            <Label
              color={matchConclusionColors[1]}
              style={{ verticalAlign: "top" }}
              horizontal
            >
              {shortMatchConclusion.toUpperCase()}
            </Label>
          </span>{" "}
          {humanGameMode.toUpperCase()}
        </Card.Header>
        <Card.Meta>
          {moment(match.createdAt).fromNow()} | {humanDuration}min game
        </Card.Meta>
      </Card.Content>
      <Card.Content style={{ color: "black" }}>
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column style={{ margin: "auto", padding: "0 0.5rem" }}>
              <div style={{ margin: "auto" }}>
                {match.rosters[0].participants.map((participant, index) => {
                  return (
                    <Image
                      avatar
                      src={
                        "/static/img/heroes/c/" +
                        participant.actor.toLowerCase() +
                        ".jpg"
                      }
                      style={{
                        borderRadius: "25%",
                        width: "22px",
                        height: "22px",
                        margin: "1px"
                      }}
                      key={index}
                    />
                  );
                })}
                <br />
                vs<br />
                {match.rosters[1].participants.map((participant, index) => {
                  return (
                    <Image
                      avatar
                      src={
                        "/static/img/heroes/c/" +
                        participant.actor.toLowerCase() +
                        ".jpg"
                      }
                      style={{
                        borderRadius: "25%",
                        width: "22px",
                        height: "22px",
                        margin: "1px"
                      }}
                      key={index}
                    />
                  );
                })}
              </div>
            </Grid.Column>
            <Grid.Column
              style={{
                textAlign: "center",
                margin: "auto",
                padding: "0 0.5rem"
              }}
            >
              <div style={{ margin: "auto" }}>
                <strong>{kdaPerTenMinutes.toFixed(1)}</strong> KDA Score
                <br />
                <strong>{goldPerMinute.toFixed(0)}</strong> Gold/min
                <br />
                {items.map((item, index) => {
                  return (
                    <Image
                      avatar
                      src={
                        "/static/img/items/c/" +
                        item.replace(/ /g, "-").toLowerCase() +
                        ".png?index=" +
                        index
                      }
                      style={{
                        width: "21px",
                        height: "21px",
                        margin: 0,
                        marginTop: "4px"
                      }}
                      key={"matchcard" + item + index}
                    />
                  );
                })}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Card.Content>
    </Card>
  );
};

const MatchesSidebar = ({
  data,
  playerName,
  playerId,
  matches,
  sidebarVisible,
  toggleSidebar,
  converter,
  setSelectedMatch
}) => (
  <Sidebar
    as={Menu}
    animation="push"
    direction="right"
    width="wide"
    visible={sidebarVisible}
    icon="labeled"
    style={{ maxWidth: "100vw" }}
    inverted
    vertical
  >
    <Menu.Item
      style={{ padding: "10px", paddingBottom: "5px", textAlign: "left" }}
    >
      <Button onClick={toggleSidebar} style={{ width: "100%" }}>
        <Icon name="chevron left" />Back
      </Button>
      <Button
        onClick={() => window.alert("Filter option is coming soon!")}
        floated="right"
        disabled
        style={{ display: "none" }}
      >
        <Icon name="filter" />Filter
      </Button>
    </Menu.Item>
    {matches.map((match, index) => {
      const { playerInTheMatch, playerInTheMatchWon } = converter({
        playerId: playerId,
        rosters: match.rosters
      }).identifyPlayerInTheMatch();

      return (
        <Menu.Item
          key={match.id}
          style={{ padding: "10px", paddingBottom: "5px" }}
        >
          <div
            style={{}}
            onClick={() => {
              setSelectedMatch(index);
            }}
          >
            <MatchCard
              key={index}
              match={match}
              playerInTheMatch={playerInTheMatch}
              playerInTheMatchWon={playerInTheMatchWon}
              converter={converter}
            />
          </div>
        </Menu.Item>
      );
    })}
  </Sidebar>
);

class ParticipantCard extends React.Component {
  render() {
    const matchDuration = this.props.matchDuration;
    const participant = this.props.participant;
    const side = this.props.side;
    const maxParticipantValues = this.props.maxParticipantValues;
    const telemetryLoading = this.props.telemetryLoading;
    const highestDamage = this.props.highestDamage;
    const totalDamage = this.props.damage;

    var items = participant.items.slice();
    if (this.props.gameMode.indexOf("5v5") !== -1) {
      items.splice(0, 2);
    }
    for (var i = 0; i < 6; i++) {
      if (!items[i]) {
        items.push("empty");
      }
    }

    var kdaPerTenMinutes =
      (participant.kills + participant.assists) /
      participant.deaths /
      (matchDuration / 600);
    if (participant.deaths == 0) {
      kdaPerTenMinutes =
        (participant.kills + participant.assists) / (matchDuration / 600);
    }

    return (
      <Link
        prefetch
        href={
          "/extension/player?error=false&extension=false&IGN=" +
          participant.player.name
        }
        as={"/extension/player/" + participant.player.name}
      >
        <Card link fluid style={{ margin: "3px 1px 3px 0", color: "black" }}>
          <Dimmer active={telemetryLoading} inverted>
            <Loader />
          </Dimmer>
          <Card.Content style={{ padding: "4px" }}>
            <Image
              size="mini"
              src={
                "/static/img/heroes/c/" +
                participant.actor.toLowerCase() +
                ".jpg"
              }
              style={{ borderRadius: "25%", margin: "0 2px" }}
              floated={side}
            />
            <strong
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "1.1rem",
                display: "block"
              }}
            >
              {participant.player.name}
            </strong>
            <div style={{ fontSize: "0.9rem" }}>
              {participant.kills}/{participant.deaths}/{participant.assists}{" "}
              <span style={{ float: { right: "left", left: "right" }[side] }}>
                ({kdaPerTenMinutes.toFixed(1)})
              </span>
            </div>
            <Grid style={{ margin: 0, marginBottom: "2px" }} columns={6}>
              <Grid.Row style={{ padding: 0 }}>
                {items.map((item, index) => {
                  return (
                    <Grid.Column
                      key={"participantcard" + index}
                      style={{ padding: 0, textAlign: "center" }}
                    >
                      <Image
                        fluid
                        src={
                          "/static/img/items/c/" +
                          item.replace(/ /g, "-").toLowerCase() +
                          ".png?index=" +
                          index
                        }
                        style={{
                          maxWidth: "3.5rem",
                          margin: "0"
                        }}
                        key={"participantcard" + item + index}
                      />
                    </Grid.Column>
                  );
                })}
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
                value={totalDamage}
                total={highestDamage}
                size="small"
                color="orange"
              />
              <div className="progressLabelWrapper">
                <span className="progressLabel">Dmg/min</span>{" "}
                <span className="progressLabelValue">
                  {(totalDamage / (matchDuration / 60)).toFixed(0)}
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
}

class MatchDetailView extends React.Component {
  render() {
    const converter = this.props.converter,
      match = this.props.match,
      TLDamagesData = this.props.TLDamagesData,
      telemetryLoading = this.props.telemetryLoading;

    const maxParticipantValues = converter({
      rosters: this.props.match.rosters
    }).getMaxParticipantValues();

    return (
      <Segment
        id="matchDetailView"
        style={{
          paddingTop: "1.6rem",
          paddingLeft: "0.5em",
          paddingRight: "0.5em"
        }}
      >
        <Label attached="top">
          <div style={{ marginBottom: "2px", padding: 0, textAlign: "center" }}>
            {converter({ gameMode: match.gameMode })
              .humanGameMode()
              .toUpperCase()}
          </div>
          {converter({ duration: match.duration }).humanDuration() + "min"}
          <span style={{ float: "right" }}>
            {moment(match.createdAt).fromNow()}
          </span>
        </Label>
        <Segment basic style={{ padding: 0, textAlign: "center" }}>
          <Label
            color={
              converter({
                rosterWon: match.rosters[0].won,
                endGameReason: match.endGameReason
              }).longMatchConclusion().matchConclusionColors[1]
            }
            style={{ width: "90px", textAlign: "center", float: "left" }}
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
            {match.rosters[0].heroKills} ⚔️{match.rosters[1].heroKills}
          </div>
          <Label
            color={
              converter({
                rosterWon: match.rosters[1].won,
                endGameReason: match.endGameReason
              }).longMatchConclusion().matchConclusionColors[1]
            }
            style={{
              float: "right",
              width: "90px",
              textAlign: "center"
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
                {match.rosters[0].gold}&zwj;💰 {match.rosters[0].acesEarned}&zwj;🃏{" "}
                {match.rosters[0].krakenCaptures}&zwj;🐲{" "}
                {match.rosters[0].turretKills}&zwj;🗼
              </Grid.Column>
              <Grid.Column textAlign="right" style={{ paddingRight: "0.4rem" }}>
                {match.rosters[1].gold}&zwj;💰 {match.rosters[1].acesEarned}&zwj;🃏{" "}
                {match.rosters[1].krakenCaptures}&zwj;🐲{" "}
                {match.rosters[1].turretKills}&zwj;🗼
              </Grid.Column>
            </Grid.Row>
            <Grid.Row style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
              <Grid.Column textAlign="left" style={{ paddingRight: "0.1em" }}>
                {match.rosters[0].participants.map((participant, index) => (
                  <ParticipantCard
                    matchDuration={match.duration}
                    participant={participant}
                    gameMode={match.gameMode}
                    maxParticipantValues={maxParticipantValues}
                    side={"left"}
                    key={index}
                    telemetryLoading={telemetryLoading}
                    damage={TLDamagesData.rosters[0][participant.actor]}
                    highestDamage={TLDamagesData.highest}
                  />
                ))}
              </Grid.Column>
              <Grid.Column textAlign="right" style={{ paddingLeft: "0.1em" }}>
                {match.rosters[1].participants.map((participant, index) => (
                  <ParticipantCard
                    matchDuration={match.duration}
                    participant={participant}
                    gameMode={match.gameMode}
                    maxParticipantValues={maxParticipantValues}
                    side={"right"}
                    key={index}
                    telemetryLoading={telemetryLoading}
                    damage={TLDamagesData.rosters[1][participant.actor]}
                    highestDamage={TLDamagesData.highest}
                  />
                ))}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </Segment>
    );
  }
}

class MainLayout extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const FBLoaded = () => {
      if (this.props.extension) {
        this.identifyExtensionUser()
          .then(IGN => {
            Router.replace(
              "/extension/player?error=false&extension=false&IGN=" + IGN,
              "/extension/player/" + IGN
            );
          })
          .catch(err => {
            try {
              window.location.replace("https://m.me/VAIN.ZONE");
            } catch (e) {
              window.location = "https://m.me/VAIN.ZONE";
            }
          });
      }
    };
    window.extAsyncInit = FBLoaded.bind(this);

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "Messenger");
  }
  identifyExtensionUser = () => {
    const genericUsername = "L3oN";
    return new Promise((resolve, reject) => {
      MessengerExtensions.getContext(
        "617200295335676",
        thread_context => {
          var psid = thread_context.psid;
          fetch("https://high-angle.glitch.me/api")
            .then(res => res.json())
            .then(res => {
              if (res.recipients[psid]) {
                //document.getElementById("FBButton").style.display = "inline-block";
                if (res.recipients[psid].IGN) {
                  resolve(res.recipients[psid].IGN);
                } else {
                  resolve(genericUsername);
                }
              } else {
                reject("User has not yet interacted with the bot.");
              }
            })
            .catch(err => {
              console.log("err", err);
              resolve(genericUsername);
            });
        },
        err => {
          console.log("Couldn't get context:", err);
          resolve(genericUsername);
        }
      );
    });
  };
  render() {
    if (this.props.extension) {
      return (
        <Layout>
          <div />
        </Layout>
      );
    }
    return (
      <Layout>
        <Sidebar.Pushable style={{ minHeight: "100vh" }}>
          <MatchesSidebar
            data={this.props.data}
            playerName={this.props.data.player.name}
            playerId={this.props.data.player.id}
            matches={this.props.data.matches}
            sidebarVisible={this.props.sidebarVisible}
            toggleSidebar={this.props.toggleSidebar}
            converter={this.props.converter}
            setSelectedMatch={this.props.setSelectedMatch}
          />
          <Sidebar.Pusher dimmed={this.props.sidebarVisible}>
            <Segment basic>
              <InputPanel
                appLoading={this.props.appLoading}
                appLoadingOn={this.props.appLoadingOn}
              />
              <PlayerDetailView player={this.props.data.player} />
              <MatchDetailView
                match={this.props.data.matches[this.props.selectedMatch]}
                converter={this.props.converter}
                TLDamagesData={this.props.TLDamagesData}
                telemetryLoading={this.props.telemetryLoading}
              />
            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </Layout>
    );
  }
}

const ErrorLayout = ({ appLoading, appLoadingOn }) => {
  return (
    <Layout>
      <Segment basic>
        <InputPanel appLoading={appLoading} appLoadingOn={appLoadingOn} />
        <Segment>
          <p>We couldn't find anything :(</p>
          <ol>
            <li>Please check the spelling of the nick.</li>
            <li>If the player hasn't played this mode</li>
            for a long time, we don't have data for them.
            <li>Maybe the player has changed their nick?</li>
          </ol>
        </Segment>
      </Segment>
    </Layout>
  );
};

class Extension extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      sidebarVisible: false,
      selectedMatch: 0,
      TLDamagesData: props.TLDamagesData,
      telemetryLoading: false,
      appLoading: false
    };
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.converter = this.converter.bind(this);
    this.setSelectedMatch = this.setSelectedMatch.bind(this);
    this.appLoadingOn = this.appLoadingOn.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      sidebarVisible: false,
      selectedMatch: 0,
      TLDamagesData: nextProps.TLDamagesData,
      telemetryLoading: false,
      appLoading: false
    });
  }
  componentDidMount() {
    Router.onRouteChangeStart = () =>
      this.setState({ telemetryLoading: true, appLoading: true });
    //Router.onRouteChangeComplete = () => console.log("Complete");
    Router.onRouteChangeError = () =>
      this.setState({ telemetryLoading: false, appLoading: false });
  }
  appLoadingOn = () => {
    this.setState({ appLoading: true });
  };
  toggleSidebar = () => {
    this.setState({ sidebarVisible: !this.state.sidebarVisible });
  };
  setSelectedMatch = index => {
    this.toggleSidebar();
    this.setState({ selectedMatch: index, telemetryLoading: true });

    const params = {
      match: JSON.stringify(this.state.data.matches[index])
    };
    const esc = encodeURIComponent;
    const telemetryQueryString = Object.keys(params)
      .map(k => esc(k) + "=" + esc(params[k]))
      .join("&");

    const that = this;

    fetch("/api/telemetry?" + telemetryQueryString)
      .then(res => res.json())
      .then(processedTelemetry => {
        that.setState({
          TLDamagesData: processedTelemetry.damagesData,
          telemetryLoading: false
        });
      })
      .catch(err => that.setState({ telemetryLoading: false }));
  };
  converter = data => {
    return {
      identifyPlayerInTheMatch: () => {
        for (
          var rosterIndex = 0;
          rosterIndex < data.rosters.length;
          rosterIndex++
        ) {
          for (
            var participantIndex = 0;
            participantIndex < data.rosters[rosterIndex].participants.length;
            participantIndex++
          ) {
            if (
              data.rosters[rosterIndex].participants[participantIndex].player
                .id === data.playerId
            ) {
              return {
                playerInTheMatch:
                  data.rosters[rosterIndex].participants[participantIndex],
                playerInTheMatchWon: data.rosters[rosterIndex].won
              };
            }
          }
        }
      },

      shortMatchConclusion: () => {
        if (data.shortMatchConclusion == "true") {
          return {
            shortMatchConclusion: "WON",
            matchConclusionColors: ["#0c5", "green"]
          };
        }
        return {
          shortMatchConclusion: "LOST",
          matchConclusionColors: ["#ff5757", "red"]
        };
      },

      longMatchConclusion: () => {
        if (data.rosterWon == "true") {
          return {
            longMatchConclusion: "VICTORY",
            matchConclusionColors: ["#0c5", "green"]
          };
        } else if (data.endGameReason == "victory") {
          return {
            longMatchConclusion: "DEFEAT",
            matchConclusionColors: ["#ff5757", "red"]
          };
        } else {
          return {
            longMatchConclusion: "SURRENDER",
            matchConclusionColors: ["#fc0", "yellow"]
          };
        }
      },

      humanGameMode: () => {
        return {
          "5v5_pvp_ranked": ["Sovereign's Rise Ranked", false, "5v5ranked"],
          "5v5_pvp_casual": ["Sovereign's Rise Casual", false, "5v5casual"],
          private_party_vg_5v5: [
            "Sovereign's Rise Private Blind",
            true,
            "5v5casual"
          ],
          ranked: ["Halcyon Fold Ranked", false, "ranked"],
          private_party_draft_match: [
            "Halcyon Fold Private Draft",
            true,
            "ranked"
          ],
          casual: ["Halcyon Fold Casual", false, "casual"],
          private: ["Halcyon Fold Private Blind", true, "casual"],
          casual_aral: ["Halcyon Fold Battle Royale", false, "br"],
          private_party_aral_match: [
            "Halcyon Fold Private Battle Royale",
            true,
            "br"
          ],
          blitz_pvp_ranked: ["Halcyon Fold Blitz", false, "blitz"],
          private_party_blitz_match: [
            "Halcyon Fold Private Blitz",
            true,
            "blitz"
          ],
          blitz_rounds_pvp_casual: [
            "Halcyon Fold Onslaught",
            false,
            "onslaught"
          ],
          private_party_blitz_rounds_match: [
            "Halcyon Fold Private Onslaught",
            true,
            "onslaught"
          ]
        }[data.gameMode][0];
      },

      humanDuration: () => {
        var time = parseInt(data.duration / 60) + ":" + data.duration % 60;
        time = time.split(":");
        if (time[0].length < 2) time[0] = "0" + time[0];
        if (time[1].length < 2) time[1] = "0" + time[1];

        return time.join(":");
      },

      getMaxParticipantValues: () => {
        var goldArray = [];
        var farmArray = [];

        for (
          var rosterIndex = 0;
          rosterIndex < data.rosters.length;
          rosterIndex++
        ) {
          for (
            var participantIndex = 0;
            participantIndex < data.rosters[rosterIndex].participants.length;
            participantIndex++
          ) {
            goldArray.push(
              data.rosters[rosterIndex].participants[participantIndex].gold
            );
            farmArray.push(
              data.rosters[rosterIndex].participants[participantIndex].farm
            );
          }
        }

        return {
          maxGold: Math.max(...goldArray),
          maxFarm: Math.max(...farmArray)
        };
      }
    };
  };
  render() {
    if (this.props.error) {
      console.log("errorMessage", this.props.errorMessage);
      return (
        <ErrorLayout
          appLoading={this.state.appLoading}
          appLoadingOn={this.appLoadingOn}
        />
      );
    }
    return (
      <MainLayout
        data={this.state.data}
        sidebarVisible={this.state.sidebarVisible}
        toggleSidebar={this.toggleSidebar}
        converter={this.converter}
        setSelectedMatch={this.setSelectedMatch}
        selectedMatch={this.state.selectedMatch}
        TLDamagesData={this.state.TLDamagesData}
        telemetryLoading={this.state.telemetryLoading}
        extension={this.props.extension}
        appLoading={this.state.appLoading}
        appLoadingOn={this.appLoadingOn}
      />
    );
  }
}

Extension.getInitialProps = async function({ query }) {
  //const res = await fetch('http://api.tvmaze.com/search/shows?q=batman')
  //const data = await res.json()
  if (!JSON.parse(query.error)) {
    if (!JSON.parse(query.extension)) {
      const requestMatches = await fetch(
        "https://test.vainglory.eu/api/matches/" + query.IGN
      );
      const data = await requestMatches.json();
      if (data.error) {
        return {
          data: null,
          TLDamagesData: null,
          extension: false,
          error: true
        };
      }

      const params = {
        match: JSON.stringify(data.matches[0])
      };
      const esc = encodeURIComponent;
      const telemetryQueryString = Object.keys(params)
        .map(k => esc(k) + "=" + esc(params[k]))
        .join("&");

      const requestProcessedTelemetry = await fetch(
        "https://test.vainglory.eu/api/telemetry?" + telemetryQueryString
      );

      const processedTelemetry = await requestProcessedTelemetry.json();

      return {
        data: data,
        TLDamagesData: processedTelemetry.damagesData,
        extension: false,
        error: false
      };
    } else {
      return {
        data: null,
        TLDamagesData: null,
        extension: true,
        error: false
      };
    }
  } else {
    return {
      data: null,
      TLDamagesData: null,
      extension: false,
      error: true,
      errorMessage: query.errorMessage
    };
  }
};

export default Extension;
