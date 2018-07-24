import React from "react";
import PropTypes from "prop-types";
import { Segment, Message, Icon, Card, Image } from "semantic-ui-react";
import Link from "next/link";
import axios from "axios";
import { css } from "glamor";
import * as moment from "moment";

import InputPanel from "./InputPanel";

const propTypes = {
  appLoading: PropTypes.bool.isRequired,
  appLoadingOn: PropTypes.func.isRequired,
  errorType: PropTypes.string,
  browserView: PropTypes.bool
};

export default function MessageLayout({
  appLoading,
  appLoadingOn,
  errorType,
  browserView
}) {
  let msgHeader = "Player not found";
  let messages = [];
  let msgColor = "yellow";

  if (["veryold"].indexOf(errorType) > -1) {
    msgHeader = "Long time no see :(";
    messages = [
      "This player hasn't played Vainglory for a long time. We don't have data for them."
    ];
  } else if (["404"].indexOf(errorType) > -1) {
    messages = [
      "Please check the spelling and capitalisation of the nick.",
      "Maybe the player has changed their nick?"
    ];
  } else if (["SEMC"].indexOf(errorType) > -1) {
    msgHeader = "Error!";
    messages = [
      "There is probably an issue with SEMC (developers of Vainglory), try again later.",
      "If you have a minute, please tell me about this! thisBoy$4399 (Discord)"
    ];
  }

  return (
    <Segment basic>
      <Link prefetch href={`/extension/player?browserView=true`} as="/">
        <img
          src="/static/img/draft/VAINZONE-logo-darkbg.png"
          alt="VAIN.ZONE"
          style={{
            width: "200px",
            display: "block",
            margin: "auto",
            marginTop: !errorType && browserView ? "10%" : null,
            marginBottom: "14px",
            cursor: "pointer"
          }}
        />
      </Link>
      <div style={{ maxWidth: "414px", margin: "auto" }}>
        <InputPanel
          appLoading={appLoading}
          appLoadingOn={appLoadingOn}
          browserView={browserView}
        />
        {errorType || !browserView ? (
          <Message color={msgColor} icon>
            <Icon name="frown" />
            <Message.Content>
              <Message.Header>{msgHeader}</Message.Header>
              <Message.List as="ol">
                {messages.map(msg => <Message.Item content={msg} />)}
              </Message.List>
            </Message.Content>
          </Message>
        ) : (
          <React.Fragment>
            Welcome to VAIN.ZONE Beta! Type your nick in the box above and hit
            Enter.
          </React.Fragment>
        )}
      </div>
      <News />
    </Segment>
  );
}

class News extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      news: [],
      featuredImages: []
    };
  }
  componentDidMount() {
    axios(
      "https://cors-anywhere.herokuapp.com/https://www.vainglorygame.com/wp-json/wp/v2/posts?per_page=5"
    )
      .then(axiosData => axiosData.data)
      .then(news => {
        this.setState({ news: news });
        return Promise.all(
          news.map(n => {
            return axios(
              `https://cors-anywhere.herokuapp.com/${
                n._links["wp:featuredmedia"][0].href
              }`
            );
          })
        );
      })
      .then(featuredImagesData => {
        this.setState({
          featuredImages: featuredImagesData.map(f => f.data.guid.rendered)
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
  render() {
    try {
      return (
        <div style={{ margin: "120px 0px 20px 0px", textAlign: "center" }}>
          <h2>Favorite Projects</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              flexWrap: "wrap",
              marginBottom: "110px"
            }}
          >
            <a target="_blank" href="//m.me/VAIN.ZONE">
              <div
                {...css({
                  width: "320px",
                  padding: "20px 30px",
                  borderRadius: "20px",
                  margin: "10px",
                  background: "linear-gradient(to right, #00c6ff, #0072ff)",
                  cursor: "pointer",
                  transition: "100ms linear",
                  boxSizing: "border-box",
                  ":hover": {
                    transform: "translateY(-3px)"
                  }
                })}
              >
                <h3
                  style={{
                    color: "white"
                  }}
                >
                  Facebook Messenger Extension
                </h3>
                <small>https://m.me/VAIN.ZONE</small>
              </div>
            </a>
            <a target="_blank" href="//vain.zone/draft">
              <div
                {...css({
                  width: "320px",
                  padding: "20px 30px",
                  borderRadius: "20px",
                  margin: "10px",
                  background: "linear-gradient(to left, #11998e, #38ef7d)",
                  cursor: "pointer",
                  transition: "100ms linear",
                  ":hover": {
                    transform: "translateY(-3px)"
                  }
                })}
              >
                <h3
                  style={{
                    color: "white",
                    width: "100%"
                  }}
                >
                  Universal Draft Tool
                </h3>
                <small>https://vain.zone/draft</small>
              </div>
            </a>
            <a target="_blank" href="//vainglory.eu">
              <div
                {...css({
                  width: "320px",
                  padding: "20px 30px",
                  borderRadius: "20px",
                  margin: "10px",
                  background: "linear-gradient(to left, #232526, #414345)",
                  cursor: "pointer",
                  transition: "100ms linear",
                  ":hover": {
                    transform: "translateY(-3px)"
                  }
                })}
              >
                <h3
                  style={{
                    color: "white"
                  }}
                >
                  Czech and Slovak Community
                </h3>
                <small>https://vainglory.eu</small>
              </div>
            </a>
          </div>
          {this.state.news.length &&
            this.state.news.length && (
              <React.Fragment>
                <h2>
                  News from{" "}
                  <a href="https://www.vainglorygame.com/news">
                    vainglorygame.com
                  </a>
                </h2>
                <Card.Group centered itemsPerRow={5} doubling stackable>
                  {this.state.news.map((n, i) => (
                    <Card
                      href={n.link}
                      link
                      style={{ background: "HSLA(211, 11%, 22%, 1.00)" }}
                    >
                      <Image src={this.state.featuredImages[i]} />
                      <Card.Content style={{ paddingBottom: 0 }}>
                        <Card.Header>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: n.title.rendered
                            }}
                          />
                        </Card.Header>
                        <Card.Meta>
                          <span className="date">
                            {moment(n.date_gmt).format("MMMM D")}
                          </span>
                        </Card.Meta>
                        <Card.Description>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: n.excerpt.rendered.substring(0, 120)
                            }}
                          />&hellip;
                        </Card.Description>
                      </Card.Content>
                      <Card.Content extra style={{ paddingTop: 0 }}>
                        <a>
                          <Icon name="globe" />
                          vainglorygame.com
                        </a>
                      </Card.Content>
                    </Card>
                  ))}
                </Card.Group>
              </React.Fragment>
            )}
        </div>
      );
    } catch (err) {
      console.error(err);
      return <React.Fragment />;
    }
  }
}

MessageLayout.propTypes = propTypes;
MessageLayout.defualtProps = {
  errorType: "",
  browserView: false
};
