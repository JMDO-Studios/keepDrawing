import React, { Component } from 'react';

class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: {},
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
            <label htmlFor="username" className="lobby-label">Enter name:
              <input
                name="username"
                className="lobby-input"
                placeholder="Nickname"
                value={name}
                onChange={(ev) => {
                  this.setState({
                    player: { name: ev.target.value },
                  });
                }}
              />
            </label>
            <button type="submit" className="lobby-button"> Play </button>
            <p className ='lobby-status'>{message}</p>
          </form>
        </div>
        <div>
          <h3>SetUp Instructions:</h3>
          <p>When instructed, enter a username and press submit</p>
          <p>Once there enough players you will automatically go to the game</p>

          <h3>Gameplay Instruction:</h3>
          <p>There are two players on a team</p>
          <p>The game is timed.</p>
          <p>Teams consist of a Clue Giver and a Drawer</p>
          <p>Roles switch after each image</p>
          <p>Use hand motions to draw images on the canvas</p>
          <p>The Clue Giver will describe to their teammate what to draw</p>
          <p>Use the buttons to start or stop drawing, erase, and clear</p>
          <p>The Clue Giver can submit their attempt to be scored and move on</p>
          <p>The closer your drawing is to the clue, the more points you will receive</p>
          <p>The team with the most points when the timer runs out is the winner</p>
        </div>
      </div>
    );
  }
}

export default Lobby;
