import React, { Component } from 'react';
import * as handTrack from 'handtrackjs';

const modelParams = {
  flipHorizontal: true,
  imageScaleFactor: 1.0,
  maxNumBoxes: 1,
  iouThreshold: 0.5,
  scoreThreshold: 0.75,
};

let model = null;
const video = document.getElementById('myVideo');
const drawingCanvas = document.getElementById('drawingCanvas');
const handCanvas = document.getElementById('handCanvas');
const drawingContext = drawingCanvas.getContext('2d');
const handContext = handCanvas.getContext('2d');

export default class DrawingGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVideo: false,
      draw: false,
      erase: false,
    };
    this.startVideo = this.startVideo.bind(this);
    this.runDetection = this.runDetection.bind(this);
    this.startGame = this.startGame.bind(this);
    this.handleButton = this.handleButton.bind(this);
  }

  handleButton(drawStatus, eraseStatus) {
    this.setState({ draw: drawStatus, erase: eraseStatus });
  }

  runDetection() {
    const { isVideo, erase, draw } = this.state;
    const { runDetection } = this;
    if (model) {
      model.detect(video).then((predictions) => {
        // console.log('model detected');
        model.renderPredictions(predictions, handCanvas, handContext, video);
        if (predictions[0]) {
          // console.log(predictions);
          const hand = predictions[0].bbox;
          const midValX = (hand[0] + hand[2]) / 2;
          // const gamex = document.body.clientWidth * (midvalx / canvas.width);
          const midValY = (hand[1] + hand[3]) / 2;
          // const x = hand[0];
          // const y = hand[0];
          // const gamey = document.body.clientHeight * (midvaly / canvas.height);
          if (draw) drawingContext.fillRect(midValX, midValY, 3, 3);
          if (erase) drawingContext.clearRect(midValX, midValY, 3, 3);
        }
        if (isVideo) {
          window.requestAnimationFrame(runDetection);
        }
      });
    }
  }

  startVideo() {
    handTrack.startVideo(video)
      .then((status) => {
        // console.log('Video Started');
        if (status) {
          this.setState({ isVideo: true });
          console.log('video started again...');
          this.runDetection();
        } else {
          console.log('please enable video');
        }
      });
  }

  startGame() {
    const { startVideo } = this;
    // console.log('Game Started');
    handTrack.load(modelParams)
      .then((lmodel) => {
        model = lmodel;
        startVideo();
      });
  }

  render() {
    const { startGame, handleButton } = this;
    startGame();
    return (
      <div>
        <button type="button" onClick={() => handleButton(true, false)}>Start Drawing</button>
        <button type="button" onClick={() => handleButton(false, false)}>Stop Drawing</button>
        <button type="button" onClick={() => (handleButton(false, true))}>Erase</button>
      </div>
    );
  }
}
