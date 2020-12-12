import React, { Component } from 'react';
import io from 'socket.io-client';
import * as handTrack from 'handtrackjs';
import DrawingGame from './DrawingGame';
// import Header from './Header';
import Lobby from './Lobby';
// import Footer from './Footer';
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
    this.handleStateChange = this.handleStateChange.bind(this);
  }

  // componentDidUpdate(prevProps, prevState) {
  //   const { status } = this.state;
  //   if (prevState.status !== status) {
  //     console.log('status has changed');
  //   }
  // }

  handleStateChange(value) {
    // ev.preventDefault();
    this.setState({ status: value });
  }

  startVideo() {
    handTrack.startVideo(video)
      .then((status) => {
        if (status) {
          this.setState({ isVideo: true, message: 'Create Username and Press Submit to Join Waiting Room' });
          // this.runDetection();
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
    const { handleStateChange } = this;
    if (status === 'lobby') {
      return (
        <Lobby socket={socket} message={message} handleStateChange={handleStateChange} />
      );
    }
    if (status === 'waiting room') {
      return (
        <Waitingroom socket={socket} message={message} handleStateChange={handleStateChange} />
      );
    }
    if (status === 'game') {
      return (
        <DrawingGame socket={socket} isVideo={isVideo} model={model} video={video} message={message} />
      );
    }
    return null;
  }
}
