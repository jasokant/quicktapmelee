import React from 'react'

export default class Bullet extends React.Component {
  static propTypes = {
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    direction: React.PropTypes.number
  }
  render() {
    let bulletStyles = {
      top: this.props.y + 'px',
      left: this.props.x + 'px',
      transform: `rotate(${this.props.direction}deg)`
    }

    return (
      <div className="bullet" style={bulletStyles}></div>
    )
  }
}
