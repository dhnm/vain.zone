import React from "react";
import axios from "axios";
import { Table, Grid, Button, Icon } from "semantic-ui-react";
import Link from "next/link";
import * as moment from "moment";

import Head from "./../../page_components/guild/Head";

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
          <Icon name="numbered list" />
          Track My Guild
        </Button>
      </Link>
      {error ? (
        <div />
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
                  {data.members.map(p => (
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
              <Link
                href={`/guild/edit?guildID=5b5f7af5ca91c80d160a8408&guildName=Blue Oyster Bar&guildTag=BAR&guildMembers=${JSON.stringify(
                  data.members
                )}`}
                as="/guild/edit"
              >
                <Button floated="right">
                  <Icon name="edit" />Edit
                </Button>
              </Link>
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
              <Link
                href={`/guild/edit?guildID=5b5f7b32ca91c80d160a8409&guildName=Police Academy&guildTag=BAR&guildMembers=${JSON.stringify(
                  data.academy
                )}`}
                as="/guild/edit"
              >
                <Button floated="right">
                  <Icon name="edit" />Edit
                </Button>
              </Link>
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

Guild.getInitialProps = ({ query }) => {
  // const { query } = context;

  let urlPath = "https://vain.zone";
  if (process.env.NODE_ENV !== "production") {
    urlPath = "http://localhost:3000";
  }

  return axios(`${urlPath}/api/fame`, {
    params: {
      clearCache: query.clearCache
    }
  })
    .then(response => {
      return { data: response.data };
    })
    .catch(err => {
      console.log(err.response, "kum2");
      return err.response.data;
    });
};
