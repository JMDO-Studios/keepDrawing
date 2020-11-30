import React, { Component } from 'react';
import * as handTrack from 'handtrackjs';

const modelParams = {
  flipHorizontal: true,
  // reduce input image size for gains in speed.
  // imageScaleFactor: 0.7,
  // maximum number of boxes to detect
  maxNumBoxes: 1,
  iouThreshold: 0.5,
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
    // this.toggleVideo = this.toggleVideo.bind(this);
    this.runDetection = this.runDetection.bind(this);
    this.startGame = this.startGame(this);
  }

  startVideo() {
    handTrack.startVideo(video)
      .then((status) => {
        console.log('video started', status);
        if (status) {
          this.setState({ isVideo: true, message: 'Video started. Now tracking.' });
          console.log('video started again...');
          this.runDetection();
        } else {
          console.log('please enable video');
          this.setState({ message: 'Please enable video.' });
        }
      });
  }

  // toggleVideo() {
  //   const { isVideo } = this.state;
  //   if (!isVideo) {
  //     this.setState({ message: 'Starting video.' });
  //     this.startVideo();
  //   } else {
  //     this.setState({ isVideo: false, message: 'Video stopped' });
  //     handTrack.stopVideo(video);
  //   }
  // }

  runDetection() {
    const { isVideo } = this.state;
    const { runDetection } = this;
    if (model) {
      model.detect(video).then((predictions) => {
        console.log('model detected');
        // model.renderPredictions(predictions, canvas, context, video);
        if (predictions[0]) {
          model.renderPredictions(predictions, canvas, context, video);

          const hand = predictions[0].bbox;
          const x = hand[0];
          const y = hand[1];
          console.log(x);
          // context.fillRect(x, y, 1, 1);
        }
        if (isVideo) {
          window.requestAnimationFrame(runDetection);
        }
      });
    }
  }

  startGame() {
    const { startVideo, runDetection } = this;
    console.log('Start Drawing');
    // this.setState({ message: 'Please wait...' });
    // const [videoStatus, lmodel] = await Promise.all([
    //   startVideo(),
    //   handTrack.load(modelParams),
    // ]);
    // model = lmodel;
    handTrack.load(modelParams)
      .then((lmodel) => {
        model = lmodel;
        startVideo();
      });
    console.log('model loaded');
    // runDetection();

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
