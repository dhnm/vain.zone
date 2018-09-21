import React from "react";

import { toast } from "react-toastify";

import Lobby from "./Lobby";
import ProfileItem from "./ProfileItem";

import VZIcon from "./../Icon";
import { ICONS } from "./../../functions/constants";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

const InteractiveElement = ({ children, overrideStyle, action }) => (
  <div
    className="outerIE"
    style={{ ...overrideStyle }}
    onClick={action}
    onKeyPress={action}
    role="button"
    tabIndex={0}
  >
    <div className="innerIE">{children}</div>
    <style jsx>
      {`
        .outerIE {
          outline: none;
          display: inline-block;
          padding: 8px 12px;
          margin-right: 10px;
          overflow: hidden;
          text-align: center;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(255, 255, 255, 0.15);
          transition: 100ms linear;
          margin-bottom: 9px;
          background: white;
          color: black;
          transition: 140ms linear;
        }
        .outerIE:hover {
          transform: scale(1.06);
        }
        .innerIE {
          width: 100%;
        }
        .outerIE:hover {
          cursor: pointer;
        }
        .outerIE:active {
          opacity: 0.85;
        }
      `}
    </style>
  </div>
);

const Radio = ({ children, value, link, action, overrideStyle }) => (
  <InteractiveElement
    overrideStyle={
      link === value
        ? {
            background: "HSLA(280, 100%, 64%, 1.00)",
            fontWeight: "bold",
            color: "white",
            ...overrideStyle
          }
        : { ...overrideStyle }
    }
    action={() => {
      if (link !== value) {
        action();
      }
    }}
  >
    {value}
  </InteractiveElement>
);

export default class DraftBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      banTime: 30,
      pickTime: 30,
      bonusTime: 60,
      sequence: [
        { team: 0, action: "ban" },
        { team: 1, action: "ban" },
        { team: 0, action: "pick" },
        { team: 1, action: "pick" },
        { team: 1, action: "pick" },
        { team: 0, action: "pick" },
        { team: 1, action: "ban" },
        { team: 0, action: "ban" },
        { team: 1, action: "pick" },
        { team: 0, action: "pick" },
        { team: 0, action: "pick" },
        { team: 1, action: "pick" },
        { team: 0, action: "ban" },
        { team: 1, action: "ban" },
        { team: 0, action: "pick" },
        { team: 1, action: "pick" }
      ],
      heroes: props.defaultHeroes,

      draftName: "",
      newHeroName: undefined,
      newHeroImageURL: undefined,
      selectedGame: "Vainglory"
    };
  }
  handleChange = event => {
    this.setState({ draftName: event.target.value });
  };
  handleHeroName = event => {
    this.setState({ newHeroName: event.target.value });
  };
  handleImageURL = event => {
    this.setState({ newHeroImageURL: event.target.value });
  };
  render() {
    return (
      <Lobby overrideStyle={{ boxShadow: "none", background: "transparent" }}>
        <h3>Select a preset profile...</h3>
        <div className="profileList">
          {this.props.defaultProfiles.map((e, i) => (
            <ProfileItem
              outerStyle={e.customStyle}
              innerStyle={e.innerStyle}
              text={e.name}
              key={e.name}
              action={() => this.props.handleSelect(i)}
            />
          ))}
          {this.props.userProfiles.map((e, i) => (
            <>
              <ProfileItem
                outerStyle={e.customStyle}
                innerStyle={e.innerStyle}
                text={e.name}
                key={e.name}
                action={() =>
                  this.props.handleSelect(i + this.props.defaultProfiles.length)
                }
              />
              <div
                style={{
                  width: "100%",
                  textAlign: "right",
                  position: "relative"
                }}
              >
                <button
                  style={{
                    outline: "none",
                    appearance: "none",
                    border: 0,
                    display: "inline-block",
                    cursor: "pointer",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: "-80px",
                    right: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingRight: "4px"
                  }}
                  onClick={() => {
                    this.props.removeUserProfile(i);
                  }}
                >
                  <VZIcon icon={ICONS.bin} size="25" />
                </button>
              </div>
            </>
          ))}
        </div>
        <div>
          <p>&nbsp;</p>
          <h3>...or create a custom draft</h3>
          <label className="field">
            <input
              type="text"
              maxLength="28"
              placeholder="Profile Name"
              onChange={this.handleChange}
              value={this.state.draftName}
              required
              className="draftNameInput"
            />
          </label>
          <div className="field">
            <div className="label">Ban Time (s)</div>
            <Radio
              value={20}
              link={this.state.banTime}
              action={() => this.setState({ banTime: 20 })}
            />
            <Radio
              value={30}
              link={this.state.banTime}
              action={() => this.setState({ banTime: 30 })}
            />
            <Radio
              value={40}
              link={this.state.banTime}
              action={() => this.setState({ banTime: 40 })}
            />
          </div>
          <div className="field">
            <div className="label">Pick Time (s)</div>
            <Radio
              value={20}
              link={this.state.pickTime}
              action={() => this.setState({ pickTime: 20 })}
            />
            <Radio
              value={30}
              link={this.state.pickTime}
              action={() => this.setState({ pickTime: 30 })}
            />
            <Radio
              value={40}
              link={this.state.pickTime}
              action={() => this.setState({ pickTime: 40 })}
            />
          </div>
          <div className="field">
            <div className="label">Bonus Time (s)</div>
            <Radio
              value={0}
              link={this.state.bonusTime}
              action={() => this.setState({ bonusTime: 0 })}
            />
            <Radio
              value={30}
              link={this.state.bonusTime}
              action={() => this.setState({ bonusTime: 30 })}
            />
            <Radio
              value={60}
              link={this.state.bonusTime}
              action={() => this.setState({ bonusTime: 60 })}
            />
          </div>
          <div className="field">
            <div className="label">Draft Sequence</div>
            <table
              style={{
                textAlign: "center",
                textTransform: "uppercase",
                fontWeight: "bold",
                width: "100%",
                borderSpacing: 0
              }}
              onDragOver={event => {
                event.preventDefault(); // allows drop
              }}
              onDrop={event => {
                event.preventDefault();
                const draggingIndex = event.dataTransfer.getData("dragging");
                this.setState(prevState => {
                  if (typeof prevState.draggedOnIndex === "number") {
                    const sliced = prevState.sequence.slice();
                    const draggingItem = sliced[draggingIndex];
                    sliced.splice(draggingIndex, 1);
                    if (prevState.draggedOnIndex > draggingIndex) {
                      sliced.splice(
                        prevState.draggedOnIndex - 1,
                        0,
                        draggingItem
                      );
                    } else {
                      sliced.splice(prevState.draggedOnIndex, 0, draggingItem);
                    }
                    return {
                      sequence: sliced
                    };
                  } else {
                    return null;
                  }
                });
              }}
            >
              <tbody>
                {this.state.sequence.map((e, i) => (
                  <tr>
                    <td style={{ textAlign: "left", width: "30px" }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: 0 }}>
                      <div
                        onDragOver={event => {
                          event.preventDefault(); // allows drop
                        }}
                        onDragEnter={() => {
                          this.setState({ draggedOnIndex: i });
                        }}
                        style={{
                          width: "85%",
                          height: "8px",
                          margin: "0 10%",
                          backgroundColor:
                            this.state.draggedOnIndex === i
                              ? "orange"
                              : "transparent"
                        }}
                      />
                      <div
                        className="draggable"
                        style={{
                          backgroundColor: e.team
                            ? "HSLA(360, 98%, 50%, 1.00)"
                            : "HSLA(206, 100%, 48%, 1.00)",
                          padding: "5px 0",
                          margin: "0 10%",
                          width: "50%",
                          float: e.team ? "right" : "left"
                        }}
                        draggable
                        onDragStart={event =>
                          event.dataTransfer.setData("dragging", i)
                        }
                        onDragEnd={() => {
                          this.setState({
                            draggedOnIndex: undefined
                          });
                        }}
                      >
                        <VZIcon
                          icon={e.action === "pick" ? ICONS.pick : ICONS.ban}
                          color="white"
                        />{" "}
                        {e.action}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", width: "30px" }}>
                      <button
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          this.setState(prevState => {
                            const sliced = prevState.sequence.slice();
                            sliced.splice(i, 1);
                            return { sequence: sliced };
                          });
                        }}
                      >
                        <VZIcon icon={ICONS.bin} color="white" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: 0 }} />
                  <td style={{ padding: 0 }}>
                    <div
                      onDragOver={event => {
                        event.preventDefault(); // allows drop
                      }}
                      onDragEnter={() => {
                        this.setState({
                          draggedOnIndex: this.state.sequence.length
                        });
                      }}
                      style={{
                        clear: "both",
                        width: "85%",
                        height: "8px",
                        margin: "0 10%",
                        backgroundColor:
                          this.state.draggedOnIndex ===
                          this.state.sequence.length
                            ? "orange"
                            : "transparent"
                      }}
                    />
                  </td>
                  <td style={{ padding: 0 }} />
                </tr>
              </tbody>
            </table>
            <div
              style={{
                clear: "both",
                marginBottom: "10px"
              }}
            />
            <InteractiveElement
              action={() =>
                this.setState(prevState => ({
                  sequence: [...prevState.sequence, { team: 0, action: "ban" }]
                }))
              }
              overrideStyle={{
                color: "HSLA(206, 100%, 48%, 1.00)",
                fontWeight: "bold",
                fontSize: "0.9rem"
              }}
            >
              <VZIcon icon={ICONS.plus} color="HSLA(206, 100%, 48%, 1.00)" />{" "}
              BAN
            </InteractiveElement>
            <InteractiveElement
              action={() =>
                this.setState(prevState => ({
                  sequence: [...prevState.sequence, { team: 0, action: "pick" }]
                }))
              }
              overrideStyle={{
                color: "HSLA(206, 100%, 48%, 1.00)",
                fontWeight: "bold",
                fontSize: "0.9rem"
              }}
            >
              <VZIcon icon={ICONS.plus} color="HSLA(206, 100%, 48%, 1.00)" />{" "}
              PICK
            </InteractiveElement>
            <InteractiveElement
              action={() =>
                this.setState(prevState => ({
                  sequence: [...prevState.sequence, { team: 1, action: "ban" }]
                }))
              }
              overrideStyle={{
                color: "HSLA(360, 98%, 50%, 1.00)",
                fontWeight: "bold",
                fontSize: "0.9rem"
              }}
            >
              <VZIcon icon={ICONS.plus} color="HSLA(360, 98%, 50%, 1.00)" /> BAN
            </InteractiveElement>
            <InteractiveElement
              action={() =>
                this.setState(prevState => ({
                  sequence: [...prevState.sequence, { team: 1, action: "pick" }]
                }))
              }
              overrideStyle={{
                color: "HSLA(360, 98%, 50%, 1.00)",
                fontWeight: "bold",
                fontSize: "0.9rem"
              }}
            >
              <VZIcon icon={ICONS.plus} color="HSLA(360, 98%, 50%, 1.00)" />{" "}
              PICK
            </InteractiveElement>
            <InteractiveElement
              action={() => this.setState({ sequence: [] })}
              overrideStyle={{
                fontWeight: "bold",
                fontSize: "0.9rem"
              }}
            >
              CLEAR
            </InteractiveElement>
          </div>
          <div className="field">
            <div className="label">Heroes</div>
            <Radio
              value={"Vainglory"}
              link={this.state.selectedGame}
              action={() => {
                this.setState({
                  heroes: this.props.defaultHeroes,
                  selectedGame: "Vainglory"
                });
              }}
            />
            <Radio
              overrideStyle={{ display: "none" }}
              value={"Dota 2"}
              link={this.state.selectedGame}
              action={() => {
                window
                  .fetch(
                    "https://cors-anywhere.herokuapp.com/https://api.opendota.com/api/heroStats"
                  )
                  .then(data => data.json())
                  .then(data => {
                    this.setState({
                      heroes: data.map(e => ({
                        name: e.localized_name,
                        img: `https://api.opendota.com${e.img}`
                      })),
                      selectedGame: "Dota 2"
                    });
                  })
                  .catch(err => console.error(err));
              }}
            />
            <Radio
              overrideStyle={{ display: "none" }}
              value={"League of Legends"}
              link={this.state.selectedGame}
              action={() => {
                let version = "";
                window
                  .fetch(
                    "https://cors-anywhere.herokuapp.com/https://ddragon.leagueoflegends.com/realms/na.json"
                  )
                  .then(data => data.json())
                  .then(data => {
                    version = data.n.champion;
                    return window.fetch(
                      `https://cors-anywhere.herokuapp.com/http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
                    );
                  })
                  .then(data => data.json())
                  .then(data => {
                    const keys = Object.keys(data.data);
                    this.setState({
                      heroes: keys.map(e => ({
                        name: data.data[e].name,
                        img: `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${
                          data.data[e].image.full
                        }`
                      })),
                      selectedGame: "League of Legends"
                    });
                  })
                  .catch(err => console.error(err));
              }}
            />
            <div
              style={{
                margin: "0 10%",
                height: "300px",
                overflow: "auto",
                marginBottom: "10px"
              }}
            >
              <table
                style={{
                  border: "1px solid white",
                  width: "100%",
                  borderCollapse: "collapse"
                }}
              >
                <tbody>
                  {this.state.heroes.map((h, i) => (
                    <tr
                      style={{
                        backgroundColor:
                          i % 2 ? "transparent" : "hsla(0, 0%, 100%, 0.2)"
                      }}
                    >
                      <td
                        style={{
                          border: 0,
                          margin: 0,
                          padding: 0
                        }}
                      >
                        <img
                          src={
                            h.img ||
                            `/static/img/heroes/170-jpg/${h.name.toLowerCase()}.jpg`
                          }
                          alt={h.name}
                          style={{
                            height: "45px",
                            verticalAlign: "middle"
                          }}
                        />
                      </td>
                      <td style={{ padding: 0 }}>{h.name}</td>
                      <td style={{ padding: 0, textAlign: "right" }}>
                        <button
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            this.setState(prevState => {
                              const sliced = prevState.heroes.slice();
                              sliced.splice(i, 1);
                              return { heroes: sliced };
                            });
                          }}
                        >
                          <VZIcon icon={ICONS.bin} color="white" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap"
              }}
            >
              <input
                type="text"
                maxLength="28"
                placeholder="Hero Name"
                onChange={this.handleHeroName}
                value={this.state.newHeroName}
                required
                style={{
                  width: "calc(40% - 10px)",
                  minWidth: "150px",
                  boxSizing: "border-box",
                  height: "38px",
                  marginBottom: "3px",
                  padding: "10px"
                }}
              />
              <input
                type="url"
                maxLength="1400"
                placeholder="Image URL"
                onChange={this.handleImageURL}
                value={this.state.newHeroImageURL}
                required
                style={{
                  width: "calc(40% - 10px)",
                  minWidth: "150px",
                  boxSizing: "border-box",
                  height: "38px",
                  marginBottom: "3px",
                  padding: "10px"
                }}
              />
              <InteractiveElement
                overrideStyle={{
                  width: "20%",
                  boxSizing: "border-box",
                  verticalAlign: "middle",
                  marginBottom: "3px",
                  minWidth: "74px"
                }}
                action={() => {
                  this.setState(prevState => {
                    if (
                      prevState.newHeroName.trim() &&
                      prevState.newHeroImageURL.trim()
                    ) {
                      const sliced = prevState.heroes.slice();
                      sliced.unshift({
                        name: prevState.newHeroName.trim(),
                        img: prevState.newHeroImageURL.trim()
                      });
                      return {
                        heroes: sliced,
                        newHeroName: "",
                        newHeroImageURL: ""
                      };
                    }
                    toast.error("Empty name and/or URL field.", {
                      position: toast.POSITION.TOP_CENTER,
                      autoClose: 1750,
                      closeButton: false,
                      hideProgressBar: true
                    });
                    return null;
                  });
                }}
              >
                <VZIcon icon={ICONS.plus} /> Add
              </InteractiveElement>
            </div>
          </div>
          <div style={{ textAlign: "justify" }}>
            Contact us if you need more customization options, including custom
            heroes, colors, logos, etc!{" "}
            <a
              style={{ color: "white" }}
              target="_blank"
              href={publicRuntimeConfig.discordInviteLink}
            >
              Join us on Discord (wDYKFaS)
            </a>.
          </div>
          <button
            id="submit_button"
            onClick={() => {
              if (!this.state.draftName.trim()) {
                toast.error("Profile Name field is empty.", {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 2750,
                  closeButton: true,
                  hideProgressBar: true
                });
              } else if (this.state.sequence.length < 4) {
                toast.error("Draft sequence must have at least 4 steps.", {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 2750,
                  closeButton: true,
                  hideProgressBar: true
                });
              } else if (
                this.state.sequence.filter(e => e.team === 0).length < 2 ||
                this.state.sequence.filter(e => e.team === 1).length < 2
              ) {
                toast.error(
                  "Each side of the draft must have at least 2 steps.",
                  {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 2750,
                    closeButton: true,
                    hideProgressBar: true
                  }
                );
              } else if (this.state.sequence.length > 20) {
                toast.error(
                  "We don't support more than 20 items in the draft sequence.",
                  {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 2750,
                    closeButton: true,
                    hideProgressBar: true
                  }
                );
              } else if (
                this.state.heroes.length < this.state.sequence.length
              ) {
                toast.error(
                  "The number of available heroes must be greater or equal to the number of steps in draft.",
                  {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 3500,
                    closeButton: true,
                    hideProgressBar: true
                  }
                );
              } else {
                const gradients = [
                  "linear-gradient(to right, #ff416c, #ff4b2b)",
                  "linear-gradient(to right, #333333, #dd1818)",
                  "linear-gradient(to right, #fe8c00, #f83600)",
                  "linear-gradient(to right, #3ca55c, #b5ac49)",
                  "linear-gradient(to right, #f7971e, #ffd200)",
                  "linear-gradient(to right, #56ab2f, #a8e063)",
                  "linear-gradient(to right, #8360c3, #2ebf91)",
                  "linear-gradient(to right, #00b4db, #0083b0)",
                  "linear-gradient(to right, #11998e, #38ef7d)",
                  "linear-gradient(to right, #8e2de2, #4a00e0)",
                  "linear-gradient(to right, #fc466b, #3f5efb)",
                  "linear-gradient(to right, #c33764, #1d2671)",
                  "linear-gradient(to right, #2c3e50, #fd746c)",
                  "linear-gradient(to right, #2c3e50, #4ca1af)",
                  "linear-gradient(to right, #43cea2, #185a9d)",
                  "linear-gradient(to right, #00c6ff, #0072ff)",
                  "linear-gradient(to right, #1a2980, #26d0ce)",
                  "linear-gradient(to right, #1488cc, #2b32b2)",
                  "linear-gradient(to right, #8a2387, #e94057, #f27121)",
                  "linear-gradient(to right, #34e89e, #0f3443)",
                  "linear-gradient(to right, #fdc830, #f37335)",
                  "linear-gradient(to right, #c02425, #f0cb35)",
                  "linear-gradient(to right, #ffe000, #799f0c)"
                ];

                this.props.addNewProfile({
                  name: this.state.draftName.trim(),
                  banTime: this.state.banTime * 1000,
                  pickTime: this.state.pickTime * 1000,
                  bonusTime: this.state.bonusTime * 1000,
                  sequence: this.state.sequence,
                  heroes: this.state.heroes,
                  customStyle: {
                    background:
                      gradients[Math.floor(Math.random() * gradients.length)] ||
                      "linear-gradient(to right, #00c6ff, #0072ff)"
                  }
                });
              }
            }}
          >
            Check and Apply Profile
          </button>
        </div>
        <style jsx>
          {`
            #submit_button {
              outline: none;
              appearance: none;
              border: 0;
              width: 100%;
              margin-top: 25px;
              height: 48px;
              text-align: center;
              color: white;
              text-transform: uppercase;
              font-weight: bold;
              background-image: linear-gradient(
                45deg,
                #fbc2eb 0%,
                #a6c1ee 51%,
                #fbc2eb 100%
              );
              background-position: right center;
              background-size: 200% auto;
              cursor: pointer;
              border-radius: 25px;
              box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
              transition: 0.5s;
            }
            #submit_button:hover {
              background-position: left center;
              font-size: 14px;
            }
            #submit_button:disabled {
              background: lightgrey;
              font-size: 11px;
              cursor: default;
            }
            td {
              padding-top: 9px;
              border: 0;
              vertical-align: middle;
            }
            .draggable {
              cursor: move;
            }
            .profileList {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              list-style-type: none;
            }

            input {
              appearance: none;
              border: 0;
              background: none;
              box-shadow: none;
              outline: none;
            }
            input[type="text"],
            input[type="url"] {
              border-radius: 0px;
              appearance: none;
              border: 0;
              margin: auto;
              box-sizing: border-box;
              font-size: 18px;
              text-align: center;
              font-weight: bold;
              color: white;

              width: 100%;
              margin-bottom: 15px;
              padding: 10px 25px;
              border-bottom: 1px solid hsla(0, 0%, 75%, 1);
              box-sizing: border-box;
              transition: 140ms linear;
            }
            input[type="text"]:focus,
            input[type="text"]:hover,
            input[type="url"]:focus,
            input[type="url"]:hover {
              border-bottom: 1px solid hsla(0, 0%, 100%, 1);
            }
            .label {
              font-weight: bold;
              font-size: 0.95rem;
              margin-bottom: 10px;
            }
            .field {
              margin-bottom: 10px;
            }
          `}
        </style>
      </Lobby>
    );
  }
}
