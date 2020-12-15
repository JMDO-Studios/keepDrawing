import React, { Component } from 'react';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: { name: props.name },
    };
    this.save = this.save.bind(this);
  }

  save(ev) {
    ev.preventDefault();
    const { changeName, handleStatusChange, isVideo } = this.props;
    const { name } = this.state.player;
    if (name && isVideo) {
      changeName(name);
      handleStatusChange('waiting room', name);
    }
  }

  render() {
    const { name } = this.state;
    const { message } = this.props;
    return (
      <div>
        <h1>Keep Drawing!</h1>
        <div className="lobby-div">
          <form className="lobby-form" onSubmit={this.save}>
            <label htmlFor="username" className="lobby-label">Enter a username:</label>
            <input
              name="username"
              className="lobby-input"
              placeholder="username"
              value={name}
              onChange={(ev) => {
                this.setState({
                  player: { name: ev.target.value },
                });
              }}
            />
            <button type="submit" className="lobby-button"> play </button>
            <p className="lobby-status">{message}</p>
          </form>
          <div className="lobby-info">
            <h3>Login Instructions:</h3>
            <p>Enter a username and press play.
              You will be taken to the Waitingroom where you can chat with others.
              Once there are enough players to start the game, then, you will be taken to the Gameroom, starting the clock.
            </p>

            <h3>Gameplay Instructions:</h3>
            <p>The game, which is timed, is composed of teams-of-two playing against each other to get the most points.
              Each team has a Clue Giver and a Drawer.
              These roles are  switched after each image (an image is chosen at random from a set of images) is submitted.
              The Clue Giver describes to his/her teammate what to draw while the Drawer uses his/her hand to draw on the canvas, which has a red outline.
              The Drawer has four buttons: start, stop, erase, and clear, which are self-explanatory.
              The Clue Giver has one button: the submit button.
              Before the timer runs out, a team should submit as many drawings as they can.
              The closer each drawing is to the image provided, the more points that team will receive.
              As a team submits more drawings with a score, more points will accumulate for that team.
              Needless to say, the team with the most points wins.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Lobby;
