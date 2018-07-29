import React from "react";
import axios from "axios";
import { Table, Grid, Button } from "semantic-ui-react";
import Link from "next/link";
import * as moment from "moment";

import Head from "./components/Head";

const Guild = ({ data, error }) => {
  return (
    <div id="container">
      <Head />
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
          <Link href="/guild/apply">
            <Button
              size="huge"
              color="orange"
              style={{
                display: "block",
                margin: "auto",
                marginBottom: "28px"
              }}
            >
              Track My Guild
            </Button>
          </Link>
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
    console.log(data);
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
