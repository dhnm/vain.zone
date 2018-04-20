import Layout from "./../../../components/ExtensionLayout";
import Link from "next/link";
import axios from "axios";
import * as moment from "moment";
import Router from "next/router";
import html2canvas from "html2canvas";

const {
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
} = require("semantic-ui-react");

class InputPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            IGNInput: "",
            appLoading: props.appLoading
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleInputChange(event) {
        // const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        this.setState({
            [event.target.id]: event.target.value
        });
    }
    handleSubmit(event) {
        event.preventDefault();
        //window.location.href = "/extension/player/" + this.state.IGNInput;
        Router.push(
            "/extension/player?error=false&extension=false&IGN=" +
                this.state.IGNInput,
            "/extension/player/" + this.state.IGNInput,
            { shallow: false }
        );
    }
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

function SkillTierPopup({ rankPoints, mode }) {
    const processedRankPoints = (rawRankPoints => {
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
            2800
        ];
        let rankProgress = 0.0;
        for (let i = 1; i < rankPointLimits.length; i++) {
            if (
                rawRankPoints >= rankPointLimits[i - 1] &&
                rawRankPoints < rankPointLimits[i]
            ) {
                rankProgress =
                    (rawRankPoints - rankPointLimits[i - 1]) /
                    (rankPointLimits[i] - 1 - rankPointLimits[i - 1]);
                return {
                    value: rawRankPoints,
                    progress: rankProgress * 100,
                    skillTier: i - 1
                };
            }
            if (
                i == rankPointLimits.length - 1 &&
                rawRankPoints >= rankPointLimits[rankPointLimits.length - 1]
            ) {
                rankProgress = 1;
                return {
                    value: rawRankPoints,
                    progress: rankProgress * 100,
                    skillTier: i
                };
            }
        }
    })(rankPoints);

    const skillTierFormats = (rawSkillTier => {
        let tierNumber = Math.floor(rawSkillTier / 3) + 1;
        let tierName = "";
        const colorNumber = rawSkillTier % 3;
        let colorName = "";
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
    })(processedRankPoints.skillTier);

    return (
        <Popup
            trigger={
                <div style={{ float: "right", position: "relative" }}>
                    <Image
                        size="tiny"
                        src={`/static/img/rank/c/${
                            skillTierFormats.number
                        }%20${skillTierFormats.color.trim()}.png`}
                        style={{
                            margin: 0,
                            marginBottom: "-7px",
                            marginRight: "5px"
                        }}
                    />
                    <strong
                        style={{
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            marginLeft: "-24px"
                        }}
                    >
                        {mode}
                    </strong>
                </div>
            }
        >
            <Popup.Header>
                {skillTierFormats.name}
                {skillTierFormats.color}
            </Popup.Header>
            <Progress percent={processedRankPoints.progress} size="tiny">
                {processedRankPoints.value.toFixed(2)}
            </Progress>
        </Popup>
    );
}

class PlayerDetailView extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const player = this.props.player;
        let experienceHours =
            (player.played_casual_5v5 * 22 +
                player.played_aral * 10 +
                player.played_blitz * 5 +
                player.played_casual * 18 +
                player.played_ranked * 22) /
            60;
        if (player.patchVersion == "3.2") {
            experienceHours += player.played_ranked_5v5 * 28 / 60;
        }
        const addictivenessRatingDict = {
            "0": "",
            "20": "There’s a new sheriff in town.",
            "40": "Lacks match practice.",
            "80": "This is quite fun.",
            "120": "Promising star.",
            "160": "I’m just getting started.",
            "240":
                "Remember, eating gives you the strength to keep on playing.",
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
                addictivenessRatingDictKeys[
                    addictivenessRatingDictKeys.length - 1
                ]
            ) {
                addictivenessRating =
                    addictivenessRatingDict[
                        addictivenessRatingDictKeys[
                            addictivenessRatingDictKeys.length - 1
                        ]
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
                                mode="3v3"
                            />
                            {(() => {
                                if (player.patchVersion == "3.2")
                                    return (
                                        <SkillTierPopup
                                            skillTier={player.skillTier}
                                            rankPoints={player.rank_5v5}
                                            mode="5v5"
                                        />
                                    );
                            })()}
                            <Card.Header>{player.name}</Card.Header>
                            <Card.Meta>{"Level: " + player.level}</Card.Meta>
                            <Label content={player.shardId.toUpperCase()} />
                            {(() => {
                                if (player.guildTag)
                                    return <Label content={player.guildTag} />;
                            })()}
                            <Image
                                style={{ height: "30px" }}
                                spaced
                                src={
                                    "/static/img/karma/c/" +
                                    player.karmaLevel +
                                    ".png"
                                }
                            />
                        </Card.Content>
                        <Card.Content>
                            <Grid columns={2}>
                                <Grid.Row style={{ paddingBottom: 0 }}>
                                    <Grid.Column
                                        width={16}
                                        style={{ textAlign: "center" }}
                                    >
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
                                        {(() => {
                                            if (player.patchVersion == "3.2") {
                                                return (
                                                    <div>
                                                        5v5 Rankeds:
                                                        <div
                                                            style={{
                                                                float: "right"
                                                            }}
                                                        >
                                                            {
                                                                player.played_ranked_5v5
                                                            }×
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div>
                                                    BRAWL Games:
                                                    <div
                                                        style={{
                                                            float: "right"
                                                        }}
                                                    >
                                                        {player.played_aral +
                                                            player.played_blitz}×
                                                    </div>
                                                </div>
                                            );
                                        })()}
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
    const humanGameMode = converter({
        gameMode: match.gameMode
    }).humanGameMode();
    const humanDuration = converter({
        duration: match.duration
    }).humanDuration();
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
                    {moment(match.createdAt).fromNow()} | {humanDuration}min
                    game
                </Card.Meta>
            </Card.Content>
            <Card.Content style={{ color: "black" }}>
                <Grid columns="equal">
                    <Grid.Row>
                        <Grid.Column
                            style={{ margin: "auto", padding: "0 0.5rem" }}
                        >
                            <div style={{ margin: "auto" }}>
                                {match.rosters[0].participants.map(
                                    (participant, index) => {
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
                                    }
                                )}
                                <br />
                                vs<br />
                                {match.rosters[1].participants.map(
                                    (participant, index) => {
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
                                    }
                                )}
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
                                <strong>{kdaPerTenMinutes.toFixed(1)}</strong>{" "}
                                KDA Score
                                <br />
                                <strong>{goldPerMinute.toFixed(0)}</strong>{" "}
                                Gold/min
                                <br />
                                {items.map((item, index) => {
                                    return (
                                        <Image
                                            avatar
                                            src={
                                                "/static/img/items/c/" +
                                                item
                                                    .replace(/ /g, "-")
                                                    .toLowerCase() +
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
                rosters: match.rosters
            }).identifyPlayerInTheMatch();
            return (
                <Menu.Item
                    key={match.matchID}
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
        const matchDuration = this.props.matchDuration,
            participant = this.props.participant,
            side = this.props.side,
            maxParticipantValues = this.props.maxParticipantValues,
            telemetryLoading = this.props.telemetryLoading,
            highestDamage = this.props.highestDamage,
            totalDamage = this.props.damage,
            playerInTheMatch = this.props.playerInTheMatch;
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
                (participant.kills + participant.assists) /
                (matchDuration / 600);
        }
        var cardBg = "white";
        if (participant.player.id === playerInTheMatch.player.id) {
            cardBg = "#f6f6f6";
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
                <Card
                    link
                    fluid
                    style={{
                        margin: "3px 1px 3px 0",
                        color: "black",
                        backgroundColor: cardBg
                    }}
                >
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
                            {participant.kills}/{participant.deaths}/{
                                participant.assists
                            }{" "}
                            <span
                                style={{
                                    float: { right: "left", left: "right" }[
                                        side
                                    ]
                                }}
                            >
                                {"(" + kdaPerTenMinutes.toFixed(1) + ")"}
                            </span>
                        </div>
                        <Grid
                            style={{ margin: 0, marginBottom: "2px" }}
                            columns={6}
                        >
                            <Grid.Row style={{ padding: 0 }}>
                                {items.map((item, index) => {
                                    return (
                                        <Grid.Column
                                            key={"participantcard" + index}
                                            style={{
                                                padding: 0,
                                                textAlign: "center"
                                            }}
                                        >
                                            <Image
                                                fluid
                                                src={
                                                    "/static/img/items/c/" +
                                                    item
                                                        .replace(/ /g, "-")
                                                        .toLowerCase() +
                                                    ".png?index=" +
                                                    index
                                                }
                                                style={{
                                                    maxWidth: "3.5rem",
                                                    margin: "0"
                                                }}
                                                key={
                                                    "participantcard" +
                                                    item +
                                                    index
                                                }
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
                                    {(
                                        participant.gold /
                                        (matchDuration / 60)
                                    ).toFixed(0)}
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
                                    {(
                                        participant.farm /
                                        (matchDuration / 60)
                                    ).toFixed(2)}
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
                                    {(
                                        totalDamage /
                                        (matchDuration / 60)
                                    ).toFixed(0)}
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
            TLData = this.props.TLData,
            telemetryLoading = this.props.telemetryLoading;
        const maxParticipantValues = converter({
            rosters: match.rosters
        }).getMaxParticipantValues();
        const { playerInTheMatch } = converter({
            rosters: match.rosters
        }).identifyPlayerInTheMatch();
        return (
            <Segment
                id="matchDetailView"
                style={{
                    paddingTop: "1.6rem",
                    paddingLeft: "0.5em",
                    paddingRight: "0.5em"
                }}
                attached="top"
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
                    {converter({
                        duration: match.duration
                    }).humanDuration() + "min"}
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
                        style={{
                            width: "90px",
                            textAlign: "center",
                            float: "left"
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
                        {match.rosters[0].heroKills} ⚔️{
                            match.rosters[1].heroKills
                        }
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
                                💰&zwj;{match.rosters[0].gold} 🃏&zwj;{
                                    match.rosters[0].acesEarned
                                }{" "}
                                🐲&zwj;{match.rosters[0].krakenCaptures} 🗼&zwj;{
                                    match.rosters[0].turretKills
                                }
                                <br />
                                {TLData.banData.rosters[0].map(b => (
                                    <Label image style={{ margin: "0.2rem 0" }}>
                                        <Image
                                            src={`/static/img/heroes/c/${b.toLowerCase()}.jpg`}
                                        />BAN
                                    </Label>
                                ))}
                            </Grid.Column>
                            <Grid.Column textAlign="right" style={{}}>
                                💰&zwj;{match.rosters[1].gold} 🃏&zwj;{
                                    match.rosters[1].acesEarned
                                }{" "}
                                🐲&zwj;{match.rosters[1].krakenCaptures} 🗼&zwj;{
                                    match.rosters[1].turretKills
                                }
                                <br />
                                {TLData.banData.rosters[1].map(b => (
                                    <Label image style={{ margin: "0.2rem 0" }}>
                                        <Image
                                            src={`/static/img/heroes/c/${b.toLowerCase()}.jpg`}
                                        />BAN
                                    </Label>
                                ))}
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row
                            style={{
                                paddingTop: "0.1rem",
                                paddingBottom: "0"
                            }}
                        >
                            <Grid.Column
                                textAlign="left"
                                style={{ paddingRight: "0.1em" }}
                            >
                                {match.rosters[0].participants.map(
                                    (participant, index) => (
                                        <ParticipantCard
                                            playerInTheMatch={playerInTheMatch}
                                            matchDuration={match.duration}
                                            participant={participant}
                                            gameMode={match.gameMode}
                                            maxParticipantValues={
                                                maxParticipantValues
                                            }
                                            side={"left"}
                                            key={index}
                                            telemetryLoading={telemetryLoading}
                                            damage={
                                                TLData.damageData.rosters[0][
                                                    participant.actor
                                                ]
                                            }
                                            highestDamage={
                                                TLData.damageData.highest
                                            }
                                        />
                                    )
                                )}
                            </Grid.Column>
                            <Grid.Column
                                textAlign="right"
                                style={{ paddingLeft: "0.1em" }}
                            >
                                {match.rosters[1].participants.map(
                                    (participant, index) => (
                                        <ParticipantCard
                                            playerInTheMatch={playerInTheMatch}
                                            matchDuration={match.duration}
                                            participant={participant}
                                            gameMode={match.gameMode}
                                            maxParticipantValues={
                                                maxParticipantValues
                                            }
                                            side={"right"}
                                            key={index}
                                            telemetryLoading={telemetryLoading}
                                            damage={
                                                TLData.damageData.rosters[1][
                                                    participant.actor
                                                ]
                                            }
                                            highestDamage={
                                                TLData.damageData.highest
                                            }
                                        />
                                    )
                                )}
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{ padding: "0 0.4em 0.1rem 0.4em" }}>
                            <Grid.Column width={16}>
                                {match.spectators.map(spectator => (
                                    <Link
                                        prefetch
                                        href={
                                            "/extension/player?error=false&extension=false&IGN=" +
                                            spectator.name
                                        }
                                        as={
                                            "/extension/player/" +
                                            spectator.name
                                        }
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
        );
    }
}
class MainLayout extends React.Component {
    constructor(props) {
        super(props);
        this.identifyExtensionUser = this.identifyExtensionUser.bind(this);
        this.generateImage = this.generateImage.bind(this);
    }
    componentDidMount() {
        const FBLoaded = () => {
            if (this.props.extension) {
                this.identifyExtensionUser()
                    .then(IGN => {
                        Router.replace(
                            "/extension/player?error=false&extension=false&IGN=" +
                                IGN,
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
    identifyExtensionUser() {
        const genericUsername = "L3oN";
        return new Promise((resolve, reject) => {
            MessengerExtensions.getContext(
                "617200295335676",
                thread_context => {
                    var psid = thread_context.psid;
                    axios({
                        method: "get",
                        url: "/api/botuser",
                        params: {
                            psid: psid
                        }
                    })
                        .then(res => {
                            return res.data;
                        })
                        .then(user => {
                            if (user.currentUser) {
                                //document.getElementById("FBButton").style.display = "inline-block";
                                if (user.defaultIGN) {
                                    resolve(user.defaultIGN);
                                } else {
                                    resolve(genericUsername);
                                }
                            } else {
                                reject(
                                    "User has not yet interacted with the bot."
                                );
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
    }
    generateImage(elementId) {
        html2canvas(document.getElementById(elementId), {
            backgroundColor: null
        })
            .then(canvas => {
                const imgBase64 = canvas.toDataURL("image/png");
                const image_data = atob(imgBase64.split(",")[1]);
                const arraybuffer = new ArrayBuffer(image_data.length);
                const view = new Uint8Array(arraybuffer);
                for (var i = 0; i < image_data.length; i++) {
                    view[i] = image_data.charCodeAt(i);
                }
                return new Blob([view], { type: "image/png" });
            })
            .then(blob => {
                const formData = new FormData();
                formData.append("blob", blob, {
                    filename: "image.png"
                });
                return new Promise((resolve, reject) => {
                    axios({
                        method: "post",
                        url: "/api/uploadtofb",
                        data: formData,
                        headers: formData.getHeaders()
                    })
                        .then(res => {
                            return res.data;
                        })
                        .then(resJson => {
                            if (resJson.error) {
                                return Promise.reject("Error uploading to FB");
                            } else {
                                console.log(resJson);
                                resolve(resJson.attachmentId);
                            }
                        })
                        .catch(err => {
                            document.getElementById("debugConsole").value +=
                                "\nerror uploading image " + err;
                            reject(err);
                        });
                });
            })
            .then(attachmentId => {
                let message = {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "media",
                            elements: [
                                {
                                    media_type: "image",
                                    attachment_id: attachmentId,
                                    buttons: [
                                        {
                                            type: "web_url",
                                            webview_share_button: "hide",
                                            url: window.location.href,
                                            title: "Open",
                                            webview_height_ratio: "full",
                                            messenger_extensions: true
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                };
                MessengerExtensions.beginShareFlow(
                    function(share_response) {
                        // User dismissed without error, but did they share the message?
                        // if (share_response.is_sent) {
                        //   // The user actually did share.
                        //   // Perhaps close the window w/ requestCloseBrowser().
                        //   MessengerExtensions.requestCloseBrowser(
                        //     function success() {
                        //       console.log("vebview closed");
                        //     },
                        //     function error(err) {
                        //       document.getElementById("debugConsole").value += "\n" + err;
                        //     }
                        //   );
                        // } else {
                        //   document.getElementById("debugConsole").value += "\nNeodesláno";
                        //   // handle not send here
                        // }
                    },
                    function(errorCode, errorMessage) {
                        document.getElementById("debugConsole").value +=
                            "\nError opening share window: " +
                            errorCode +
                            " " +
                            errorMessage;
                        alert(
                            "Error! Please contact the developers." +
                                errorCode +
                                " " +
                                errorMessage
                        );
                        // handle error in ui here
                    },
                    message,
                    "broadcast"
                );
            })
            .catch(err => {
                document.getElementById("debugConsole").value +=
                    "\nError L " + err;
                alert("Error! Please notify the developers. " + err);
            });
    }
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
                        playerId={this.props.data.player.playerID}
                        matches={this.props.data.matches}
                        sidebarVisible={this.props.sidebarVisible}
                        toggleSidebar={this.props.toggleSidebar}
                        converter={this.props.converter}
                        setSelectedMatch={this.props.setSelectedMatch}
                    />
                    <Sidebar.Pusher dimmed={this.props.sidebarVisible}>
                        <Segment basic>
                            <InputPanel appLoading={this.props.appLoading} />
                            <PlayerDetailView player={this.props.data.player} />
                            <Button.Group attached="bottom">
                                <Button
                                    onClick={e =>
                                        this.generateImage("playerDetailView")
                                    }
                                >
                                    <Icon name="send" />Send Image{" "}
                                    <Label color="yellow">Beta</Label>
                                </Button>
                                <Button onClick={this.props.toggleSidebar}>
                                    <Icon name="sidebar" /> Matches
                                </Button>
                            </Button.Group>
                            <textarea
                                id="debugConsole"
                                style={{
                                    width: "100%",
                                    height: "120px",
                                    display: "none"
                                }}
                                value="Debugging"
                                readOnly
                            />
                            <MatchDetailView
                                match={
                                    this.props.data.matches[
                                        this.props.selectedMatch
                                    ]
                                }
                                converter={this.props.converter}
                                TLData={this.props.TLData}
                                telemetryLoading={this.props.telemetryLoading}
                            />
                            <Button
                                onClick={e =>
                                    this.generateImage("matchDetailView")
                                }
                                attached="bottom"
                            >
                                <Icon name="send" />Send Image{" "}
                                <Label color="yellow">Beta</Label>
                            </Button>
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
                <InputPanel
                    appLoading={appLoading}
                    appLoadingOn={appLoadingOn}
                />
                <Segment>
                    <p>We couldn't find anything :(</p>
                    <ol>
                        <li>
                            Please check the spelling and capitalisation of the
                            nick.
                        </li>
                        <li>If the player hasn't played this mode</li>
                        for a long time, we don't have data for them.
                        <li>Maybe the player has changed their nick?</li>
                        <li>
                            There might also be an issue in our data source
                            (SEMC). In that case, please try again in 2 minutes.
                        </li>
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
            TLData: props.TLData,
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
            TLData: nextProps.TLData,
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
        this.setState({ telemetryLoading: true });
        const that = this;
        axios({
            method: "get",
            url: "/api/telemetry",
            params: {
                match: this.state.data.matches[index]
            }
        })
            .then(res => {
                return res.data;
            })
            .then(processedTelemetry => {
                that.setState({
                    selectedMatch: index,
                    TLData: processedTelemetry,
                    telemetryLoading: false
                });
            })
            .catch(err => {
                that.setState({ telemetryLoading: false });
                alert("Error retrieving telemetry data.");
                console.log(err);
            });
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
                        participantIndex <
                        data.rosters[rosterIndex].participants.length;
                        participantIndex++
                    ) {
                        if (
                            data.rosters[rosterIndex].participants[
                                participantIndex
                            ].player.id === this.state.data.player.playerID
                        ) {
                            return {
                                playerInTheMatch:
                                    data.rosters[rosterIndex].participants[
                                        participantIndex
                                    ],
                                playerInTheMatchWon:
                                    data.rosters[rosterIndex].won
                            };
                        }
                    }
                }
            },
            shortMatchConclusion: () => {
                if (
                    data.shortMatchConclusion ||
                    data.shortMatchConclusion == "true"
                ) {
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
                if (data.rosterWon || data.rosterWon == "true") {
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
                    "5v5_pvp_ranked": [
                        "Sovereign's Rise Ranked",
                        false,
                        "5v5ranked"
                    ],
                    "5v5_pvp_casual": [
                        "Sovereign's Rise Casual",
                        false,
                        "5v5casual"
                    ],
                    private_party_draft_match_5v5: [
                        "Sovereign's Rise Private Draft",
                        true,
                        "5v5ranked"
                    ],
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
                var time =
                    parseInt(data.duration / 60) + ":" + data.duration % 60;
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
                        participantIndex <
                        data.rosters[rosterIndex].participants.length;
                        participantIndex++
                    ) {
                        goldArray.push(
                            data.rosters[rosterIndex].participants[
                                participantIndex
                            ].gold
                        );
                        farmArray.push(
                            data.rosters[rosterIndex].participants[
                                participantIndex
                            ].farm
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
                TLData={this.state.TLData}
                telemetryLoading={this.state.telemetryLoading}
                extension={this.props.extension}
                appLoading={this.state.appLoading}
                appLoadingOn={this.appLoadingOn}
            />
        );
    }
}

export default Extension;

Extension.getInitialProps = async function(context) {
    try {
        const query = context.query;
        let urlPath = "https://test.vainglory.eu";
        if (process.env.NODE_ENV !== "production") {
            urlPath = "http://localhost:3000";
        }
        if (!JSON.parse(query.error)) {
            if (!JSON.parse(query.extension)) {
                const requestMatches = await axios({
                    method: "get",
                    url: urlPath + "/api/matches",
                    params: {
                        IGN: query.IGN
                    }
                });
                const data = await requestMatches.data;
                
                if (data.error) {
                    console.log(JSON.stringify(data));
                    return {
                        data: null,
                        TLData: null,
                        extension: false,
                        error: true
                    };
                }
                const requestProcessedTelemetry = await axios({
                    method: "get",
                    url: urlPath + "/api/telemetry",
                    params: {
                        match: data.matches[0]
                    }
                });
                const processedTelemetry = await requestProcessedTelemetry.data;
                return {
                    data: data,
                    TLData: processedTelemetry,
                    extension: false,
                    error: false
                };
            } else {
                return {
                    data: null,
                    TLData: null,
                    extension: true,
                    error: false
                };
            }
        } else {
            return {
                data: null,
                TLData: null,
                extension: false,
                error: true,
                errorMessage: query.errorMessage
            };
        }
    } catch (err) {
        return {
            data: null,
            TLData: null,
            extension: false,
            error: true,
            errorMessage: err
        };
    }
};
