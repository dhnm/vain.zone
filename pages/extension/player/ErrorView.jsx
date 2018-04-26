import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Message, Icon } from 'semantic-ui-react';
import InputPanel from './InputPanel';

const propTypes = {
  appLoading: PropTypes.bool.isRequired,
  appLoadingOn: PropTypes.func.isRequired,
};

export default function ErrorLayout({ appLoading, appLoadingOn }) {
  return (
    <Segment basic>
      <InputPanel appLoading={appLoading} appLoadingOn={appLoadingOn} />
      <Message info icon>
        <Icon name="frown" />
        <Message.Content>
          <Message.Header>We couldn't find anything :(</Message.Header>
          <Message.List as="ol">
            <Message.Item>
              Please check the spelling and capitalisation of the nick.
            </Message.Item>
            <Message.Item>
              If the player hasn't played a match recently, we don't have data
              for them.
            </Message.Item>
            <Message.Item>
              Maybe the player has changed their nick?
            </Message.Item>
            <Message.Item>
              There might also be an issue with our data source (SEMC). In that
              case, please try again in 2 minutes.
            </Message.Item>
          </Message.List>
        </Message.Content>
      </Message>
    </Segment>
  );
}

ErrorLayout.propTypes = propTypes;
