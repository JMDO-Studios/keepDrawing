import React, { Component } from 'react';
import {
  BrowserRouter as Router, Route, Switch,
} from 'react-router-dom';
import DrawingGame from './DrawingGame';
import ChatRoom from '../twilio/ChatRoom';

export default class Routes extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" exact component={DrawingGame} />
          <Route path="/chat" exact component={ChatRoom} />
        </Switch>
      </Router>
    );
  }
}
