import React, { Component } from 'react';
import io from 'socket.io-client';
import * as handTrack from 'handtrackjs';
import DrawingGame from './DrawingGame';
import Lobby from './Lobby';
import Waitingroom from './Waitingroom';

const socket = io();
socket.name = '';

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
    };
    this.startVideo = this.startVideo.bind(this);
    this.startGame = this.startGame.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  handleStatusChange(status) {
    this.setState({ status });
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
    const { status, isVideo, message } = this.state;
    const { handleStatusChange } = this;
    if (status === 'lobby') {
      return (
        <Lobby socket={socket} message={message} handleStatusChange={handleStatusChange} isVideo={isVideo} />
      );
    }
    if (status === 'waiting room') {
      return (
        <Waitingroom socket={socket} handleStatusChange={handleStatusChange} />
      );
    }
    if (status === 'game') {
      return (
        <DrawingGame socket={socket} isVideo={isVideo} model={model} video={video} message={message} handleStatusChange={handleStatusChange} />
      );
    }
    return null;
  }
}
