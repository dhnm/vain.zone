import React from "react";
import PropTypes from "prop-types";
import Router from "next/router";
import { Form, Search } from "semantic-ui-react";

const propTypes = {
  appLoading: PropTypes.bool.isRequired,
  browserView: PropTypes.bool.isRequired
};

export default class InputPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      IGNInput: "",
      favorites: [],
      results: []
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    // window.location.href = "${this.props.browserView ? "" : "/extension"}/player/" + this.state.IGNInput;

    this.setState({ results: [] });

    Router.push(
      `/extension/player?${
        this.props.browserView ? "browserView=true&" : ""
      }error=false&extension=false&IGN=${this.state.IGNInput}`,
      `${this.props.browserView ? "" : "/extension"}/player/${
        this.state.IGNInput
      }`,
      { shallow: false }
    );
  }
  handleInputChange(event) {
    // const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    this.setState({
      // [event.target.id]: event.target.value.trim(),
      [event.target.id]: event.target.value.replace(/\s+/g, "")
    });
  }
  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Field>
          {/* <Input
            icon={<Icon name="search" />}
            type="search"
            onChange={this.handleInputChange}
            value={this.state.IGNInput}
            id="IGNInput"
            placeholder="In-Game Name"
            required
            loading={this.props.appLoading}
          /> */}
          <Search
            placeholder="In-Game Name"
            style={{ fontSize: "16px" }}
            loading={this.props.appLoading}
            maxLength={25}
            onFocus={() => {
              if (window.localStorage) {
                const favorites = window.localStorage.getItem("favorites");

                if (favorites) {
                  const sortedFavorites = JSON.parse(favorites).sort(
                    (a, b) => b.count - a.count
                  );

                  if (this.state.IGNInput) {
                    this.setState({
                      favorites: sortedFavorites
                    });
                  } else {
                    this.setState({
                      favorites: sortedFavorites,
                      results: sortedFavorites.map(({ name }) => ({
                        title: name
                      }))
                    });
                  }
                }
              }
            }}
            onResultSelect={(_, { result }) => {
              this.setState({ IGNInput: result.title });
              Router.push(
                `${this.props.browserView ? "" : "/extension"}/player?${
                  this.props.browserView ? "" : "browserView=true&"
                }error=false&extension=false&IGN=${result.title}`,
                `${this.props.browserView ? "" : "/extension"}/player/${
                  result.title
                }`,
                { shallow: false }
              );
            }}
            onSearchChange={(_, { value }) => {
              this.setState({
                IGNInput: value,
                results: this.state.favorites.reduce((acc, { name }) => {
                  if (name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                    acc.push({ title: name });
                  }
                  return acc;
                }, [])
              });
            }}
            minCharacters={0}
            results={this.state.results.slice(0, 5)}
            showNoResults={false}
            value={this.state.IGNInput}
          />
        </Form.Field>
      </Form>
    );
  }
}

InputPanel.propTypes = propTypes;
