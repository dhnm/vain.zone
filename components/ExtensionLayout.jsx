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
        <link
          rel="stylesheet"
          href="//semantic-ui-forest.com/static/dist/semantic-ui/forest-themes/bootswatch/semantic.slate.min.css"
        />
        <script src="https://cdn.polyfill.io/v2/polyfill.min.js" />
      </Head>
      {children}
      <style jsx global>
        {`
          body {
            background-color: black !important;

            background-image: linear-gradient(
                hsla(0, 0%, 0%, 0.6),
                hsla(0, 0%, 0%, 0.5),
                hsla(0, 0%, 0%, 0.7),
                hsla(227, 32%, 9%, 0.8),
                hsla(227, 32%, 9%, 1)
              ),
              url('/static/img/bg.jpg') !important;
            background-repeat: no-repeat;
            background-position: center center;
            background-attachment: fixed;
            background-size: cover;

            min-height: 100vh;
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
