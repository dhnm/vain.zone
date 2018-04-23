import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

const propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default function ExtensionLayout({ children }) {
  return (
    <div id="container">
      <Head>
        <title>VAIN.ZONE</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, shrink-to-fit=no"
        />
        <link
          rel="stylesheet"
          href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
        />
      </Head>
      {children}
      <style jsx global>
        {`
          body {
            background-color: black !important;

            background-image: linear-gradient(
                hsla(0, 0%, 0%, 0.4),
                hsla(0, 0%, 0%, 0.4),
                hsla(0, 0%, 0%, 0.4),
                hsla(227, 32%, 9%, 0.5),
                hsla(227, 32%, 9%, 1)
              ),
              url('/static/img/bg.jpg') !important;
            background-repeat: no-repeat;
            background-position: center center;
            background-attachment: fixed;
            background-size: cover;
          }
        `}
      </style>
      <style jsx>
        {`
          #container {
            min-height: 100vh;

            max-width: 414px;
            margin: auto;
          }
        `}
      </style>
    </div>
  );
}

ExtensionLayout.propTypes = propTypes;
