import React, { Component } from 'react';
import * as handTrack from 'handtrackjs';
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

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: {},
      isVideo: false,
      message: 'Please Wait. Video Starting...',
    };
    this.save = this.save.bind(this);
    this.startVideo = this.startVideo.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  save(ev) {
    const { socket } = this.props;
    ev.preventDefault();
    const { player } = this.state;
    socket.name = player.name;
    const { name } = socket;
    socket.emit('change name', name);
  }

  startVideo() {
    handTrack.startVideo(video)
      .then((status) => {
        if (status) {
          this.setState({ isVideo: true, message: 'Create Username and Press Enter to Join Waiting Room' });
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
    const { name, isVideo, message } = this.state;
    const { socket } = this.props;
    if (!isVideo) this.startGame();
    return (socket.name === '' ? (
      <div>
        <h1>Lobby Room</h1>
        <div className="lobby-div">
          {/* <form className="lobby-form" onSubmit={this.save}> */}
          <form className="lobby-form" onSubmit={this.save}>
            <label htmlFor="username" className="lobby-label">Username:</label>
            <input
              name="username"
              className="lobby-input"
              value={name}
              onChange={(ev) => this.setState({
                player: { name: ev.target.value },
              })}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && isVideo === true) {
                  this.save(e);
                }
              }}
            />
            <label>{message}</label>
          </form>
        </div>
      </div>
    ) : (<Waitingroom socket={socket} message={message} isVideo={isVideo} model={model} video={video} />));
  }
}

export default Lobby;
