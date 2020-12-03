import React, { Component } from 'react';
import {
  BrowserRouter as Router, Route, Switch,
} from 'react-router-dom';
import DrawingGame from './DrawingGame';
import threeDGame from '../babylon/game';

export default class Routes extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={DrawingGame} />
          <Route exact path="/reactgame" component={threeDGame} />
        </Switch>
      </Router>
    );
  }
}
