import React from "react";
import axios from "axios";
import { Grid, Message, Form } from "semantic-ui-react";
import Link from "next/link";

import GuildWrapper from "./../../components/GuildWrapper";

export default class GuildApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state = { guildName: "", guildTag: "", contact: "", guildMembers: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }
  handleSubmit(event) {
    event.preventDefault();
    this.setState({ formLoading: true }, () => {
      axios
        .post("/api/fame", this.state)
        .then(response =>
          this.setState({ formSuccess: true, formLoading: false })
        )
        .catch(err => {
          console.error(err);
          this.setState({ formError: true, formLoading: false });
        });
    });
  }
  render() {
    return (
      <GuildWrapper>
        <div id="container">
          <Link prefetch href={`/extension/player?browserView=true`} as="/">
            <img
              src="/static/img/draft/VAINZONE-logo-darkbg.png"
              alt="VAIN.ZONE"
              style={{
                width: "200px",
                display: "block",
                margin: "auto",
                marginBottom: "14px",
                cursor: "pointer"
              }}
            />
          </Link>
          <h2>VAIN.ZONE Fame Tracker Beta</h2>
          <h1>Guild Application</h1>
          <Grid columns="equal" stackable>
            <Grid.Column>
              <h3>A few things you should consider before applying:</h3>

              <Message>
                <Message.Content>
                  Your guild is eligible if it has reached level 50 or higher in
                  the previous season and has at least 25 active members. We
                  might make exceptions.
                </Message.Content>
              </Message>
              <Message>
                <Message.Content>
                  The Fame Tracker tracks fame as if all players were Veterans
                  and didn't have Fame Boost. Vainglory currently doesn't
                  provide tools to track these features. Nevertheless it can
                  serve as an activity tracker and provide general insight.
                </Message.Content>
              </Message>
              <Message>
                <Message.Content>
                  Guild Members need to have their nicks at least occasionaly
                  checked on{" "}
                  <a href="https://vain.zone" target="_blank">
                    VAIN.ZONE
                  </a>{" "}
                  or{" "}
                  <a href="https://m.me/VAIN.ZONE">VAIN.ZONE Messenger Bot</a>{" "}
                  to populate the database with their matches. Anyone can check
                  any player's nick.
                </Message.Content>
              </Message>
            </Grid.Column>
            <Grid.Column>
              <Form
                action="/api/fame"
                method="post"
                onSubmit={this.handleSubmit}
                success={this.state.formSuccess}
                error={this.state.formError}
                loading={this.state.formLoading}
              >
                <Form.Field>
                  <label>Guild Name</label>
                  <Form.Input
                    type="text"
                    name="guildName"
                    value={this.state.guildName}
                    onChange={this.handleChange}
                    required
                  />
                </Form.Field>
                <Form.Field>
                  <label>Guild Tag</label>
                  <Form.Input
                    type="text"
                    name="guildTag"
                    value={this.state.guildTag}
                    onChange={this.handleChange}
                    required
                  />
                </Form.Field>
                <Form.Field>
                  <label>Contact (E-mail/Twitter/Discord/...)</label>
                  <Form.Input
                    type="text"
                    name="contact"
                    value={this.state.contact}
                    onChange={this.handleChange}
                    required
                  />
                </Form.Field>
                <Form.Field>
                  <label>Guild Members</label>
                  <Form.TextArea
                    autoHeight={true}
                    rows={9}
                    name="guildMembers"
                    value={this.state.guildMembers}
                    onChange={this.handleChange}
                    spellCheck={false}
                    data-gramm={false}
                    required
                  />
                </Form.Field>
                <Message success>
                  <Message.Header>Success!</Message.Header>
                  <Message.Content>
                    We'll reach out to you once we review your application. In
                    the meantime you can leave a message on our{" "}
                    <a target="_blank" href="https://discord.gg/wDYKFaS">
                      Discord Server (wDYKFaS)
                    </a>.
                  </Message.Content>
                </Message>
                <Message error>
                  <Message.Header>Error!</Message.Header>
                  <Message.Content>
                    Something went wrong :( Please message us on our{" "}
                    <a target="_blank" href="https://discord.gg/wDYKFaS">
                      Discord Server (wDYKFaS)
                    </a>{" "}
                    or try again later.
                  </Message.Content>
                </Message>
                {!this.state.formSuccess && (
                  <Form.Field>
                    <Form.Button
                      type="submit"
                      color="orange"
                      style={{ width: "100%" }}
                      size="big"
                    >
                      Submit
                    </Form.Button>
                  </Form.Field>
                )}
              </Form>
            </Grid.Column>
          </Grid>
          <style jsx>
            {`
              h1,
              h2,
              .small {
                text-align: center;
              }
              .small {
                font-size: 0.85rem;
              }
              #container {
                min-height: 100vh;
                margin: 40px auto;
                max-width: 768px;
                padding-bottom: 100px;
              }
              @media (max-width: 767px) {
                #container {
                  max-width: 414px;
                }
              }
            `}
          </style>
        </div>
      </GuildWrapper>
    );
  }
}
