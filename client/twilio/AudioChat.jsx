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

  componentDidMount() {
    const { joinAudioChat, props } = this;
    const { socket } = props;
    socket.on('initialize', ({ teamName }) => joinAudioChat(teamName));
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

  async joinAudioChat(team) {
    try {
      const { participantConnected, participantDisconnected, props } = this;
      const { socket } = props;
      const { chatId } = socket;
      const playerDetails = {
        identity: chatId,
        room: team,
      };
      const { data } = await axios.post('twilio/audio/token', playerDetails);
      const { token } = data;
      const audioRoom = await Video.connect(token, {
        audio: true,
        name: team,
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
    const { teamName } = socket;
    const { audioRoom, remoteParticipants } = state;
    if (teamName && audioRoom === null) {
      joinAudioChat(teamName);
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
