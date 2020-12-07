import React, { Component } from 'react';
import {
  BrowserRouter as Router, Route, Switch,
} from 'react-router-dom';
import DrawingGame from './DrawingGame';
import Header from './Header';
import Lobby from './Lobby';
import Footer from './Footer';
import Waitingroom from './Waitingroom';

const io = require('socket.io-client');

const socket = io();

export default class Routes extends Component {
  render() {
    return (
      <Router>
        <Header />
        <Switch>
          <Route
            exact
            path="/"
            render={(props) => <Lobby {...props} socket={socket} />}
          />
          <Route
            exact
            path="/waitingroom"
            render={(props) => <Waitingroom {...props} socket={socket} />}
          />
          <Route path="/imagegame" exact component={DrawingGame} />
        </Switch>
        <Footer />
      </Router>
    );
  }
}
