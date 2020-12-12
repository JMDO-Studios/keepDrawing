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

  async joinTeam() {
    const { socket } = this.state;
    const { name, teamName } = socket;
    const playerDetails = {
      identity: name,
      room: teamName,
    };
    const { data } = await axios.post('twilio/token', playerDetails);
    this.setState({
      token: data,
    });
  }

  render() {
    const { socket, token } = this.state;
    const { name, teamName } = socket;
    return (
      <div>
        <div>Your Name: {name}</div>
        <div>Your Team: {teamName}</div>
        <div>Your Token: {token}</div>
      </div>
    );
  }
}
