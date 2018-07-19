import React from "react";
import PropTypes from "prop-types";
import { Segment, Message, Icon } from "semantic-ui-react";
import InputPanel from "./InputPanel";

const propTypes = {
  appLoading: PropTypes.bool.isRequired,
  appLoadingOn: PropTypes.func.isRequired
};

export default function ErrorLayout({ appLoading, appLoadingOn, errorType }) {
  return (
    <Segment basic>
      <InputPanel appLoading={appLoading} appLoadingOn={appLoadingOn} />
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
                  Vainglory). You can try other API sites, such as VGPRO,
                  vgminer or VainAura. If other sites are working but this site
                  is not, please contact me! thisBoy$4399 (Discord)
                </Message.Item>
              </React.Fragment>
            )}
          </Message.List>
        </Message.Content>
      </Message>
    </Segment>
  );
}

ErrorLayout.propTypes = propTypes;
