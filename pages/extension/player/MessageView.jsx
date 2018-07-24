import React from "react";
import PropTypes from "prop-types";
import { Segment, Message, Icon } from "semantic-ui-react";
import Link from "next/link";
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
          "Welcome to VAIN.ZONE Beta! Type your nick in the box above and hit Enter."
        )}
      </div>
    </Segment>
  );
}

MessageLayout.propTypes = propTypes;
MessageLayout.defualtProps = {
  errorType: "",
  browserView: false
};
