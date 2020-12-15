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
        <header>
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
            <p className="lobby-status">{message}</p>
          </form>
        </div>
        </header>
        <div className="instructions">
          <h3>Login Instructions:</h3>
          <p>When instructed, enter a username and press submit</p>
          <p>You will join a waiting room where you can chat with other players</p>
          <p>Once there enough players, you will automatically join a game</p>

          <h3>Gameplay Instruction:</h3>
          <p>There are two players on a team</p>
          <p>The game is timed.</p>
          <p>Teams consist of a Clue Giver and a Drawer</p>
          <p>Work together to draw pictures that match the clue image</p>
          <p>The closer the drawing is to the clue, the more points you get</p>
          <p>The team with the most points when the timer runs out wins the game!</p>
          <br />

          <h4>Clue Givers</h4>
          <p>You will be shown an image and it's your job to describe that image to your teammate </p>
          <p>You'll see your teammates drawing in realtime on the right </p>
          <p>At any time, you can hit the submit button to send the drawing for scoring</p>
          <p>The closer your drawing is to the image, the more points you will receive</p>
          <p>After you submit a drawing, it's your turn to draw!</p>
          <br />

          <h4>Drawers</h4>
          <p>The Clue Giver will tell you what to draw</p>
          <p>On the right is your canvas, use hand motions in the air to draw an image (one hand only!)</p>
          <p>On the left you'll see a video of yourself from your camera, use this to help position your hand</p>
          <p>Use the Start button to start drawing and the Stop button to pause drawing</p>
          <p>The Erase button will let you erase parts of your drawing and the Clear button will reset your canvas to an empty drawing</p>

        </div>
      </div>
    );
  }
}

export default Lobby;
