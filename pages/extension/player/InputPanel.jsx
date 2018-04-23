import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { Form, Input, Icon } from 'semantic-ui-react';

const propTypes = {
  appLoading: PropTypes.bool.isRequired,
};

export default class InputPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      IGNInput: '',
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleInputChange(event) {
    // const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    this.setState({
      [event.target.id]: event.target.value,
    });
  }
  handleSubmit(event) {
    event.preventDefault();
    // window.location.href = "/extension/player/" + this.state.IGNInput;
    Router.push(
      `/extension/player?error=false&extension=false&IGN=${
        this.state.IGNInput
      }`,
      `/extension/player/${this.state.IGNInput}`,
      { shallow: false },
    );
  }
  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Field>
          <Input
            icon={<Icon name="search" />}
            type="search"
            onChange={this.handleInputChange}
            value={this.state.IGNInput}
            id="IGNInput"
            placeholder="In-Game Name"
            required
            loading={this.props.appLoading}
          />
        </Form.Field>
      </Form>
    );
  }
}

InputPanel.propTypes = propTypes;
