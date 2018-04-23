import React from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';
import InputPanel from './InputPanel';

const propTypes = {
  appLoading: PropTypes.bool.isRequired,
  appLoadingOn: PropTypes.func.isRequired,
};

export default function ErrorLayout({ appLoading, appLoadingOn }) {
  return (
    <Segment basic>
      <InputPanel appLoading={appLoading} appLoadingOn={appLoadingOn} />
      <Segment>
        <p>We couldn't find anything :(</p>
        <ol>
          <li>Please check the spelling and capitalisation of the nick.</li>
          <li>If the player hasn't played this mode</li>
          for a long time, we don't have data for them.
          <li>Maybe the player has changed their nick?</li>
          <li>
            There might also be an issue in our data source (SEMC). In that
            case, please try again in 2 minutes.
          </li>
        </ol>
      </Segment>
    </Segment>
  );
}

ErrorLayout.propTypes = propTypes;
