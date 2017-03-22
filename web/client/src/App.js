import React, { Component } from 'react';
import './App.css';
import * as firebase from 'firebase';

import beginButton from './images/Begin_Battle_BTN.svg';
import readyingButton from './images/Readying_Fighters_BTN.svg';
import qtsLogo from './images/QTS_Logo.svg';

let backend = firebase.initializeApp({
  apiKey: "AIzaSyAsomyfnSlWJO_pRRzJKy-Gxqjq-KuHvME",
  authDomain: "quicktapmelee.firebaseapp.com",
  databaseURL: "https://quicktapmelee.firebaseio.com",
  storageBucket: "quicktapmelee.appspot.com",
  messagingSenderId: "165490831895"
});

let database = firebase.database();

class App extends Component {
  constructor() {
    super();

    this.state = {
      players: [{
        name: 'Player 1'
      }],
      battleStarted: false,
      battleEnded: false
    }
  }

  startBattle = () => {
    alert('test')
  }

  render() {
    return (
      <div className="app">
        <div className="start-screen">
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
                      <div className="battle-roster__player">{player.name}</div>
                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>
        <div className="game-screen">
        </div>
        <div className="end-screen">
        </div>
        <img src={qtsLogo} className="qts-logo"></img>
      </div>
    );
  }
}

export default App;
