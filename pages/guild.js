import React from "react";
import axios from "axios";
import Head from "next/head";
import { Table, Grid } from "semantic-ui-react";
import Link from "next/link";
import * as moment from "moment";

const Guild = ({ data, error }) => {
  return (
    <div id="container">
      <Head>
        <title>VAIN.ZONE</title>
        <link
          rel="stylesheet"
          href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
        />
        <link rel="stylesheet" href="/static/css/semantic.slate.min.css" />

        <meta property="fb:app_id" content="617200295335676" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="VAIN.ZONE for Vainglory" />
        <meta
          property="og:description"
          content="Tools and Statistics for Vainglory players!"
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
      <Link prefetch href={`/extension/player?browserView=true`} as="/">
        <img
          src="/static/img/draft/VAINZONE-logo-darkbg.png"
          alt="VAIN.ZONE"
          style={{
            width: "200px",
            display: "block",
            margin: "auto",
            marginBottom: "14px",
            cursor: "pointer"
          }}
        />
      </Link>
      {error ? (
        <div>Error: {JSON.stringify(error)}</div>
      ) : (
        <React.Fragment>
          <Grid columns="equal" stackable>
            <Grid.Column>
              <h1>Blue Oyster Bar</h1>
              <p className="small">
                Last Updated {moment(data.lastUpdated).fromNow()}
              </p>
              <Table unstackable selectable style={{ margin: "20px auto" }}>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Fame</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.guild.map(p => (
                    <Link
                      prefetch
                      href={`player?browserView=true&error=false&extension=false&IGN=${
                        p.name
                      }`}
                      as={`/player/${p.name}`}
                    >
                      <Table.Row style={{ cursor: "pointer" }}>
                        <Table.Cell>{p.name}</Table.Cell>
                        <Table.Cell>{Math.round(p.fame)}</Table.Cell>
                      </Table.Row>
                    </Link>
                  ))}
                </Table.Body>
              </Table>
            </Grid.Column>
            <Grid.Column>
              <h1>Police Academy</h1>
              <p className="small">
                Last Updated {moment(data.lastUpdated).fromNow()}
              </p>
              <Table unstackable selectable style={{ margin: "20px auto" }}>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Fame</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.academy.map(p => (
                    <Link
                      prefetch
                      href={`player?browserView=true&error=false&extension=false&IGN=${
                        p.name
                      }`}
                      as={`/player/${p.name}`}
                    >
                      <Table.Row style={{ cursor: "pointer" }}>
                        <Table.Cell>{p.name}</Table.Cell>
                        <Table.Cell>{Math.round(p.fame)}</Table.Cell>
                      </Table.Row>
                    </Link>
                  ))}
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid>
        </React.Fragment>
      )}
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
      <style jsx>
        {`
          h1,
          .small {
            text-align: center;
          }
          .small {
            font-size: 0.85rem;
          }
          #container {
            min-height: 100vh;
            margin: 40px auto;
            max-width: 768px;
          }
          @media (max-width: 767px) {
            #container {
              max-width: 414px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Guild;

Guild.getInitialProps = async function getInitialProps() {
  try {
    // const { query } = context;

    let urlPath = "https://vain.zone";
    if (process.env.NODE_ENV !== "production") {
      urlPath = "http://localhost:3000";
    }

    const requestData = await axios({
      method: "get",
      url: `${urlPath}/api/fame`
    });
    const data = await requestData.data;

    if (data.error) {
      return {
        error: data.error
      };
    }

    return {
      data
    };
  } catch (error) {
    return {
      error
    };
  }
};
