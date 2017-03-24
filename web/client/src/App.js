import React, { Component } from 'react';
import './App.css';
import * as firebase from 'firebase';

import beginButton from './images/Begin_Battle_BTN.svg';
import readyingButton from './images/Readying_Fighters_BTN.svg';
import qtsLogo from './images/QTS_Logo.svg';

import Player from './components/Player';

let backend = firebase.initializeApp({
  apiKey: "AIzaSyAsomyfnSlWJO_pRRzJKy-Gxqjq-KuHvME",
  authDomain: "quicktapmelee.firebaseapp.com",
  databaseURL: "https://quicktapmelee.firebaseio.com",
  storageBucket: "quicktapmelee.appspot.com",
  messagingSenderId: "165490831895"
});

let database = firebase.database();

let usersRef = database.ref("/users/");

const MAX_VELOCITY = 300;
const MIN_VELOCITY = 0;

const ANGULAR_ACCELERATION = 90;
const ACCELERATION = 100;


let t = performance.now()

class App extends Component {
  constructor() {
    super();

    this.state = {
      players: [],
      battleStarted: false,
      battleEnded: false
    }

    usersRef.once('value', this.getInitialUsers)
  }

  getInitialUsers = (snapshot) => {
    let usersObject = snapshot.val()
    let userIdArray = Object.keys(usersObject)
    let playersArray = userIdArray.map((id) => {
      return {
        id: id,
        username: usersObject[id].username,
        acceleration: usersObject[id].acceleration,
        rotation: usersObject[id].rotation,
        velocity: 0,
        direction: Math.random() * 360,
        position: {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight
        },
        health: 100
      }
    });

    this.setState({players: playersArray})
  }

  usersUpdated = (snapshot) => {
    let usersObject = snapshot.val()

    let newPlayersArray = this.state.players.map((player) => {
      return {
        id: player.id,
        username: usersObject[player.id].username,
        acceleration: usersObject[player.id].acceleration,
        rotation: usersObject[player.id].rotation,
        velocity: player.velocity,
        direction: player.direction,
        position: player.position,
        health: player.health
      }
    })

    this.setState({players: newPlayersArray})
  }

  startBattle = () => {
    this.setState({battleStarted: true})

    usersRef.on('value', this.usersUpdated)

    t = performance.now()

    window.requestAnimationFrame(this.tick)
  }

  tick = (timestamp) => {
    let newPlayersArray = this.state.players.map((player) => {
      let tDiff = (timestamp - t) / 1000;
      t = timestamp;

      let newVelocity = player.velocity + (ACCELERATION * tDiff);
      let newDirection = player.direction + (ANGULAR_ACCELERATION * tDiff);

      let middleDirection = player.direction + ANGULAR_ACCELERATION * tDiff / 2;

      let displacement = player.velocity * tDiff + ACCELERATION * Math.pow(tDiff,2) / 2;

      let xDisplacement = Math.cos(middleDirection / 180 * Math.PI) * displacement;
      let yDisplacement = Math.sin(middleDirection / 180 * Math.PI) * displacement;
      let newXPosition = player.position.x + xDisplacement;
      let newYPosition = player.position.y + yDisplacement;

      return {
        id: player.id,
        username: player.username,
        acceleration: player.acceleration,
        rotation: player.rotation,
        velocity: newVelocity,
        direction: newDirection,
        position: {
          x: newXPosition,
          y: newYPosition
        },
        health: player.health
      }
    });

    this.setState({players: newPlayersArray })
    window.requestAnimationFrame(this.tick)
  }

  render() {
    let startScreenStyle = this.state.battleStarted ? { top: "100vh" } : { top: "0" };
    let gameScreenStyle = this.state.battleStarted ? { top: "0" } : { top: "-100vh" };
    let endScreenStyle = this.state.battleEnded ? { top: "0" } : { top: "-100vh" };

    return (
      <div className="app">
        <div className="start-screen" style={startScreenStyle}>
          <div className="start-screen__content">
            <div className="start-screen__content__title">
            </div>
            {
              this.state.players.length > 1 ? (
                  <img src={beginButton} className="start-screen__content__start-button" onClick={this.startBattle}></img>
                ) : (
                  <img src={readyingButton} className="start-screen__content__start-button"></img>
                )
            }
            <div className="battle-roster">
              <div className="battle-roster__title"></div>
              <div className="battle-roster__players">
                {
                  this.state.players.map((player) => {
                    return (
                      <div className="battle-roster__player">{player.username}</div>
                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>
        <div className="game-screen" style={gameScreenStyle}>
          {
            this.state.battleStarted && !this.state.battleEnded ?
              this.state.players.map((player)=>{
                return (
                  <Player
                    username={player.username}
                    health={player.health}
                    x={player.position.x}
                    y={player.position.y}
                    direction={player.direction}>
                  </Player>
                )
              }) : null
          }
        </div>
        <div className="end-screen" style={endScreenStyle}>
        </div>
        <img src={qtsLogo} className="qts-logo"></img>
      </div>
    );
  }
}

export default App;
