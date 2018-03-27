import Layout from "../../components/ExtensionLayout.js";
import Link from "next/link";
import fetch from "isomorphic-unfetch";
import moment from "moment";

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
  Icon
} from "semantic-ui-react";

class InputPanel extends React.Component {
  constructor() {
    super();
    this.state = { IGNInput: "", loading: false };

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
    this.setState({ loading: true });
    event.preventDefault();
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
            loading={this.state.loading}
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
      return { value: rawRankPoints, progress: rankProgress };
    }

    return { value: rawRankPoints, progress: rankProgress };
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

const Player = ({ player }) => (
  <div>
    <Segment
      basic
      attached="top"
      style={{ padding: 0, margin: "1em 0 0 -1px" }}
    >
      <Card fluid>
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
          <strong>Experience:</strong>
          <Grid columns="equal">
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
                <div style={{ float: "right" }}>{player.played_casual}×</div>
                <br />
                3v3 Rankeds:
                <div style={{ float: "right" }}>{player.played_ranked}×</div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>
    </Segment>
  </div>
);

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
                {match.rosters[0].participants.map(participant => {
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
                    />
                  );
                })}
                <br />
                vs<br />
                {match.rosters[1].participants.map(participant => {
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
                1.25 KDA/min
                <br />
                200 Gold/min
                <br />
                {playerInTheMatch.items.map((item, index) => {
                  if (
                    match.gameMode.indexOf("5v5") !== -1 &&
                    (index == 0 || index == 1)
                  ) {
                    return <div />;
                  }

                  return (
                    <Image
                      avatar
                      src={
                        "/static/img/items/c/" +
                        item.replace(/ /g, "-").toLowerCase() +
                        ".png"
                      }
                      style={{
                        width: "21px",
                        height: "21px",
                        margin: 0,
                        marginTop: "4px"
                      }}
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
  playerId,
  matches,
  sidebarVisible,
  toggleSidebar,
  converter
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
      <Button onClick={toggleSidebar}>
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
    {matches.map(match => {
      const { playerInTheMatch, playerInTheMatchWon } = converter({
        playerId: playerId,
        match: match
      }).identifyPlayerInTheMatch();

      return (
        <Menu.Item
          key={match.id}
          style={{ padding: "10px", paddingBottom: "5px" }}
        >
          <Link as={`/match/${match.id}`} href={`/match?id=${match.id}`}>
            <MatchCard
              match={match}
              playerInTheMatch={playerInTheMatch}
              playerInTheMatchWon={playerInTheMatchWon}
              converter={converter}
            />
          </Link>
        </Menu.Item>
      );
    })}
  </Sidebar>
);

class Extension extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      sidebarVisible: false
    };
  }
  toggleSidebar = () => {
    this.setState({ sidebarVisible: !this.state.sidebarVisible });
  };
  converter = data => {
    return {
      identifyPlayerInTheMatch: () => {
        for (
          var rosterIndex = 0;
          rosterIndex < data.match.rosters.length;
          rosterIndex++
        ) {
          for (
            var participantIndex = 0;
            participantIndex <
            data.match.rosters[rosterIndex].participants.length;
            participantIndex++
          ) {
            if (
              data.match.rosters[rosterIndex].participants[participantIndex]
                .player.id === data.playerId
            ) {
              return {
                playerInTheMatch:
                  data.match.rosters[rosterIndex].participants[
                    participantIndex
                  ],
                playerInTheMatchWon: data.match.rosters[rosterIndex].won
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

      humanGameMode: () => {
        return {
          "5v5_pvp_ranked": ["5v5 Ranked", false, "5v5ranked"],
          "5v5_pvp_casual": ["5v5 Casual", false, "5v5casual"],
          private_party_vg_5v5: ["5v5 Private Casual", true, "5v5casual"],
          ranked: ["Ranked", false, "ranked"],
          private_party_draft_match: ["Private Ranked", true, "ranked"],
          casual: ["Casual", false, "casual"],
          private: ["Private Casual", true, "casual"],
          casual_aral: ["Battle Royale", false, "br"],
          private_party_aral_match: ["Private Battle Royale", true, "br"],
          blitz_pvp_ranked: ["Blitz", false, "blitz"],
          private_party_blitz_match: ["Private Blitz", true, "blitz"],
          blitz_rounds_pvp_casual: ["Onslaught", false, "onslaught"],
          private_party_blitz_rounds_match: [
            "Private Onslaught",
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
      }
    };
  };
  render() {
    return (
      <Layout>
        <Sidebar.Pushable style={{ minHeight: "100vh" }}>
          <MatchesSidebar
            playerId={this.state.data.player.id}
            matches={this.state.data.matches}
            sidebarVisible={this.state.sidebarVisible}
            toggleSidebar={this.toggleSidebar}
            converter={this.converter}
          />
          <Sidebar.Pusher dimmed={this.state.sidebarVisible}>
            <Segment basic>
              <InputPanel />
              <Player player={this.state.data.player} />
              <Button.Group attached="bottom">
                <Button>
                  <Icon name="send" />Send
                </Button>
                <Button onClick={this.toggleSidebar}>
                  <Icon name="sidebar" /> Matches
                </Button>
              </Button.Group>
            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </Layout>
    );
  }
}

Extension.getInitialProps = async function({ query }) {
  //const res = await fetch('http://api.tvmaze.com/search/shows?q=batman')
  //const data = await res.json()

  const data = JSON.parse(query.data);

  return {
    data: data
  };
};

export default Extension;
