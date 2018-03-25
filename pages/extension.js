import Layout from "../components/ExtensionLayout.js";
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
    <p>{data.skillTier}</p>
    <p>Level: {data.level}</p>
    <div>
      <h3>Played:</h3>
      <p>{data.played_casual_5v5}x 5v5 Casuals</p>
      <p>{data.played_ranked + data.played_casual}x 3v3 Games</p>
    </div>
    <div>Karma: {data.karmaLevel}</div>
  </div>
);

class Extension extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data
    };
  }
  render() {
    return (
      <Layout>
        <InputPanel />
        <Player data={this.state.data.player} />
        <ul>
          {this.state.data.matches.map(match => (
            <li key={match.id}>
              <Link as={`/match/${match.id}`} href={`/match?id=${match.id}`}>
                <a>{match.id}</a>
              </Link>
            </li>
          ))}
        </ul>
        <textarea
          id="console"
          defaultValue={this.state.data}
          cols="50"
          rows="20"
        />
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
