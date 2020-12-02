import React from 'react';

const Lobby = ({
  username,
  handleUsernameChange,
  roomName,
  handleRoomNameChange,
  handleSubmit,
}) => (
  <form onSubmit={handleSubmit}>
    <h2>Enter a room</h2>
    <div>
      <label htmlFor="name">Name:
        <input
          type="text"
          id="name"
          value={username}
          onChange={handleUsernameChange}
          required
        />
      </label>
    </div>

    <div>
      <label htmlFor="room">Room name:
        <input
          type="text"
          id="room"
          value={roomName}
          onChange={handleRoomNameChange}
          required
        />
      </label>
    </div>

    <button type="submit">Submit</button>
  </form>
);

export default Lobby;
