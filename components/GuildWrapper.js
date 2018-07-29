import React from "react";
import Head from "next/head";

const GuildWrapper = ({ children, guildName }) => (
  <React.Fragment>
    <Head>
      <title>VAIN.ZONE</title>
      <link
        rel="stylesheet"
        href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
      />
      <link rel="stylesheet" href="/static/css/semantic.slate.min.css" />

      <meta property="fb:app_id" content="617200295335676" />
      <meta property="og:type" content="website" />
      <meta
        property="og:title"
        content={`${guildName || "Guild"}'s Weekly Fame`}
      />
      <meta
        property="og:description"
        content="VAIN.ZONE: Tools and Statistics for Vainglory players!"
      />
      <meta property="og:url" content="https://vain.zone/" />
      <meta
        property="og:image"
        content="https://vain.zone/static/img/og-VAINZONE-logo.png"
      />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="600" />
      <meta property="og:image:height" content="480" />
      <meta property="og:image:alt" content="VAIN.ZONE" />
    </Head>
    {children}
    <style jsx global>
      {`
        body {
          background-color: black !important;

          background-image: linear-gradient(
              hsla(0, 0%, 0%, 0.7),
              hsla(0, 0%, 0%, 0.6),
              hsla(0, 0%, 0%, 0.8),
              hsla(227, 32%, 9%, 0.9),
              hsla(227, 32%, 9%, 1)
            ),
            url("/static/img/bg.jpg") !important;
          background-repeat: no-repeat;
          background-position: center center;
          background-attachment: fixed;
          background-size: cover;
        }
      `}
    </style>
  </React.Fragment>
);

export default GuildWrapper;
