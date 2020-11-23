import React, { Component } from 'react';
import {
  BrowserRouter as Router, Route, Switch,
} from 'react-router-dom';
import { connect } from 'react-redux';
import handTrack from './handTrack';

class Routes extends Component {
  render() {
    return (
      <Router>
        <Switch>
          {/* <Route exact path="/" component={handTrack} /> */}
          <Route exact path="/" component={handTrack} />
        </Switch>
      </Router>
    );
  }
}

export default connect()(Routes);
