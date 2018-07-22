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
  return (
    <Segment basic>
      <Link prefetch href={`/extension/player?browserView=true`} as="/">
        <img
          src="/static/img/draft/VAINZONE-logo-darkbg.png"
          alt="VAIN.ZONE"
          style={{
            width: "25%",
            display: "block",
            margin: "auto",
            marginTop: !errorType && browserView ? "10%" : null,
            marginBottom: "14px"
          }}
        />
      </Link>
      <InputPanel
        appLoading={appLoading}
        appLoadingOn={appLoadingOn}
        browserView={browserView}
      />
      {errorType || !browserView ? (
        <Message info icon>
          <Icon name="frown" />
          <Message.Content>
            <Message.Header>Player not found :(</Message.Header>
            <Message.List as="ol">
              {["404"].indexOf(errorType) > -1 && (
                <React.Fragment>
                  <Message.Item>
                    Please check the spelling and capitalisation of the nick.
                  </Message.Item>
                  <Message.Item>
                    Maybe the player has changed their nick?
                  </Message.Item>
                  <Message.Item>
                    If the player hasn't played a PvP match in the last 28 days,
                    we don't have data for them.
                  </Message.Item>
                </React.Fragment>
              )}
              {["general"].indexOf(errorType) > -1 && (
                <React.Fragment>
                  <Message.Item>
                    There is probably an issue with SEMC (developers of
                    Vainglory).<Message.Item>
                      You can try other API sites, such as VGPRO, vgminer or
                      VainAura.{" "}
                    </Message.Item>
                    <Message.Item>
                      If other sites are working but this site is not, please
                      contact me! thisBoy$4399 (Discord)
                    </Message.Item>
                  </Message.Item>
                </React.Fragment>
              )}
            </Message.List>
          </Message.Content>
        </Message>
      ) : (
        "Welcome to VAIN.ZONE Beta! Type your nick in the box above and hit Enter."
      )}
    </Segment>
  );
}

MessageLayout.propTypes = propTypes;
MessageLayout.defualtProps = {
  errorType: "",
  browserView: false
};
