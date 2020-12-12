import React, { Component } from 'react';
import axios from 'axios';

export default class TwilioChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      socket: this.props,
    };
    this.joinTeam = this.joinTeam.bind(this);
  }

  joinTeam() {
    const playerDetails = {
      identity: socket.name,
      room: socket.teamName,
    };
    const { data } = await axios.post('twilio/token', playerDetails);
  }

  render() {
    return (
      <div />
    )
  }
}
