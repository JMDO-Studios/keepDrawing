import React, { Component } from 'react';
import {
  BrowserRouter as Router, Route, Switch,
} from 'react-router-dom';
import DrawingGame from './DrawingGame';

export default class Routes extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" component={DrawingGame} />
        </Switch>
      </Router>
    );
  }
}
