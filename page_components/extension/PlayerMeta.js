import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

import React from "react";
import Link from "next/link";
import { Label, Segment, Progress, Image, Tab, Table } from "semantic-ui-react";
import axios from "axios";
import html2canvas from "html2canvas";

export default ({ data, browserView }) => {
  if (!data) {
    return <div />;
  }
  return (
    <React.Fragment>
      <Segment>
        <Label attached="top"> Win Rate (Autumn Season 2018) </Label>
        <Progress
          style={{ marginBottom: 0 }}
          percent={(data.winrate.won * 100 / data.winrate.of_matches).toFixed(
            1
          )}
          progress
          size="medium"
          color="green"
          inverted
        />
      </Segment>
      {(data.favorites.length != 0 || data.nightmares.length != 0) && (
        <Tab
          defaultActiveIndex={data.favorites.length > 0 ? 0 : 1}
          panes={[
            data.favorites.length && {
              menuItem: "Favorites",
              render: () => (
                <Tab.Pane>
                  <table
                    style={{
                      width: "100%",
                      textAlign: "center",
                      borderSpacing: 0
                    }}
                  >
                    <tbody>
                      <tr>
                        <th> Hero </th> <th> Pick % </th> <th> Win % </th>
                        <th> KDA </th>
                      </tr>
                      {data.favorites.map((h, i) => (
                        <tr
                          style={
                            i % 2
                              ? {}
                              : {
                                  backgroundColor: "hsla(0, 0%, 100%, 0.05"
                                }
                          }
                        >
                          <td style={{ textAlign: "left" }}>
                            <Image
                              style={{
                                width: "26px",
                                borderRadius: "25%",
                                display: "inline-block",
                                margin: "3px"
                              }}
                              src={`/static/img/heroes/c/${h._id.toLowerCase()}.jpg`}
                            />
                            {h._id}
                          </td>
                          <td> {Math.round(h.count / h.totalCount * 100)} %</td>
                          <td
                            style={{
                              color: "HSLA(127, 63%, 49%, 1.00)"
                            }}
                          >
                            {Math.round(h.won / h.count * 100)} %
                          </td>
                          <td>
                            {Math.round(h.kills / h.count)}
                            /{Math.round(h.deaths / h.count)}
                            /{Math.round(h.assists / h.count)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Tab.Pane>
              )
            },
            data.nightmares.length && {
              menuItem: "Nightmares",
              render: () => (
                <Tab.Pane>
                  <table
                    style={{
                      width: "100%",
                      textAlign: "center",
                      borderSpacing: 0
                    }}
                  >
                    <tbody>
                      <tr>
                        <th> Hero </th> <th> Played Against % </th>
                        <th> Lose % </th>
                      </tr>
                      {data.nightmares.map((h, i) => (
                        <tr
                          style={
                            i % 2
                              ? {}
                              : {
                                  backgroundColor: "hsla(0, 0%, 100%, 0.05"
                                }
                          }
                        >
                          <td style={{ textAlign: "left" }}>
                            <Image
                              style={{
                                width: "26px",
                                borderRadius: "25%",
                                display: "inline-block",
                                margin: "3px"
                              }}
                              src={`/static/img/heroes/c/${h._id.toLowerCase()}.jpg`}
                            />
                            {h._id}
                          </td>
                          <td> {Math.round(h.count / h.totalCount * 100)} %</td>
                          <td
                            style={{
                              color: "HSLA(360, 72%, 51%, 1.00)"
                            }}
                          >
                            {Math.round(h.lost / h.count * 100)} %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Tab.Pane>
              )
            }
          ]}
        />
      )}
      {(data.friends.length != 0 || data.nemeses.length != 0) && (
        <Tab
          defaultActiveIndex={data.friends.length > 0 ? 0 : 1}
          style={{ marginTop: "14px" }}
          panes={[
            data.friends.length && {
              menuItem: "Friends",
              render: () => (
                <Tab.Pane>
                  <table
                    style={{
                      width: "100%",
                      textAlign: "center",
                      borderSpacing: 0
                    }}
                  >
                    <tbody>
                      <tr>
                        <th> Name </th> <th> Played Together % </th>
                        <th> Win % </th>
                      </tr>
                      {data.friends.map((p, i) => (
                        <tr
                          style={
                            i % 2
                              ? {}
                              : {
                                  backgroundColor: "hsla(0, 0%, 100%, 0.05"
                                }
                          }
                        >
                          <td
                            style={{
                              textAlign: "left",
                              height: "34px",
                              paddingLeft: "5px",
                              fontWeight: "bold"
                            }}
                          >
                            <Link
                              prefetch
                              href={`/extension/player?${
                                browserView ? "browserView=true&" : ""
                              }error=false&extension=false&playerID=${p._id}`}
                              as={`${browserView ? "" : "/extension"}/player/${
                                p.name
                              }`}
                            >
                              {p.name}
                            </Link>
                          </td>
                          <td> {Math.round(p.count / p.totalCount * 100)} %</td>
                          <td
                            style={{
                              color: "HSLA(127, 63%, 49%, 1.00)"
                            }}
                          >
                            {Math.round(p.won / p.count * 100)} %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Tab.Pane>
              )
            },
            data.nemeses.length && {
              menuItem: "Nemeses",
              render: () => (
                <Tab.Pane>
                  <table
                    style={{
                      width: "100%",
                      textAlign: "center",
                      borderSpacing: 0
                    }}
                  >
                    <tbody>
                      <tr>
                        <th> Name </th> <th> Lose % </th>
                      </tr>
                      {data.nemeses.map((p, i) => (
                        <tr
                          style={
                            i % 2
                              ? {}
                              : {
                                  backgroundColor: "hsla(0, 0%, 100%, 0.05"
                                }
                          }
                        >
                          <td
                            style={{
                              textAlign: "left",
                              height: "34px",
                              paddingLeft: "5px",
                              fontWeight: "bold"
                            }}
                          >
                            <Link
                              prefetch
                              href={`/extension/player?${
                                browserView ? "browserView=true&" : ""
                              }error=false&extension=false&playerID=${p._id}`}
                              as={`${browserView ? "" : "/extension"}/player/${
                                p.name
                              }`}
                            >
                              {p.name}
                            </Link>
                          </td>
                          <td
                            style={{
                              color: "HSLA(360, 72%, 51%, 1.00)"
                            }}
                          >
                            {Math.round(p.lost / p.count * 100)} %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Tab.Pane>
              )
            }
          ]}
        />
      )}
    </React.Fragment>
  );
};
