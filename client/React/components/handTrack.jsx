import * as handTrack from 'handtrackjs';
import React, { Component } from 'react';

export default class HandTrack extends Component {
  componentDidMount() {
    const modelParams = {
      // flip e.g for video
      flipHorizontal: true,
      // reduce input image size for gains in speed.
      imageScaleFactor: 0.7,
      // maximum number of boxes to detect
      maxNumBoxes: 1,
      // ioU threshold for non-max suppression
      iouThreshold: 0.5,
      // confidence threshold for predictions.
      scoreThreshold: 0.79,
    };
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    const video = document.querySelector('#video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    let model;
    const runDetection = () => {
      model.detect(video)
        .then((predictions) => {
          // console.log(predictions);
          if (predictions.length !== 0) {
            const hand = predictions[0].bbox;
            const x = hand[0];
            const y = hand[1];
            // console.log(x);
            // console.log(y);
            // draws a dot at the x & y coordinates
            context.fillRect(x, y, 3, 3);
            // shows the location of the hand
            // model.renderPredictions(predictions, canvas, context, video);
          }
        });
      // requestAnimationFrame(runDetection());
    };
    handTrack.startVideo(video)
      .then((status) => {
        if (status) {
          navigator.getUserMedia({ video: {} }, (stream) => {
            video.srcObject = stream;
            //  Run our detection
            setInterval(runDetection, 10);
          },
          (err) => console.log(err));
        }
      });
    handTrack.load(modelParams)
      .then((lmodel) => {
        model = lmodel;
      });
  }

  render() {
    return (
      <div>
        <video id='video' autoPlay='autoplay' />
        <canvas id='canvas' className='canvasbox' />
      </div>
    );
  }
}
