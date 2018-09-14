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
      <React.Fragment>
        If you have a minute, please tell me about this{" "}
        <a
          target="_blank"
          href="https://discord.gg/wDYKFaS"
          style={{ color: "black" }}
        >
          on Discord (wDYKFaS)
        </a>!
      </React.Fragment>
    ];
  }
  console.log(browserView);
  return (
    <Segment basic>
      {browserView && (
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
      )}
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
      {browserView && <News />}
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
            if (!n._links["wp:featuredmedia"]) {
              return "https://jd3sljkvzi-flywheel.netdna-ssl.com/wp-content/themes/vainglory/images/logo.png";
            }
            return axios(
              `https://cors-anywhere.herokuapp.com/${
                n._links["wp:featuredmedia"][0].href
              }`
            )
              .then(f => f.data.guid.rendered)
              .catch(
                e =>
                  "https://jd3sljkvzi-flywheel.netdna-ssl.com/wp-content/themes/vainglory/images/logo.png"
              );
          })
        );
      })
      .then(featuredImagesData => {
        this.setState({
          featuredImages: featuredImagesData
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
  render() {
    try {
      return (
        <div style={{ margin: "120px 0px 40px 0px", textAlign: "center" }}>
          <h2>Favorite Projects</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              flexWrap: "wrap",
              margin: "auto",
              marginBottom: "110px"
            }}
          >
            <Link href="/guild">
              <div
                {...css({
                  width: "320px",
                  padding: "20px",
                  borderRadius: "20px",
                  margin: "10px",
                  background: "linear-gradient(to left, #f12711, #f5af19)",
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
                  Weekly Fame Tracker
                </h3>
                <small>Sample & Application Form</small>
              </div>
            </Link>
            <a
              target="_blank"
              href="https://m.me/VAIN.ZONE"
              {...css({
                width: "320px",
                padding: "20px",
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
              <small>@VAIN.ZONE</small>
            </a>
            <a
              target="_blank"
              href="/draft"
              {...css({
                width: "320px",
                padding: "20px",
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
              <small>VAIN.ZONE/draft</small>
            </a>
            <a
              target="_blank"
              href="https://vainglory.eu"
              {...css({
                width: "320px",
                padding: "20px",
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
              <small>Vainglory.eu</small>
            </a>
            <a
              target="_blank"
              href="https://discord.gg/wDYKFaS"
              {...css({
                width: "320px",
                padding: "20px",
                borderRadius: "20px",
                margin: "10px",
                background:
                  "linear-gradient(to right, HSLA(226, 47%, 63%, 1.00), HSLA(227, 48%, 54%, 1.00))",
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
                Discord Server
              </h3>
              <small>wDYKFaS</small>
            </a>
          </div>
          {this.state.news.length === 0 ? (
            "..."
          ) : (
            <React.Fragment>
              <h2>
                News from{" "}
                <a href="https://www.vainglorygame.com/news" target="_blank">
                  vainglorygame.com
                </a>
              </h2>
              <Card.Group centered itemsPerRow={5} doubling stackable>
                {this.state.news.map((n, i) => (
                  <Card
                    href={n.link}
                    target="_blank"
                    link
                    style={{ background: "HSLA(211, 11%, 22%, 1.00)" }}
                    key={n.link}
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
                      <Icon name="globe" />
                      vainglorygame.com
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
