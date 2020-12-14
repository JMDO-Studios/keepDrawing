import React, { Component } from 'react';
import ThreeDScene from '../babylon/game';

const drawingCanvas = document.getElementById('drawingCanvas');
const handCanvas = document.getElementById('handCanvas');
const drawingContext = drawingCanvas.getContext('2d');
const handContext = handCanvas.getContext('2d');

export default class DrawingGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draw: false,
      erase: false,
    };
    this.runDetection = this.runDetection.bind(this);
    this.handleButton = this.handleButton.bind(this);
    this.clearCanvas = this.clearCanvas.bind(this);
  }

  handleButton(drawStatus, eraseStatus) {
    // if (drawStatus) this.setState({ message: 'Drawing Activated' });
    // if (eraseStatus) this.setState({ message: 'Eraser Activated' });
    // if (!drawStatus && !eraseStatus) this.setState({ message: 'Drawing Paused' });
    this.setState({ draw: drawStatus, erase: eraseStatus });
  }

  clearCanvas() {
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  }

  runDetection() {
    const { isVideo, model, video } = this.props;
    const { erase, draw } = this.state;
    const { runDetection } = this;
    if (model) {
      model.detect(video).then((predictions) => {
        model.renderPredictions(predictions, handCanvas, handContext, video);
        if (predictions[0]) {
          const hand = predictions[0].bbox;
          const midValX = hand[0] + (hand[2] / 2);
          const midValY = hand[1] + (hand[3] / 2);
          if (draw) drawingContext.fillRect(midValX, midValY, 20, 20);
          if (erase) drawingContext.clearRect(midValX, midValY, 10, 10);
        }
        if (isVideo) {
          window.requestAnimationFrame(runDetection);
        }
      });
    }
  }

  render() {
    const { handleButton, runDetection } = this;
    const { socket, returnToWaitingRoom } = this.props;
    runDetection();
    return (
      <div>
        <ThreeDScene socket={socket} returnToWaitingRoom={returnToWaitingRoom} />
      </div>
    );
  }
}
