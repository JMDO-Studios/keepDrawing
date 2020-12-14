import React, { Component } from 'react';
import axios from 'axios';
import Video from 'twilio-video';
import AudioParticipant from './AudioParticipant';

export default class TwilioChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localParticipant: null,
      remoteParticipants: [],
    };
    this.joinTwilioRoom = this.joinTwilioRoom.bind(this);
    this.participantConnected = this.participantConnected.bind(this);
    this.participantDisconnected = this.participantDisconnected.bind(this);
  }

  participantConnected(participant) {
    const { remoteParticipants } = this.state;
    const newParticipants = [...remoteParticipants, participant];
    this.setState({
      remoteParticipants: newParticipants,
    });
  }

  participantDisconnected(participant) {
    const { remoteParticipants } = this.state;
    const newParticipants = remoteParticipants.filter((p) => p !== participant);
    this.setState({
      remoteParticipants: newParticipants,
    });
  }

  async joinTwilioRoom() {
    const { participantConnected, participantDisconnected, props } = this;
    const { socket } = props;
    const { name, teamName } = socket;
    const playerDetails = {
      identity: name,
      room: teamName,
    };
    const { data } = await axios.post('twilio/token', playerDetails);
    const { token } = data;
    socket.twilioToken = token;
    const twilioRoom = await Video.connect(token, {
      audio: true,
      name: teamName,
    });
    this.setState({
      localParticipant: twilioRoom.localParticipant,
    });
    console.log(twilioRoom);
    twilioRoom.participants.forEach((participant) => {
      participantConnected(participant);
      console.log(participant);
    });
    twilioRoom.on('participantConnected', (participant) => {
      participantConnected(participant);
      console.log(participant);
    });
    twilioRoom.on('participantDisconnected', (participant) => {
      participantDisconnected(participant);
      console.log(participant.identity, ' left the room');
    });
  }

  render() {
    const { joinTwilioRoom, props, state } = this;
    const { socket } = props;
    const { name, teamName, twilioToken } = socket;
    const { localParticipant, remoteParticipants } = state;
    if (name && teamName && !twilioToken) {
      joinTwilioRoom();
    }
    return (
      <div>
        <div>Local Participant (YOU!)</div>
        {localParticipant ? <AudioParticipant participant={localParticipant} /> : null}
        <div>Your Team:</div>
        {remoteParticipants.map((participant) => (
          <AudioParticipant key={participant.sid} participant={participant} />
        ))}
      </div>
    );
  }
}
