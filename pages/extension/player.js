import Layout from "../../components/ExtensionLayout.js";
import Link from "next/link";
import fetch from "isomorphic-unfetch";

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
  Button
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
            icon="user"
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
          src={`http://x.vainglory.eu/vg_extension2/assets/img/rank/c/${
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
  <Card link fluid>
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
        src={
          "http://x.vainglory.eu/vg_extension2/assets/img/karma/c/" +
          player.karmaLevel +
          ".png"
        }
      />
    </Card.Content>
    <Card.Content>
      <strong>Experience:</strong>
      <Grid columns="equal">
        <Grid.Row>
          <Grid.Column>
            5v5 Casuals:
            <div style={{ float: "right" }}>{player.played_casual_5v5}×</div>
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
);

const MatchCard = ({ match, participant }) => (
  <Card link fluid>
    <Card.Content>
      <Card.Header>
        {participant.won} {match.gameMode}
      </Card.Header>
      <Card.Meta>Level: </Card.Meta>
      <Label>label</Label>
      <Image
        style={{ height: "30px" }}
        spaced
        src={"http://x.vainglory.eu/vg_extension2/assets/img/karma/c/1.png"}
      />
    </Card.Content>
    <Card.Content>
      <strong>Experience:</strong>
      <Grid columns="equal">
        <Grid.Row>
          <Grid.Column>
            5v5 Casuals:
            <div style={{ float: "right" }}>×</div>
            <br />
            BRAWL Games:
            <div style={{ float: "right" }}>×</div>
          </Grid.Column>
          <Grid.Column>
            3v3 Casuals:
            <div style={{ float: "right" }}>x</div>
            <br />
            3v3 Rankeds:
            <div style={{ float: "right" }}>×</div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Card.Content>
  </Card>
);

const MatchesSidebar = ({
  playerId,
  matches,
  sidebarVisible,
  toggleSidebar
}) => (
  <Sidebar
    as={Menu}
    animation="push"
    width="wide"
    visible={sidebarVisible}
    icon="labeled"
    style={{ maxWidth: "100vw" }}
    inverted
    vertical
  >
    <Menu.Item>
      <Button onClick={toggleSidebar}>Close</Button>
    </Menu.Item>
    {matches.map(match => {
      const participant = identifyPlayerInTheMatch(playerId, match);

      return (
        <Menu.Item key={match.id}>
          <Link as={`/match/${match.id}`} href={`/match?id=${match.id}`}>
            <MatchCard match={match} participant={participant} />
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
  render() {
    return (
      <Layout>
        <Sidebar.Pushable style={{ minHeight: "100vh" }}>
          <MatchesSidebar
            playerId={this.state.data.player.id}
            matches={this.state.data.matches}
            sidebarVisible={this.state.sidebarVisible}
            toggleSidebar={this.toggleSidebar}
          />
          <Sidebar.Pusher dimmed={this.state.sidebarVisible}>
            <Segment basic>
              <InputPanel />
              <Player player={this.state.data.player} />
              <Button onClick={this.toggleSidebar}>Matches</Button>
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

const identifyPlayerInTheMatch = (playerId, match) => {
  for (var rosterIndex = 0; rosterIndex < match.rosters.length; rosterIndex++) {
    for (
      var participantIndex = 0;
      participantIndex < match.rosters[rosterIndex].participants.length;
      participantIndex++
    ) {
      if (
        match.rosters[rosterIndex].participants[participantIndex].player.id ===
        playerId
      ) {
        return {
          data: match.rosters[rosterIndex].participants[participantIndex],
          won: match.rosters[rosterIndex].won
        };
      }
    }
  }
};
