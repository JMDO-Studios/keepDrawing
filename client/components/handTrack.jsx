import * as handTrack from 'handtrackjs';
import React, { Component } from 'react';
import { connect } from 'react-redux';

class HandTrack extends Component {
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
    let model;
    const runDetection = () => {
      model.detect(video)
        .then((predictions) => {
          // console.log(predictions);
          if (predictions.length !== 0) {
            const hand = predictions[0].bbox;
            const x = hand[0];
            const y = hand[1];
            console.log(x);
            console.log(y);
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
            setInterval(runDetection, 100);
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
        <video id='video' />
      </div>
    );
  }
}

export default connect()(HandTrack);

// const img = document.getElementById('img');

// // loading the model
// handTrack.load().then((model) => {
//   // detect objects in the image
//   console.log('model loaded');
//   model.detect(img).then((predictions) => {
//     console.log('Predictions: ', predictions);
//   });
// });
