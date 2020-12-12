import React, { Component } from 'react';
import {
  BrowserRouter as Router, Route, Switch,
} from 'react-router-dom';
import io from 'socket.io-client';
import TwilioChat from '../twilio/index';
import DrawingGame from './DrawingGame';
import Header from './Header';
import Lobby from './Lobby';
import Footer from './Footer';
import Waitingroom from './Waitingroom';

const socket = io();

export default class Routes extends Component {
  render() {
    return (
      <Router>
        <Header />
        <TwilioChat socket={socket} />
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
          <Route
            exact
            path="/imagegame"
            render={(props) => <DrawingGame {...props} socket={socket} />}
          />
        </Switch>
        <Footer />
      </Router>
    );
  }
}
