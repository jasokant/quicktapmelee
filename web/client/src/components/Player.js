import React, { Component } from 'react';

class Player extends Component {
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
    return (
      <div></div>
    )
  }
}
