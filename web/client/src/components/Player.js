import React, { Component } from 'react';

export default class Player extends Component {
  static propTypes =  {
    username: React.PropTypes.string,
    health: React.PropTypes.number,
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    direction: React.PropTypes.number
  };

  constructor() {
    super();
  }

  render() {
    let playerContainerStyle = {
      top: `${this.props.y}px`,
      left: `${this.props.x}px`
    };

    let playerStyle = {
      transform: `rotate(${this.props.direction}deg)`
    }

    return (
      <div className="player-container" style={playerContainerStyle}>
        <div className="player" style={playerStyle}></div>
        <div className="player-name">{this.props.username}</div>
        <div className="player-health">{this.props.health}</div>
      </div>
    )
  }
}
