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
            <Icon name="frown outline" />
            <Message.Content>
              <Message.Header>{msgHeader}</Message.Header>
              <Message.List as="ol">
                {messages.map(msg => <Message.Item content={msg} />)}
              </Message.List>
            </Message.Content>
          </Message>
        ) : (
          <React.Fragment>
            <p>
              Welcome to VAIN.ZONE Beta! Type your nick in the box above and hit
              Enter.
            </p>
            <p style={{ textAlign: "center" }}>
              NEW: Enjoy our beautiful Autumn Season 2018 update. We implemented massive behind-the-scene improvements that
              will allow us to make VAIN.ZONE even better in the future!
            </p>
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
    axios("/api/vgnews")
      .then(axiosData => axiosData.data)
      .then(news => {
        this.setState({ news });
      })
      .catch(err => {
        console.error(err);
      });
  }
  render() {
    try {
      return (
        <div style={{ margin: "115px 20px 40px 20px", textAlign: "center" }}>
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
            <a
              target="_blank"
              href="https://m.me/VAIN.ZONE"
              {...css({
                width: "320px",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
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
                  color: "hsla(0, 100%, 100%, 0.85) !important"
                }}
              >
                <Icon name="facebook messenger" />
                Facebook Messenger Extension
              </h3>
              <small>@VAIN.ZONE</small>
            </a>
            <a
              target="_blank"
              href="/draft"
              {...css({
                width: "320px",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
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
                  color: "hsla(0, 100%, 100%, 0.8) !important",
                  width: "100%"
                }}
              >
                <Icon name="cubes" />
                Universal Draft Builder
              </h3>
              <small>VAIN.ZONE/draft</small>
            </a>
            <Link href="/guild">
              <div
                {...css({
                  width: "320px",
                  height: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
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
                    color: "hsla(0, 100%, 100%, 0.85) !important"
                  }}
                >
                  <Icon name="calculator" />
                  Weekly Fame Tracker
                </h3>
                <small>Sample & Application Form</small>
              </div>
            </Link>
            <a
              target="_blank"
              href="https://vainglory.eu"
              {...css({
                width: "320px",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
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
                  color: "hsla(0, 100%, 100%, 0.85) !important"
                }}
              >
                <Icon name="group" />
                Czech and Slovak Community
              </h3>
              <small>Vainglory.eu</small>
            </a>
            <a
              target="_blank"
              href="https://twitter.com/VAINZONE_vg"
              {...css({
                width: "320px",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                padding: "20px",
                borderRadius: "20px",
                margin: "10px",
                background:
                  "linear-gradient(to left, HSLA(202, 88%, 62%, 1.00), HSLA(203, 89%, 53%, 1.00))",
                cursor: "pointer",
                transition: "100ms linear",
                ":hover": {
                  transform: "translateY(-3px)"
                }
              })}
            >
              <h3
                style={{
                  color: "hsla(0, 100%, 100%, 0.85) !important"
                }}
              >
                <Icon name="twitter" />
                Official Twitter
              </h3>
              <small>@VAINZONE_vg</small>
            </a>
            <a
              target="_blank"
              href="https://discord.gg/wDYKFaS"
              {...css({
                width: "320px",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
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
                  color: "hsla(0, 100%, 100%, 0.85) !important"
                }}
              >
                <Icon name="discord" />
                Discord Server
              </h3>
              <small>wDYKFaS</small>
            </a>
          </div>
          {this.state.news.length === 0 ? (
            <div />
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
                    <Card.Content
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Card.Header>
                        <h4>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: n.title
                            }}
                          />
                        </h4>
                      </Card.Header>
                      {/*<Card.Meta>
                                              <span className="date">
                                                {moment(n.date_gmt).format("MMMM D")}
                                              </span>
                                            </Card.Meta>*/}
                      <Card.Description>
                        <Image
                          src={n.featuredImage}
                          style={{ borderRadius: "12px" }}
                        />
                        {/*<div
                                                  dangerouslySetInnerHTML={{
                                                    __html: n.excerpt.rendered.substring(0, 120)
                                                  }}
                                                />&hellip;*/}
                      </Card.Description>
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