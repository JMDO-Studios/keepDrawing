import React, { Component } from 'react';
import axios from 'axios';
import Video from 'twilio-video';
import AudioParticipant from './AudioParticipant';

export default class AudioChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioRoom: null,
      remoteParticipants: [],
    };
    this.joinAudioChat = this.joinAudioChat.bind(this);
    this.participantConnected = this.participantConnected.bind(this);
    this.participantDisconnected = this.participantDisconnected.bind(this);
  }

  componentWillUnmount() {
    const { audioRoom } = this.state;
    if (audioRoom) {
      audioRoom.disconnect();
    }
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

  async joinAudioChat() {
    try {
      const { participantConnected, participantDisconnected, props } = this;
      const { socket } = props;
      const { name, teamName } = socket;
      const playerDetails = {
        identity: name,
        room: teamName,
      };
      const { data } = await axios.post('twilio/audio/token', playerDetails);
      const { token } = data;
      const audioRoom = await Video.connect(token, {
        audio: true,
        name: teamName,
      });
      this.setState({
        audioRoom,
      });
      audioRoom.participants.forEach((participant) => participantConnected(participant));
      audioRoom.on('participantConnected', (participant) => participantConnected(participant));
      audioRoom.on('participantDisconnected', (participant) => participantDisconnected(participant));
    } catch (err) {
      console.error('Could not connect to audio chat: ', err);
    }
  }

  render() {
    const { joinAudioChat, props, state } = this;
    const { socket } = props;
    const { audioRoom, remoteParticipants } = state;
    if (socket.teamName && !audioRoom) {
      joinAudioChat();
    }
    return (
      <div>
        {remoteParticipants.map((participant) => (
          <AudioParticipant key={participant.sid} participant={participant} />
        ))}
      </div>
    );
  }
}
