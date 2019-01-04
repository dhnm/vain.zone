import React from "react";
import axios from "axios";
import { Message, Form, Button, Icon } from "semantic-ui-react";
import Link from "next/link";

import Head from "./../../page_components/guild/Head";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

class GuildEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      guildName: this.props.guildName,
      guildTag: this.props.guildTag,
      changeContact: false,
      contact: "",
      guildMembers: this.props.guildMembers
        ? this.props.guildMembers.sort().join("\n")
        : "",
      key: "",

      formLoading: false,
      formSuccess: false,
      formError: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(_, { name, value, type, checked }) {
    this.setState({
      [name]: type === "checkbox" ? checked : value
    });
  }
  handleSubmit(event) {
    event.preventDefault();
    if (this.state.formSuccess) {
      return;
    }
    const formData = {
      name: this.state.guildName.trim(),
      tag: this.state.guildTag.trim(),
      key: this.state.key
    };
    const members = this.state.guildMembers.split("\n");
    if (members.length > 50) {
      this.setState({
        formError: 50,
        formLoading: false,
        formSuccess: false
      });
      return;
    } else {
      formData.members = members;
    }
    if (this.state.changeContact) {
      formData.contact = this.state.contact.trim();
    }
    this.setState({ formLoading: true }, () => {
      axios
        .post("/api/fame/edit", { guildID: this.props.guildID, data: formData })
        .then(response => {
          if (response.data.error) {
            this.setState({
              formError: response.data.message,
              formLoading: false,
              formSuccess: false
            });
          } else {
            this.setState({
              formSuccess: true,
              formError: false,
              formLoading: false
            });
          }
        })
        .catch(err => {
          console.error("teza", err);
          this.setState({
            formError: true,
            formSuccess: false,
            formLoading: false
          });
        });
    });
  }
  render() {
    if (this.props.error) {
      return (
        <div>
          <p>Access denied.</p>
          <p>
            <Link href="/extension/player?browserView=true" as="/">
              <a>Go back to homepage</a>
            </Link>
          </p>
        </div>
      );
    }
    return (
      <div id="container">
        <Head />
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
        <h1>Editing {this.state.guildName || "Guild"}</h1>
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
              style={{ fontSize: "16px" }}
              maxLength={25}
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
              style={{ fontSize: "16px" }}
              maxLength={4}
              type="text"
              name="guildTag"
              value={this.state.guildTag}
              onChange={this.handleChange}
              required
            />
          </Form.Field>
          <Form.Field>
            <Form.Checkbox
              style={{ fontSize: "16px" }}
              label="Change contact information"
              name="changeContact"
              toggle
              checked={this.state.changeContact}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <label>New contact (E-mail/Twitter/Discord/...)</label>
            <Form.Input
              style={{ fontSize: "16px" }}
              maxLength={50}
              type="text"
              name="contact"
              value={this.state.contact}
              onChange={this.handleChange}
              disabled={!this.state.changeContact}
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Guild Members (one per line)</label>
            <Form.TextArea
              style={{ fontSize: "16px" }}
              maxLength={1400}
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
          <Form.Field>
            <label>Password</label>
            <Form.Input
              style={{ fontSize: "16px" }}
              maxLength={90}
              type="password"
              name="key"
              value={this.state.key}
              onChange={this.handleChange}
              required
            />
          </Form.Field>
          <Message success>
            <Message.Header>Success!</Message.Header>
            <Message.Content>
              Your changes are saved and will be displayed latest on the next
              update term.
            </Message.Content>
          </Message>
          <Message error>
            <Message.Header>Error!</Message.Header>
            <Message.Content>
              {this.state.formError === 50 && (
                <React.Fragment>
                  Your guild can't have more than 50 members.
                </React.Fragment>
              )}
              {this.state.formError === 401 && (
                <React.Fragment>Wrong password.</React.Fragment>
              )}
              {this.state.formError === 404 && (
                <React.Fragment>
                  Guild not found. Please message us on our{" "}
                  <a
                    target="_blank"
                    href={`https://discord.gg/${
                      publicRuntimeConfig.discordInviteCode
                    }`}
                  >
                    Discord Server ({publicRuntimeConfig.discordInviteCode})
                  </a>{" "}
                  or try again later.
                </React.Fragment>
              )}
              {this.state.formError !== 50 &&
                this.state.formError !== 401 &&
                this.state.formError !== 404 && (
                  <React.Fragment>
                    Something went wrong :( Please message us on our{" "}
                    <a
                      target="_blank"
                      href={`https://discord.gg/${
                        publicRuntimeConfig.discordInviteCode
                      }`}
                    >
                      Discord Server ({publicRuntimeConfig.discordInviteCode})
                    </a>{" "}
                    or try again later.
                  </React.Fragment>
                )}
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
        <br />
        <Link href={`/guild?id=${this.props.guildID}`}>
          <Button size="small">
            <Icon name="chevron left" />
            Back to Guild
          </Button>
        </Link>
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
              max-width: 414px;
              padding: 0 15px 100px 15px;
            }
          `}
        </style>
      </div>
    );
  }
}

export default GuildEdit;

GuildEdit.getInitialProps = async function getInitialProps({ query }) {
  if (query.guildID) {
    let urlPath = "https://vain.zone";
    if (process.env.NODE_ENV !== "production") {
      urlPath = "http://localhost:3000";
    }

    const requestData = await axios(
      `${urlPath}/api/fame/edit?id=${query.guildID}`
    );
    const data = await requestData.data;
    console.log(data);
    if (data.error) {
      console.error(data.message);
      return {
        error: true
      };
    }

    return {
      guildID: query.guildID,
      guildName: data.name,
      guildTag: data.tag,
      guildMembers: data.members
    };
  }

  return { error: true };
};
