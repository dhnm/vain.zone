import Layout from "../components/MyLayout.js";
import Link from "next/link";
import fetch from "isomorphic-unfetch";

class InputPanel extends React.Component {
  constructor() {
    super();
    this.state = { IGNInput: "", modeSelect: "", private: false };

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
    alert(JSON.stringify(this.state));
    event.preventDefault();
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="search"
          onChange={this.handleInputChange}
          value={this.state["IGNInput"]}
          id="IGNInput"
          placeholder="In-Game Name"
          required
        />
        {JSON.stringify(this.state)}
      </form>
    );
  }
}

const Player = ({ data }) => (
  <div>
    <div>Rank</div>
    <h2>{data.name}</h2>
    <small>{data.guildTag}</small>
    <p>{data.rank}</p>
    <p>Level: {data.level}</p>
    <div>
      <h3>Played:</h3>
      <p>{data.gamesPlayed.casual_5v5}x 5v5 Casuals</p>
      <p>{data.gamesPlayed.total_3v3}x 3v3 Games</p>
    </div>
    <div>Karma</div>
  </div>
);

const Index = ({ data }) => (
  <Layout>
    <InputPanel />
    <Player data={data.player} />
    <ul>
      {data.matches.map(match => (
        <li key={match.id}>
          <Link as={`/match/${match.id}`} href={`/match?id=${match.id}`}>
            <a>{match.id}</a>
          </Link>
        </li>
      ))}
    </ul>
  </Layout>
);

Index.getInitialProps = async function() {
  //const res = await fetch('http://api.tvmaze.com/search/shows?q=batman')
  //const data = await res.json()

  return {
    data: {
      player: {
        name: "thisBoy",
        rank: "Pinnacle of Awesome Bronze",
        level: "32",
        guildTag: "BAR",
        karma: "Good Karma",
        gamesPlayed: {
          casual_5v5: 38,
          total_3v3: 3000
        }
      },
      matches: [
        {
          id: "123"
        },
        {
          id: "456"
        }
      ]
    }
  };
};

export default Index;
