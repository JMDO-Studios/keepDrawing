import React, { Component } from 'react';
import io from 'socket.io-client';
import * as handTrack from 'handtrackjs';
import AudioChat from '../twilio/AudioChat';
import DrawingGame from './DrawingGame';
import Lobby from './Lobby';
import Waitingroom from './Waitingroom';

const modelParams = {
  flipHorizontal: true,
  imageScaleFactor: 1.0,
  maxNumBoxes: 1,
  iouThreshold: 0.5,
  scoreThreshold: 0.70,
};

let model = null;
const video = document.getElementById('myVideo');

export default class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVideo: false,
      message: 'Please Wait. Video Starting...',
      status: 'lobby',
      socket: null,
      name: '',
    };
    this.startVideo = this.startVideo.bind(this);
    this.startGame = this.startGame.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.returnToWaitingRoom = this.returnToWaitingRoom.bind(this);
    this.changeName = this.changeName.bind(this);
    // this.createSocket = this.createSocket.bind(this);
  }

  handleStatusChange(status, name = this.state.name) {
    if (status === 'waiting room' && this.state.socket === null) {
      this.setState({ socket: this.createSocket(name) });
    }
    this.setState({ status });
  }

  createSocket(name) {
    const socket = io();
    socket.name = name;
    socket.on('disconnect', () => {
      window.alert('You have disconnected from the server.\nPress OK to reconnect and wait to join a new game');
      this.returnToWaitingRoom(true);
    });
    return socket;
  }

  changeName(name) {
    this.setState({ name });
  }

  returnToWaitingRoom(reconnect) {
    const { socket } = this.state;
    if (reconnect) socket.open();
    else socket.emit('leave game');
    this.handleStatusChange('waiting room');
  }

  startVideo() {
    handTrack.startVideo(video)
      .then((status) => {
        if (status) {
          this.setState({ isVideo: true, message: 'Create Username and Press Submit to Join Waiting Room' });
        } else {
          this.setState({ message: 'Please enable your video' });
        }
      });
  }

  startGame() {
    const { startVideo } = this;
    handTrack.load(modelParams)
      .then((lmodel) => {
        model = lmodel;
        startVideo();
      });
  }

  render() {
    this.startGame();
    const {
      handleStatusChange, returnToWaitingRoom, state, changeName,
    } = this;
    const {
      status, isVideo, message, socket,
    } = state;
    if (status === 'lobby') {
      return (
        <Lobby changeName={changeName} message={message} handleStatusChange={handleStatusChange} isVideo={isVideo} />
      );
    }
    if (status === 'waiting room' && !!socket) {
      return (
        <div>
          <Waitingroom socket={socket} handleStatusChange={handleStatusChange} />
        </div>
      );
    }
    if (status === 'game' && !!socket) {
      return (
        <div>
          <DrawingGame socket={socket} isVideo={isVideo} model={model} video={video} message={message} returnToWaitingRoom={returnToWaitingRoom} />
          <AudioChat socket={socket} />
        </div>
      );
    }
    return null;
  }
}
