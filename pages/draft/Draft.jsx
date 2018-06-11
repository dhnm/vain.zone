import React from 'react';
import Head from 'next/head';

import io from 'socket.io-client';
import axios from 'axios';
import Router from 'next/router';

import { toast } from 'react-toastify';

const HeroPick = ({ hero }) => {
  const src = hero.img || `/static/img/heroes/${hero.name.toLowerCase()}.png`;
  return <img src={src} alt={hero.name} />;
};

class Draft extends React.Component {
  static async getInitialProps({ query }) {
    return query;
  }
  static getDerivedStateFromProps(props, state) {
    const draftPositionIndex = props.draftedHeroes.length;
    const teamTurn = props.draftSequence[draftPositionIndex].team;
    const sideBonus = teamTurn ? 'redBonus' : 'blueBonus';

    if (props.team === teamTurn) {
      toast.info('Your turn.', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        closeButton: true,
        hideProgressBar: true,
      });
    }

    return new Date(
      new Date(props.timeLeft).getTime() + props[`${sideBonus}Left`],
    ) === state[sideBonus]
      ? null
      : { [sideBonus]: undefined };
  }
  state = { timeLeft: 0 };
  componentDidMount() {
    this.socket = io();

    toast.success('Draft has started. Good luck!', {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 2000,
      closeButton: false,
      hideProgressBar: true,
    });

    setInterval(() => {
      const draftPositionIndex = this.props.draftedHeroes.length;
      const teamTurn = this.props.draftSequence[draftPositionIndex].team;
      const sideBonus = teamTurn ? 'redBonus' : 'blueBonus';

      const timeLeft =
        new Date(this.props.timeLeft).getTime() - new Date().getTime();
      if (timeLeft >= 0) {
        this.setState({
          timeLeft,
        });
      } else if (typeof this.state[sideBonus] === 'undefined') {
        this.setState({
          timeLeft: 0,
          [sideBonus]: new Date(
            new Date(this.props.timeLeft).getTime() +
              this.props[`${sideBonus}Left`],
          ),
          [`${sideBonus}Left`]:
            new Date(this.props.timeLeft).getTime() +
            this.props[`${sideBonus}Left`] -
            new Date().getTime(),
        });
      } else {
        this.setState((prevState) => ({
          [`${sideBonus}Left`]:
            new Date(prevState[sideBonus]).getTime() - new Date().getTime(),
        }));
      }
    }, 1000);
  }
  componentWillUnmount() {
    this.socket.close();
  }
  draftItemCallback = (e, i) => {
    const draftPositionIndex = this.props.draftSequence.indexOf(e);
    const drafted = draftPositionIndex + 1 <= this.props.draftedHeroes.length;
    const hero = this.props.heroes.find(
      (h) => h.name === this.props.draftedHeroes[draftPositionIndex],
    );
    const src = drafted
      ? hero.img ||
        `${this.props.urlPath}/static/img/heroes/${hero.name.toLowerCase()}.png`
      : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNU+g8AAUkBI5mqlHIAAAAASUVORK5CYII=';
    return (
      <li>
        <img src={src} alt={e.name} width="50px" />
      </li>
    );
  };
  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };
  render() {
    let percent =
      (this.state.timeLeft - 800) /
      (this.props.draftSequence[this.props.draftedHeroes.length].action ===
      'pick'
        ? this.props.pickTime
        : this.props.banTime);
    if (percent < 0) {
      percent = 0;
    }
    return (
      <React.Fragment>
        <Head>
          <title>{this.props.matchName}</title>
        </Head>
        <h1>{this.props.matchName}</h1>
        <div id="timers">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52.5"
              fill="none"
              stroke="#0000ff"
              strokeWidth="15"
            />
            <circle
              transform="rotate(-90 60 60)"
              cx="60"
              cy="60"
              r="52.5"
              fill="none"
              stroke="#f77a52"
              strokeWidth="15"
              strokeDasharray={2 * Math.PI * 52.5}
              strokeDashoffset={
                2 *
                Math.PI *
                52.5 *
                (1 - this.state.blueBonusLeft / this.props.bonusTime)
              }
              style={{ transition: 'stroke-dashoffset 1000ms linear' }}
            />
            <text
              x="60"
              y="60"
              textAnchor="middle"
              alignmentBaseline="central"
              fontSize="45px"
              fontWeight="bold"
            >
              {Math.round(this.state.timeLeft / 1000)}
            </text>
          </svg>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52.5"
              fill="none"
              stroke="#e6e6e6"
              strokeWidth="15"
            />
            <circle
              transform="rotate(-90 60 60)"
              cx="60"
              cy="60"
              r="52.5"
              fill="none"
              stroke="#f77a52"
              strokeWidth="15"
              strokeDasharray={2 * Math.PI * 52.5}
              strokeDashoffset={2 * Math.PI * 52.5 * (1 - percent)}
              style={{ transition: 'stroke-dashoffset 1000ms linear' }}
            />
            <text
              x="60"
              y="60"
              textAnchor="middle"
              alignmentBaseline="central"
              fontSize="45px"
              fontWeight="bold"
            >
              {Math.round(this.state.timeLeft / 1000)}
            </text>
          </svg>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52.5"
              fill="none"
              stroke="#e6e6e6"
              strokeWidth="15"
            />
            <circle
              transform="rotate(-90 60 60)"
              cx="60"
              cy="60"
              r="52.5"
              fill="none"
              stroke="#f77a52"
              strokeWidth="15"
              strokeDasharray={2 * Math.PI * 52.5}
              strokeDashoffset={2 * Math.PI * 52.5 * (1 - percent)}
              style={{ transition: 'stroke-dashoffset 1000ms linear' }}
            />
            <text
              x="60"
              y="60"
              textAnchor="middle"
              alignmentBaseline="central"
              fontSize="45px"
              fontWeight="bold"
            >
              {Math.round(this.state.timeLeft / 1000)}
            </text>
          </svg>
        </div>
        <div id="draft_state">
          <ul id="blue_pick">
            {this.props.draftSequence
              .filter((e) => e.action === 'pick' && e.team === 0)
              .map(this.draftItemCallback)}
          </ul>
          <div id="bans">
            <ul id="blue_bans">
              {this.props.draftSequence
                .filter((e) => e.action === 'ban' && e.team === 0)
                .map(this.draftItemCallback)}
            </ul>
            <ul id="red_bans">
              {this.props.draftSequence
                .filter((e) => e.action === 'ban' && e.team === 1)
                .map(this.draftItemCallback)}
            </ul>
          </div>
          <ul id="red_pick">
            {this.props.draftSequence
              .filter((e) => e.action === 'pick' && e.team === 1)
              .map(this.draftItemCallback)}
          </ul>
        </div>
        <div id="input_panel">
          <h2 id="heroes">Heroes</h2>
          <input type="text" placeholder="Search Hero" />
          <ul>
            {this.props.heroes.map((hero) => {
              const src =
                hero.img || `/static/img/heroes/${hero.name.toLowerCase()}.png`;
              return (
                <li>
                  <button
                    style={{
                      color: 'inherit',
                      font: 'inherit',
                      cursor: 'pointer',
                      outline: 'inherit',
                      appearance: 'none',
                      border: 0,
                      padding: 0,
                      background: `url('${src}')`,
                      backgroundSize: 'cover',
                      width: '100px',
                      height: '100px',
                    }}
                    id={hero.name}
                    onClick={(e) => {
                      this.props.emit({
                        draftedHeroes: [
                          ...this.props.draftedHeroes,
                          e.target.id,
                        ],
                      });
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </React.Fragment>
    );
  }
}

export default Draft;
