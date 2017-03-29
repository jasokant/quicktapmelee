import React, { Component } from 'react';
import './App.css';
import * as firebase from 'firebase';

import beginButton from './images/Begin_Battle_BTN.svg';
import readyingButton from './images/Readying_Fighters_BTN.svg';
import qtsLogo from './images/QTS_Logo.svg';

import Player from './components/Player';
import Bullet from './components/Bullet'

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

const ANGULAR_ACCELERATION = 180;
const ACCELERATION = 100;

const BULLET_VELOCITY = 750;
const BULLET_TIME = 2000;
const BULLET_FREQUENCY = 100;

let t = performance.now()
let bulletT = performance.now()

class App extends Component {
  constructor() {
    super();

    this.state = {
      players: [],
      bullets: [],
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

    t = performance.now();
    bulletT = t;
    window.requestAnimationFrame(this.tick)
  }

  tick = (timestamp) => {
    let tDiff = (timestamp - t) / 1000;
    t = timestamp;

    let oldBullets = this.state.bullets
      .filter((bullet) => {
        return timestamp - bullet.timeCreated <= BULLET_TIME
      })
      .map((bullet) => {
        let displacement = BULLET_VELOCITY * tDiff;
        let xDisplacement = Math.sin(bullet.direction / 180 * Math.PI) * displacement;
        let yDisplacement = Math.cos(bullet.direction / 180 * Math.PI) * displacement;
        let newXPosition = bullet.x + xDisplacement;
        let newYPosition = bullet.y - yDisplacement;

        return {
          x: newXPosition,
          y: newYPosition,
          direction: bullet.direction,
          timeCreated: bullet.timeCreated,
          userId: bullet.userId
        }
      })

    let newBullets = []

    if (timestamp - bulletT > BULLET_FREQUENCY) {
      bulletT = timestamp;

      newBullets = this.state.players
        .filter((player) => {
          return player.health > 0
        })
        .map((player) => {
          return {
            x: player.position.x + 25 + 20 * Math.sin(player.direction * Math.PI / 180),
            y: player.position.y + 25 - 20 * Math.cos(player.direction * Math.PI / 180),
            direction: player.direction,
            timeCreated: timestamp,
            userId: player.id
          }
        })
    }

    let newPlayersArray = this.state.players.map((player) => {
      let factor = player.acceleration === -1 ? 3 : 1;
      let newVelocity = player.velocity + (factor * ACCELERATION * player.acceleration * tDiff);
      if (newVelocity > MAX_VELOCITY) {
        newVelocity = MAX_VELOCITY;
      }
      if (newVelocity < MIN_VELOCITY){
        newVelocity = MIN_VELOCITY;
      }

      let newDirection = player.direction + (ANGULAR_ACCELERATION * player.rotation * tDiff);

      let middleDirection = player.direction + (ANGULAR_ACCELERATION * player.rotation * tDiff / 2);
      let displacement = (player.velocity * tDiff) + (factor * ACCELERATION * player.rotation * Math.pow(tDiff,2) / 2);

      let xDisplacement = Math.sin(middleDirection / 180 * Math.PI) * displacement;
      let yDisplacement = Math.cos(middleDirection / 180 * Math.PI) * displacement;
      let newXPosition = player.position.x + xDisplacement;
      let newYPosition = player.position.y - yDisplacement;

      if (newXPosition > (window.innerWidth - 50)) {
        newXPosition = window.innerWidth - 50;
      } else if (newXPosition < 0) {
        newXPosition = 0;
      }

      if (newYPosition > (window.innerHeight - 50)) {
        newYPosition = window.innerHeight - 50;
      } else if (newYPosition < 0) {
        newYPosition = 0;
      }

      let hitBulletTimeCreated = null;
      let hitBulletUserId = null;

      let hitByBullet = oldBullets
        .filter((bullet) => {
          return bullet.userId !== player.id
        })
        .reduce((acc, bullet) => {
          let hit = bullet.x >= player.position.x && bullet.x <= player.position.x + 50 && bullet.y >= player.position.y && bullet.y <= player.position.y + 50;

          if(hit) {
            hitBulletTimeCreated = bullet.timeCreated
            hitBulletUserId = bullet.userId
          }

          return acc || hit;
        }, false);

      if(hitByBullet) {
        player.health -= 5
        oldBullets = oldBullets.filter((bullet) => {
          return bullet.timeCreated != hitBulletTimeCreated && bullet.userId !== hitBulletUserId
        })

        database.ref("/users/"+player.id).update({
          collision: 1
        })

        // setTimeout(()=>{
        //   database.ref("/users/"+player.id).update({
        //     collision: 0
        //   })
        // }, 2000)
      }

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

    let bullets = oldBullets.concat(newBullets)

    this.setState({
      players: newPlayersArray,
      bullets: bullets
    });

    window.requestAnimationFrame(this.tick)
  }

  render() {
    let startScreenStyle = this.state.battleStarted ? { top: "100vh" } : { top: "0" };
    let gameScreenStyle = this.state.battleStarted ? { top: "0" } : { top: "-100vh" };

    let battleEnded = this.state.players.filter((player) => {
      return player.health > 0
    }).length <= 1;

    let endScreenStyle = this.state.battleStarted && battleEnded ? { top: "0" } : { top: "-100vh" };

    return (
      <div className="app">
        <div className="start-screen" style={startScreenStyle}>
          <div className="start-screen__content">
            <div className="start-screen__content__title">
            </div>
            {
              this.state.players.length > 0 ? (
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
              this.state.players
                .filter((player) => {
                  return player.health > 0
                })
                .map((player)=>{
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
          {
            this.state.battleStarted && !this.state.battleEnded ?
              this.state.bullets.map((bullet) => {
                return (
                  <Bullet
                    x={bullet.x}
                    y={bullet.y}
                    direction={bullet.direction}>
                  </Bullet>
                )
              }) : null
          }
        </div>
        <div className="end-screen" style={endScreenStyle}>
          <div className="winner">
            {
              this.state.players.length > 0 ?
                this.state.players.filter((player) => {
                  return player.health > 0
                })[0].username : null
            }
          </div>
          <div className="trophy"></div>
        </div>
        <img src={qtsLogo} className="qts-logo"></img>
      </div>
    );
  }
}

export default App;
