import React, { Component } from "react";
import * as handTrack from 'handtrackjs';

const modelParams = {
  // flip e.g for video
  flipHorizontal: true,
  // reduce input image size for gains in speed.
  // imageScaleFactor: 0.7,
  // maximum number of boxes to detect
  maxNumBoxes: 1,
  // ioU threshold for non-max suppression
  iouThreshold: 0.5,
  // confidence threshold for predictions.
  scoreThreshold: 0.75,
};

let model = null;
const video = document.getElementById('myVideo');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

export default class DrawingGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVideo: false,
      message: '',
    };
    this.startVideo = this.startVideo.bind(this);
    this.toggleVideo = this.toggleVideo.bind(this);
    this.runDetection = this.runDetection(this);
    this.startGame = this.startGame(this);
  }

  async startVideo() {
    const status = await handTrack.startVideo(video);
    if (status) {
      this.setState({ isVideo: true, message: 'Video started. Now tracking.' });
    } else {
      console.log('please enable video');
      this.setState({ message: 'Please enable video.'});
    }
  }

  toggleVideo() {
    const { isVideo } = this.state;
    if (!isVideo) {
      this.startVideo();
      this.setState({ message: 'Starting video.' });
    } else {
      handTrack.stopVideo(video);
      this.setState({ isVideo: false, message: 'Video stopped' });
    }
  }

  runDetection() {
    const { isVideo } = this.state;
    const { runDetection } = this;
    model.detect(video).then((predictions) => {
      model.renderPredictions(predictions, canvas, context, video);
      if (predictions[0]) {
        const hand = predictions[0].bbox;
        const x = hand[0];
        const y = hand[1];
        context.fillRect(x, y, 1, 1);
      }
      if (isVideo) {
        window.requestAnimationFrame(runDetection);
      }
    });
  }

  async startGame() {
    const { startVideo, runDetection } = this;
    console.log('Start Drawing');
    this.setState({ message: 'Please wait...' });
    const [videoStatus, lmodel] = await Promise.all([
      startVideo(),
      handTrack.load(modelParams),
    ]);
    model = lmodel;
    console.log('model loaded');
    runDetection();

    this.setState({ message: 'READY' });
  }

  render() {
    const { startGame } = this;
    const { message } = this.state;
    return (
      <div>
        <div>{message}</div>
        <button type="button" onClick={startGame}>Start Drawing</button>
      </div>
    );
  }
}
