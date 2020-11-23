import React, { Component } from 'react';
import {
  BrowserRouter as Router, Route, Switch,
} from 'react-router-dom';
import { connect } from 'react-redux';
// import Home from './Home';

class Routes extends Component {
  render() {
    return (
      <Router>
        <Switch>
          {/* <Route exact path="/" component={Home} /> */}
        </Switch>
      </Router>
    );
  }
}

export default connect()(Routes);
