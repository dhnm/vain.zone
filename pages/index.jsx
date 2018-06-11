import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

function App(props) {
  return <React.Fragment>👋</React.Fragment>;
}

export default App;

App.getInitialProps = async function getInitialProps(context) {
  const { query } = context;

  let urlPath = 'https://test.vainglory.eu';
  if (process.env.NODE_ENV !== 'production') {
    urlPath = 'http://localhost:3000';
  }

  return {};
};
