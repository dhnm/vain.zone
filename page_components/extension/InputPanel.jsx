import React from "react";
import PropTypes from "prop-types";
import Router from "next/router";
import { Form, Search } from "semantic-ui-react";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

const propTypes = {
  appLoading: PropTypes.bool.isRequired,
  browserView: PropTypes.bool.isRequired
};

export default class InputPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      IGNInput: "",
      searchFavoritesList: [],
      searchResults: []
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    // window.location.href = "${this.props.browserView ? "" : "/extension"}/player/" + this.state.IGNInput;

    this.setState({ searchResults: [] });

    Router.push(
      `${this.props.browserView ? "" : "/extension"}/player?${
        this.props.browserView ? "browserView=true&" : ""
      }${
        this.props.gloryGuide
          ? `setting=gloryguide&ui=${this.props.gloryGuide}&`
          : ""
      }error=false&extension=false&IGN=${this.state.IGNInput}`,
      `${this.props.browserView ? "" : "/extension"}/player/${
        this.state.IGNInput
      }${
        this.props.gloryGuide
          ? `?setting=gloryguide&ui=${this.props.gloryGuide}`
          : ""
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
      <Form
        onSubmit={this.handleSubmit}
        style={
          this.props.gloryGuide ? { display: "none" } : { marginBottom: "1em" }
        }
      >
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
                const fromStorage = window.localStorage.getItem("favorites");
                let searchFavorites = {
                  version: publicRuntimeConfig.storageVersion,
                  list: []
                };
                if (fromStorage) {
                  try {
                    const parsed = JSON.parse(fromStorage);
                    if (parsed.version == publicRuntimeConfig.storageVersion) {
                      searchFavorites = parsed;
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }

                searchFavorites.list = searchFavorites.list.sort(
                  (a, b) => b.count - a.count
                );

                if (
                  searchFavorites.list[0] &&
                  searchFavorites.list[0].count > 20
                ) {
                  searchFavorites.list = searchFavorites.list
                    .map(fav => {
                      fav.count = Math.round(fav.count / 1.2);
                      return fav;
                    })
                    .filter(fav => fav.count > 0);

                  window.localStorage.setItem(
                    "favorites",
                    JSON.stringify(searchFavorites)
                  );
                }

                if (this.state.IGNInput) {
                  this.setState({
                    searchFavoritesList: searchFavorites.list
                  });
                } else {
                  this.setState({
                    searchFavoritesList: searchFavorites.list,
                    searchResults: searchFavorites.list.map(({ name, id }) => ({
                      title: name,
                      id
                    }))
                  });
                }
              }
            }}
            onResultSelect={(_, { result }) => {
              this.setState({ IGNInput: result.title });
              Router.push(
                `${this.props.browserView ? "" : "/extension"}/player?${
                  this.props.browserView ? "browserView=true&" : ""
                }${
                  this.props.gloryGuide
                    ? `setting=gloryguide&ui=${this.props.gloryGuide}&`
                    : ""
                }error=false&extension=false&playerID=${result.id}`,
                `${this.props.browserView ? "" : "/extension"}/player/${
                  result.title
                }${
                  this.props.gloryGuide
                    ? `?setting=gloryguide&ui=${this.props.gloryGuide}`
                    : ""
                }`,
                { shallow: false }
              );
            }}
            onSearchChange={(_, { value }) => {
              this.setState({
                IGNInput: value,
                searchResults: this.state.searchFavoritesList.reduce(
                  (acc, { name }) => {
                    if (name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                      acc.push({ title: name });
                    }
                    return acc;
                  },
                  []
                )
              });
            }}
            minCharacters={0}
            results={this.state.searchResults.slice(0, 5)}
            showNoResults={false}
            value={this.state.IGNInput}
          />
        </Form.Field>
      </Form>
    );
  }
}

InputPanel.propTypes = propTypes;
