import React, { Component } from 'react';
import io from 'socket.io-client';
import * as handTrack from 'handtrackjs';
const { v4: uuidv4 } = require('uuid');
import AudioChat from '../twilio/AudioChat';
import ChatRoom from '../twilio/ChatRoom';
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
  }

  componentDidMount() {
    this.startGame();
  }

  handleStatusChange(status, name = this.state.name) {
    if (status === 'waiting room' && this.state.socket === null) {
      this.setState({ socket: this.createSocket(name) });
    }
    this.setState({ status });
  }

  createSocket(name) {
    const { socket } = this.state;
    if (!socket) {
      const newSocket = io();
      newSocket.name = name;
      newSocket.chatId = uuidv4();
      newSocket.on('disconnect', () => {
        window.alert('You have disconnected from the server.\nPress OK to reconnect and wait to join a new game');
        this.returnToWaitingRoom(true);
      });
      return newSocket;
    }
    return socket;
  }

  changeName(name) {
    this.setState({ name });
  }

  returnToWaitingRoom(reconnect) {
    const { socket } = this.state;
    if (reconnect) socket.open();
    else socket.emit('leave game');
    this.handleStatusChange('lobby');
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
    const {
      startGame, handleStatusChange, returnToWaitingRoom, state, changeName,
    } = this;
    const {
      status, isVideo, message, socket, name,
    } = state;
    if (!isVideo) {
      startGame();
    }
    if (status === 'lobby') {
      return (
        <Lobby changeName={changeName} message={message} handleStatusChange={handleStatusChange} isVideo={isVideo} name={name} />
      );
    }
    return (
      <div>
        {status === 'waiting room' && !!socket ? <Waitingroom socket={socket} handleStatusChange={handleStatusChange} /> 
          : null}
        {status === 'game' && !!socket
          ? (
            <div>
              <DrawingGame socket={socket} isVideo={isVideo} model={model} video={video} message={message} returnToWaitingRoom={returnToWaitingRoom} />
              <AudioChat socket={socket} />
            </div>
          )
          : null}
        <ChatRoom socket={socket} />
      </div>
    );
  }
}
